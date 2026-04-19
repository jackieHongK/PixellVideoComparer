const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const { spawn } = require("child_process");

const PORT = Number(process.env.PIXELL_DASHBOARD_PORT || 41731);
const ROOT = __dirname;
const STATE_FILE = path.join(ROOT, "dashboard-data", "state.json");
const RUNTIME_DIR = path.join(ROOT, "dashboard-data", "agent-runtime");
const RUN_DIR = path.join(ROOT, "dashboard-data", "runs");
const CODEX_HOME = path.join(os.homedir(), ".codex");
const CLAUDE_CACHE = path.join(os.homedir(), "AppData", "Local", "claude-cli-nodejs", "Cache");
const PROJECT_CACHE_KEY = "C--Users-HJP-Downloads-PJ-pixell-launcher";

const runningJobs = new Map();

ensureDir(RUNTIME_DIR);
ensureDir(RUN_DIR);

http
  .createServer(async (req, res) => {
    const requestUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);
    const pathname = decodeURIComponent(requestUrl.pathname || "/");

    if (req.method === "GET" && pathname === "/api/dashboard-state") {
      return json(res, buildDashboardState());
    }

    if (req.method === "POST" && pathname === "/api/dashboard-state") {
      const body = await readBody(req);
      fs.writeFileSync(STATE_FILE, body, "utf8");
      return json(res, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/dashboard-reset") {
      resetBoard();
      return json(res, { ok: true });
    }

    if (req.method === "POST" && pathname === "/api/dashboard-seed") {
      seedClaudeDesignTask();
      return json(res, { ok: true });
    }

    if (req.method === "GET" && pathname === "/api/references/file") {
      return handleReferenceRead(requestUrl, res);
    }

    if (req.method === "POST" && pathname === "/api/references/file") {
      return handleReferenceSave(req, res);
    }

    if (req.method === "POST" && pathname.startsWith("/api/agent-runtime/")) {
      const agentId = pathname.split("/").pop();
      const body = await readBody(req);
      fs.writeFileSync(path.join(RUNTIME_DIR, `${agentId}.json`), body, "utf8");
      return json(res, { ok: true });
    }

    if (req.method === "POST" && pathname.startsWith("/api/agents/")) {
      const parts = pathname.split("/");
      const agentId = parts[3];
      const action = parts[4];
      if (!agentId || !action) return json(res, { ok: false, message: "invalid agent action" });
      if (action === "launch") return json(res, launchAgentTerminal(agentId));
    }

    if (req.method === "GET" && pathname.startsWith("/api/tasks/")) {
      const parts = pathname.split("/");
      const taskId = parts[3];
      const action = parts[4];
      if (!taskId || !action) return json(res, { ok: false, message: "invalid task action" });
      if (action === "log") return handleTaskLog(taskId, requestUrl, res);
    }

    if (req.method === "POST" && pathname.startsWith("/api/tasks/")) {
      const parts = pathname.split("/");
      const taskId = parts[3];
      const action = parts[4];
      if (!taskId || !action) return json(res, { ok: false, message: "invalid task action" });
      return handleTaskAction(taskId, action, req, res);
    }

    return serveStatic(pathname, res);
  })
  .listen(PORT, () => {
    console.log(`Pixell dashboard server running at http://127.0.0.1:${PORT}`);
  });

function buildDashboardState() {
  const state = refreshAgentExecution(readState());
  state.tasks = state.tasks.map((task) => enrichTask(state, task));
  state.agents = state.agents.map((agent) => {
    const autoRuntime = agent.type === "codex" ? getCodexRuntime(agent) : agent.type === "claude" ? getClaudeRuntime() : baseRuntime();
    const manualRuntime = readManualRuntime(agent.id);
    const execution = summarizeAgentExecution(state, agent.id);
    return {
      ...agent,
      parallelSlots: agent.parallelSlots || 1,
      runtime: mergeRuntime(autoRuntime, manualRuntime),
      execution,
    };
  });
  state.meta.updatedAt = new Date().toISOString();
  state.telemetryUpdatedAt = new Date().toISOString();
  return state;
}

async function handleTaskAction(taskId, action, req, res) {
  const state = readState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return json(res, { ok: false, message: "task not found" });

  if (action === "start") {
    if (task.execution?.running) return json(res, { ok: false, message: "task already running" });
    const blockers = getDependencyBlockers(state, task);
    if (blockers.length) return json(res, { ok: false, message: `선행 작업 필요: ${blockers.map((item) => item.title).join(", ")}` });
    enqueueTaskRun(taskId);
    return json(res, { ok: true });
  }

  if (action === "qa") {
    if (task.execution?.running) return json(res, { ok: false, message: "task already running" });
    enqueueQaRun(taskId);
    return json(res, { ok: true });
  }

  if (action === "release") {
    task.releaseStatus = task.releaseStatus === "released" ? "not_released" : "released";
    task.updatedAt = new Date().toISOString();
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "decision-clear") {
    task.decisionNeeded = false;
    task.updatedAt = new Date().toISOString();
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "requeue") {
    const body = await readBody(req);
    const payload = parseJson(body);
    task.status = "todo";
    task.execution = {
      ...(task.execution || defaultExecution()),
      running: false,
      mode: "idle",
      lastIssue: payload?.issue || "사용자 재작업 요청",
    };
    task.updatedAt = new Date().toISOString();
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "dependency") {
    const body = await readBody(req);
    const payload = parseJson(body) || {};
    const dependsOn = payload.dependsOn ? [String(payload.dependsOn)] : [];
    task.dependsOn = dependsOn.filter((value) => value && value !== task.id);
    task.updatedAt = new Date().toISOString();
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "owner") {
    const body = await readBody(req);
    const payload = parseJson(body) || {};
    if (task.status !== "todo" && task.status !== "backlog") {
      return json(res, { ok: false, message: "할 일 상태에서만 담당자 변경 가능" });
    }
    task.ownerId = String(payload.ownerId || task.ownerId);
    task.updatedAt = new Date().toISOString();
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "comment") {
    const body = await readBody(req);
    const payload = parseJson(body) || {};
    task.operatorComment = String(payload.operatorComment || "");
    task.updatedAt = new Date().toISOString();
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "delete") {
    if (task.execution?.running) return json(res, { ok: false, message: "실행중 태스크는 삭제할 수 없음" });
    if (task.status !== "todo" && task.status !== "backlog") {
      return json(res, { ok: false, message: "할 일 상태에서만 삭제 가능" });
    }
    state.tasks = state.tasks.filter((item) => item.id !== taskId);
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "history-clear") {
    state.history = [];
    writeState(state);
    return json(res, { ok: true });
  }

  if (action === "cancel") {
    cancelTaskRun(taskId);
    return json(res, { ok: true });
  }

  return json(res, { ok: false, message: "unknown action" });
}

function enqueueTaskRun(taskId) {
  const state = readState();
  const current = state.tasks.find((item) => item.id === taskId);
  if (!current) return;

  current.execution = {
    ...(current.execution || defaultExecution()),
    mode: "queued_run",
    running: false,
    lastIssue: "",
  };
  current.nextStep = getDependencyBlockers(state, current).length
    ? "선행 작업 완료 대기 중"
    : `${findAgentName(state, current.ownerId)} 실행 슬롯 대기 중`;
  current.updatedAt = new Date().toISOString();
  writeState(state);
  scheduleQueuedRuns();
}

function dispatchTaskRun(task) {
  const state = readState();
  const current = state.tasks.find((item) => item.id === task.id);
  if (!current) return;
  const owner = state.agents.find((agent) => agent.id === current.ownerId);

  current.status = "in_progress";
  current.execution = {
    ...(current.execution || defaultExecution()),
    mode: "run",
    running: true,
    lastRunAt: new Date().toISOString(),
    lastIssue: "",
  };
  current.nextStep = "에이전트 실행 중";
  current.updatedAt = new Date().toISOString();
  writeState(state);

  const runPrompt = buildRunPrompt(current);
  const runner = current.ownerId === "claude" ? createClaudeRun(runPrompt, current.id) : createCodexRun(owner, runPrompt, current.id);
  executeRunner(current.id, runner, "run");
}

function enqueueQaRun(taskId) {
  const state = readState();
  const current = state.tasks.find((item) => item.id === taskId);
  if (!current) return;

  current.execution = {
    ...(current.execution || defaultExecution()),
    mode: "queued_qa",
    running: false,
    lastIssue: "",
  };
  current.nextStep = "Claude QA 슬롯 대기 중";
  current.updatedAt = new Date().toISOString();
  writeState(state);
  scheduleQueuedRuns();
}

function dispatchQaRun(task) {
  const state = readState();
  const current = state.tasks.find((item) => item.id === task.id);
  if (!current) return;

  current.execution = {
    ...(current.execution || defaultExecution()),
    mode: "qa",
    running: true,
    lastRunAt: new Date().toISOString(),
  };
  current.nextStep = "Claude QA 실행 중";
  current.updatedAt = new Date().toISOString();
  writeState(state);

  const qaPrompt = buildQaPrompt(current);
  const runner = createClaudeQaRun(qaPrompt, current.id);
  executeRunner(current.id, runner, "qa");
}

function executeRunner(taskId, runner, mode) {
  fs.writeFileSync(runner.logFile, "", "utf8");

  const child = spawn(runner.command, runner.args, {
    cwd: ROOT,
    env: { ...process.env, ...(runner.env || {}) },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false,
  });

  runningJobs.set(taskId, { child, mode });
  markTaskAsRunning(taskId, mode, child.pid, runner);

  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => {
    const text = String(chunk);
    stdout += text;
    appendRunLog(runner.logFile, text);
  });
  child.stderr.on("data", (chunk) => {
    const text = String(chunk);
    stderr += text;
    appendRunLog(runner.logFile, `[stderr]\n${text}`);
  });

  child.on("close", (code) => {
    runningJobs.delete(taskId);
    persistRunLog(runner.logFile, stdout, stderr);
    if (mode === "run") finishTaskRun(taskId, code, stdout, stderr);
    if (mode === "qa") finishQaRun(taskId, code, stdout, stderr);
    scheduleQueuedRuns();
  });
}

function markTaskAsRunning(taskId, mode, pid, runner) {
  const state = readState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.execution = {
    ...(task.execution || defaultExecution()),
    running: true,
    mode,
    processId: pid || null,
    processCommand: [runner.command].concat(runner.args || []).join(" "),
    lastLogPath: path.relative(ROOT, runner.logFile).replaceAll("\\", "/"),
  };
  task.updatedAt = new Date().toISOString();
  writeState(state);
}

function handleTaskLog(taskId, requestUrl, res) {
  const state = readState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return json(res, { ok: false, message: "task not found" });

  const tail = Math.max(1000, Math.min(30000, Number(requestUrl.searchParams.get("tail") || 12000)));
  const logPath = resolveTaskLogPath(task);
  if (!logPath || !fs.existsSync(logPath)) {
    return json(res, { ok: true, log: "", running: Boolean(task.execution?.running), processId: task.execution?.processId || null });
  }

  const text = fs.readFileSync(logPath, "utf8");
  return json(res, {
    ok: true,
    log: text.slice(-tail),
    running: Boolean(task.execution?.running),
    processId: task.execution?.processId || null,
    logPath: path.relative(ROOT, logPath).replaceAll("\\", "/"),
  });
}

function finishTaskRun(taskId, code, stdout, stderr) {
  const state = readState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  task.execution = {
    ...(task.execution || defaultExecution()),
    mode: "idle",
    running: false,
    processId: null,
    lastOutput: truncateOutput(stdout || stderr),
    lastIssue: code === 0 ? "" : truncateOutput(stderr || stdout || "실행 실패"),
    lastLogPath: relativeRunPath(taskId, "run"),
  };
  task.status = code === 0 ? "review" : "todo";
  task.nextStep = code === 0 ? "QA 실행으로 검토 진행" : "실패 원인을 확인하고 다시 실행";
  task.updatedAt = new Date().toISOString();
  pushHistoryEntry(state, {
    task,
    stage: "run",
    result: code === 0 ? "pass" : "fail",
    summary: code === 0 ? "실행 완료, 검토 단계로 이동" : truncateOutput(stderr || stdout || "실행 실패", 180),
    logPath: relativeRunPath(taskId, "run"),
  });
  writeState(state);
}

function finishQaRun(taskId, code, stdout, stderr) {
  const state = readState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const parsed = parseJson(stdout);
  const passed = code === 0 && parsed && parsed.result === "pass";
  const issues = Array.isArray(parsed?.issues) ? parsed.issues.join(" | ") : "";

  task.execution = {
    ...(task.execution || defaultExecution()),
    mode: "idle",
    running: false,
    processId: null,
    qaSummary: parsed?.summary || truncateOutput(stdout || stderr),
    lastIssue: passed ? "" : issues || parsed?.summary || truncateOutput(stderr || stdout || "QA 실패"),
    lastOutput: truncateOutput(stdout || stderr),
    lastLogPath: relativeRunPath(taskId, "qa"),
  };
  task.status = passed ? "done" : "todo";
  task.nextStep = passed ? "릴리스 여부를 확인" : "이슈를 반영하고 다시 실행";
  task.updatedAt = new Date().toISOString();
  pushHistoryEntry(state, {
    task,
    stage: "qa",
    result: passed ? "pass" : "fail",
    summary: parsed?.summary || truncateOutput(stderr || stdout || "QA 종료", 180),
    logPath: relativeRunPath(taskId, "qa"),
  });
  writeState(state);
}

function createCodexRun(agent, prompt, taskId) {
  const outputFile = path.join(RUN_DIR, `${taskId}-run.log`);
  return {
    command: path.join(os.homedir(), "AppData", "Roaming", "npm", "codex.cmd"),
    args: [
      "exec",
      "-C",
      ROOT,
      "--full-auto",
      "--skip-git-repo-check",
      "-o",
      outputFile,
      prompt,
    ],
    env: agent?.codexHome ? { CODEX_HOME: agent.codexHome } : {},
    logFile: outputFile,
  };
}

function createClaudeRun(prompt, taskId) {
  return {
    command: path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe"),
    args: [
      "-p",
      "--permission-mode",
      "bypassPermissions",
      "--output-format",
      "text",
      prompt,
    ],
    logFile: path.join(RUN_DIR, `${taskId}-run.log`),
  };
}

function createClaudeQaRun(prompt, taskId) {
  return {
    command: path.join(os.homedir(), "AppData", "Roaming", "npm", "node_modules", "@anthropic-ai", "claude-code", "bin", "claude.exe"),
    args: [
      "-p",
      "--permission-mode",
      "bypassPermissions",
      "--output-format",
      "json",
      prompt,
    ],
    logFile: path.join(RUN_DIR, `${taskId}-qa.log`),
  };
}

function buildQaPrompt(task) {
  return [
    "당신은 QA 담당자다.",
    "다음 작업 결과를 검토하고 반드시 JSON만 반환하라.",
    '형식: {"result":"pass|fail","summary":"짧은 요약","issues":["문제1","문제2"]}',
    `태스크 제목: ${task.title}`,
    `검토 기준: ${task.reviewPrompt || "기능, 회귀, UX 흐름, 기본 동작 이상 여부를 확인"}`,
    `최근 실행 결과 요약: ${task.execution?.lastOutput || "없음"}`,
  ].join("\n");
}

function buildRunPrompt(task) {
  if (!task.operatorComment) return task.prompt || "";
  return [
    task.prompt || "",
    "",
    "추가 운영 코멘트:",
    task.operatorComment,
  ].join("\n");
}

function getCodexRuntime(agent) {
  const latest = findLatestCodexSession(agent);
  if (!latest) return inactiveRuntime("Codex 세션 파일을 찾지 못함");

  const lines = safeReadLines(latest.fullPath);
  let tokenEvent = null;
  let latestUserMessage = null;
  let latestAgentMessage = null;

  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const line = lines[i];
    try {
      const parsed = JSON.parse(line);
      if (!tokenEvent && parsed.type === "event_msg" && parsed.payload?.type === "token_count") tokenEvent = parsed;
      if (!latestUserMessage && parsed.type === "event_msg" && parsed.payload?.type === "user_message") latestUserMessage = parsed.payload?.message;
      if (!latestAgentMessage && parsed.type === "event_msg" && parsed.payload?.type === "agent_message") latestAgentMessage = parsed.payload?.message;
      if (tokenEvent && latestUserMessage && latestAgentMessage) break;
    } catch (error) {}
  }

  const runtime = baseRuntime();
  runtime.isActive = Date.now() - latest.mtimeMs < 5 * 60 * 1000;
  runtime.lastActiveAt = new Date(latest.mtimeMs).toISOString();
  runtime.sessionPath = latest.fullPath;
  runtime.tokenSourceLabel = "Codex 세션 로그";
  runtime.note = buildCodexRuntimeNote(agent, latest.meta);
  runtime.activityLabel = latestAgentMessage ? truncateOutput(latestAgentMessage, 140) : "최근 상태 메시지 없음";
  runtime.userOrderLabel = latestUserMessage ? truncateOutput(latestUserMessage, 140) : "";

  if (tokenEvent) {
    const info = tokenEvent.payload?.info || {};
    const rateLimits = tokenEvent.payload?.rate_limits || {};
    runtime.lastActiveAt = tokenEvent.timestamp || runtime.lastActiveAt;
    runtime.tokens = {
      session: info.last_token_usage?.total_tokens ?? null,
      total: info.total_token_usage?.total_tokens ?? null,
      last: info.last_token_usage?.total_tokens ?? null,
    };
    runtime.quota = {
      planType: rateLimits.plan_type || null,
      primaryUsedPercent: rateLimits.primary?.used_percent ?? null,
      primaryRemainingPercent: rateLimits.primary?.used_percent !== undefined ? Math.max(0, 100 - rateLimits.primary.used_percent) : null,
      primaryResetAt: epochToIso(rateLimits.primary?.resets_at),
      secondaryUsedPercent: rateLimits.secondary?.used_percent ?? null,
      secondaryRemainingPercent: rateLimits.secondary?.used_percent !== undefined ? Math.max(0, 100 - rateLimits.secondary.used_percent) : null,
      secondaryResetAt: epochToIso(rateLimits.secondary?.resets_at),
    };
  }

  return runtime;
}

function getClaudeRuntime() {
  const latest = findLatestFile(path.join(CLAUDE_CACHE, PROJECT_CACHE_KEY), ".jsonl");
  if (!latest) return inactiveRuntime("Claude 활동 로그를 찾지 못함");

  const lines = safeReadLines(latest.fullPath);
  let activity = "";
  for (let i = lines.length - 1; i >= 0; i -= 1) {
    const extracted = extractClaudeActivity(lines[i]);
    if (extracted) {
      activity = extracted;
      break;
    }
  }

  const runtime = baseRuntime();
  runtime.isActive = Date.now() - latest.mtimeMs < 5 * 60 * 1000;
  runtime.lastActiveAt = new Date(latest.mtimeMs).toISOString();
  runtime.sessionPath = latest.fullPath;
  runtime.tokenSourceLabel = "Claude 활동 로그";
  runtime.note = "현재 로컬 로그에는 토큰 숫자 필드가 없어 활동만 자동 표시";
  runtime.activityLabel = activity || "최근 활동 로그만 감지";
  return runtime;
}

function extractClaudeActivity(line) {
  try {
    const parsed = JSON.parse(line);
    const debug = parsed.debug || parsed.error || "";
    const toolMatch = debug.match(/Calling MCP tool: ([^"]+)/);
    if (toolMatch) return `최근 툴 호출: ${toolMatch[1]}`;
    if (debug.includes("Successfully connected")) return "IDE 연결 활성";
    if (debug.includes("Authentication required")) return "외부 MCP 인증 필요";
    return debug ? truncateOutput(debug, 120) : "";
  } catch (error) {
    return "";
  }
}

function seedClaudeDesignTask() {
  const state = readState();
  const existingTask = state.tasks.find((task) => task.id === "task-claude-token-runtime");
  if (existingTask) {
    existingTask.status = "todo";
    existingTask.updatedAt = new Date().toISOString();
    writeState(state);
    return;
  }
  state.tasks.unshift({
    id: "task-claude-token-runtime",
    title: "Claude 토큰 사용량 수집 경로 정리",
    ownerId: "claude",
    status: "todo",
    priority: "high",
    summary: "Claude 세션 토큰, 누적 토큰, 리셋 시각을 대시보드에 자동 반영할 수 있는 로그 경로와 런타임 포맷을 정리",
    prompt: "현재 Claude CLI 환경에서 세션 토큰, 누적 토큰, 잔여량, 다음 리셋 시각을 수집할 수 있는 로그 경로 또는 런타임 API를 찾아라. 이 저장소 대시보드가 바로 읽을 수 있게 필요한 필드명, 샘플 페이로드, 래퍼 스크립트 수정 포인트를 정리하고 가능하면 실제 반영 코드까지 제안하라.",
    operatorComment: "실제 사용 가능한 로그/파일/API가 없으면 없다고 명확히 적고, 우회 수집 방식을 함께 제안.",
    decisionNeeded: false,
    decisionOwner: "user",
    decisionPrompt: "",
    nextStep: "실행 버튼으로 작업 시작",
    dependsOn: [],
    hiddenContext: "",
    reviewPrompt: "제안이 실제로 대시보드 연동에 바로 쓰일 수준인지, 필드명과 경로가 구체적인지 확인",
    releaseStatus: "not_applicable",
    execution: defaultExecution(),
    tags: ["Claude", "토큰", "런타임"],
    updatedAt: new Date().toISOString(),
  });
  writeState(state);
}

function resetBoard() {
  const current = readState();
  current.tasks.forEach((task) => {
    task.status = "todo";
    task.releaseStatus = task.releaseStatus === "not_applicable" ? "not_applicable" : "not_released";
    task.execution = defaultExecution();
    task.updatedAt = new Date().toISOString();
  });
  current.history = [];
  writeState(current);
}

function cancelTaskRun(taskId) {
  const active = runningJobs.get(taskId);
  if (active?.child && !active.child.killed) {
    try {
      active.child.kill();
    } catch (error) {}
  }

  runningJobs.delete(taskId);

  const state = readState();
  const task = state.tasks.find((item) => item.id === taskId);
  if (!task) return;

  const wasQa = task.execution?.mode === "qa";
  task.status = wasQa ? "review" : "todo";
  task.execution = {
    ...(task.execution || defaultExecution()),
    mode: "idle",
    running: false,
    processId: null,
    lastIssue: "운영자가 실행을 취소함",
  };
  task.nextStep = wasQa ? "QA를 다시 실행" : "필요하면 다시 실행";
  task.updatedAt = new Date().toISOString();
  pushHistoryEntry(state, {
    task,
    stage: wasQa ? "qa" : "run",
    result: "cancelled",
    summary: "운영자가 실행을 취소함",
    logPath: task.execution?.lastLogPath || "",
  });
  writeState(state);
}

function readState() {
  return JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function refreshAgentExecution(state) {
  const normalized = {
    ...state,
    agents: (state.agents || []).map((agent) => ({ ...agent, parallelSlots: agent.parallelSlots || 1 })),
    history: Array.isArray(state.history) ? state.history : [],
    taskTemplates: Array.isArray(state.taskTemplates) ? state.taskTemplates : [],
  };

  normalized.tasks = (normalized.tasks || []).map((task) => ({
    ...task,
    dependsOn: Array.isArray(task.dependsOn) ? task.dependsOn : [],
    operatorComment: task.operatorComment || "",
    execution: {
      ...defaultExecution(),
      ...(task.execution || {}),
    },
  }));

  return normalized;
}

function findLatestCodexSession(agent) {
  const roots = [];
  if (agent?.codexHome) roots.push(path.join(agent.codexHome, "sessions"));
  roots.push(path.join(CODEX_HOME, "sessions"));
  let latest = null;
  for (const dir of roots) {
    if (!fs.existsSync(dir)) continue;
    walk(dir, (filePath, stat) => {
      if (!filePath.endsWith(".jsonl")) return;
      const meta = readCodexSessionMeta(filePath);
      if (!meta) return;
      if (!matchesCodexAgent(agent, meta)) return;
      if (!latest || stat.mtimeMs > latest.mtimeMs) latest = { fullPath: filePath, mtimeMs: stat.mtimeMs, meta };
    });
  }
  return latest;
}

function readCodexSessionMeta(filePath) {
  const lines = safeReadLines(filePath);
  let sessionMeta = null;
  let turnContext = null;
  let tokenEvent = null;
  for (const line of lines.slice(0, 20)) {
    try {
      const parsed = JSON.parse(line);
      if (!sessionMeta && parsed.type === "session_meta") sessionMeta = parsed.payload || {};
      if (!turnContext && parsed.type === "turn_context") turnContext = parsed.payload || {};
      if (!tokenEvent && parsed.type === "event_msg" && parsed.payload?.type === "token_count") tokenEvent = parsed.payload || {};
      if (sessionMeta && tokenEvent) break;
    } catch (error) {}
  }
  if (!sessionMeta) return null;
  return {
    cwd: sessionMeta.cwd || turnContext?.cwd || "",
    source: sessionMeta.source || "",
    originator: sessionMeta.originator || "",
    cliVersion: sessionMeta.cli_version || "",
    planType: tokenEvent?.rate_limits?.plan_type || null,
  };
}

function matchesCodexAgent(agent, meta) {
  const match = agent?.runtimeMatch || {};
  if (match.planType && meta.planType !== match.planType) return false;
  if (Array.isArray(match.cwdIncludes) && match.cwdIncludes.length) {
    const cwd = String(meta.cwd || "").toLowerCase();
    if (!match.cwdIncludes.every((token) => cwd.includes(String(token).toLowerCase()))) return false;
  }
  return true;
}

function buildCodexRuntimeNote(agent, meta) {
  const chunks = ["세션 JSONL에서 실시간 수집"];
  if (agent?.codexProfileId) chunks.push(`프로필 ${agent.codexProfileId}`);
  if (meta?.planType) chunks.push(`요금제 ${meta.planType}`);
  if (meta?.cwd) chunks.push(`cwd ${meta.cwd}`);
  return chunks.join(" · ");
}

function readManualRuntime(agentId) {
  const filePath = path.join(RUNTIME_DIR, `${agentId}.json`);
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    return null;
  }
}

function mergeRuntime(base, extra) {
  if (!extra) return base;
  return {
    ...base,
    ...extra,
    tokens: { ...base.tokens, ...(extra.tokens || {}) },
    quota: { ...base.quota, ...(extra.quota || {}) },
  };
}

function launchAgentTerminal(agentId) {
  const state = readState();
  const agent = (state.agents || []).find((item) => item.id === agentId);
  if (!agent) return { ok: false, message: "agent not found" };
  if (!agent.loginCommand) return { ok: false, message: "login command not configured" };

  const normalized = String(agent.loginCommand).replace(/^\.\\/, "").replaceAll("/", "\\");
  const launcherPath = path.join(ROOT, normalized);
  if (!fs.existsSync(launcherPath)) return { ok: false, message: "launcher not found" };

  try {
    const child = spawn("cmd.exe", ["/c", launcherPath], {
      cwd: ROOT,
      detached: true,
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error.message || "launch failed" };
  }
}

function baseRuntime() {
  return {
    isActive: false,
    lastActiveAt: null,
    sessionPath: "",
    tokens: { session: null, total: null, last: null },
    tokenSourceLabel: "연결 없음",
    note: "",
    activityLabel: "",
    userOrderLabel: "",
    terminal: {
      shell: "",
      pid: null,
      title: "",
      command: ""
    },
    quota: {
      planType: null,
      primaryUsedPercent: null,
      primaryRemainingPercent: null,
      primaryResetAt: null,
      secondaryUsedPercent: null,
      secondaryRemainingPercent: null,
      secondaryResetAt: null
    }
  };
}

function inactiveRuntime(note) {
  const runtime = baseRuntime();
  runtime.note = note;
  return runtime;
}

function defaultExecution() {
  return {
    mode: "idle",
    running: false,
    lastRunAt: null,
    lastOutput: "",
    lastIssue: "",
    qaSummary: "",
    lastLogPath: "",
    processId: null,
    processCommand: ""
  };
}

function enrichTask(state, task) {
  const blockers = getDependencyBlockers(state, task);
  return {
    ...task,
    dependencyState: {
      blocked: blockers.length > 0,
      blockerIds: blockers.map((item) => item.id),
      blockerTitles: blockers.map((item) => item.title),
      ready: blockers.length === 0,
    },
  };
}

function summarizeAgentExecution(state, agentId) {
  const runningTasks = state.tasks.filter((task) => task.execution?.running && executorForTask(task) === agentId);
  const queuedTasks = state.tasks.filter((task) => isQueuedMode(task.execution?.mode) && executorForTask(task) === agentId);
  return {
    runningCount: runningTasks.length,
    queuedCount: queuedTasks.length,
    runningTaskIds: runningTasks.map((task) => task.id),
    runningTaskTitles: runningTasks.map((task) => task.title),
    queuedTaskTitles: queuedTasks.map((task) => task.title),
  };
}

function scheduleQueuedRuns() {
  const state = refreshAgentExecution(readState());

  for (const agent of state.agents) {
    const capacity = Math.max(1, Number(agent.parallelSlots || 1));
    const runningCount = state.tasks.filter((task) => task.execution?.running && executorForTask(task) === agent.id).length;
    let freeSlots = capacity - runningCount;
    if (freeSlots <= 0) continue;

    const queuedTasks = state.tasks.filter((task) => isQueuedForAgent(task, agent.id));
    for (const task of queuedTasks) {
      if (freeSlots <= 0) break;
      if (getDependencyBlockers(state, task).length) continue;
      if (task.execution?.mode === "queued_run") dispatchTaskRun(task);
      if (task.execution?.mode === "queued_qa") dispatchQaRun(task);
      freeSlots -= 1;
    }
  }
}

function executorForTask(task) {
  return task.execution?.mode === "qa" || task.execution?.mode === "queued_qa" ? "claude" : task.ownerId;
}

function isQueuedMode(mode) {
  return mode === "queued_run" || mode === "queued_qa";
}

function isQueuedForAgent(task, agentId) {
  return isQueuedMode(task.execution?.mode) && executorForTask(task) === agentId;
}

function findAgentName(state, agentId) {
  return state.agents.find((agent) => agent.id === agentId)?.name || agentId;
}

function getDependencyBlockers(state, task) {
  const dependencies = Array.isArray(task.dependsOn) ? task.dependsOn : [];
  return dependencies
    .map((dependencyId) => state.tasks.find((item) => item.id === dependencyId))
    .filter((dependency) => dependency && dependency.status !== "done");
}

function pushHistoryEntry(state, payload) {
  const history = Array.isArray(state.history) ? state.history : [];
  history.unshift({
    id: `history-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    taskId: payload.task.id,
    taskTitle: payload.task.title,
    agentId: executorForTask(payload.task),
    ownerId: payload.task.ownerId,
    stage: payload.stage,
    result: payload.result,
    summary: payload.summary,
    logPath: payload.logPath || "",
    createdAt: new Date().toISOString(),
  });
  state.history = history.slice(0, 40);
}

function findLatestFile(dir, ext) {
  if (!fs.existsSync(dir)) return null;
  let latest = null;
  walk(dir, (filePath, stat) => {
    if (!filePath.endsWith(ext)) return;
    if (!latest || stat.mtimeMs > latest.mtimeMs) latest = { fullPath: filePath, mtimeMs: stat.mtimeMs };
  });
  return latest;
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    try {
      const stat = fs.statSync(fullPath);
      if (entry.isDirectory()) walk(fullPath, visit);
      else visit(fullPath, stat);
    } catch (error) {}
  }
}

function safeReadLines(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  } catch (error) {
    return [];
  }
}

function epochToIso(value) {
  if (!value) return null;
  return new Date(Number(value) * 1000).toISOString();
}

function truncateOutput(value, limit = 500) {
  if (!value) return "";
  const cleaned = String(value).replace(/\s+/g, " ").trim();
  return cleaned.length > limit ? `${cleaned.slice(0, limit - 1)}…` : cleaned;
}

function persistRunLog(logFile, stdout, stderr) {
  if (!logFile) return;
  const output = [stdout, stderr].filter(Boolean).join("\n\n[stderr]\n\n");
  if (!output.trim()) return;
  try {
    fs.writeFileSync(logFile, output, "utf8");
  } catch (error) {}
}

function appendRunLog(logFile, text) {
  if (!logFile || !text) return;
  try {
    fs.appendFileSync(logFile, text, "utf8");
  } catch (error) {}
}

function resolveTaskLogPath(task) {
  if (task.execution?.lastLogPath) {
    return path.join(ROOT, task.execution.lastLogPath);
  }
  const suffix = task.execution?.mode === "qa" || task.execution?.mode === "queued_qa" ? "qa" : "run";
  return path.join(RUN_DIR, `${task.id}-${suffix}.log`);
}

function relativeRunPath(taskId, kind) {
  return `./dashboard-data/runs/${taskId}-${kind}.log`;
}

function parseJson(value) {
  try {
    return JSON.parse(value);
  } catch (error) {
    return null;
  }
}

async function handleReferenceSave(req, res) {
  const body = await readBody(req);
  const payload = parseJson(body) || {};
  const target = resolveWorkspacePath(payload.path);
  if (!target || path.extname(target).toLowerCase() !== ".md") {
    return json(res, { ok: false, message: "지원하지 않는 문서 경로" });
  }
  fs.writeFileSync(target, String(payload.content || ""), "utf8");
  return json(res, { ok: true });
}

function handleReferenceRead(requestUrl, res) {
  const target = resolveWorkspacePath(requestUrl.searchParams.get("path"));
  if (!target || path.extname(target).toLowerCase() !== ".md" || !fs.existsSync(target)) {
    return json(res, { ok: false, message: "문서를 찾을 수 없음" });
  }
  return json(res, {
    ok: true,
    path: path.relative(ROOT, target).replaceAll("\\", "/"),
    content: fs.readFileSync(target, "utf8"),
  });
}

function resolveWorkspacePath(relativePath) {
  if (!relativePath) return null;
  const sanitized = String(relativePath).replace(/^\.\//, "");
  const fullPath = path.normalize(path.join(ROOT, sanitized));
  if (!fullPath.startsWith(ROOT)) return null;
  return fullPath;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function serveStatic(pathname, res) {
  const relativePath = pathname === "/" ? "/dashboard.html" : pathname;
  const filePath = path.normalize(path.join(ROOT, relativePath));
  if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end("Not found");
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".md": "text/markdown; charset=utf-8"
  }[ext] || "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType, "Cache-Control": "no-store" });
  fs.createReadStream(filePath).pipe(res);
}

function json(res, payload) {
  res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(payload, null, 2));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => resolve(data));
    req.on("error", reject);
  });
}

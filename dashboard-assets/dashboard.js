(function () {
  const TAB_IDS = ["ops-tab", "work-tab"];
  const BOARD_COLUMNS = [
    { key: "todo", label: "할 일" },
    { key: "in_progress", label: "진행중" },
    { key: "review", label: "검토" },
    { key: "done", label: "완료" },
  ];

  let state = null;
  let logPollHandle = null;

  const els = {
    gnbOverview: document.getElementById("gnb-overview"),
    agentList: document.getElementById("agent-list"),
    tokenMonitor: document.getElementById("token-monitor"),
    referenceList: document.getElementById("reference-list"),
    decisionList: document.getElementById("decision-list"),
    historyList: document.getElementById("history-list"),
    kanbanBoard: document.getElementById("kanban-board"),
    telemetryUpdatedAt: document.getElementById("telemetry-updated-at"),
    saveBoardBtn: document.getElementById("save-board-btn"),
    exportBoardBtn: document.getElementById("export-board-btn"),
    importBoardInput: document.getElementById("import-board-input"),
    resetBoardBtn: document.getElementById("reset-board-btn"),
    seedBacklogBtn: document.getElementById("seed-backlog-btn"),
    orderForm: document.getElementById("order-form"),
    orderOwnerSelect: document.getElementById("order-owner-select"),
    taskTemplateSelect: document.getElementById("task-template-select"),
    taskDependencySelect: document.getElementById("task-dependency-select"),
  };

  init();

  async function init() {
    wireEvents();
    await refreshState();
    window.setInterval(refreshState, 4000);
  }

  function wireEvents() {
    els.saveBoardBtn.addEventListener("click", saveState);
    els.exportBoardBtn.addEventListener("click", exportState);
    els.importBoardInput.addEventListener("change", importState);
    els.resetBoardBtn.addEventListener("click", resetState);
    els.seedBacklogBtn.addEventListener("click", seedClaudeTask);
    els.orderForm.addEventListener("submit", onOrderSubmit);
    els.taskTemplateSelect.addEventListener("change", onTemplateChange);

    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.addEventListener("click", () => switchTab(button.dataset.tabTarget));
    });
  }

  async function refreshState() {
    try {
      const response = await fetch("/api/dashboard-state", { cache: "no-store" });
      if (!response.ok) throw new Error("api");
      state = await response.json();
      render();
    } catch (error) {
      renderConnectionError();
    }
  }

  function render() {
    renderOverview();
    renderOwnerOptions();
    renderTemplateOptions();
    renderDependencyOptions();
    renderAgents();
    renderTokens();
    renderReferences();
    renderDecisions();
    renderHistory();
    renderBoard();
    syncLogPolling();
  }

  function renderConnectionError() {
    const message = "대시보드 서버와 연결되지 않았습니다. dashboard.cmd로 서버를 먼저 실행한 뒤 새로고침하세요.";
    const block = `<p class="empty-state">${escapeHtml(message)}</p>`;
    els.gnbOverview.innerHTML = `<div class="gnb-chip"><strong>서버 연결 필요</strong><span>${escapeHtml(message)}</span></div>`;
    els.agentList.innerHTML = block;
    els.tokenMonitor.innerHTML = block;
    els.referenceList.innerHTML = block;
    els.decisionList.innerHTML = block;
    els.historyList.innerHTML = block;
    els.kanbanBoard.innerHTML = block;
    els.telemetryUpdatedAt.textContent = "서버 연결 안 됨";
  }

  function renderOverview() {
    const tasks = state.tasks || [];
    const activeAgents = state.agents.filter((agent) => agent.runtime?.isActive).length;
    const runningTasks = tasks.filter((task) => task.execution?.running).length;
    const reviewTasks = tasks.filter((task) => task.status === "review").length;
    const blockedTasks = tasks.filter((task) => task.dependencyState?.blocked && task.status === "todo").length;

    const items = [
      ["활성 에이전트", activeAgents],
      ["실행중 태스크", runningTasks],
      ["검토 대기", reviewTasks],
      ["선행 작업 대기", blockedTasks],
      ["최근 갱신", formatTime(state.meta?.updatedAt)],
    ];

    els.gnbOverview.innerHTML = items
      .map(([label, value]) => `<div class="gnb-chip"><span>${escapeHtml(label)}</span><strong>${escapeHtml(String(value))}</strong></div>`)
      .join("");
  }

  function renderOwnerOptions() {
    const current = els.orderOwnerSelect.value;
    els.orderOwnerSelect.innerHTML = (state.agents || [])
      .map((agent) => `<option value="${escapeHtml(agent.id)}">${escapeHtml(agent.name)}</option>`)
      .join("");
    if (current) els.orderOwnerSelect.value = current;
  }

  function renderTemplateOptions() {
    const current = els.taskTemplateSelect.value;
    const options = ['<option value="">직접 입력</option>']
      .concat((state.taskTemplates || []).map((template) => `<option value="${escapeHtml(template.id)}">${escapeHtml(template.label)}</option>`));
    els.taskTemplateSelect.innerHTML = options.join("");
    if (current) els.taskTemplateSelect.value = current;
  }

  function renderDependencyOptions() {
    const selected = els.taskDependencySelect.value;
    const options = ['<option value="">없음</option>'].concat(
      (state.tasks || []).map((task) => `<option value="${escapeHtml(task.id)}">${escapeHtml(task.title)}</option>`)
    );
    els.taskDependencySelect.innerHTML = options.join("");
    if (selected) els.taskDependencySelect.value = selected;
  }

  function renderAgents() {
    els.agentList.innerHTML = (state.agents || [])
      .map((agent) => {
        const runtime = agent.runtime || {};
        const execution = agent.execution || {};
        return `
          <article class="agent-card">
            <div class="card-head">
              <div>
                <h3>${escapeHtml(agent.name)}</h3>
                <p class="muted">${escapeHtml(agent.role || "")}</p>
              </div>
              <span class="pill ${runtime.isActive ? "pill-live" : "pill-idle"}">${runtime.isActive ? "연결됨" : "대기"}</span>
            </div>
            <p class="body-text"><strong>병렬 슬롯:</strong> ${escapeHtml(String(execution.runningCount || 0))} / ${escapeHtml(String(agent.parallelSlots || 1))}</p>
            <p class="body-text"><strong>대기열:</strong> ${escapeHtml(String(execution.queuedCount || 0))}</p>
            <p class="body-text"><strong>현재 활동:</strong> ${escapeHtml(runtime.activityLabel || "감지 정보 없음")}</p>
            ${runtime.userOrderLabel ? `<p class="body-text"><strong>최근 오더:</strong> ${escapeHtml(runtime.userOrderLabel)}</p>` : ""}
            <p class="body-text"><strong>터미널 실행:</strong> ${escapeHtml(agent.loginCommand || "-")}</p>
            <p class="body-text"><strong>오더 실행 방식:</strong> ${escapeHtml("백그라운드 CLI 실행")}</p>
            <p class="body-text"><strong>브랜치:</strong> ${escapeHtml(agent.branch || "-")}</p>
            <p class="body-text"><strong>현재 터미널:</strong> ${escapeHtml(formatTerminal(runtime.terminal))}</p>
            <p class="body-text"><strong>메모:</strong> ${escapeHtml(runtime.note || agent.notes || "-")}</p>
            <div class="button-row">
              <button class="mini-button" type="button" data-agent-action="launch" data-agent-id="${escapeHtml(agent.id)}">터미널 열기</button>
            </div>
          </article>
        `;
      })
      .join("");

    bindAgentButtons(els.agentList);
  }

  function renderTokens() {
    els.telemetryUpdatedAt.textContent = `갱신 ${formatTime(state.telemetryUpdatedAt)}`;
    els.tokenMonitor.innerHTML = (state.agents || [])
      .map((agent) => {
        const runtime = agent.runtime || {};
        const quota = runtime.quota || {};
        return `
          <article class="token-card">
            <div class="card-head">
              <div>
                <h3>${escapeHtml(agent.name)}</h3>
                <p class="muted">${escapeHtml(runtime.tokenSourceLabel || "-")}</p>
              </div>
            </div>
            <div class="metric-grid">
              <div class="metric-box">
                <span class="metric-label">세션 토큰</span>
                <strong>${formatToken(runtime.tokens?.session)}</strong>
              </div>
              <div class="metric-box">
                <span class="metric-label">누적 토큰</span>
                <strong>${formatToken(runtime.tokens?.total)}</strong>
              </div>
            </div>
            ${renderQuota(quota)}
          </article>
        `;
      })
      .join("");
  }

  function renderQuota(quota) {
    const hasPrimary = quota.primaryUsedPercent !== null && quota.primaryUsedPercent !== undefined;
    const hasSecondary = quota.secondaryUsedPercent !== null && quota.secondaryUsedPercent !== undefined;
    if (!hasPrimary && !hasSecondary) {
      return `<p class="body-text">이 에이전트는 현재 토큰 한도 로그를 제공하지 않습니다.</p>`;
    }

    const rows = [];
    if (hasPrimary) rows.push(quotaRow("단기 한도", quota.primaryUsedPercent, quota.primaryRemainingPercent, quota.primaryResetAt));
    if (hasSecondary) rows.push(quotaRow("주간 한도", quota.secondaryUsedPercent, quota.secondaryRemainingPercent, quota.secondaryResetAt));
    return `<div class="quota-stack">${rows.join("")}</div>`;
  }

  function quotaRow(label, used, remaining, resetAt) {
    return `
      <div class="quota-row">
        <div class="quota-head">
          <strong>${escapeHtml(label)}</strong>
          <span class="muted">다음 충전 ${escapeHtml(formatTime(resetAt))}</span>
        </div>
        <div class="quota-bar"><span class="quota-fill" style="width:${Number(used || 0)}%"></span></div>
        <div class="quota-meta">
          <span>사용 ${escapeHtml(formatPercent(used))}</span>
          <span>잔여 ${escapeHtml(formatPercent(remaining))}</span>
        </div>
      </div>
    `;
  }

  function renderReferences() {
    els.referenceList.innerHTML = (state.references || [])
      .map((ref) => `
        <article class="reference-card">
          <h3>${escapeHtml(ref.title)}</h3>
          <p class="body-text">${escapeHtml(ref.summary || "")}</p>
          <div class="button-row">
            ${(ref.links || []).map((link) => `<button class="mini-button" type="button" data-doc-path="${escapeHtml(link.href)}">${escapeHtml(link.label)}</button>`).join("")}
          </div>
        </article>
      `)
      .join("");

    els.referenceList.querySelectorAll("[data-doc-path]").forEach((button) => {
      button.addEventListener("click", () => {
        const docPath = button.dataset.docPath;
        const url = `/markdown-editor.html?path=${encodeURIComponent(docPath)}`;
        window.open(url, "_blank", "noopener,noreferrer");
      });
    });
  }

  function renderDecisions() {
    const items = (state.tasks || []).filter((task) => task.decisionNeeded);
    if (!items.length) {
      els.decisionList.innerHTML = '<p class="empty-state">지금 결정이 필요한 항목이 없습니다.</p>';
      return;
    }

    els.decisionList.innerHTML = items
      .map((task) => `
        <article class="decision-card">
          <h3>${escapeHtml(task.title)}</h3>
          <p class="body-text">${escapeHtml(task.decisionPrompt || "")}</p>
          ${task.dependencyState?.blocked ? `<p class="body-text"><strong>선행 작업:</strong> ${escapeHtml(task.dependencyState.blockerTitles.join(", "))}</p>` : ""}
          <div class="button-row">
            <button class="mini-button" type="button" data-task-action="decision-clear" data-task-id="${escapeHtml(task.id)}">결정 완료</button>
          </div>
        </article>
      `)
      .join("");

    bindTaskButtons(els.decisionList);
  }

  function renderHistory() {
    const items = (state.history || []).slice(0, 10);
    if (!items.length) {
      els.historyList.innerHTML = '<p class="empty-state">아직 실행 기록이 없습니다.</p>';
      return;
    }

    els.historyList.innerHTML = items
      .map((item) => `
        <article class="history-card">
          <div class="card-head">
            <div>
              <h3>${escapeHtml(item.taskTitle)}</h3>
              <p class="muted">${escapeHtml(historyStageLabel(item.stage))} · ${escapeHtml(formatTime(item.createdAt))}</p>
            </div>
            <span class="pill ${historyPillClass(item.result)}">${escapeHtml(historyResultLabel(item.result))}</span>
          </div>
          <p class="body-text">${escapeHtml(item.summary || "")}</p>
        </article>
      `)
      .join("");
  }

  function renderBoard() {
    const groups = {
      todo: (state.tasks || []).filter((task) => task.status === "todo" || task.status === "backlog"),
      in_progress: (state.tasks || []).filter((task) => task.status === "in_progress"),
      review: (state.tasks || []).filter((task) => task.status === "review"),
      done: (state.tasks || []).filter((task) => task.status === "done"),
    };

    els.kanbanBoard.innerHTML = BOARD_COLUMNS.map((column) => `
      <section class="kanban-column">
        <div class="kanban-head">
          <h3>${escapeHtml(column.label)}</h3>
          <span class="muted">${groups[column.key].length}</span>
        </div>
        <div class="kanban-stack">
          ${groups[column.key].length ? groups[column.key].map(renderTaskCard).join("") : '<p class="empty-state">비어 있음</p>'}
        </div>
      </section>
    `).join("");

    bindTaskButtons(els.kanbanBoard);
  }

  function renderTaskCard(task) {
    const ownerName = findAgent(task.ownerId)?.name || "미할당";
    const execution = task.execution || {};
    const executionStatus = taskExecutionStatus(task);
    const releaseText = task.releaseStatus === "released" ? "릴리스 완료" : task.releaseStatus === "not_applicable" ? "릴리스 대상 아님" : "미릴리스";
    return `
      <article class="task-card">
        <div class="card-head">
          <div>
            <div class="task-title-row">
              ${execution.running ? '<span class="signal-light" aria-hidden="true"></span>' : ""}
              <h3>${escapeHtml(task.title)}</h3>
            </div>
            <p class="muted">${escapeHtml(ownerName)} · ${escapeHtml(formatTime(task.updatedAt))}</p>
          </div>
          <span class="pill pill-priority-${escapeHtml(task.priority)}">${escapeHtml(priorityLabel(task.priority))}</span>
        </div>
        <p class="body-text">${escapeHtml(task.summary || "")}</p>
        ${executionStatus ? `<p class="body-text"><strong>실행 상태:</strong> ${escapeHtml(executionStatus)}</p>` : ""}
        ${renderDependencyLine(task)}
        ${renderTodoEditors(task)}
        <p class="body-text"><strong>다음 단계:</strong> ${escapeHtml(task.nextStep || "-")}</p>
        ${execution.running ? '<p class="live-text">실행중입니다. 신호등 아이콘과 로그가 계속 갱신됩니다.</p>' : ""}
        ${(execution.running || execution.lastLogPath) ? renderLogPanel(task) : ""}
        ${execution.lastIssue ? `<p class="issue-text"><strong>최근 이슈:</strong> ${escapeHtml(execution.lastIssue)}</p>` : ""}
        ${execution.qaSummary ? `<p class="body-text"><strong>QA 요약:</strong> ${escapeHtml(task.execution.qaSummary)}</p>` : ""}
        <label class="inline-edit">
          <span>내 추가 코멘트</span>
          <textarea rows="3" data-task-comment="${escapeHtml(task.id)}" placeholder="추가 지시, 수정 방향, QA 메모">${escapeHtml(task.operatorComment || "")}</textarea>
        </label>
        <details>
          <summary>프롬프트와 상세 내용</summary>
          <p class="body-text"><strong>실행 프롬프트:</strong> ${escapeHtml(task.prompt || "")}</p>
          <p class="body-text"><strong>QA 기준:</strong> ${escapeHtml(task.reviewPrompt || "")}</p>
          ${task.dependsOn?.length ? `<p class="body-text"><strong>선행 작업 ID:</strong> ${escapeHtml(task.dependsOn.join(", "))}</p>` : ""}
          ${execution.lastOutput ? `<p class="body-text"><strong>최근 출력:</strong> ${escapeHtml(execution.lastOutput)}</p>` : ""}
          ${execution.lastLogPath ? `<p class="body-text"><strong>로그 파일:</strong> ${escapeHtml(execution.lastLogPath)}</p>` : ""}
        </details>
        <div class="button-row">
          ${renderTaskActions(task, execution)}
        </div>
        <div class="release-line">${escapeHtml(releaseText)}</div>
      </article>
    `;
  }

  function renderTodoEditors(task) {
    if (task.status !== "todo" && task.status !== "backlog") return "";
    return `
      <div class="task-inline-grid">
        <label class="inline-edit">
          <span>선행 작업</span>
          <select data-task-dependency="${escapeHtml(task.id)}">
            ${renderDependencySelectOptions(task)}
          </select>
        </label>
        <label class="inline-edit">
          <span>할당 에이전트</span>
          <select data-task-owner="${escapeHtml(task.id)}">
            ${(state.agents || []).map((agent) => `<option value="${escapeHtml(agent.id)}" ${agent.id === task.ownerId ? "selected" : ""}>${escapeHtml(agent.name)}</option>`).join("")}
          </select>
        </label>
      </div>
    `;
  }

  function renderLogPanel(task) {
    const execution = task.execution || {};
    return `
      <section class="task-log-panel">
        <div class="task-log-head">
          <strong>실시간 실행 로그</strong>
          <span class="muted">${escapeHtml(execution.processId ? `PID ${execution.processId}` : "PID 없음")}</span>
        </div>
        ${execution.processCommand ? `<p class="body-text"><strong>실행 명령:</strong> ${escapeHtml(execution.processCommand)}</p>` : ""}
        ${execution.lastLogPath ? `<p class="body-text"><strong>로그 파일:</strong> ${escapeHtml(execution.lastLogPath)}</p>` : ""}
        <pre class="task-log-viewer" data-task-log="${escapeHtml(task.id)}">로그를 불러오는 중...</pre>
      </section>
    `;
  }

  function renderDependencyLine(task) {
    if (!task.dependsOn?.length) return "";
    if (task.dependencyState?.blocked) {
      return `<p class="issue-text"><strong>선행 작업 대기:</strong> ${escapeHtml(task.dependencyState.blockerTitles.join(", "))}</p>`;
    }
    return `<p class="body-text"><strong>선행 작업:</strong> 모두 완료</p>`;
  }

  function renderTaskActions(task, execution) {
    const actions = [];
    if (execution.running) {
      actions.push(`<button class="mini-button" type="button" data-task-action="cancel" data-task-id="${escapeHtml(task.id)}">실행 취소</button>`);
      return actions.join("");
    }
    if (task.status === "todo" || task.status === "backlog") {
      if (task.dependencyState?.blocked) {
        actions.push(`<button class="mini-button" type="button" disabled>선행 작업 대기</button>`);
      } else {
        actions.push(`<button class="mini-button mini-button-primary" type="button" data-task-action="start" data-task-id="${escapeHtml(task.id)}">실행 시작</button>`);
      }
      actions.push(`<button class="mini-button" type="button" data-task-action="delete" data-task-id="${escapeHtml(task.id)}">삭제</button>`);
      return actions.join("");
    }
    if (task.status === "review") {
      actions.push(`<button class="mini-button mini-button-primary" type="button" data-task-action="qa" data-task-id="${escapeHtml(task.id)}">QA 실행</button>`);
      actions.push(`<button class="mini-button" type="button" data-task-action="requeue" data-task-id="${escapeHtml(task.id)}">다시 할 일로</button>`);
      return actions.join("");
    }
    if (task.status === "done" && task.releaseStatus !== "not_applicable") {
      actions.push(`<button class="mini-button" type="button" data-task-action="release" data-task-id="${escapeHtml(task.id)}">${task.releaseStatus === "released" ? "릴리스 취소" : "릴리스 완료"}</button>`);
      return actions.join("");
    }
    return "";
  }

  function bindTaskButtons(root) {
    root.querySelectorAll("[data-task-action]").forEach((button) => {
      button.addEventListener("click", onTaskAction);
    });
    root.querySelectorAll("[data-task-dependency]").forEach((select) => {
      select.addEventListener("change", onDependencyChange);
    });
    root.querySelectorAll("[data-task-owner]").forEach((select) => {
      select.addEventListener("change", onOwnerChange);
    });
    root.querySelectorAll("[data-task-comment]").forEach((textarea) => {
      textarea.addEventListener("change", onCommentChange);
    });
  }

  function bindAgentButtons(root) {
    root.querySelectorAll("[data-agent-action]").forEach((button) => {
      button.addEventListener("click", onAgentAction);
    });
  }

  async function onAgentAction(event) {
    const agentId = event.currentTarget.dataset.agentId;
    const action = event.currentTarget.dataset.agentAction;
    const result = await post(`/api/agents/${agentId}/${action}`);
    if (!result.ok) {
      window.alert(result.message || "에이전트 실행 요청에 실패했습니다.");
      return;
    }
    window.setTimeout(refreshState, 1000);
  }

  function renderDependencySelectOptions(task) {
    const current = task.dependsOn?.[0] || "";
    const options = ['<option value="">없음</option>'];
    (state.tasks || [])
      .filter((candidate) => candidate.id !== task.id)
      .forEach((candidate) => {
        options.push(`<option value="${escapeHtml(candidate.id)}" ${candidate.id === current ? "selected" : ""}>${escapeHtml(candidate.title)}</option>`);
      });
    return options.join("");
  }

  async function onTaskAction(event) {
    const taskId = event.currentTarget.dataset.taskId;
    const action = event.currentTarget.dataset.taskAction;
    const commentField = document.querySelector(`[data-task-comment="${CSS.escape(taskId)}"]`);
    const operatorComment = commentField ? commentField.value.trim() : "";

    if (action === "requeue") {
      const issue = window.prompt("다시 할 일로 돌리는 이유를 입력하세요.", "QA 이슈");
      if (issue === null) return;
      const result = await post(`/api/tasks/${taskId}/requeue`, { issue, operatorComment });
      if (!result.ok) window.alert(result.message || "재작업 요청에 실패했습니다.");
      return refreshState();
    }

    if (action === "delete") {
      const confirmed = window.confirm("이 태스크를 삭제할까요?");
      if (!confirmed) return;
    }

    const result = await post(`/api/tasks/${taskId}/${action}`, { operatorComment });
    if (!result.ok) {
      window.alert(result.message || "작업 요청에 실패했습니다.");
    }
    await refreshState();
  }

  async function onDependencyChange(event) {
    const taskId = event.currentTarget.dataset.taskDependency;
    const dependsOn = event.currentTarget.value;
    const result = await post(`/api/tasks/${taskId}/dependency`, { dependsOn });
    if (!result.ok) window.alert(result.message || "선행작업 변경에 실패했습니다.");
    await refreshState();
  }

  async function onOwnerChange(event) {
    const taskId = event.currentTarget.dataset.taskOwner;
    const ownerId = event.currentTarget.value;
    const result = await post(`/api/tasks/${taskId}/owner`, { ownerId });
    if (!result.ok) window.alert(result.message || "할당 에이전트 변경에 실패했습니다.");
    await refreshState();
  }

  async function onCommentChange(event) {
    const taskId = event.currentTarget.dataset.taskComment;
    const operatorComment = event.currentTarget.value;
    const result = await post(`/api/tasks/${taskId}/comment`, { operatorComment });
    if (!result.ok) window.alert(result.message || "추가 코멘트 저장에 실패했습니다.");
  }

  function syncLogPolling() {
    if (logPollHandle) {
      window.clearInterval(logPollHandle);
      logPollHandle = null;
    }

    fetchVisibleLogs();

    if ((state.tasks || []).some((task) => task.execution?.running)) {
      logPollHandle = window.setInterval(fetchVisibleLogs, 2000);
    }
  }

  async function fetchVisibleLogs() {
    const viewers = Array.from(document.querySelectorAll("[data-task-log]"));
    await Promise.all(viewers.map(async (viewer) => {
      const taskId = viewer.dataset.taskLog;
      try {
        const response = await fetch(`/api/tasks/${taskId}/log?tail=16000`, { cache: "no-store" });
        const result = await response.json();
        viewer.textContent = result.ok ? (result.log || "아직 기록된 로그가 없습니다.") : (result.message || "로그를 불러오지 못했습니다.");
      } catch (error) {
        viewer.textContent = "로그를 불러오지 못했습니다.";
      }
    }));
  }

  async function onOrderSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const dependencyIds = els.taskDependencySelect.value ? [els.taskDependencySelect.value] : [];
    const prompt = String(form.get("prompt") || "").trim();
    const operatorComment = String(form.get("operatorComment") || "").trim();
    const reviewPrompt = String(form.get("reviewPrompt") || "").trim() || "변경 결과가 목표에 맞고 회귀가 없는지 확인";

    state.tasks.unshift({
      id: `task-${Date.now()}`,
      title: String(form.get("title") || "").trim(),
      ownerId: String(form.get("ownerId") || ""),
      status: "todo",
      priority: String(form.get("priority") || "medium"),
      summary: firstLine(prompt),
      prompt,
      operatorComment,
      decisionNeeded: Boolean(form.get("decisionNeeded")),
      decisionOwner: "user",
      decisionPrompt: String(form.get("decisionPrompt") || "").trim(),
      nextStep: dependencyIds.length ? "선행 작업 완료 후 실행" : "실행 버튼으로 작업 시작",
      dependsOn: dependencyIds,
      hiddenContext: "",
      reviewPrompt,
      releaseStatus: "not_released",
      execution: defaultExecution(),
      tags: [],
      updatedAt: new Date().toISOString(),
    });
    event.currentTarget.reset();
    els.taskTemplateSelect.value = "";
    render();
    await saveState();
  }

  function onTemplateChange(event) {
    const template = (state.taskTemplates || []).find((item) => item.id === event.currentTarget.value);
    if (!template) return;
    const form = els.orderForm;
    if (!form.elements.title.value.trim() && template.titlePrefix) form.elements.title.value = `${template.titlePrefix} 작업`;
    form.elements.ownerId.value = template.ownerId || form.elements.ownerId.value;
    form.elements.priority.value = template.priority || form.elements.priority.value;
    if (!form.elements.prompt.value.trim()) form.elements.prompt.value = template.promptTemplate || "";
    form.elements.reviewPrompt.value = template.reviewPrompt || form.elements.reviewPrompt.value;
    form.elements.decisionNeeded.checked = Boolean(template.decisionNeeded);
    if (!form.elements.decisionPrompt.value.trim()) form.elements.decisionPrompt.value = template.decisionPrompt || "";
  }

  async function seedClaudeTask() {
    const result = await post("/api/dashboard-seed");
    if (!result.ok) window.alert(result.message || "기본 태스크 추가에 실패했습니다.");
    await refreshState();
  }

  async function resetState() {
    const result = await post("/api/dashboard-reset");
    if (!result.ok) window.alert(result.message || "보드 초기화에 실패했습니다.");
    await refreshState();
  }

  async function saveState() {
    await fetch("/api/dashboard-state", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state, null, 2),
    });
    await refreshState();
  }

  function exportState() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "pixell-dashboard-state.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importState(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    state = JSON.parse(text);
    await saveState();
    event.target.value = "";
  }

  async function post(url, body) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : "{}",
    });
    return response.json();
  }

  function switchTab(targetId) {
    TAB_IDS.forEach((id) => {
      document.getElementById(id)?.classList.toggle("is-active", id === targetId);
    });
    document.querySelectorAll("[data-tab-target]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tabTarget === targetId);
    });
  }

  function priorityLabel(priority) {
    return { high: "높음", medium: "중간", low: "낮음" }[priority] || priority;
  }

  function taskExecutionStatus(task) {
    const mode = task.execution?.mode;
    if (mode === "queued_run") return `${findAgent(task.ownerId)?.name || task.ownerId} 슬롯 대기`;
    if (mode === "queued_qa") return "Claude QA 대기";
    if (mode === "run") return `${findAgent(task.ownerId)?.name || task.ownerId} 실행중`;
    if (mode === "qa") return "Claude QA 실행중";
    return "";
  }

  function findAgent(agentId) {
    return (state.agents || []).find((agent) => agent.id === agentId) || null;
  }

  function historyResultLabel(result) {
    return { pass: "성공", fail: "실패", cancelled: "취소" }[result] || result;
  }

  function historyStageLabel(stage) {
    return { run: "실행", qa: "QA" }[stage] || stage;
  }

  function historyPillClass(result) {
    return { pass: "pill-live", fail: "pill-priority-high", cancelled: "pill-idle" }[result] || "pill-idle";
  }

  function formatToken(value) {
    if (value === null || value === undefined) return "-";
    return new Intl.NumberFormat("ko-KR").format(Number(value));
  }

  function formatPercent(value) {
    if (value === null || value === undefined) return "-";
    return `${Number(value).toFixed(0)}%`;
  }

  function formatTime(value) {
    if (!value) return "-";
    try {
      return new Date(value).toLocaleString("ko-KR", {
        hour12: false,
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return String(value);
    }
  }

  function firstLine(value) {
    return (value.split(/\n+/)[0] || "").slice(0, 120);
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
      processCommand: "",
    };
  }

  function formatTerminal(terminal) {
    if (!terminal || (!terminal.pid && !terminal.command && !terminal.title)) return "감지 정보 없음";
    const parts = [];
    if (terminal.title) parts.push(terminal.title);
    if (terminal.shell) parts.push(terminal.shell);
    if (terminal.pid) parts.push(`PID ${terminal.pid}`);
    if (terminal.command) parts.push(terminal.command);
    return parts.join(" · ");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }
})();

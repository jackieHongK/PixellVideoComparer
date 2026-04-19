$repoPath = Split-Path -Parent $PSScriptRoot
Set-Location $repoPath
$claudeExe = Join-Path $env:USERPROFILE "AppData\Roaming\npm\node_modules\@anthropic-ai\claude-code\bin\claude.exe"

if (-not (Test-Path $claudeExe)) {
  Write-Host "claude executable not found." -ForegroundColor Yellow
  Write-Host "Check Claude CLI installation and try again." -ForegroundColor Yellow
  exit 1
}

Write-Host "Starting Claude in $repoPath" -ForegroundColor Cyan
& (Join-Path $PSScriptRoot "set-agent-runtime.ps1") `
  -AgentId "claude" `
  -ActivityLabel "Claude 터미널 실행" `
  -Note "런처에서 시작됨" `
  -TerminalTitle "Claude" `
  -TerminalShell "PowerShell" `
  -TerminalCommand $claudeExe `
  -TerminalPid $PID
& $claudeExe

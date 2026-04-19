$repoPath = Split-Path -Parent $PSScriptRoot
Set-Location $repoPath

$profileId = "pixell"
$codexHome = Join-Path $env:USERPROFILE ".codex-profiles\$profileId"
$codexCmd = Join-Path $env:USERPROFILE "AppData\Roaming\npm\codex.cmd"

if (-not (Test-Path $codexCmd)) {
  Write-Host "codex.cmd not found." -ForegroundColor Yellow
  Write-Host "Check Codex CLI installation and try again." -ForegroundColor Yellow
  exit 1
}

$env:CODEX_HOME = $codexHome
Write-Host "Starting Codex PIXELL in $repoPath" -ForegroundColor Cyan
Write-Host "CODEX_HOME=$codexHome" -ForegroundColor DarkGray
& (Join-Path $PSScriptRoot "set-agent-runtime.ps1") `
  -AgentId "codex_pixell" `
  -ActivityLabel "Codex PIXELL 터미널 실행" `
  -Note "런처에서 시작됨" `
  -TerminalTitle "Codex PIXELL" `
  -TerminalShell "PowerShell" `
  -TerminalCommand "$codexCmd -C $repoPath" `
  -TerminalPid $PID
& $codexCmd -C $repoPath

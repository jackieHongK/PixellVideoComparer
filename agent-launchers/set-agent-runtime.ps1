param(
  [Parameter(Mandatory = $true)]
  [string]$AgentId,

  [string]$ActivityLabel,
  [string]$UserOrderLabel,
  [string]$Note,
  [string]$TerminalTitle,
  [string]$TerminalShell,
  [string]$TerminalCommand,
  [int]$TerminalPid
)

$repoPath = Split-Path -Parent $PSScriptRoot
$dashboardUrl = "http://127.0.0.1:41731/api/agent-runtime/$AgentId"

$payload = @{
  activityLabel = $ActivityLabel
  userOrderLabel = $UserOrderLabel
  note = $Note
  terminal = @{
    title = $TerminalTitle
    shell = $TerminalShell
    command = $TerminalCommand
    pid = $TerminalPid
  }
  updatedAt = (Get-Date).ToString("o")
} | ConvertTo-Json

try {
  Invoke-WebRequest -Uri $dashboardUrl -Method Post -ContentType "application/json; charset=utf-8" -Body $payload | Out-Null
  Write-Host "Agent runtime updated for $AgentId" -ForegroundColor Green
} catch {
  Write-Host "Failed to update runtime. Start dashboard server first: http://127.0.0.1:41731/" -ForegroundColor Yellow
  exit 1
}

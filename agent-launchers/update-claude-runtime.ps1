param(
  [string]$ActivityLabel = "",
  [string]$UserOrderLabel = "",
  [string]$Note = ""
)

$dashboardUrl = "http://127.0.0.1:41731/api/agent-runtime/claude"

# Read existing runtime to preserve terminal info
$runtimeFile = Join-Path $PSScriptRoot "..\dashboard-data\agent-runtime\claude.json"
$existing = @{ terminal = @{} }
if (Test-Path $runtimeFile) {
  try { $existing = Get-Content $runtimeFile -Raw | ConvertFrom-Json } catch {}
}

$payload = @{
  activityLabel  = $ActivityLabel
  userOrderLabel = $UserOrderLabel
  note           = $Note
  terminal       = @{
    title   = if ($existing.terminal.title)   { $existing.terminal.title }   else { "Claude" }
    shell   = if ($existing.terminal.shell)   { $existing.terminal.shell }   else { "PowerShell" }
    command = if ($existing.terminal.command) { $existing.terminal.command } else { "claude.exe" }
    pid     = if ($existing.terminal.pid)     { $existing.terminal.pid }     else { 0 }
  }
  updatedAt      = (Get-Date).ToString("o")
} | ConvertTo-Json -Depth 4

try {
  Invoke-WebRequest -Uri $dashboardUrl -Method Post -ContentType "application/json; charset=utf-8" -Body $payload | Out-Null
  Write-Host "Claude runtime updated: $ActivityLabel" -ForegroundColor Green
} catch {
  Write-Host "Dashboard not running (http://127.0.0.1:41731)" -ForegroundColor Yellow
}

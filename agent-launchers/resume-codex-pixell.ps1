$repoPath = Split-Path -Parent $PSScriptRoot
Set-Location $repoPath

$profileId = "pixell"
$codexHome = Join-Path $env:USERPROFILE ".codex-profiles\$profileId"
$codexCmd = Join-Path $env:USERPROFILE "AppData\Roaming\npm\codex.cmd"

$env:CODEX_HOME = $codexHome
Write-Host "Resuming Codex PIXELL in $repoPath" -ForegroundColor Cyan
Write-Host "CODEX_HOME=$codexHome" -ForegroundColor DarkGray
& $codexCmd -C $repoPath resume --last

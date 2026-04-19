param(
  [Parameter(Mandatory = $true)]
  [ValidateSet("pixell", "personal")]
  [string]$ProfileId
)

$baseHome = Join-Path $env:USERPROFILE ".codex"
$targetHome = Join-Path $env:USERPROFILE ".codex-profiles\$ProfileId"

if (-not (Test-Path $baseHome)) {
  Write-Host "Base .codex directory not found: $baseHome" -ForegroundColor Yellow
  exit 1
}

if (-not (Test-Path $targetHome)) {
  New-Item -ItemType Directory -Path $targetHome -Force | Out-Null
}

$copyFiles = @(
  "auth.json",
  "config.toml",
  "models_cache.json",
  "version.json"
)

foreach ($name in $copyFiles) {
  $src = Join-Path $baseHome $name
  $dst = Join-Path $targetHome $name
  if (Test-Path $src) {
    Copy-Item -LiteralPath $src -Destination $dst -Force
  }
}

foreach ($dirName in @("sessions", "log", "rules", "memories")) {
  $targetDir = Join-Path $targetHome $dirName
  if (-not (Test-Path $targetDir)) {
    New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
  }
}

Write-Host "Codex profile bootstrapped: $ProfileId" -ForegroundColor Green
Write-Host "CODEX_HOME=$targetHome" -ForegroundColor DarkGray
Write-Host "If this profile should point to a different workspace, run login once with:" -ForegroundColor Yellow
Write-Host "  `$env:CODEX_HOME='$targetHome'; codex login" -ForegroundColor Yellow

# # build-next.ps1
# param(
#   [switch]$Clean,                 # wipe .next before building
#   [switch]$Zip,                   # create a zip after build
#   [string]$OutDir = "artifacts",  # where to put the zip
#   [string]$ZipName                # optional custom zip name
# )

# $ErrorActionPreference = 'Stop'

# function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
# function Ok($m){ Write-Host "[OK]   $m" -ForegroundColor Green }
# function Warn($m){ Write-Host "[WARN]  $m" -ForegroundColor Yellow }

# # 0) Quick sanity
# if (-not (Test-Path "package.json")) { throw "package.json not found. Run from your Next.js project root." }
# if (-not (Test-Path "node_modules")) { Warn "node_modules missing; proceeding WITHOUT npm install/ci as requested." }

# # 1) Clean (optional)
# if ($Clean) {
#   if (Test-Path ".next") {
#     Info "Removing .next"
#     Remove-Item ".next" -Recurse -Force
#   }
# }

# # 2) Build (no npm install/ci here)
# $env:NODE_ENV = 'production'
# Info "Running: npm run build"
# npm run build

# # 3) Report layout
# $standalone = Test-Path ".next/standalone/server.js"
# if ($standalone) {
#   Ok "Built standalone bundle at .next/standalone"
# } else {
#   Ok "Build complete (non-standalone layout in .next)"
# }

# # 4) Optional ZIP packaging
# if ($Zip) {
#   if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

#   $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
#   $mode = if ($standalone) { "standalone" } else { "fullnext" }
#   if (-not $ZipName) { $ZipName = "next-build-$mode-$timestamp.zip" }
#   $zipPath = Join-Path $OutDir $ZipName

#   # What to include
#   $paths = @()
#   if ($standalone) {
#     if (Test-Path ".next/standalone") { $paths += ".next/standalone" }
#     if (Test-Path ".next/static")     { $paths += ".next/static" }
#   } else {
#     $paths += ".next"
#   }
#   if (Test-Path "public")             { $paths += "public" }
#   if (Test-Path "package.json")       { $paths += "package.json" }
#   if (Test-Path "next.config.js")     { $paths += "next.config.js" }
#   if (Test-Path ".env.production")    { $paths += ".env.production" }
#   if (Test-Path "ecosystem.config.js"){ $paths += "ecosystem.config.js" }

#   if ($paths.Count -eq 0) { throw "Nothing to archive. Build first or check paths." }

#   Info "Creating ZIP: $zipPath"
#   if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
#   Compress-Archive -Path $paths -DestinationPath $zipPath -Force
#   Ok "ZIP ready: $zipPath"
# }

# Ok "Done. (No npm install/ci executed.)"
# build-next.ps1
param(
  [switch]$Clean,                 # wipe .next before building
  [switch]$Zip,                   # create a zip after build
  [string]$OutDir = "artifacts",  # where to put the zip
  [string]$ZipName                # optional custom zip name
)

$ErrorActionPreference = 'Stop'

function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[OK]   $m" -ForegroundColor Green }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Die($m){ Write-Host "[ERR]  $m" -ForegroundColor Red; exit 1 }

# Always run from this script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $scriptDir

# Sanity checks
if (-not (Test-Path "package.json")) { Die "package.json not found. Run from your Next.js project root." }
if (-not (Test-Path "node_modules")) { Warn "node_modules missing; proceeding WITHOUT npm install/ci as requested." }

# Optional clean
if ($Clean -and (Test-Path ".next")) {
  Info "Removing .next"
  Remove-Item ".next" -Recurse -Force
}

# Build
$env:NODE_ENV = 'production'
Info "Running: npm run build"
& npm run build
if ($LASTEXITCODE -ne 0) {
  Die "Build failed with exit code $LASTEXITCODE. Run 'npm run build' manually to see the error."
}

# Verify output
if (-not (Test-Path ".next")) { Die "Build reported success but '.next' not found." }

$standalone = Test-Path ".next/standalone/server.js"
if ($standalone) { Ok "Built standalone bundle at .next/standalone" }
else { Ok "Build complete (non-standalone layout in .next)" }

# Optional ZIP
if ($Zip) {
  if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }

  $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
  $mode = if ($standalone) { "standalone" } else { "fullnext" }
  if (-not $ZipName) { $ZipName = "next-build-$mode-$timestamp.zip" }
  $zipPath = Join-Path $OutDir $ZipName

  $paths = @()
  if ($standalone) {
    if (Test-Path ".next/standalone") { $paths += ".next/standalone" }
    if (Test-Path ".next/static")     { $paths += ".next/static" }
  } else {
    $paths += ".next"
  }

  # Core files
  if (Test-Path "public")                { $paths += "public" }
  if (Test-Path "package.json")          { $paths += "package.json" }
  if (Test-Path "package-lock.json")     { $paths += "package-lock.json" }
  if (Test-Path "next.config.js")        { $paths += "next.config.js" }

  # Environment files
  if (Test-Path ".env.production")       { $paths += ".env.production" }
  if (Test-Path ".env.local")            { $paths += ".env.local" }

  # PM2 deployment files
  if (Test-Path "ecosystem.production.config.js") { $paths += "ecosystem.production.config.js" }
  if (Test-Path "ecosystem.config.js")   { $paths += "ecosystem.config.js" }
  if (Test-Path "server.js")             { $paths += "server.js" }

  # Deployment scripts and docs
  if (Test-Path "verify-production-env.js") { $paths += "verify-production-env.js" }
  if (Test-Path "README.md")             { $paths += "README.md" }

  if ($paths.Count -eq 0) { Die "Nothing to archive. Build first or check paths." }

  Info "Files to include in deployment package:"
  foreach ($path in $paths) {
    $size = if (Test-Path $path -PathType Container) {
      (Get-ChildItem $path -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    } else {
      (Get-Item $path).Length / 1MB
    }
    Write-Host "  ✓ $path" -ForegroundColor Green -NoNewline
    Write-Host " ($([math]::Round($size, 2)) MB)" -ForegroundColor Gray
  }

  Info "Creating ZIP: $zipPath"
  if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
  Compress-Archive -Path $paths -DestinationPath $zipPath -Force

  $zipFull = [System.IO.Path]::GetFullPath($zipPath)
  Ok "ZIP ready: $zipFull"
  try { Start-Process explorer ([System.IO.Path]::GetFullPath($OutDir)) } catch {}
}

Ok "Done."

# zip-deploy.ps1
param(
  [ValidateSet('runtime','source')]
  [string]$Kind = 'runtime',          # runtime | source
  [string]$OutDir = 'artifacts',
  [string]$ZipName
)

$ErrorActionPreference = 'Stop'

function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Ok($m){ Write-Host "[OK]  $m" -ForegroundColor Green }
function Die($m){ Write-Host "[ERR] $m" -ForegroundColor Red; exit 1 }

# run from this script's directory
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -LiteralPath $scriptDir

if (-not (Test-Path 'package.json')) { Die "package.json not found here. Run from your project root." }

if (-not (Test-Path $OutDir)) { New-Item -ItemType Directory -Path $OutDir | Out-Null }
$stamp = Get-Date -Format 'yyyyMMdd-HHmmss'
if (-not $ZipName) { $ZipName = "tijarah-web-$Kind-$stamp.zip" }
$zipPath = Join-Path $OutDir $ZipName

switch ($Kind) {
  'runtime' {
    # zip the built runtime (no node_modules)
    $paths = @()
    foreach ($p in @('.next','public','package.json','next.config.js','.env.production','middleware.ts','ecosystem.production.config.js','ecosystem.config.js')) {
      if (Test-Path $p) { $paths += $p }
    }
    if (-not ($paths | Where-Object { $_ -eq '.next' })) {
      Info "'.next' not found; runtime zip will not contain a build."
    }
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Info "Creating runtime zip: $zipPath"
    Compress-Archive -Path $paths -DestinationPath $zipPath -Force
    Ok "ZIP ready: $([IO.Path]::GetFullPath($zipPath))"
  }
  'source' {
    # stage a clean copy without .next / node_modules / .git
    $stage = Join-Path $OutDir "stage-$stamp"
    New-Item -ItemType Directory -Path $stage | Out-Null
    Info "Staging source into $stage"
    robocopy . $stage /MIR /XD node_modules .next .git $OutDir .expo .vercel /XF *.log *.tmp > $null
    if (Test-Path 'package-lock.json') { Copy-Item package-lock.json $stage -Force }
    if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
    Info "Creating source zip: $zipPath"
    Compress-Archive -Path (Join-Path $stage '*') -DestinationPath $zipPath -Force
    Remove-Item $stage -Recurse -Force
    Ok "ZIP ready: $([IO.Path]::GetFullPath($zipPath))"
  }
}

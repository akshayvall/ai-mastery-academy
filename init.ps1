<#
.SYNOPSIS
    Bootstrap / convenience script for AI Mastery Academy.

.DESCRIPTION
    - With no switches: prints status of the project (file inventory + module counts).
    - -Serve: starts the local dev server on http://localhost:8080 (same as launch.bat).
    - -StampDate: refreshes the "last touched" date in CHANGELOG.md (Unreleased section).

    Idempotent. Safe to re-run.

.EXAMPLE
    ./init.ps1
    ./init.ps1 -Serve
    ./init.ps1 -StampDate
#>
[CmdletBinding()]
param(
    [switch]$Serve,
    [switch]$StampDate
)

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$today = (Get-Date).ToString('yyyy-MM-dd')

function Show-Status {
    Write-Host "AI Mastery Academy — status" -ForegroundColor Cyan
    Write-Host ("Root: {0}" -f $root)
    Write-Host ""

    $jsDir = Join-Path $root 'js'
    if (Test-Path $jsDir) {
        Write-Host "Module files:" -ForegroundColor Yellow
        foreach ($f in 'modules-100.js', 'modules-200.js', 'modules-300.js', 'modules-extras.js', 'modules-pm.js') {
            $p = Join-Path $jsDir $f
            if (-not (Test-Path $p)) { continue }
            $content = Get-Content $p -Raw
            $count = ([regex]::Matches($content, "id:\s*'[^']+'")).Count
            $kb = [math]::Round((Get-Item $p).Length / 1KB, 1)
            Write-Host ("  {0,-20} {1,4} module objects  ({2,6} KB)" -f $f, $count, $kb)
        }
    }

    Write-Host ""
    Write-Host "Convention files:" -ForegroundColor Yellow
    foreach ($f in 'README.md', 'CHANGELOG.md', 'SESSION_CONTEXT.md', 'launch.bat', 'index.html') {
        $p = Join-Path $root $f
        $mark = if (Test-Path $p) { 'OK ' } else { 'MISSING' }
        Write-Host ("  [{0}] {1}" -f $mark, $f)
    }

    Write-Host ""
    Write-Host "Run:" -ForegroundColor Green
    Write-Host "  ./init.ps1 -Serve       # start dev server on :8080"
    Write-Host "  ./init.ps1 -StampDate   # refresh changelog date stamp"
}

function Stamp-ChangelogDate {
    $cl = Join-Path $root 'CHANGELOG.md'
    if (-not (Test-Path $cl)) {
        Write-Host "CHANGELOG.md not found — nothing to stamp." -ForegroundColor Yellow
        return
    }
    $content = Get-Content $cl -Raw
    $stamp = "_Last touched: $today_"
    if ($content -match '_Last touched: \d{4}-\d{2}-\d{2}_') {
        $content = [regex]::Replace($content, '_Last touched: \d{4}-\d{2}-\d{2}_', $stamp)
    } else {
        $content = $content -replace '## \[Unreleased\]', "## [Unreleased]`n$stamp`n"
    }
    Set-Content $cl -Value $content -NoNewline
    Write-Host "Stamped CHANGELOG.md with $today" -ForegroundColor Green
}

function Start-Server {
    Push-Location $root
    try {
        $py = Get-Command python -ErrorAction SilentlyContinue
        if (-not $py) { $py = Get-Command python3 -ErrorAction SilentlyContinue }
        if ($py) {
            Write-Host "Serving with $($py.Name) on http://localhost:8080" -ForegroundColor Green
            & $py.Source -m http.server 8080
            return
        }
        $npx = Get-Command npx -ErrorAction SilentlyContinue
        if ($npx) {
            Write-Host "Serving with npx http-server on http://localhost:8080" -ForegroundColor Green
            & $npx http-server -p 8080 -c-1
            return
        }
        Write-Host "No Python or Node found. Opening index.html directly (limited features)." -ForegroundColor Yellow
        Start-Process (Join-Path $root 'index.html')
    } finally {
        Pop-Location
    }
}

if ($Serve) { Start-Server; return }
if ($StampDate) { Stamp-ChangelogDate; return }
Show-Status

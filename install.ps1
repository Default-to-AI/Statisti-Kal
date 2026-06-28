# install.ps1 — Installer for codebase-memory-mcp (Windows)

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12 -bor [Net.SecurityProtocolType]::Tls13

$Repo = "DeusData/codebase-memory-mcp"
$InstallDir = "$env:LOCALAPPDATA\Programs\codebase-memory-mcp"
$BinName = "codebase-memory-mcp.exe"
$BaseUrl = if ($env:CBM_DOWNLOAD_URL) { $env:CBM_DOWNLOAD_URL } else { "https://github.com/$Repo/releases/latest/download" }

if (-not $BaseUrl.StartsWith("https://") -and -not $BaseUrl.StartsWith("http://localhost") -and -not $BaseUrl.StartsWith("http://127.0.0.1")) {
    Write-Host "error: refusing non-HTTPS download URL: $BaseUrl" -ForegroundColor Red
    exit 1
}

$Variant = "standard"
$SkipConfig = $false
foreach ($arg in $args) {
    if ($arg -eq "--ui") { $Variant = "ui" }
    if ($arg -eq "--standard") { $Variant = "standard" }
    if ($arg -eq "--skip-config") { $SkipConfig = $true }
    if ($arg -like "--dir=*") { $InstallDir = $arg.Substring(6) }
}

$Archive = if ($Variant -eq "ui") { "codebase-memory-mcp-ui-windows-amd64.zip" } else { "codebase-memory-mcp-windows-amd64.zip" }
$Url = "$BaseUrl/$Archive"

Write-Host "Installing codebase-memory-mcp ($Variant variant)..."

$TmpDir = Join-Path ([System.IO.Path]::GetTempPath()) "cbm-install-$(Get-Random)"
New-Item -ItemType Directory -Path $TmpDir -Force | Out-Null

try {
    Write-Host "Downloading $Archive..."
    Invoke-WebRequest -Uri $Url -OutFile "$TmpDir\$Archive" -UseBasicParsing

    try {
        $checksumLine = (Invoke-WebRequest -Uri "$BaseUrl/checksums.txt" -UseBasicParsing).Content -split "`n" | Where-Object { $_ -like "*$Archive*" }
        if ($checksumLine) {
            $expected = ($checksumLine -split '\s+')[0]
            $actual = (Get-FileHash -Path "$TmpDir\$Archive" -Algorithm SHA256).Hash.ToLower()
            if ($expected -ne $actual) { throw "Checksum mismatch: expected $expected, got $actual" }
            Write-Host "Checksum verified."
        }
    } catch { Write-Host "warning: checksum verification skipped" }

    Expand-Archive -Path "$TmpDir\$Archive" -DestinationPath $TmpDir -Force

    $DlBin = Join-Path $TmpDir $BinName
    if (-not (Test-Path $DlBin)) {
        $UiBin = Join-Path $TmpDir "codebase-memory-mcp-ui.exe"
        if (Test-Path $UiBin) { Rename-Item $UiBin $BinName; $DlBin = Join-Path $TmpDir $BinName }
        else { throw "Binary not found after extraction" }
    }

    New-Item -ItemType Directory -Path $InstallDir -Force | Out-Null
    $Dest = Join-Path $InstallDir $BinName

    if (Test-Path $Dest) {
        Remove-Item "$Dest.old" -Force -ErrorAction SilentlyContinue
        Rename-Item $Dest "$Dest.old" -ErrorAction SilentlyContinue
    }

    Copy-Item $DlBin $Dest -Force
    Write-Host "Installed: $(& $Dest --version 2>&1)"

    if (-not $SkipConfig) {
        Write-Host "Configuring agents..."
        & $Dest install -y 2>&1 | Write-Host
    }

    $UserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    if ($UserPath -notlike "*$InstallDir*") {
        [Environment]::SetEnvironmentVariable("PATH", "$UserPath;$InstallDir", "User")
        $env:PATH = "$env:PATH;$InstallDir"
        Write-Host "Added to PATH"
    }
} finally {
    Remove-Item -Recurse -Force $TmpDir -ErrorAction SilentlyContinue
}

Write-Host "Done! Restart your terminal to use codebase-memory-mcp."

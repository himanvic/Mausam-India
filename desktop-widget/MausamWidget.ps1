# Mausam India — Native Windows Desktop Floating Widget
[CmdletBinding()]
param(
    [string]$City = "",
    [string]$Theme = "",
    [switch]$StayOnTop
)

# 1. Resolve paths and load configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ConfigFile = Join-Path $ScriptDir "config.json"
$Config = @{
    city = "New Delhi"
    theme = "dark"
    showAqi = $true
    alwaysOnTop = $true
    width = 340
    height = 205
    position = "top-right"
}

if (Test-Path $ConfigFile) {
    try {
        $loaded = Get-Content $ConfigFile -Raw | ConvertFrom-Json
        if ($loaded.city) { $Config.city = $loaded.city }
        if ($loaded.theme) { $Config.theme = $loaded.theme }
        if ($null -ne $loaded.showAqi) { $Config.showAqi = $loaded.showAqi }
        if ($null -ne $loaded.alwaysOnTop) { $Config.alwaysOnTop = $loaded.alwaysOnTop }
        if ($loaded.width) { $Config.width = [int]$loaded.width }
        if ($loaded.height) { $Config.height = [int]$loaded.height }
        if ($loaded.position) { $Config.position = $loaded.position }
    } catch {}
}

if ($City) { $Config.city = $City }
if ($Theme) { $Config.theme = $Theme }
if ($PSBoundParameters.ContainsKey('StayOnTop')) { $Config.alwaysOnTop = $StayOnTop.IsPresent }

# 2. Locate Microsoft Edge or Google Chrome
$BrowserExe = ""
$EdgePaths = @(
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
    "$env:LOCALAPPDATA\Microsoft\Edge\Application\msedge.exe"
)
foreach ($p in $EdgePaths) {
    if (Test-Path $p) { $BrowserExe = $p; break }
}

if (-not $BrowserExe) {
    $ChromePaths = @(
        "C:\Program Files\Google\Chrome\Application\chrome.exe",
        "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
        "$env:LOCALAPPDATA\Google\Chrome\Application\chrome.exe"
    )
    foreach ($p in $ChromePaths) {
        if (Test-Path $p) { $BrowserExe = $p; break }
    }
}

if (-not $BrowserExe) {
    [System.Windows.Forms.MessageBox]::Show(
        "Neither Microsoft Edge nor Google Chrome could be found to run the desktop widget.",
        "Mausam India Widget Error",
        [System.Windows.Forms.MessageBoxButtons]::OK,
        [System.Windows.Forms.MessageBoxIcon]::Error
    )
    exit 1
}

# 3. Calculate Screen Positioning (Top-Right by default)
Add-Type -AssemblyName System.Windows.Forms
$Screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$Width = $Config.width
$Height = $Config.height

$PosX = $Screen.Width - $Width - 25
$PosY = 40
if ($Config.position -eq "bottom-right") {
    $PosY = $Screen.Height - $Height - 25
} elseif ($Config.position -eq "top-left") {
    $PosX = 25
    $PosY = 40
} elseif ($Config.position -eq "bottom-left") {
    $PosX = 25
    $PosY = $Screen.Height - $Height - 25
}

# 4. Target Widget URL
$CityEncoded = [System.Uri]::EscapeDataString($Config.city)
$AqiParam = if ($Config.showAqi) { "true" } else { "false" }
$WidgetUrl = "https://mausam-india.pages.dev/widget.html?city=$CityEncoded&theme=$($Config.theme)&aqi=$AqiParam"

# Check if local widget.html exists for offline preview
$LocalWidget = Join-Path (Split-Path -Parent $ScriptDir) "public\widget.html"
if (-not (Test-Connection -ComputerName "pages.dev" -Count 1 -Quiet -ErrorAction SilentlyContinue) -and (Test-Path $LocalWidget)) {
    $WidgetUrl = "file:///" + $LocalWidget.Replace("\", "/") + "?city=$CityEncoded&theme=$($Config.theme)&aqi=$AqiParam"
}

# 5. Launch in dedicated, lightweight app mode
$UserDataDir = Join-Path $env:LOCALAPPDATA "MausamIndiaDesktopWidget"
$LaunchArgs = @(
    "--app=`"$WidgetUrl`"",
    "--window-size=$Width,$Height",
    "--window-position=$PosX,$PosY",
    "--user-data-dir=`"$UserDataDir`"",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking"
)

$Process = Start-Process -FilePath $BrowserExe -ArgumentList ($LaunchArgs -join " ") -PassThru

# 6. Apply Always-On-Top if requested
if ($Config.alwaysOnTop -and $Process) {
    Start-Sleep -Milliseconds 600
    $Win32Code = @"
using System;
using System.Runtime.InteropServices;
public class WidgetWin32 {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);

    public static readonly IntPtr HWND_TOPMOST = new IntPtr(-1);
    public const uint SWP_NOMOVE = 0x0002;
    public const uint SWP_NOSIZE = 0x0001;
    public const uint SWP_SHOWWINDOW = 0x0040;
}
"@
    try {
        Add-Type -TypeDefinition $Win32Code -Language CSharp -ErrorAction SilentlyContinue
        $hWnd = $Process.MainWindowHandle
        if ($hWnd -and $hWnd -ne [IntPtr]::Zero) {
            [WidgetWin32]::SetWindowPos($hWnd, [WidgetWin32]::HWND_TOPMOST, 0, 0, 0, 0, ([WidgetWin32]::SWP_NOMOVE -bor [WidgetWin32]::SWP_NOSIZE -bor [WidgetWin32]::SWP_SHOWWINDOW))
        }
    } catch {}
}

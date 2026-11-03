# Mausam India - Create Desktop Shortcut
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$DesktopPath = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Desktop)
$ShortcutPath = Join-Path $DesktopPath "Mausam India Desktop Widget.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"" + (Join-Path $ScriptDir "Launch-Widget.vbs") + "`""
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "Mausam India - Live Weather and CPCB AQI Desktop Widget"
$Shortcut.WindowStyle = 7

$IconCandidate = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if (Test-Path $IconCandidate) {
    $Shortcut.IconLocation = "$IconCandidate,0"
}
$Shortcut.Save()

Write-Host "Desktop shortcut created successfully on your Windows Desktop:" -ForegroundColor Green
Write-Host "   $ShortcutPath" -ForegroundColor Cyan

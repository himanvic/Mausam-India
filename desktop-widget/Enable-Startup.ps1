# Mausam India - Enable Autostart on Windows Login
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$StartupFolder = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$ShortcutPath = Join-Path $StartupFolder "Mausam India Desktop Widget.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = "wscript.exe"
$Shortcut.Arguments = "`"" + (Join-Path $ScriptDir "Launch-Widget.vbs") + "`""
$Shortcut.WorkingDirectory = $ScriptDir
$Shortcut.Description = "Mausam India - Live Weather and AQI Desktop Widget (Auto-Start)"
$Shortcut.WindowStyle = 7
$Shortcut.Save()

Write-Host "Autostart enabled! The widget will now open automatically when you log into Windows." -ForegroundColor Green

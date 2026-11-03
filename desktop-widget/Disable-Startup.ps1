# Mausam India - Disable Autostart
$StartupFolder = [System.Environment]::GetFolderPath([System.Environment+SpecialFolder]::Startup)
$ShortcutPath = Join-Path $StartupFolder "Mausam India Desktop Widget.lnk"

if (Test-Path $ShortcutPath) {
    Remove-Item -Path $ShortcutPath -Force
    Write-Host "Autostart disabled. Removed from Windows Startup." -ForegroundColor Green
} else {
    Write-Host "Autostart was not enabled." -ForegroundColor Yellow
}

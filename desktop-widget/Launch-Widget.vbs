Set WshShell = CreateObject("WScript.Shell")
ScriptPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
PsCmd = "powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -File """ & ScriptPath & "\MausamWidget.ps1"""
WshShell.Run PsCmd, 0, False

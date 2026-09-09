param([ValidateSet('install','start','stop','restart','status','uninstall')][string]$Action='status')
$ErrorActionPreference='Stop'
$projectRoot=Split-Path $PSScriptRoot -Parent
$taskName='N2-Daily-Course-Sync'
switch ($Action) {
 'install' {
  $nodePath=(Get-Command node -ErrorAction Stop).Source
  $gitFolder=Split-Path (Get-Command git -ErrorAction Stop).Source
  $syncDir=Join-Path $projectRoot '.sync'
  New-Item -ItemType Directory -Force -Path $syncDir | Out-Null
  $launcher=Join-Path $syncDir 'run-sync.ps1'
  $escapedRoot=$projectRoot.Replace("'","''")
  $escapedNode=$nodePath.Replace("'","''")
  $escapedGit=$gitFolder.Replace("'","''")
  @"
`$env:PATH='$escapedGit;'+`$env:PATH
Set-Location -LiteralPath '$escapedRoot'
& '$escapedNode' 'tools/sync.cjs' watch
exit `$LASTEXITCODE
"@ | Set-Content -LiteralPath $launcher -Encoding UTF8
  $command=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launcher`"" -WorkingDirectory $projectRoot
  $trigger=New-ScheduledTaskTrigger -AtLogOn -User ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name)
  $principal=New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
  $settings=New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero) -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
  Register-ScheduledTask -TaskName $taskName -Action $command -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
  Start-ScheduledTask -TaskName $taskName
 }
 'start' {Start-ScheduledTask -TaskName $taskName}
 'stop' {Stop-ScheduledTask -TaskName $taskName}
 'restart' {Stop-ScheduledTask -TaskName $taskName; Start-ScheduledTask -TaskName $taskName}
 'uninstall' {Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName $taskName -Confirm:$false}
 'status' {Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue | Select-Object TaskName,State; Get-ScheduledTaskInfo -TaskName $taskName -ErrorAction SilentlyContinue; if(Test-Path (Join-Path $projectRoot '.sync/status.json')){Get-Content (Join-Path $projectRoot '.sync/status.json')}}
}

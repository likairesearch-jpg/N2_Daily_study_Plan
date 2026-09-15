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
  @{NodePath=$nodePath;GitFolder=$gitFolder} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $syncDir 'runtime.json') -Encoding UTF8
  $launcher=Join-Path $syncDir 'run-sync.ps1'
  $escapedRoot=$projectRoot.Replace("'","''")
  $escapedNode=$nodePath.Replace("'","''")
  $escapedGit=$gitFolder.Replace("'","''")
  @"
`$env:PATH='$escapedGit;'+`$env:PATH
Set-Location -LiteralPath '$escapedRoot'
& '$escapedNode' 'tools/sync.cjs' once
exit `$LASTEXITCODE
"@ | Set-Content -LiteralPath $launcher -Encoding UTF8
  $command=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument "-NoProfile -NonInteractive -WindowStyle Hidden -ExecutionPolicy Bypass -File `"$launcher`"" -WorkingDirectory $projectRoot
  $trigger=New-ScheduledTaskTrigger -Daily -At '16:00'
  $principal=New-ScheduledTaskPrincipal -UserId ([System.Security.Principal.WindowsIdentity]::GetCurrent().Name) -LogonType Interactive -RunLevel Limited
  $settings=New-ScheduledTaskSettingsSet -MultipleInstances IgnoreNew -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit ([TimeSpan]::Zero)
  Register-ScheduledTask -TaskName $taskName -Action $command -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
 }
 'start' {Enable-ScheduledTask -TaskName $taskName | Out-Null}
 'stop' {Disable-ScheduledTask -TaskName $taskName | Out-Null; Stop-ScheduledTask -TaskName $taskName}
 'restart' {Stop-ScheduledTask -TaskName $taskName; Enable-ScheduledTask -TaskName $taskName | Out-Null; Start-ScheduledTask -TaskName $taskName}
 'uninstall' {Stop-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue; Unregister-ScheduledTask -TaskName $taskName -Confirm:$false}
 'status' {
  $task=Get-ScheduledTask -TaskName $taskName -ErrorAction Stop
  $info=Get-ScheduledTaskInfo -TaskName $taskName
  [pscustomobject]@{TaskName=$taskName;State=$task.State.ToString();Enabled=$task.Settings.Enabled;Schedule='Daily 16:00 (Windows local time)';LastRunTime=$info.LastRunTime;LastTaskResult=$info.LastTaskResult;NextRunTime=$info.NextRunTime} | Format-List
  if(Test-Path (Join-Path $projectRoot '.sync/status.json')){Get-Content (Join-Path $projectRoot '.sync/status.json')}
 }
}

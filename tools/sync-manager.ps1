param([switch]$SmokeTest)
$ErrorActionPreference='Stop'
Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
[System.Windows.Forms.Application]::EnableVisualStyles()
$root=Split-Path $PSScriptRoot -Parent
Set-Location -LiteralPath $root
$runtimeFile=Join-Path $root '.sync/runtime.json'
if(Test-Path $runtimeFile){$runtime=Get-Content -Raw -LiteralPath $runtimeFile | ConvertFrom-Json; $node=$runtime.NodePath; $env:PATH=$runtime.GitFolder+';'+$env:PATH}else{$node=(Get-Command node -ErrorAction Stop).Source}
$form=New-Object System.Windows.Forms.Form
$form.Text='N2 Daily · 同步管理'
$form.Size=New-Object System.Drawing.Size(900,700)
$form.MinimumSize=New-Object System.Drawing.Size(900,600)
$form.StartPosition='CenterScreen'
$form.Font=New-Object System.Drawing.Font('Microsoft YaHei UI',10)
$form.BackColor=[System.Drawing.Color]::FromArgb(245,247,250)
$title=New-Object System.Windows.Forms.Label
$title.Text='课程发布与本地资料库'
$title.Font=New-Object System.Drawing.Font('Microsoft YaHei UI',18,[System.Drawing.FontStyle]::Bold)
$title.SetBounds(24,18,820,40)
$form.Controls.Add($title)
$hint=New-Object System.Windows.Forms.Label
$hint.Text='课程每天 16:00 自动同步（电脑本地时间）。Reference 仅在点击按钮时联网更新。'
$hint.SetBounds(24,65,830,30)
$form.Controls.Add($hint)
$script:buttons=@()
function Add-ActionButton($text,$left,$top,$scriptFile,$mode){
 $button=New-Object System.Windows.Forms.Button
 $button.Text=$text; $button.SetBounds($left,$top,190,42)
 $button.Tag=@($scriptFile,$mode)
 $button.Add_Click({Start-JobUI $this.Tag[0] $this.Tag[1] $this.Text})
 $form.Controls.Add($button);$script:buttons+=,$button
}
Add-ActionButton '立即同步课程' 24 108 'tools/sync.cjs' 'once'
Add-ActionButton '停止自动同步' 230 108 'tools/sync.cjs' 'stop'
Add-ActionButton '开启自动同步' 436 108 'tools/sync.cjs' 'start'
Add-ActionButton '查看同步状态' 642 108 'tools/sync.cjs' 'status'
Add-ActionButton '手动更新 Reference' 24 164 'tools/reference.cjs' 'update'
Add-ActionButton '查看 Reference 信息' 230 164 'tools/reference.cjs' 'status'
$note=New-Object System.Windows.Forms.Label
$note.Text='开启只恢复每日计划；立即同步随时可用。停止不撤回已发布内容。资料更新不会发布课程。'
$note.SetBounds(24,220,830,38)
$form.Controls.Add($note)
$script:output=New-Object System.Windows.Forms.TextBox
$script:output.Multiline=$true;$script:output.ReadOnly=$true;$script:output.ScrollBars='Both';$script:output.WordWrap=$false
$script:output.Font=New-Object System.Drawing.Font('Consolas',10)
$script:output.SetBounds(24,266,808,330);$script:output.Anchor='Top,Bottom,Left,Right'
$form.Controls.Add($script:output)
$script:state=New-Object System.Windows.Forms.Label
$script:state.SetBounds(24,610,808,28);$script:state.Anchor='Bottom,Left,Right';$script:state.Text='就绪 · 关闭窗口不影响每日计划任务'
$form.Controls.Add($script:state)
$script:job=$null;$script:smokeExit=1
function Start-JobUI($scriptFile,$mode,$label){
 if($script:job){return}
 try{
  $info=New-Object System.Diagnostics.ProcessStartInfo
  $info.FileName=$node;$info.Arguments=$scriptFile+' '+$mode;$info.WorkingDirectory=$root
  $info.UseShellExecute=$false;$info.CreateNoWindow=$true;$info.RedirectStandardOutput=$true;$info.RedirectStandardError=$true
  $info.StandardOutputEncoding=[System.Text.Encoding]::UTF8;$info.StandardErrorEncoding=[System.Text.Encoding]::UTF8
  $script:job=New-Object System.Diagnostics.Process;$script:job.StartInfo=$info
  [void]$script:job.Start()
  $script:stdout=$script:job.StandardOutput.ReadToEndAsync();$script:stderr=$script:job.StandardError.ReadToEndAsync()
  $script:output.Text=$label+' …'+[Environment]::NewLine+'操作完成后显示结果。网络下载可能需要几分钟。'
  $script:state.Text='运行中 · '+$label
  foreach($button in $script:buttons){$button.Enabled=$false}
 }catch{$script:job=$null;$script:output.Text=$_.Exception.Message;$script:state.Text='未能启动，请检查 Node/Git 路径'}
}
$timer=New-Object System.Windows.Forms.Timer;$timer.Interval=250
$timer.Add_Tick({
 if($script:job -and $script:job.HasExited -and $script:stdout.IsCompleted -and $script:stderr.IsCompleted){
  $code=$script:job.ExitCode
  $script:output.Text=($script:stdout.Result+[Environment]::NewLine+$script:stderr.Result) -replace "`r?`n","`r`n"
  $script:state.Text=if($code -eq 0){'已完成 · '+(Get-Date -Format 'HH:mm:ss')}else{'失败 · 退出码 '+$code+' · 请查看上方错误；原有资料不会因失败而删除'}
  $script:job.Dispose();$script:job=$null
  foreach($button in $script:buttons){$button.Enabled=$true}
  if($SmokeTest){$script:smokeExit=$code;$form.Refresh();$bmp=New-Object System.Drawing.Bitmap($form.Width,$form.Height);$form.DrawToBitmap($bmp,$form.ClientRectangle);$bmp.Save((Join-Path $root '.sync/manager-preview.png'));$bmp.Dispose();$form.Close()}
 }
})
$form.Add_FormClosing({if($script:job){$_.Cancel=$true;[void][System.Windows.Forms.MessageBox]::Show('请等待当前操作完成，再关闭窗口。','操作正在运行')}})
$form.Add_Shown({Start-JobUI 'tools/reference.cjs' 'status' '本地 Reference 信息'})
$timer.Start()
[void]$form.ShowDialog()
$timer.Stop();$timer.Dispose();$form.Dispose()
if($SmokeTest){exit $script:smokeExit}

# 发布与维护

## A. 首次搭建完成后的正常状态

现有 Day001 App 和 Day002–014 保留；课程从外部 JSON 加载。main 连接 https://github.com/likairesearch-jpg/N2_Daily_study_Plan.git。正式网站预期地址：https://likairesearch-jpg.github.io/N2_Daily_study_Plan/ 。实际启用结果见 SETUP_STATUS.md，配置文件存在不等于上线成功。

本机需要 Node.js 22+、Git、首次安装的校验依赖和已登录的 Git Credential Manager。朋友无需 Node/Git。GitHub Actions 使用 Node24 和 lockfile。

Windows 计划任务 N2-Daily-Course-Sync 在当前用户登录时隐藏启动，每30秒检测；普通用户权限，不依赖 Codex 或 ChatGPT 开着。关机/睡眠/未登录时不运行，恢复后继续。

## B. 以后每周理想流程

Work 更新本地整周课程 → 两次检测文件稳定 → JSON/Schema/引用/卡片验证 → 生成 index/version → 独立 Git index 提交精确快照 → push main → Actions 检查/测试/打包 → Pages 发布 → 用户联网打开或回到 App 自动更新。

只提交白名单课程。无关工作文件不提交；手动暂存区不为空或校验器/渲染器有未提交修改时暂停本轮。禁止自动删除已发布课程。

网络失败保留本地文件和 commit，下次重试；不 reset、不 force push、不丢弃内容。远程领先/分叉停止自动发布，交由人工处理。无变更不建 commit，发布锁阻止进程互相干扰。

## C. 启动、停止、状态和恢复

在项目目录 PowerShell 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\sync-service.ps1 install
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\sync-service.ps1 start
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\sync-service.ps1 stop
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\sync-service.ps1 restart
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\sync-service.ps1 status
```

install 会创建登录启动任务并启动。状态同时显示任务状态和 .sync/status.json（时间、PID、最近结果）。网络操作可能等待一分钟，时间过旧时检查任务是否运行。

- JSON错误：Work 修改报错字段，保存后自动重试。
- 网络错误：联网后重试。
- 认证过期：运行 `git credential-manager github login --username likairesearch-jpg --device`，按官方页面提示授权；不把 Token 写入任何文件。
- 锁残留：停止任务，确认锁内 PID 已退出，运行 `node tools/sync.cjs recover`，再启动。不能删除活动发布锁。
- 分叉/手动暂存：停止任务，检查 git status，由了解 Git 的人保留本地工作后处理，不强制覆盖。
- 移动目录/更新 Node 或 Git 路径后：重新 install。
- 卸载同步：同样的 PowerShell 命令末尾改为 uninstall，不删除课程或网站。
- 电脑策略禁止计划任务时，备用方式为 `node tools/sync.cjs watch`；关闭终端即停止，不能当作已经登录自动启动。

## D. 一条命令重新发布

```powershell
node tools/sync.cjs once
```

执行同样的校验、版本生成和安全同步，无变更不制造 commit。撞锁时稍后重试。

push 成功而 Actions 失败时，再 push 同一 commit 不会重跑。使用 `node tools/redeploy.cjs` 安全读取凭据管理器并触发 workflow_dispatch；或 GitHub Actions 中 Re-run jobs。程序错误需要修复，不能绕过检查。

## 客户端更新

课程：启动、重新联网、回到前台和每5分钟检查版本，也可点检查更新。HTTP no-store，SW 不对单个课程请求返回旧缓存。验证 version→index→所有JSON的 SHA-256 后，以单条 Cache Storage 写入提交完整快照。失败明确报告并保留上次完整版本，避免混合新旧课程。

程序：构建时根据程序资源生成 SW revision；完整预缓存成功才激活。updateViaCache:none，主动检查更新，激活后刷新。只清理本 App 的旧程序缓存，不删课程快照/localStorage。新增课程不需要重新安装 PWA。

进度：保留 n2-daily-v1 键，按 Day 和稳定卡片 ID 保存红黄绿、笔记和答案。更新不清除进度。file:// 与 HTTPS 属于不同来源：迁移前在原本地页面导出，然后在网站导入。更换浏览器/电脑同样使用导出导入，没有账号云同步。

首次使用必须联网；浏览器清理/驱逐存储可能丢缓存和进度，请定期导出。TTS 离线能力取决于是否安装本地日语声音。

## 工程发布与边界

每周课程无需改程序；未来浏览器变化、依赖维护、程序 bug 仍可能需要工程维护，不能承诺永远免维护。

工程发布：停止同步 → 修改 → node tools/release.cjs prepare → npm test → node tools/release.cjs build → 人工审核提交明确文件 → git push origin main → 确認 Actions 成功 → 重启同步。

参考：[GitHub Pages 自定义工作流](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)、[MDN 缓存策略](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Caching)、[SW updateViaCache](https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/updateViaCache)。

# 发布与维护

## A. 首次搭建完成后的正常状态

现有 Day001 App 和 Day002–014 保留；课程从外部 JSON 加载。main 连接 https://github.com/likairesearch-jpg/N2_Daily_study_Plan.git。正式网站预期地址：https://likairesearch-jpg.github.io/N2_Daily_study_Plan/ 。实际启用结果见 SETUP_STATUS.md，配置文件存在不等于上线成功。

本机需要 Node.js 22+、Git、首次安装的校验依赖和已登录的 Git Credential Manager。朋友无需 Node/Git。GitHub Actions 使用 Node24 和 lockfile。

Windows 计划任务 N2-Daily-Course-Sync 每天 Windows 本地时间 16:00 执行一次（当前 Asia/Tokyo）；普通用户权限，不依赖 Codex 或 ChatGPT 开着。关机/睡眠/未登录时不运行，错过运行时由 StartWhenAvailable 在可运行时补跑；不是云端任务。

## B. 以后每周理想流程

Work 完成草稿并 validate/promote → 每天16:00或手动立即同步 → JSON/Schema/引用/卡片验证 → 生成 index/version → 独立 Git index 提交精确快照 → push main → Actions 检查/测试/打包 → Pages 发布 → 用户联网打开或回到 App 自动更新。

只提交白名单课程。无关工作文件不提交；手动暂存区不为空或校验器/渲染器有未提交修改时暂停本轮。禁止自动删除已发布课程。

网络失败保留本地文件和 commit，下次重试；不 reset、不 force push、不丢弃内容。远程领先/分叉停止自动发布，交由人工处理。无变更不建 commit，发布锁阻止进程互相干扰。

## C. 启动、停止、状态和恢复

在项目目录 PowerShell 执行（不需要 npm）：

| 操作 | 命令 | npm 等价命令（若已安装 npm） |
|---|---|---|
| 立即同步 | `node tools/sync.cjs once` | `npm run sync` |
| 查看状态 | `node tools/sync.cjs status` | `npm run sync:status` |
| 停止每日任务 | `node tools/sync.cjs stop` | `npm run sync:stop` |
| 开启每日任务 | `node tools/sync.cjs start` | `npm run sync:start` |

首次安装或移动目录后：`node tools/sync.cjs install`。install 替换同名任务，只有一个 Daily 16:00 触发器，没有登录/每分钟触发器或分钟失败重试。start 只开启日程，不立即发布。stop 禁用日程并停止当前任务；手动 once 仍可使用。status 显示 Enabled、State、LastRunTime、LastTaskResult、NextRunTime 和最近同步结果。Ready 是正常等待状态。任务在普通用户已登录时运行，关机期间不能同步；错过任务在可用时补跑。

- JSON错误：Work 修改报错字段，保存后等次日任务或手动 once 重试。
- 网络错误：联网后重试。
- 认证过期：运行 `git credential-manager github login --username likairesearch-jpg --device`，按官方页面提示授权；不把 Token 写入任何文件。
- 锁残留：停止任务，确认锁内 PID 已退出，运行 `node tools/sync.cjs recover`，再启动。不能删除活动发布锁。
- 分叉/手动暂存：停止任务，检查 git status，由了解 Git 的人保留本地工作后处理，不强制覆盖。
- 移动目录/更新 Node 或 Git 路径后：重新 install。
- 卸载同步：同样的 PowerShell 命令末尾改为 uninstall，不删除课程或网站。
- 电脑策略禁止计划任务时，使用手动 once 命令。

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

## 2026-09-15：周期任务与参考资料

当前正式课程停在 Week02 / Day014，Week03 等待用户后续交给 Work。保留 data/weekXX.json，Work 不编辑 index/version。

任务已改为每日16:00运行 node tools/sync.cjs once。Ready 表示等待下一次执行，不再代表服务失效；结合 NextRunTime、LastTaskResult 和 .sync/status.json 的时间判断。stop 禁用任务，start 重新启用；脚本在运行时失效可在下一轮继续。已退出进程的发布锁可自动回收，活动进程锁不会被删除。电脑关机、睡眠、用户未登录时仍不会同步。

GitHub Actions 先验证课程并生成元数据，再检查、测试和构建，因此将来 Work 直接提交远程正式周 JSON 时不必手动生成索引。远程更新后，本地 watcher 仍会在分叉/落后时停止，需先安全协调本地 Git 工作区；本地同步不擅自合并。

参考资料使用 node tools/reference.cjs update，校验通过后生成独立快照；不触碰正式课程。参考数据不会被课程 watcher 自动提交，也不会装进学习者的离线包。工程发布时 CI 额外验证 reference，操作与许可见 REFERENCE_PIPELINE.md、SOURCES.md。

## Local candidate queries and network boundary

Work must query small batches locally; do not read whole records.json files into the conversation and do not refresh/download references for each Week. The program reads the local snapshot in its own process; only bounded selected records enter Work's context. Default 10, maximum 50 per query; paginate with --offset=10. Normal local generation does not require GitHub access.

`node tools/reference.cjs query --type=vocab --level=N2 --covered=false --conflict=false --confidence=medium --limit=10`

Filters: --type=vocab|kanji|grammar|examples, --level=N5..N1 (any source label), --keyword=text (or a positional keyword), --confidence=medium|review|high|low, --conflict=true|false, --covered=true|false, --id=stable-id. --review is an alias for --confidence=review. Actual current sources use medium/review; asking for high may return zero. Resolve example IDs with --id=... --type=examples --limit=1.

Covered means surface matched in formal Day001 and weekly vocabulary/grammar, not personal mastery. It cannot distinguish all homographs/senses. --covered requires vocab or grammar; kanji/examples have no reliable formal coverage and return null instead of falsely claiming unlearned. Personal browser progress is separate and inaccessible to this tool.

Storage: data/reference/index.json points to data/reference/snapshots/<version>/{vocab,kanji,grammar,examples}/records.json and metadata. All standardized records already exist locally. .cache/reference-sources/ contains ignored upstream clones.

No network: query, coverage, validate, update --offline, sync status/start/stop. Internet: reference update without --offline clones/fetches upstream; sync once and the daily task fetch/push the course repository (even no-change sync checks remote state); GitHub Actions performs cloud build/deploy; learner App fetches Pages updates. A reference refresh is explicit, never part of the daily course task. Work should only request a refresh if separately instructed or the local library lacks needed data, and must report missing candidates rather than invent a source.

## Windows management window

Double-click **N2 Sync Manager.vbs** in the project folder. No terminal commands are needed. Buttons: sync courses now, stop/start daily course sync, show sync status, manually update Reference, and show local Reference snapshot/source information. Closing the window leaves the daily task enabled unless you stopped it. Course sync runs daily at 16:00 Windows local time (currently Japan). Reference has NO scheduled refresh. The learner App does not download the reference library; Work uses local bounded queries.

Reference update is explicitly manual: GUI button, or `node tools/reference.cjs update` / `npm run refs:update`. Latest snapshot is in `data/reference/index.json`, and commit/version/fetchedAt are in its `metadata/registry.json` and `sources/registry.json`; the GUI Reference info button displays them. fetchedAt stays unchanged when the pinned upstream commit stays unchanged. Failures or changed license/attribution evidence leave the last usable snapshot intact.

## Draft publication gate and Work handoff (current)

Work MUST write data/drafts/weekXX.json, never edit data/weekXX.json directly. Drafts are ignored by Git, course capture/index, build and PWA. Complete the whole week before explicitly promoting it. The GUI includes context, validate-draft and promote buttons with a Week selector.

1. Generate planning context: `npm run work:context -- --week=3` (or `node tools/workflow.cjs context --week=3`). This does NOT generate a course.
2. Read WORK_INSTRUCTIONS.md, docs/COURSE_SCHEMA.md, reports/work-context.json and only necessary prior formal Week data. Write original teaching content to the draft path.
3. Validate: `node tools/workflow.cjs validate --week=3`.
4. Only when complete, promote: `node tools/workflow.cjs promote --week=3`.
5. Daily 16:00 sync or the GUI sync button publishes approved data.

Promote validates the entire candidate course collection and renderer, then records exact SHA-256 in data/publication.json. Direct edits after promotion are rejected by sync and CI/build. Approval is an accidental-publication safeguard, not a cryptographic authorization system. A crash between week and manifest writes blocks publication; rerun promotion after recovery. .cache/promotions stores local pre-promotion backups. Draft is retained. Promoting identical already-approved bytes is a no-op. Do not manually edit publication.json; it is maintained by the promotion tool and auto-synced with courses.

Optional vocabulary/grammar `referenceId` is the stable ID from the context/reference record; validator checks existence, type and matching surface. Historical mappings are in reports/course-reference-map.json; unresolved/conflicting matches in reports/reference-mapping-review.json. Courses are not silently rewritten. Stable ID mapping takes priority; unresolved historical text is fallback, not mastery. Never guess a referenceId.

Optional `provenance` can be attached to course objects, Japanese text, questions or vocab/grammar items. Original content: `{"origin":"work-original"}`. Copied/adapted third-party content: `{"origin":"third-party-adapted","sourceRef":"exact source URL or reference ID with locator","license":"applicable license","attribution":"required credit"}` (use third-party-verbatim for copies). All three fields are required for third-party origins. Work must identify copying/adaptation: a validator cannot discover undeclared copying or decide whether a license permits publication. Preserve source-specific notices and satisfy applicable license obligations before promotion.

Reference supplies candidates/readings/kanji/JLPT metadata/coverage/fact checking. Work should write original Chinese explanations, collocation guidance, examples, reading/listening passages, speaking demonstrations and N2-style exercises. Do not assume an example in the context pack is free of attribution requirements.

Context pack is local, bounded below 100KB and Git-ignored; default candidates: 20 vocab, 10 grammar, 8 kanji, 8 examples. Reading support means vocabulary/readings, not generated reading passages. D+1/D+3/D+7 use day offsets and identify future draft-only items as pending. Red/yellow/green are unknown unless explicitly supplied in local reports/learner-state.json: `{"schemaVersion":1,"states":{"<referenceId>":"red"}}`. This is a user-supplied mapping, not automatic import of browser card colors. The pack includes all matched learned IDs, not claims of mastery; map review reports may need inspection if coverage is sparse. Regenerate context after formal course/reference changes. Next-Week dates follow the preserved Day001 anchor; date drift is for Work/user planning, not silent renumbering.

Week03 remains uncreated by Codex. Creating its context is not authorization to generate a formal course.

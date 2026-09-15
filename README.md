# N2 Daily App

保留既有 Day001–014 正式课程、桌面卡片界面、Week/Day 导航、日语点击朗读与本地进度。Work 是教学内容权威，程序只读取、验证、展示、缓存和发布。

- [正式网站](https://likairesearch-jpg.github.io/N2_Daily_study_Plan/)
- [安装教程](docs/INSTALL.md)
- [课程契约](docs/COURSE_SCHEMA.md)
- [自动同步、停止、恢复和发布](docs/RELEASE_WORKFLOW.md)
- [实际安装/测试状态](docs/SETUP_STATUS.md)

Work 保存 data/drafts/weekXX.json → 完成后 validate/promote → 本地每日16:00同步（Windows本地时间） → 校验 → 自动 commit/push → Actions → Pages → App 自动更新。index/version 由程序维护，课程与学习进度分离。

```powershell
node tools/release.cjs prepare
node tools/release.cjs validate
npm test
node tools/release.cjs build
node tools/serve.cjs
```

本机没有 npm 命令时，可直接使用 node 命令；首次依赖已由可用包管理器安装。后续自动同步无需 npm。开发测试也可分别执行 tests 下的四个 .cjs 测试。

保留双击 index.html 的旧用法，但 file:// 不支持 PWA 自动更新；朋友应使用正式 HTTPS 网站。迁移前先从旧页面导出进度，再到网站导入。

## Reference library (2026-09-15)

Formal courses remain Week01–02 / Day001–014. Week03 is on hold; only Work may create it after a later user instruction. The highest course interface is docs/COURSE_SCHEMA.md; keep data/weekXX.json and display/tts/goalsZh/recap. Work never edits generated index/version files.

- [Reference source audit](docs/SOURCES.md)
- [Reference refresh, search and coverage](docs/REFERENCE_PIPELINE.md)
- [Work instructions](WORK_INSTRUCTIONS.md)

```powershell
node tools/reference.cjs update
node tools/reference.cjs validate
node tools/reference.cjs query --type=grammar --level=N2 --limit=5
node tools/reference.cjs coverage
```

Reference snapshots are separate from formal courses and excluded from the learner PWA bundle. Only audited data is redistributed, with full license evidence. The Windows course task runs daily at 16:00 local time; Ready between runs is normal.

## 课程更新

在项目目录运行（无需 npm）：

- 立即更新：`node tools/sync.cjs once`
- 停止每日同步：`node tools/sync.cjs stop`
- 开启每日同步：`node tools/sync.cjs start`
- 查看状态：`node tools/sync.cjs status`

如已安装 npm，也可使用 `npm run sync`、`npm run sync:stop`、`npm run sync:start`、`npm run sync:status`。每日16:00（Windows本地时间，当前日本时间）；无变化不产生空 commit。电脑关机或未登录时无法执行，错过后在可用时补跑。

Work 查询本地小批量资料：

`node tools/reference.cjs query --type=vocab --level=N2 --covered=false --conflict=false --limit=10`

参考查询与 coverage/validate 不联网。只有主动 refs:update（不带 --offline）下载上游；课程同步 fetch/push GitHub；浏览器更新访问 Pages。参考库不随每日课程同步刷新。

## Windows management window

Double-click **N2 Sync Manager.vbs** in the project folder. No terminal commands are needed. Buttons: sync courses now, stop/start daily course sync, show sync status, manually update Reference, and show local Reference snapshot/source information. Closing the window leaves the daily task enabled unless you stopped it. Course sync runs daily at 16:00 Windows local time (currently Japan). Reference has NO scheduled refresh. The learner App does not download the reference library; Work uses local bounded queries.

Reference update is explicitly manual: GUI button, or `node tools/reference.cjs update` / `npm run refs:update`. Latest snapshot is in `data/reference/index.json`, and commit/version/fetchedAt are in its `metadata/registry.json` and `sources/registry.json`; the GUI Reference info button displays them. fetchedAt stays unchanged when the pinned upstream commit stays unchanged. Failures or changed license/attribution evidence leave the last usable snapshot intact.

## Work readiness

Work writes `data/drafts/weekXX.json`, validates, then explicitly promotes. Only hash-approved formal weeks can publish. Use the manager context/draft buttons or `npm run work:context -- --week=3`. See docs/COURSE_SCHEMA.md and reports/system-readiness.md. Opening the manager reads local status; checking Pages is an explicit network action.

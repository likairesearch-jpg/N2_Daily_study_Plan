# N2 Daily App

保留既有 Day001–014 正式课程、桌面卡片界面、Week/Day 导航、日语点击朗读与本地进度。Work 是教学内容权威，程序只读取、验证、展示、缓存和发布。

- [正式网站](https://likairesearch-jpg.github.io/N2_Daily_study_Plan/)
- [安装教程](docs/INSTALL.md)
- [课程契约](docs/COURSE_SCHEMA.md)
- [自动同步、停止、恢复和发布](docs/RELEASE_WORKFLOW.md)
- [实际安装/测试状态](docs/SETUP_STATUS.md)

Work 保存 data/weekXX.json → 本地每分钟检测文件稳定性 → 校验 → 自动 commit/push → Actions → Pages → App 自动更新。index/version 由程序维护，课程与学习进度分离。

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

Reference snapshots are separate from formal courses and excluded from the learner PWA bundle. Only audited data is redistributed, with full license evidence. The Windows course task now polls once per minute; Ready between runs is normal.

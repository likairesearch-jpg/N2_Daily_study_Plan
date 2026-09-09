# 安装与测试记录（2026-09-09）

## 已实际完成

- 现有项目原地升级，保留 Day001–014、翻页、听读展开、日语点击朗读和本机进度。
- Day001 原27张卡片展示逐字提取到 JSON；原课程字段与迁移前完全一致。Week01/02 的 JSON 解析内容未改写。
- 外部课程加载、稳定 schema、完整快照缓存、PWA、版本检测、进度导出导入。
- Git 仓库 main、Git Credential Manager 安全登录、GitHub Pages 的 GitHub Actions 发布源均已配置。
- Windows 登录启动任务 N2-Daily-Course-Sync 已安装；启动、停止和运行状态已实测。普通用户隐藏运行，30秒稳定检测。无需保持 Codex 开启。

## 正式地址

- [学习网站](https://likairesearch-jpg.github.io/N2_Daily_study_Plan/)
- [GitHub 仓库](https://github.com/likairesearch-jpg/N2_Daily_study_Plan)
- [真实自动课程发布成功记录](https://github.com/likairesearch-jpg/N2_Daily_study_Plan/actions/runs/34317752756)

## 完整链路实测

后台计划任务自行发现 data/week02.json 末尾新增换行（不改变教学内容），创建 `49be137` 课程提交并 push main，Actions 成功部署，已经打开的真实 Edge 客户端从 `f8010b1b` 更新到 `49c4de6e`。Day014 黄色状态保留，随后断网重新打开仍保留课程与进度。

课程版本：`49c4de6eba6928d15ea83ff96c285cb7158631e6e2564345ff503ff3b97c25c5`。详细本机证明保存在 .sync/live-proof.json（不提交）。

## 其他验证

- Day001 原27张卡片、全部 Day002–014 隐藏/展开状态、导航、答案、ja-JP 参数、旧进度恢复。
- JSON/Schema/引用/跨Day进度ID、未来Week03自动发现（仅内存测试夹具，不发布未来课程）。
- 隔离的真实 Git 测试：重复检测不建commit，无关文件不提交，手动暂存保护，校验失败禁止push。
- 真实 Edge：GitHub Pages 子路径、课程更新、哈希不符回退、离线重开、Service Worker 更新、无JS错误。
- Windows/Linux 精确字节一致性；.gitattributes 禁止 Git 改写课程换行造成哈希漂移。
- 新增依赖安装审计无已报告漏洞。

## 明确边界

- Work 必须确实把最终课程保存到本机此目录；本系统不自动读取云端 Project 对话。
- 未实测 macOS、真实语音听辨或实体浏览器的安装点击。自动化 Edge 中没有检测到日语系统声音，需按安装指南下载。
- 首次联网后可离线；浏览器清理存储仍可能删除用户记录，请导出备份。
- file:// 旧进度不会自动跨来源迁移到 HTTPS，必须先导出再导入。
- 停止/恢复/一键重试命令见 RELEASE_WORKFLOW.md；将来的软件故障和浏览器变化仍可能需要工程维护。


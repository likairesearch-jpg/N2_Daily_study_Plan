# 安装教程

## 学习者：Windows / macOS

1. 用 Chrome / Edge 打开 [N2 Daily](https://likairesearch-jpg.github.io/N2_Daily_study_Plan/)，第一次联网等到显示课程已更新、可离线使用。
2. 可直接学习。想要独立窗口，点击 App 的“安装到电脑”或地址栏安装图标；不提供安装按钮的浏览器可继续使用普通网页。
3. 左侧 Week/Day 导航，上一页/下一页或方向键翻页。点击日语虚线文字朗读，不弹播放器。保留阅读和听力先作答后展开的原流程。
4. 未检测到日语声音时，在 Windows 系统语言/语音组件或 macOS 系统朗读设置中下载日语声音，再重启浏览器。
5. 红黄绿、笔记和答题自动保存在本机。定期点“导出学习进度”备份。
6. 以后联网打开即可更新，不需要每周重新安装。

## 从现有本地版迁移

1. 保持原文件路径，在原浏览器重新打开 index.html。
2. 点“导出学习进度”。
3. 打开正式网站，侧栏导入进度备份。
4. 检查 Day001 页码、笔记和红黄绿。导入合并记录，同名记录使用备份值。

## 课程维护者

现有电脑使用已发现的 Node/Git。换电脑先安装 [Node.js LTS](https://nodejs.org/) 和 [Git for Windows](https://gitforwindows.org/)，克隆仓库，在目录执行：

```powershell
npm ci --ignore-scripts
node tools/release.cjs prepare
node tools/release.cjs build
node tools/serve.cjs
```

访问 http://127.0.0.1:4173 。Ctrl+C 停预览；修改代码后重新 build，预览只提供 dist。

Git Credential Manager 登录后，完成首次 main push 和 Pages 发布，再按 RELEASE_WORKFLOW 安装同步计划任务。GitHub Settings → Pages → Source 选择 GitHub Actions，只设置一次。不要把密码或 Token 放进项目。

# AGENTS.md
# N2-Daily-App｜Codex 长期开发与资料管线规则

> 角色：Codex = 软件工程、参考资料管线、验证、发布基础设施负责人  
> 教学内容由 Work 负责。Codex 不自行设计正式 Day / Week。  
> 每次开发、资料刷新或发布前，先读取本文件。

---

## 0. 当前项目状态

- 正式课程已确认完成：
  - Week 01 = Day 001–007
  - Week 02 = Day 008–014
- Week 03 应从 Day 015｜2026-09-10 开始。
- 当前检查日期：2026-09-15。
- 2026 年第二次 JLPT：2026-12-06。
- 程序第一优先级：Windows / macOS 桌面浏览器与桌面 PWA。
- 移动端可响应式兼容，但暂不为 iOS App Store / 原生 iOS 审核增加复杂度。

---

## 1. 职责边界

Codex 负责：

1. App 核心程序。
2. PWA / Service Worker。
3. 日语 ja-JP TTS。
4. 课程 JSON 加载与渲染。
5. 参考资料的下载、缓存、标准化、许可审计、冲突标记。
6. schema / validator。
7. 测试。
8. Git / GitHub / GitHub Actions / GitHub Pages。
9. 自动更新机制。
10. 开发文档和来源文档。

Codex 不负责：

- 自行决定每天教哪些词/语法。
- 自行生成正式 Week 课程并冒充 Work。
- 因外部数据库不同而覆盖正式课程。
- 把未经许可的第三方内容完整复制到公开仓库。

---

## 2. 推荐目录边界

在兼容现有项目的前提下，目标结构：

```text
N2-Daily-App/
├── index.html
├── css/
├── js/
├── data/
│   ├── course/
│   │   ├── index.json
│   │   ├── week01.json
│   │   ├── week02.json
│   │   └── week03.json ...
│   └── reference/
│       ├── vocab/
│       ├── kanji/
│       ├── grammar/
│       ├── examples/
│       └── metadata/
├── sources/
│   └── registry.json
├── scripts/
│   ├── update-reference-data.*
│   ├── validate-reference-data.*
│   ├── validate-course.*
│   └── release.*
├── docs/
│   ├── SOURCES.md
│   ├── COURSE_SCHEMA.md
│   └── RELEASE_WORKFLOW.md
├── .cache/
│   └── reference-sources/
├── manifest.json
├── service-worker.js
├── version.json
├── WORK_INSTRUCTIONS.md
├── AGENTS.md
└── README.md
```

如现有项目结构不同，不为了“漂亮”而大规模重写；逐步迁移。

---

## 3. 必须审计的资料源

### 用户指定

1. JLPT Benkyo  
   https://jlptbenkyo.com/

2. kananinirav/jlptbenkyo  
   https://github.com/kananinirav/jlptbenkyo

3. AnchorI/jlpt-kanji-dictionary  
   https://github.com/AnchorI/jlpt-kanji-dictionary

4. hatwarsanskar95-web/japanese-JLPT-learner  
   https://github.com/hatwarsanskar95-web/japanese-JLPT-learner

5. xinwu-yang/nippon  
   https://github.com/xinwu-yang/nippon

### 已补充

6. OpenJLPT  
   https://github.com/evanclan/OpenJLPT

7. nihongo-mono  
   https://github.com/stndaru/nihongo-mono

8. JLPT 官方 Sample Questions / Official Practice Workbook / Test Sections  
   https://www.jlpt.jp/e/samples/forlearners.html  
   https://www.jlpt.jp/e/guideline/testsections.html

9. 若发现许可清楚、质量较高的开放 JLPT mock / question bank，可加入，但必须先审计。

---

## 4. 下载 / 更新资料源

### 原则

如果是 GitHub 源且资料对构建有价值：

- 优先由脚本自动获取。
- 默认下载到：
  `.cache/reference-sources/<source-name>/`
- `.cache/` 默认不提交到 Git。
- 优先浅克隆：
  `git clone --depth 1`
- 已存在则：
  `git fetch` / `git pull --ff-only`
- 不能假设 public GitHub repo = 可自由再分发。
- 下载后先检查 `LICENSE`、`NOTICE`、README、数据来源说明，再决定哪些文件可以进入 `data/reference/`。

### 要求

建立一个幂等命令，例如：

```bash
npm run refs:update
```

或适合当前技术栈的等效命令。

它应：

1. 下载/刷新允许获取的源。
2. 记录上游 commit hash / version / fetchedAt。
3. 做许可检查。
4. 标准化。
5. schema validation。
6. 冲突检测。
7. 生成/更新 `docs/SOURCES.md` 与 `sources/registry.json` 中可自动维护的信息。
8. 不修改 `data/course/`。

网络失败时保留上一版可用 reference 数据，不删除。

---

## 5. 许可与来源规则

必须逐个源确认最新许可，不依赖聊天记忆。

当前已知、仍需在实际拉取时再次核验的方向：

- OpenJLPT：其仓库说明数据与代码采用 CC BY-SA 4.0，并提供 NOTICE；可作为机器数据主来源之一。
- nihongo-mono：
  - 代码为 MIT。
  - Grammar 数据是项目原创，仓库的 `LICENSE-DATA.md` 指明 grammar 为 MIT。
  - 词汇/汉字等其他数据包含 JMdict/KANJIDIC2/KanjiVG/Tatoeba 等不同许可，必须保留对应 attribution / share-alike 要求。
- 其他仓库：必须实际检查 LICENSE / NOTICE；如果不明确，只能作为人工参考，不批量再分发。

### 官方 JLPT

- 官方 Sample Questions / Practice Workbook 可用于理解题型、难度与训练结构。
- 不得抓取、保存或发布未公开的实际 JLPT 试题/答案。
- 不得把所谓泄露真题打包进公开仓库。
- App 的习题库应优先使用原创 N2-style 题目或许可明确的开放题库。

---

## 6. Reference 标准化目标

至少建立：

- N5–N1 vocabulary
- N5–N1 kanji
- N5–N1 grammar
- example sentences
- JLPT level metadata
- source metadata
- confidence/conflict metadata

建议统一字段（按现有 schema 调整）：

```json
{
  "id": "stable-id",
  "type": "vocab",
  "surface": "把握",
  "reading": "はあく",
  "meanings": ["掌握", "了解"],
  "jlpt": {
    "resolved": "N2",
    "bySource": {
      "sourceA": "N2",
      "sourceB": "N2"
    }
  },
  "confidence": "high",
  "conflict": false,
  "sources": [
    {
      "id": "sourceA",
      "url": "...",
      "license": "..."
    }
  ]
}
```

不要把中文释义凭空当成第三方源数据。若中文为本项目自己生成，标记：

`translationOrigin: "project-generated"`

---

## 7. 多来源冲突处理

不得 last-write-wins 静默覆盖。

至少保留：

- source value
- resolved value
- conflict
- confidence
- provenance

建议：

- 3+ 高质量来源一致：high
- 2 个来源一致：medium/high
- 单一来源：medium
- 来源冲突：review

读音、JLPT level、词义或语法结构有明显冲突时输出 review report。

---

## 8. N2 考试导向的数据选择

Reference 可覆盖 N5–N1，但 App 正式目标是 N2。

不要为了“完成数据库”把所有 N1 内容推给 Work。

应给 Work 提供：

- N2 主候选
- N5–N3 prerequisite / gap candidates
- N1 optional extension
- frequency/commonness（若可合法获得）
- source confidence
- examples availability
- grammar relations
- known duplicates

建立可查询统计，例如：

- N2 vocab total candidate
- N2 kanji total candidate
- N2 grammar total candidate
- Work 已正式覆盖数量
- conflict/review 数量

---

## 9. 课程 schema

`docs/COURSE_SCHEMA.md` 是 Work 和 App 的接口合同。

Codex 负责维护 schema 与 validator，但不擅自改变教学含义。

至少支持：

```text
Day
├─ goals
├─ review
├─ vocabulary
├─ grammar
├─ reading
├─ listening
├─ speaking
└─ dailyReview
```

Week 第 7 天支持：

```text
weeklyReview
handoffSummary
miniMock
```

### TTS

每个需朗读对象同时支持：

- `studyText`：可含假名
- `tts`：纯日语

不要让 UI 从带括号假名文本直接读，以免 TTS 读出括号内容。

---

## 10. App 渲染要求

桌面优先：

1. PPT / flashcard 风格。
2. Week / Day 导航。
3. 上一页 / 下一页。
4. 学习进度本地保存。
5. 课程更新不得清除进度。
6. 重点日语文本本身可点击。
7. ja-JP SpeechSynthesis / 可替换 TTS adapter。
8. 点击文本直接朗读，不弹额外窗口。
9. 可点击文本用贴字的细虚线下划线。
10. 阅读第一轮可禁用朗读/隐藏辅助。
11. 听力第一遍支持只播放、不显示原文。
12. 第二轮显示原文与跟读。

---

## 11. Week 03 状态检查

Codex 不生成教学内容，但要确保 App 能发现 Work 的更新。

检查：

- `data/course/index.json`
- `data/course/week03.json`
- UI 当前最新 Week / Day

截至 2026-09-15，用户报告 App 在 Week 02 / Day 014 后没有继续更新。

因此若 Work 后续写入 `week03.json`：

- App 必须无需改核心代码即可自动显示 Week 03。
- `index.json` 若可自动生成，则由 build/release 脚本自动生成，减少 Work 手工维护。
- validator 应检查 Day 015–021 日期连续性。
- 不允许程序把缺失 Day 自动伪造为空白正式课程。

---

## 12. 自动发布目标

长期目标：

```text
Work 写入 data/course/weekXX.json
        ↓
本地/云端校验
        ↓
通过
        ↓
Git commit / push
        ↓
GitHub Actions
        ↓
GitHub Pages
        ↓
用户下次联网打开 PWA
        ↓
获取最新课程
```

Codex 第一次尽可能把此基础设施搭好。

### 如果仍依赖本地电脑

明确记录：

- 电脑关机时，本地 watcher 不会执行。
- 不得把“本地 watcher”描述成真正云端自动化。

### 更长期

尽可能把可迁移步骤放到 GitHub Actions：

- JSON/schema validation
- build/test
- course index generation（如可安全自动生成）
- deploy Pages

如果未来 Work 能直接写入远端仓库，则本地电脑不应成为发布必经节点。

---

## 13. 客户端自动更新

朋友不应反复重新下载 ZIP / index.html。

推荐：

- GitHub Pages Web App
- 桌面 PWA
- App shell：cache-first / stale-while-revalidate（视实现）
- 课程索引和课程 JSON：network-first 或显式版本检查
- 离线 fallback

必须避免旧 Service Worker 让用户长期停留在旧课程。

应有：

- `version.json` 或等效机制
- cache versioning
- update notification / silent refresh policy
- 用户进度与课程 cache 分离

---

## 14. 测试与质量门

资料刷新后至少：

- JSON parse
- schema validation
- duplicate ID check
- required field check
- kana/reading sanity
- source provenance presence
- conflict report
- license/attribution presence

课程发布前至少：

- Week / Day 连续性
- 日期连续性
- 新词重复计数检查
- 新语法重复计数检查
- TTS 字段检查
- reference/source 可追踪性检查（如课程声明了来源）
- App load smoke test
- PWA/service worker smoke test

失败时禁止自动发布。

---

## 15. 12 月 6 日倒排支持

Codex 不决定学习量，但应提供给 Work 可读取的统计工具：

例如：

```bash
npm run stats:coverage
```

输出：

- 当前正式 Day
- 距 2026-12-06 剩余天数
- N2 vocab candidate coverage
- N2 kanji candidate coverage
- N2 grammar candidate coverage
- 已覆盖 / 未覆盖 / conflict
- Week 复习与 mock 数量

只提供数据，不替 Work 自动决定教学计划。

---

## 16. 默认执行指令

用户只说：

> “按 AGENTS.md 继续”
> “更新参考资料”
> “检查 App”
> “准备发布”

时：

### 更新参考资料

1. 读取本文件。
2. 读取 `docs/SOURCES.md`。
3. 自动获取允许下载的 GitHub / 数据源。
4. 核验 license。
5. 标准化到 `data/reference/`。
6. 校验。
7. 生成冲突报告。
8. 不修改正式课程。

### 检查 App

1. 读取课程 index。
2. 检查最新 Week。
3. 验证 Work 新数据。
4. 测试 UI/TTS/PWA。
5. 不自行填课程空缺。

### 发布

1. 先 validator。
2. 再 build/test。
3. 成功后才提交/推送。
4. GitHub Actions / Pages 自动部署。
5. 不提交 secret。
6. 不提交 `.cache/reference-sources/`，除非某源明确要求且项目做了有意识的 vendor 决策。

---

## 17. 禁止事项

- 不自行生成正式 Day 课程替代 Work。
- 不下载并发布未授权真题。
- 不把没有明确许可的整个网站镜像到仓库。
- 不把 public repo 视为 public domain。
- 不丢失 LICENSE / NOTICE / attribution。
- 不让 reference 更新自动改写正式历史课程。
- 不把用户学习进度存进会被课程刷新覆盖的文件。
- 不把 GitHub token / password / key 写入 repo。
- 不在 validator 失败时自动发布。

> 最新发布规则：Work 只写 data/drafts/weekXX.json；完成后明确 validate/promote 才进入正式目录。以 docs/COURSE_SCHEMA.md 的 Draft publication gate 为准。Codex 不生成 Week03。

> 2026-09-15 最新实施规则：暂不生成任何正式 Week03；保留 data/weekXX.json 平面结构。docs/COURSE_SCHEMA.md 是最高接口合同，沿用 display/tts/goalsZh/recap。示意字段不能替代合同。reference 与正式课程完全分离。

# WORK_INSTRUCTIONS.md
# N2 每日冲刺 App｜Work 长期课程生产规则

> 角色：Work = 教研与正式课程生产入口  
> 本文件是长期规则。后续在本地 `N2-Daily-App` 项目中工作时，应先读取本文件，再执行课程更新。  
> 除非用户明确修改，本文件优先于临时格式偏好；若与 ChatGPT Project「N2 每日冲刺」中的最新明确规则冲突，以用户最新明确要求为准。

---

## 0. 当前基线

- 项目：JLPT N2 双人冲刺学习 App
- 正式课程最后已确认版本：**Week 02 = Day 008–014**
- 日期连续性保持原正式记录：
  - Day 013 = 2026-09-08
  - Day 014 = 2026-09-09
  - Day 015 = 2026-09-10
  - Day 016 = 2026-09-11
  - Day 017 = 2026-09-12
  - Day 018 = 2026-09-13
  - Day 019 = 2026-09-14
  - Day 020 = 2026-09-15
  - Day 021 = 2026-09-16
- 当前检查日期：**2026-09-15**
- 2026 年第二次 JLPT 日期：**2026-12-06**
- 目标：12 月 6 日考试前，以 N2 通过为首要目标，尽可能完成高价值 N2 词汇、汉字、语法、阅读、听力、输出与题型训练。

---

## 1. Work 的职责边界

Work 负责：

1. 读取当前 ChatGPT Project「N2 每日冲刺」的 Project Instructions、正式 Day、交接摘要、已学词汇/语法、🔴🟡薄弱项与最近表现。
2. 读取本地 App 中已经标准化的参考资料：
   - `data/reference/`
   - `docs/SOURCES.md`
   - `docs/COURSE_SCHEMA.md`
3. 根据学习历史与考试目标生成正式 Week / Day 课程。
4. 将正式课程写入：
   - `data/weekXX.json`
   - `data/index.json` 与 `version.json` 由程序生成，Work 不手动编辑。
5. 对课程做连续性、重复项、读音、语法、日期与 schema 自检。
6. 第 7 天生成周复盘与下一周交接摘要。

Work 不负责：

- 自行重构 App 核心程序。
- 擅自修改 PWA / Service Worker / GitHub Actions。
- 自行改变 Codex 已定义的课程 schema。
- 因外部数据库不同而擅自覆盖已确认的正式 Week 01–02。
- 把任何单一第三方词表当成 JLPT 官方词表。

---

## 2. 外部参考资料的使用原则

外部资料只作为“候选库、交叉验证、题型参考”，不是正式课程本身。

优先读取 Codex 已标准化到 `data/reference/` 的数据，不要每次重新抓网页。

当前参考源包括：

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

6. OpenJLPT  
   https://github.com/evanclan/OpenJLPT

7. nihongo-mono  
   https://github.com/stndaru/nihongo-mono

8. JLPT 官方 Sample Questions / Official Practice Workbook / Test Sections  
   https://www.jlpt.jp/e/samples/forlearners.html  
   https://www.jlpt.jp/e/guideline/testsections.html

9. 其他经过 Codex 审计、许可明确且适合本项目的开放 JLPT 题库或数据集。

### 使用规则

- N2 正式学习优先。
- N5–N3：用于补基础漏洞、读音、核心词与先修语法，不机械重学已经掌握内容。
- N1：只在对 N2 理解、阅读或表达明显有帮助时少量引入，不抢占 N2 冲刺时间。
- 多来源一致可提高可信度；来源冲突必须保留并标记，不静默覆盖。
- JLPT 官方并不公布正式词汇/汉字清单，因此“JLPT 等级”是参考标签，不是绝对真值。
- 不复制、储存、传播未公开的实际 JLPT 真题。官方 Sample Questions / Official Practice Workbook 只用于题型、难度和训练结构参考。
- 练习题优先生成原创 N2-style 题目，避免大段复制受版权保护材料。

---

## 3. 12 月 6 日考试倒排原则

目标不是“把 N5–N1 数据库全部机械刷完”，而是把**对 N2 通过最有价值的内容尽可能在 2026-12-06 前完成并形成长期记忆**。

每次生成 Week 时都应重新计算剩余时间，并动态调节。

优先顺序：

1. N2 高频词汇、汉字读音、自然搭配
2. N2 核心语法与易混语法
3. N2 阅读题型与限时阅读
4. N2 听力：任务理解、概要理解、即时应答、综合理解
5. D+1 / D+3 / D+7 以及 🔴🟡回收
6. 周测 / Mini N2 Mock
7. 临考阶段的完整模拟与错题回收

### 负荷规则

- 每天新词原则 12–15 个；仅在掌握良好、复习积压低时适度提高。
- 每天新语法原则 3–4 个；复习负担高时减少。
- 不为了赶进度牺牲复习。
- 若候选 N2 项目很多，应按频率、题型价值、与既有知识关联度排序。
- 12 月前至少完成多轮回收，而不是仅“看过一次”。

### 推荐阶段

- 现在～10 月上旬：补齐核心 N2 词汇/语法覆盖，持续阅读与听力。
- 10 月中旬～11 月上旬：扩大题型训练、限时阅读、听力筛选、输出。
- 11 月中旬～11 月下旬：高频错题、综合周测、Mini Mock / Full Mock。
- 12 月 1–5 日：减新内容，集中错题、听力状态、阅读节奏、重点复习。
- 12 月 6 日：考试。

如果真实学习状态与阶段冲突，以学习状态为准。

---

## 4. 每日正式课程结构

正式 Day 原则上包含：

1. `🎯 今日目标`
   - 目标
   - 重点
   - 预计时长
   - 训练类型

2. `① 旧知识复习`
   - D+1 / D+3 / D+7
   - 🔴/🟡优先
   - 汉字读音
   - 近义词/易混词
   - 语法辨析

3. `② 新词＋汉字`
   - 原则 12–15 个
   - 单词
   - 读音
   - 中文意义
   - 原词/来源
   - 自然搭配
   - 易错读音
   - 必要的近义/反义/相似汉字
   - 纯日语 TTS 文本

4. `③ N2 语法`
   - 原则 3–4 个
   - 形式
   - 中文意义
   - 语感/用法
   - 接续（必要时）
   - 带假名学习例句
   - 中文翻译
   - 纯日语 TTS
   - 易混辨析

5. `④ 阅读`
   - N2 左右
   - 第一轮限时、不查词、不点朗读
   - 主旨 / 信息 / 观点 / 推断
   - 解释错误选项为什么错
   - 第二轮全文纯日语朗读文本
   - 最后 2–3 句日语复述

6. `⑤ 听力／复述`
   - 听 → 复述 → 提问 → 回答
   - 第一次需要隐藏文本时，只提供可播放的纯日语文本数据
   - 答题后再显示原文
   - 逐步覆盖 N2 任务理解、重点理解、概要理解、即时应答、综合理解

7. `⑥ 双人口语`
   - 与当日词汇/语法/阅读/现实生活相关
   - 双方轮流表达与追问
   - 至少主动使用当天与旧语法
   - 关键示范句提供纯日语 TTS

8. `⑦ 当日复盘`
   - 🔴 / 🟡 / 🟢
   - 汉字读音错误
   - 词汇/语法混淆
   - 阅读错误
   - 听力问题
   - 口语困难
   - 后续 D+1 / D+3 / D+7 回收队列

### 每周第 7 天追加

- 📊 本周复盘
- 本周新增词汇/语法
- 🔴/🟡
- 高频读音/语法错误
- 易混表达
- 阅读/听力/口语表现
- 下周继续回收项
- Mini N2 Mock（根据阶段决定题量）
- 📦 上周学习状态交接摘要

---

## 5. TTS / 假名数据要求

App 课程数据必须同时保留：

- 学习展示文本：允许 `漢字（かな）`
- 纯日语朗读文本：不得含中文、括号假名、罗马字或解释

示例：

```json
{
  "display": "状況（じょうきょう）を把握（はあく）する",
  "tts": "状況を把握する",
  "lang": "ja-JP",
  "translationZh": null
}
```

需要朗读的单位包括：

- 新词
- 重点搭配
- 每个新语法至少 1 个例句
- 阅读第二轮全文
- 听力原文
- 口语关键示范句

---

## 6. Week 03 暂停生成（2026-09-15 最新指令）

当前正式课程固定为 Week01 / Day001–007 与 Week02 / Day008–014。
在基础设施与参考资料系统完成并得到用户后续课程生成指令之前，Work 不创建、补写或发布 Week03。缺失 Week03 是有意暂停，不是需要自动补齐的错误。
未来获准继续时才从 Day015｜2026-09-10 开始；不得重新编号。

## 7. 课程数据写入规则

正式课程写到：

`data/weekXX.json`

并遵循：

`docs/COURSE_SCHEMA.md`

如果 schema 不存在或版本不一致：

- 不自行创造另一套格式。
- 先读取现有 App / Codex 文档。
- 必要时把问题报告给用户或 Codex。

课程写入后：

1. 检查 Day 连续性。
2. 检查日期连续性。
3. 检查新词是否与正式已学词重复计数。
4. 检查新语法是否与已学语法重复计数。
5. 检查所有应朗读内容是否存在纯日语 `tts`。
6. 检查中文解释与日语 TTS 没有混在同一字段。
7. 不手动维护课程索引，交由 build/release 自动生成。
8. 不修改程序代码。

---

## 8. 外部资料覆盖策略

参考库包含 N5–N1 时，不要按数据库顺序机械学习。

为每个候选项至少考虑：

- JLPT level metadata
- 多来源一致度
- 频率/常用度（若有）
- 是否已正式学过
- 是否为 🔴/🟡
- 是否与最近语法/阅读主题相关
- 是否容易混淆
- 是否有高价值搭配
- 是否适合考试题型

建议维护覆盖指标：

- N2 vocab candidate coverage
- N2 kanji coverage
- N2 grammar coverage
- 已正式学过
- 已掌握
- 🔴
- 🟡
- 尚未覆盖

覆盖率只用于决策，不可替代真实掌握度。

---

## 9. 启动时默认执行流程

用户只说：

> “继续更新课程”
> “按本地规则继续”
> “更新本周”
> “继续 Week 03”

时，默认：

1. 读取本文件。
2. 读取 Project 最新学习状态。
3. 读取 `docs/SOURCES.md`、`docs/COURSE_SCHEMA.md`。
4. 读取 `data/reference/`。
5. 检查当前最新正式 Week / Day。
6. 检查第6节暂停规则；未获得用户后续生成指令则停止课程生成。
7. 按 12 月 6 日考试倒排和当前学习负担生成课程。
8. 写入正式课程 JSON。
9. 自检。
10. 如果本地自动发布链路已配置，只修改允许 Work 修改的课程数据文件，不手动干预 Git/PWA 核心代码。

---

## 10. 不可违反的原则

- 不虚构用户实际 🔴/🟡记录。
- 不把“参考资料存在”当成“用户已经学过”。
- 不用大量新内容挤掉旧知识回收。
- 不未经验证复制所谓“真实 JLPT 泄露真题”。
- 不把第三方受限内容大段复制进公开 GitHub。
- 不因课程晚更新而重新编号 Day。
- 不因资料库标签不同而擅自重写历史正式 Day。

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

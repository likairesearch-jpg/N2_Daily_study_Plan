> 历史记录：当前工程与发布流程请以 COURSE_SCHEMA.md、RELEASE_WORKFLOW.md 和 SETUP_STATUS.md 为准。

# 给 Codex 的课程数据交接

目标：继续现有N2_Daily App，不另建App、不重新设计UI。

已交付：
- data/week02.json：Day008–014完整结构化课程。
- data/knowledge-index.json：Week01至Week02知识点与首次教学日，用于跨Day回收。
- data/course-policy.json：课程职责、日期、编号、复习与TTS规则。
- data/course-data.schema.json：周数据结构。
- data/week02-handoff.json：本周覆盖、实际结果待填字段、下周复习日程。
- docs/course-data-format.md：格式与兼容说明。
- docs/course-sources/：Day008–012原正式正文、Day013–014续编可读稿。
- docs/week02-editorial-audit.md：修订、来源缺口、检查结果。

需要Codex接续的程序工作：
1. 先读取现有程序。保留界面，支持按周读取JSON以及Week/Day导航。
2. 使用day.modules顺序渲染，每个词/语法一个学习模块；长文不能截断。
3. 保留旧Day001卡片键和存储，将后续课程用稳定id保存；不得将所有课程套入day001状态键。
4. 所有日语只播放text.tts，保留先读后听、先听后看顺序。
5. 复习资料从knowledge-index解析，不能静默略过未导入Day的复习。
6. 后续PWA、Git、部署、自动更新、程序测试由Codex单独处理。

重要：本次没有把Week02接入现有index，也没有发布网站。
仅新增课程数据和文档；day001.json/day001.js/index.html/style.css/app.js未修改。
写入位置：C:\LI KAI\AI\_Programing\N2_Daily。

## 2026-09-08：Week02 已接入页面
当前 index.html 已加载 Day001 与 Week02。学习周选择 Week02 后可选择 Day008–014。Week01 的 Day002–007仍无完整App课程，继续标明尚未导入。
保留 Day001 的状态键、页码和笔记；其他Day分别保存位置、状态、笔记与答题记录。原来的视觉布局保留。
数据来源仍为JSON。修改week02.json或knowledge-index.json后，运行 node tools/build-course-data.cjs 更新生成的data/course-bundle.js，刷新页面。不要手动编辑生成文件。
验证：tests/smoke.cjs 和 tests/weekly-integration.cjs 已通过，覆盖七天卡片生成、导航、旧进度保留、分日恢复、听读展开、日语TTS参数及JSON/加载文件一致性。此次未进行浏览器声音听辨。
先前文档中“数据尚未接入页面”描述的是上一轮交付状态，本次已完成接入。

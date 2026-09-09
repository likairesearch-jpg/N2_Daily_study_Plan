> 历史记录：当前工程与发布流程请以 COURSE_SCHEMA.md、RELEASE_WORKFLOW.md 和 SETUP_STATUS.md 为准。

# N2 课程数据格式 2.0.0

## 范围
在现有 Day001 App 上增加课程数据，不修改 index.html、style.css、app.js、day001.json 或 day001.js。本次没有实现课程选择器、PWA、Git或部署功能。
week02.json 是课程交付，当前页面仍只读取 day001.js；新课程不会仅因文件存在就出现在界面中。

## 现有格式检查
Day001 使用 window.N2_DAY，数据包含 week、day、date、title、vocab、grammar、listening、speaking。
vocab 是 [词,读音,中文,搭配显示,搭配中文] 数组。
grammar 是 [形式,中文意义,说明,带注音例句,翻译,可选补充] 数组。
listening、speaking 是 [显示日语,中文] 数组。
现有 app.js 还固定写入 Day001 标题、时长、步骤与卡片ID，不能简单换数据脚本后声称支持多日。
day001-0 等既有状态键应保留，不能重编号或覆盖旧学习进度。

## 稳定的数据单位
- week 文件：schemaVersion、contentVersion、week、dayRange、dateRange、days。
- day：id=day008、day=8、week=2、date、title、revision、source、modules和各模块内容。
- module：固定 type=review/vocabulary/grammar/reading/listening/speaking/recap；顺序由 modules 决定。
- 知识点：conceptId 全局稳定，例如 v-担当、g-ものの。重复学习继续引用原ID。
- 课程中的出现位置：id 在当天稳定，例如 day008-v01。调整显示顺序不能改已有ID；新增分配新ID。
- 学习文本：display为带注音日语；tts为纯日语；lang固定ja-JP；translationZh为中文或null。
- source.kind：existing_formal为历史正式内容；new_authorized_continuation为本次授权续编。
- completionStatus 和 recap.result 是结果状态；课程编制完成不代表用户学完。

## 兼容层
每个day有legacy对象，保留旧vocab/grammar/listening/speaking数组形状，供Codex逐步适配。
legacy只是兼容投影，不是完整教材：多搭配、多例句、整篇阅读、听力对话、复习与交接须读取规范字段。
week02.json是唯一周教材来源；不要手动维护第二份week02.js课程。如果后续需要file://启动，可由Codex从JSON生成等价JS加载文件。

## 日语朗读
只朗读tts，不从display去注音后猜测，更不能读整个含中文容器。
将同一text对象的display渲染为透明行内点击区域；虚线仅跟随文字，不重复显示朗读行。
听力segments包含speaker与text，speaker只作元数据，不读“男/女”标签。当前数据保留完整文本朗读和逐角色片段；不保证系统有两种日语声音。
reading.firstPass禁用朗读/中文/词典，保留原学习版注音，可另提供隐藏假名选项。
listening.firstPass隐藏原文与译文，先播一次再答；答案与原文在答后展开。
课程或选项中的日语都使用结构化文本字段，tts不能为空。

## 复习与去重
D+1/D+3/D+7的sourceDay=当前Day-offsetDays。Week02实际D+7对应Day001–007。
vocabularyIds和grammarIds解析到knowledge-index.json，原Day尚未在App导入也能获得读音、意义和语法例句。
mode=new表示首次明确教学，review为回收，不代表任何人的掌握状态。
仅在例句偶然出现的词不自动视为已掌握；一方和必ずしも因已明确教学另记为复习。
已发现历史重复词及总数冲突保存在week02.sourceAudit；不得用标题中的“12个新词”直接做统计。

## 个人状态
静态课程不写实际成绩。两位用户的结果应独立，以learnerId+conceptId+技能维度存储。
没有真实记录时用null，不用空数组暗示“没有错误”；候选薄弱项单列。
同一概念读音正确但听辨失败可不同色，不能互相覆盖。
用户结果、笔记与课程文件分离；更新教材不得清除进度。

## 版本与验证约束
schemaVersion 2.0.0定义字段契约；新增可选字段保持兼容，破坏性改变升主版本。
contentVersion标识教材修订；单日revision保留修订号。
需核对day与week映射、日期、所有复习引用、答案选项、TTS纯日语、计数及source来源。
course-data.schema.json定义结构约束；跨记录语义规则见本说明。
本次只做课程结构与内容核对，没有改动或测试程序代码。

## 2026-09-08：Week02 已接入页面
当前 index.html 已加载 Day001 与 Week02。学习周选择 Week02 后可选择 Day008–014。Week01 的 Day002–007仍无完整App课程，继续标明尚未导入。
保留 Day001 的状态键、页码和笔记；其他Day分别保存位置、状态、笔记与答题记录。原来的视觉布局保留。
数据来源仍为JSON。修改week02.json或knowledge-index.json后，运行 node tools/build-course-data.cjs 更新生成的data/course-bundle.js，刷新页面。不要手动编辑生成文件。
验证：tests/smoke.cjs 和 tests/weekly-integration.cjs 已通过，覆盖七天卡片生成、导航、旧进度保留、分日恢复、听读展开、日语TTS参数及JSON/加载文件一致性。此次未进行浏览器声音听辨。
先前文档中“数据尚未接入页面”描述的是上一轮交付状态，本次已完成接入。

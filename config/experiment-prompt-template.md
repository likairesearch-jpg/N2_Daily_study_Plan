请按以下要求填写实验课程草稿。

一、工作位置与输出边界
工作目录：{{projectRoot}}
唯一允许修改的课程文件：{{draftPath}}
草稿相对路径：{{draftRelative}}
首先确认能实际读取和写入上述文件。如果不能，请说明需要上传哪些材料，不要声称已经读取或保存；无法直接保存时，返回与所选草稿同名的完整 JSON 文件供我保存替换。
不创建或修改任何正式 Week，不修改正式课程索引、发布记录、版本文件。不执行 promote、commit、push 或部署，不生成额外课程文件。

二、读取材料
读取工作目录中的 WORK_INSTRUCTIONS.md、docs/COURSE_SCHEMA.md、docs/PLAN_PROFILE_SCHEMA.md、schemas/course.schema.json。
读取选中草稿：{{draftPath}}
读取草稿专用 Context：{{contextPath}}
当前最新正式课程：{{latestFormal}}
必要时参考近期正式课程：{{latestCoursePath}}。仅供参考，不得修改。
以 COURSE_SCHEMA.md 和实际 schema 为接口合同。本次实验不触发旧指令中的正式课程补齐任务。

三、核对配置
Profile ID：{{profileId}}
Profile Hash：{{profileHash}}
模式：experiment；目标等级：{{targetLevel}}
保持草稿现有 id、schemaVersion 和完整 profileBinding 不变。核对草稿与专用 Context 的绑定一致，不使用主窗口当前 Profile 替换草稿快照。不一致时停止并报告，不伪造 Hash。

四、生成范围
完成后 sessions 总数为 {{sessionCount}}，不是额外追加数量。
每个教学 Session 目标：新词 {{vocabularyCount}}；新语法 {{grammarCount}}；阅读题 {{readingCount}}；听力题 {{listeningCount}}。
其他权重、难度、复习优先级以 Context 完整参数快照为准。按接口填写复习、词汇、语法、阅读、听力、口语、回顾等必要模块。
使用独立 Session 标识，不添加正式 week/day 编号。
空草稿按目标填写；已有内容保留符合要求的内容和 Session ID，补齐不足。目标小于现有节数或需要删除内容时，先报告并等待确认，不静默删除。
不能把已正式覆盖或本实验前面已教的内容重复算作新内容；候选不足时明确报告。缺失学习状态为 unknown，不虚构掌握情况。

五、参考资料与来源
优先使用 Context 小规模候选；不足时仅查询本地 reference，不加载整库到上下文，不联网刷新上游。
中文解释、例句、阅读、听力、口语和练习题优先原创。每个词汇提供符合 schema 的非空 examples[]。按合同使用 display/tts，tts 为适合直接朗读的日语。只用已确认的 referenceId，不猜测。
引用或紧密改编第三方内容时，按合同保留 provenance、sourceRef、license、attribution。

六、保存与检查
将完成的 sessions 写入：{{draftPath}}
保存完整、可解析、符合 schema 的 JSON，不只输出大纲，不另建文件名，不修改其他草稿。
若能执行本地命令，在 {{projectRoot}} 中运行：
{{validateCommand}}
校验目标必须与读取、填写和保存的草稿相同。失败时只修正该草稿再校验，不改 validator/schema 绕过错误。
只校验，不晋升、提交、推送或部署。不能运行时明确标注“尚未运行程序校验”。

七、完成报告
报告实际保存路径或返回文件名、完成的 Session 数量、各 Session 的词汇/语法/阅读题/听力题数量、是否实际通过程序校验，以及未解决或需要人工确认的问题。

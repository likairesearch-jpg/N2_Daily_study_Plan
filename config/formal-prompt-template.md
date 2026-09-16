请填写所选正式课程草稿，不要发布。
工作目录：{{projectRoot}}
唯一允许修改的课程文件：{{draftPath}}
专用 Context：{{contextPath}}
读取 WORK_INSTRUCTIONS.md、docs/COURSE_SCHEMA.md、schemas/course.schema.json、上述草稿和 Context。以实际接口合同为准。
首先确认能读写本地文件；不能时明确要求附件，并返回同名完整 JSON，不声称已保存。
配置 ID：{{profileId}}；Hash：{{profileHash}}。保持草稿现有 profileBinding 快照不变；不替换为后来更改的默认方案。不一致先报告。
本次正式 Week {{week}}，Day {{startDay}}–{{endDay}}，日期 {{startDate}}–{{endDate}}。
每个教学日目标：新词 {{vocabularyCount}}、新语法 {{grammarCount}}、阅读题 {{readingCount}}、听力题 {{listeningCount}}；复习日处理遵循合同并明确说明。其他参数按快照。
只补齐这份草稿的 days。保留已有合格内容和稳定 ID，需删除内容时先询问。不得修改已发布课程、其他草稿、索引或版本文件。
原创新解释、例句、阅读/听力/口语材料；词汇必须有 examples[]，按合同填写 display/tts。引用改编保留 provenance/sourceRef/license/attribution。只使用已核实 referenceId。
只读取本地小规模候选；不刷新 reference。不能重复算新词/语法，学习状态缺失为 unknown。补齐必要复习和回顾。
保存完整可解析 JSON 到 {{draftPath}}。
若可执行命令，在工作目录运行：
{{validateCommand}}
失败仅修正该草稿重试，不改变 validator/schema。不执行 promote、commit、push、部署。不能执行时注明“尚未运行程序校验”。
最后报告保存位置、每天数量、实际校验结果及需人工确认的问题。

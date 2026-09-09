# 正式课程数据契约

Work（ChatGPT「N2 每日冲刺」Project）是正式内容唯一权威。程序只验证结构、引用和可渲染性，不生成、纠正或审定教学内容。

## 文件职责

- `data/weekXX.json`：正式整周课程，自动发现，无需改核心程序。
- `data/day001.json`：原 Day001 兼容输入，保留原卡片与状态 ID。
- `data/knowledge-index.json`：既有知识索引；运行时从周课程的 conceptId / knowledgeId 补入缺失项，已有索引优先。Work 修订既有复习释义时须同步此文件。
- `data/course-policy.json`：Work 管理的既有政策。
- `data/index.json`、`version.json`：自动生成；SHA-256 标识实际内容，不手改版本。
- `data/day001.js`、`data/course-bundle.js`：生成的双击兼容文件；正式网站直接读取 JSON。
- week02-handoff 等历史文件保留，但不属于自动同步输入，也不部署到网站。

自动提交白名单仅为上述四类 JSON 输入和 index/version；不会包含源码、备份或任意 data 文件。临时文件用 .tmp 后缀或放 work/。

## 机器契约

`schemas/course.schema.json` 是发布校验入口，兼容现有 schemaVersion 2.0.0 / 2.1.0。`data/course-data.schema.json` 是旧格式留档，不能完整表示已导入的 Week01，不作为当前入口。

Week N 覆盖 (N-1)*7+1 至 N*7。Week01.days 为 Day002–007，Day001 使用 legacy 文件；Week02 = Day008–014；Week03 = Day015–021；Week04 = Day022–028。周必须完整、按 Day 排序、编号连续，不发布半周。

周文件包含 schemaVersion、week、dayRange、days。dayRange 兼容现有数组或 {start,end}。Day 包含稳定 id、day、week、合法 date、title、source、goalsZh、scheduledMinutes、counts、modules。按模块类型验证实际字段。支持 review/vocabulary/grammar/reading/listening/speaking/recap/source/responses；不为了契约补写历史缺失课程模块。

日语文本字段：display（原显示文本）、tts（非空朗读原文）、lang 固定 ja-JP、translationZh（中文或 null）。display 保留注音；tts 不含全角注音括号。程序不猜测翻译。

卡片/问题/知识点 ID 必须稳定，重新排序不能重编号。单选答案必须引用已有选项。D+1/D+3/D+7 引用日期必须匹配且已存在，知识点引用必须可解析。卡片 ID 不重复，全部展开状态须可渲染。教学来源、历史审校备注不删除，静态课程不写用户成绩。

## Work 每周交付

1. 按 Project Instructions 完成整周内容。
2. 先写临时文件，完成后保存最终 data/weekXX.json；多文件修改连续完成，必要时先停止自动同步，完成后重启。
3. 两次相同快照（间隔30秒）后校验；失败不提交、不推送。
4. index/version 自动维护。

Work 必须实际具备向这台电脑此目录写入文件的能力。仅在云端对话生成了文字或下载文件，并不表示本地已更新；本系统从“文件已保存到本地”开始自动化，不读取私人 Project 对话。稳定检测不能判断文字是否已经审稿完成。

手动校验：`node tools/release.cjs prepare`，再运行 `node tools/release.cjs validate`。

Day001 特例：cards 存放从原版逐字提取的27张静态卡片展示，id 固定 day001-0…26。发布校验限制标签与属性，禁止脚本、事件处理器、链接和样式注入。原 vocab/grammar/listening/speaking 也保留作来源对照。

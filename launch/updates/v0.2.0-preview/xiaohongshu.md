# 小红书更新草稿

Language: zh-CN

不要自动发布。发布前必须人工预览。

项目地址：
https://github.com/darwinx687-afk/mcp-scope

## 草稿

我这次主要修了几个很基础但重要的地方。

MCP Scope / MCP 透镜准备做 `v0.2.0-preview`，定位是“双语入口与使用体验完善版”。

这次重点不是加很多新功能，而是把早期项目里容易让人疑惑的入口补清楚：

- README 第一屏增加 English / 简体中文切换
- 单独写清楚 limitations：现在能做什么、不能做什么、后续可能做什么
- 增加工具元数据导出说明，解释 `--tools <tools.json>` 支持哪些本地 JSON 形态
- discovery 找到 MCP config 候选文件后，会给出下一步 scan 命令提示
- 准备后续版本更新时的 LinkedIn / 小红书发布记录模板

边界还是一样：

- 不执行 MCP server
- 不发送实时 `tools/list`
- 不调用外部 AI API
- 发现项只是静态风险信号，不是安全证明

如果你手上有 MCP config，或者已经导出了工具元数据，欢迎试试看文档是否顺、下一步命令是否够清楚。也欢迎直接评论哪里看不懂。

https://github.com/darwinx687-afk/mcp-scope

# Jike Draft

Language: zh-CN

Selected image asset: `launch/assets/social-card-zh-CN.svg`

Do not post automatically. Preview manually before publishing.

## GitHub Repo

https://github.com/darwinx687-afk/mcp-scope

## Headline

做了一个很早期的 MCP 透明度报告工具，想听听大家反馈

## Main Post

最近做了一个小开源项目：MCP Scope / MCP 透镜。

它的出发点很简单：在把 MCP 工具交给 AI Agent 信任之前，先把本地配置和工具元数据看清楚。

现在它可以读取本地 MCP config 和本地导出的 tools metadata，生成 Markdown / JSON / HTML 报告，也支持本地 snapshot 和 diff。

几个边界：

- 不执行 MCP server
- 不请求实时 `tools/list`
- 不调用外部 AI API
- secret 值会隐藏
- 发现项只是静态风险信号

GitHub:
https://github.com/darwinx687-afk/mcp-scope

如果你在用 MCP 或 AI coding 工具，想请你帮忙看看：报告是否清楚、哪些地方太吵、还缺哪些 config 形态。

## Shorter Variant

做了一个早期小工具：MCP Scope / MCP 透镜。

本地读取 MCP 配置和导出的工具元数据，生成透明度报告。不执行 server，不联网请求实时工具列表。

GitHub:
https://github.com/darwinx687-afk/mcp-scope

欢迎用 MCP / AI coding 工具的朋友反馈。

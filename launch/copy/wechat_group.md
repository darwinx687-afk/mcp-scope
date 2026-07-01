# WeChat Group Draft

Language: zh-CN

Selected image asset: `launch/assets/social-card-zh-CN.svg`

Do not post automatically. Preview manually before publishing.

## GitHub Repo

https://github.com/darwinx687-afk/mcp-scope

## Main Post

我最近做了一个很早期的开源小工具：MCP Scope / MCP 透镜。

它主要解决一个问题：MCP 工具接进 AI coding 工具前，先在本地看清配置会启动什么、工具元数据声明了什么、哪些地方值得人工审查。

现在支持本地 discovery、scan、tool metadata 检查、Markdown / JSON / HTML 报告、snapshot/diff，还有 GitHub Action。

边界也明确：不执行 MCP server，不请求实时 `tools/list`，不调用外部 AI API，发现项只是静态风险信号。

GitHub:
https://github.com/darwinx687-afk/mcp-scope

如果群里有人在用 MCP / Claude Code / Cursor-like 工具，欢迎帮忙看看报告是否清楚、规则是否太吵、还缺哪些 config 形态。

## Shorter Variant

发一个早期小项目：MCP Scope / MCP 透镜。

本地读取 MCP 配置和导出的工具元数据，生成透明度报告。不执行 server，不请求实时工具列表。

GitHub:
https://github.com/darwinx687-afk/mcp-scope

欢迎正在用 MCP 或 AI coding 工具的朋友提反馈。

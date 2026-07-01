# V2EX Draft

Do not post automatically.

## Suggested Node

`programmer` or another relevant node after manual review.

## Suggested Image

None. Keep it simple.

## Title

做了一个 MCP 配置和工具元数据透明度报告工具，想请用 MCP 的朋友帮忙看看

## Body

最近做了一个小的开源项目：MCP Scope / MCP 透镜。

它的目标是，在 MCP 工具被 AI Agent 信任之前，先本地看一眼配置和工具元数据里暴露了什么、发生了什么变化、哪些地方值得人工审查。

现在能做：

- 发现可能的本地 MCP config
- 静态扫描 server 配置项
- 检查本地导出的 tools metadata
- 生成 Markdown / JSON / HTML 报告
- 做 snapshot 和 diff
- 跑 GitHub Action 门禁

边界：

- 不执行 MCP server
- 不请求实时 `tools/list`
- 不调用外部 AI API
- 发现项只是静态风险信号

GitHub:
https://github.com/darwinx687-afk/mcp-scope

如果你平时用 MCP、Claude Code、Cursor-like 工具或其他 AI coding 工具，欢迎帮忙试一下。尤其想听听：报告是否清楚，规则是否太吵，还缺哪些 config 形态。

## Shorter Version

做了一个本地优先的 MCP 配置和工具元数据透明度报告工具：MCP Scope。

不执行 MCP server，不请求实时 `tools/list`，只读本地配置和已导出的 metadata，生成 Markdown / JSON / HTML 报告。

GitHub: https://github.com/darwinx687-afk/mcp-scope

想请正在用 MCP 的朋友帮忙看看报告和规则是否有用。

## Posting Note

Post only after manual approval. Keep the tone low-promo.

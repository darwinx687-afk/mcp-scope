# WeChat Moments Draft

Do not post automatically.

## Suggested Image

`launch/assets/social-card-square-zh-CN.svg`

## Body

最近做了一个小开源项目，叫 MCP Scope / MCP 透镜。

起因很简单：我在看 MCP 工具接入 AI Agent 时，发现很多时候我们太快点了“信任”。但一个工具背后会启动什么命令、暴露哪些路径、工具描述里写了什么、之后有没有变化，其实都值得先看清楚。

所以我先做了一个很朴素的版本：本地读配置和已导出的工具元数据，生成 Markdown / JSON / HTML 透明度报告。

它现在还很早期，也不做安全保证：

- 不执行 MCP server
- 不请求实时 `tools/list`
- 不调用外部 AI API
- 发现项只是静态风险信号

GitHub:
https://github.com/darwinx687-afk/mcp-scope

如果你也在用 MCP 或 AI coding 工具，欢迎帮我看看。尤其想知道报告是否读得明白、哪些规则太吵、还缺什么场景。

## Shorter Version

做了一个早期小项目 MCP Scope / MCP 透镜：在信任 MCP 工具前，先本地看清配置和工具元数据。

不执行 server，不联网请求实时工具列表，只生成本地报告。欢迎正在用 MCP 的朋友帮忙试试。

GitHub: https://github.com/darwinx687-afk/mcp-scope

## Posting Note

Post manually only after the draft prerelease is reviewed. Use the prepared SVG, not personal photos.

# Xiaohongshu Draft

Language: zh-CN

Selected image asset: `launch/assets/social-card-square-zh-CN.svg`

Do not post automatically. Preview manually before publishing.

## GitHub Repo

https://github.com/darwinx687-afk/mcp-scope

## Title Options

1. 做了一个小工具：先看清 MCP 配置再信任工具
2. MCP 工具接进 AI Agent 前，我想先看清它暴露了什么
3. 一个很早期的开源项目：MCP Scope
4. 给 MCP 配置和工具元数据做一份本地透明度报告
5. AI Agent 用工具前，能不能先看一眼风险信号

## Main Post

最近在看 MCP 工具接入 AI Agent 的流程时，我反复遇到一个问题：工具一旦被 Agent 信任，背后到底暴露了哪些能力，很多时候并不直观。

比如一个 MCP 配置可能会启动本地命令，传入路径，暴露环境变量键名；工具元数据里也可能写着文件读写、网络访问、凭据相关操作，或者一些值得人工审查的描述。

所以我做了一个小的开源项目：MCP Scope / MCP 透镜。

它现在还很早期，主要做几件事：

- 在本地发现可能的 MCP config 文件
- 静态扫描 server 配置项
- 检查本地导出的工具元数据
- 生成 Markdown / JSON / HTML 报告
- 做本地审批记忆 snapshot 和静态 diff
- 在 GitHub Actions 里作为质量门禁使用

边界也先说清楚：

- 不执行 MCP server
- 不请求实时 `tools/list`
- 不调用外部 AI API
- secret 值会隐藏
- 发现项只是静态风险信号

项目地址：
https://github.com/darwinx687-afk/mcp-scope

如果你正在用 MCP、Claude Code、Cursor-like 工具或其他 AI coding 工具，欢迎帮我看看：报告是否看得懂、规则是否太吵、还缺哪些 config 形态。

## Shorter Variant

做了一个很早期的小开源项目：MCP Scope / MCP 透镜。

它是一个本地优先的 MCP 配置和工具元数据透明度报告工具。目标很简单：在把 MCP 工具交给 AI Agent 信任之前，先看清它暴露了什么、变了什么、哪些地方值得审查。

不执行 MCP server，不请求实时 `tools/list`，不调用外部 AI API。发现项只是静态风险信号。

GitHub:
https://github.com/darwinx687-afk/mcp-scope

欢迎正在用 MCP / AI coding 工具的朋友帮忙试一下，提 issue 或反馈都可以。

## Tags

`#MCP` `#AI工具` `#开源项目` `#AI编程` `#本地优先`

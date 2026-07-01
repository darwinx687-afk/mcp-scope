# Juejin Draft

Language: zh-CN

Selected image asset: `launch/assets/release-banner-zh-CN.svg`

Do not post automatically. Preview manually before publishing.

## GitHub Repo

https://github.com/darwinx687-afk/mcp-scope

## Title

我做了一个本地优先的 MCP 配置和工具元数据透明度报告工具

## Main Post

### 背景

最近越来越多开发者把 MCP server 接到 AI coding 工具里。这个过程里，我最想先看清几件事：

- 配置会启动什么命令？
- 会传入哪些路径、URL 或权限提示？
- 工具元数据里声明了哪些能力？
- 描述、schema、annotation 里有没有值得人工审查的风险信号？
- 审批后这些信息有没有变化？

所以我做了 MCP Scope / MCP 透镜，一个很早期的本地优先开源工具。

### 它现在能做什么

MCP Scope 读取本地 JSON 配置和本地导出的工具元数据，生成可以审查的透明度报告。

当前支持：

- `discover`：发现可能的本地 MCP config 文件
- `scan`：扫描 MCP server 配置项，可选加入工具元数据
- `inspect-tools`：检查本地导出的工具元数据
- `snapshot`：生成本地脱敏审批记忆
- `diff`：比较后续配置或工具元数据变化
- Markdown / JSON / HTML 报告
- GitHub Action 质量门禁

### 快速试用

```bash
pnpm install
pnpm build

node apps/cli/dist/index.js discover --root examples/clients
node apps/cli/dist/index.js scan \
  --config examples/clients/claude-code-project.mcp.json \
  --tools examples/tools/filesystem-tools.json
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.changed-description.json
```

### 边界

- 不执行 MCP server
- 不请求实时 `tools/list`
- 不调用外部 AI API
- 不上传报告
- secret 值会隐藏
- 发现项是静态风险信号，不是被攻击或安全的证明
- 还没有发布 npm，也没有 GitHub Marketplace action

### 想请大家看什么

如果你正在使用 MCP 或 AI coding 工具，欢迎帮忙看：

- 报告是否清楚？
- 哪些规则太吵？
- 哪些静态信号漏了？
- 还应该支持哪些本地 config 形态？
- GitHub Action 用起来是否顺手？

GitHub:
https://github.com/darwinx687-afk/mcp-scope

## Shorter Variant

做了一个很早期的开源项目：MCP Scope / MCP 透镜。

它读取本地 MCP 配置和本地导出的工具元数据，生成 Markdown / JSON / HTML 透明度报告，帮助开发者在信任 MCP 工具前看清配置、能力和变化。

不执行 MCP server，不请求实时 `tools/list`，不调用外部 AI API。发现项只是静态风险信号。

GitHub:
https://github.com/darwinx687-afk/mcp-scope

欢迎正在用 MCP 或 AI coding 工具的朋友反馈。

## Tags

`MCP`, `AI`, `TypeScript`, `CLI`, `GitHub Actions`, `开源`

# Juejin Draft

Do not post automatically.

## Suggested Image

`launch/assets/release-banner-zh-CN.svg`

## Link

https://github.com/darwinx687-afk/mcp-scope

## Title

我做了一个本地优先的 MCP 配置和工具元数据透明度报告工具：MCP Scope

## Body

### 背景

越来越多开发者开始把 MCP server 接入 AI coding 工具。问题是，工具被 Agent 信任之前，我们经常看不清几个基础问题：

- 配置会启动什么命令？
- 会传入哪些路径或 URL？
- 工具元数据里声明了哪些能力？
- 工具描述、schema、annotation 里有没有值得人工审查的信号？
- 审批后这些信息有没有变化？

### MCP Scope 做什么

MCP Scope / MCP 透镜是一个早期、本地优先的开源项目。它读取本地 JSON 配置和本地导出的工具元数据，生成可审查的透明度报告。

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

### 报告示例

- Markdown: `examples/reports/sample-combined-report.md`
- JSON: `examples/reports/sample-combined-report.json`
- HTML viewer: `examples/viewer/sample-combined-viewer.html`

### 当前边界

- 不执行 MCP server
- 不请求实时 `tools/list`
- 不调用外部 AI API
- 不上传报告
- 发现项是静态风险信号，不是被攻击或安全的证明
- 还没有发布 npm，也没有 GitHub Marketplace action

### 希望收到的反馈

如果你正在使用 MCP 或 AI coding 工具，欢迎帮忙看：

- 报告是否清楚？
- 哪些规则太吵？
- 哪些静态信号漏了？
- 还应该支持哪些本地 config 形态？
- GitHub Action 用起来是否顺手？

GitHub:
https://github.com/darwinx687-afk/mcp-scope

## Tags

`MCP`, `AI`, `TypeScript`, `CLI`, `GitHub Actions`, `开源`

## Posting Note

Wait until release finalization is approved. Do not publish automatically.

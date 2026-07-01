# MCP Scope / MCP 透镜

MCP Scope 是一个本地优先的 MCP 工具元数据、服务配置与 AI Agent 工具权限透明化审计工具。

当前项目处于 Phase 5 / 早期预览阶段。它还不是可用于生产环境的完整安全产品，不做完整安全保证，也不会执行 MCP 服务。

## 当前边界

- 核心 Phase 5 检查不调用外部 API。
- 不需要登录。
- 不使用数据库。
- 默认不依赖云服务。
- 不执行 MCP 服务。
- 不拉取远程元数据。
- 不向实时 MCP 服务发送 `tools/list` 请求。
- `env` 和 `headers` 中的值会被隐藏，报告只展示键名。
- 工具元数据发现项是静态风险信号，不是被攻击的证明。
- Markdown 报告支持 `--lang en` 和 `--lang zh-CN`。
- JSON 报告保持稳定的英文机器可读字段。
- HTML 报告是本地自包含文件，使用内联 CSS，不依赖外部资源。
- HTML 报告需要 `--output`；MCP Scope 不会自动打开浏览器，也不会启动服务。
- GitHub Action 支持只是包装本地 CLI，不会自动上传文件。

## CLI

当前命令：

```bash
mcp-scope --help
mcp-scope --version
mcp-scope status
mcp-scope scan --config <path>
mcp-scope scan --config <path> --tools <path>
mcp-scope scan --config <path> --tools <path> --lang zh-CN
mcp-scope scan --config <path> --format json
mcp-scope scan --config <path> --format markdown --output reports/mcp-scope-report.md
mcp-scope scan --config <path> --tools <path> --format html --output reports/mcp-scope-report.html
mcp-scope inspect-tools --tools <path> --format markdown --lang zh-CN
mcp-scope inspect-tools --tools <path> --format html --output reports/mcp-scope-tools.html
mcp-scope scan --config <path> --tools <path> --fail-on high
mcp-scope view --report examples/reports/sample-combined-report.json --output reports/sample-viewer.html
```

`mcp-scope status` 输出当前静态扫描状态：

```json
{
  "project": "mcp-scope",
  "name": "MCP Scope",
  "phase": 5,
  "status": "github-action-gate-ready",
  "scanner": "static-config-tool-metadata-ci-gate",
  "externalApiCalls": false,
  "serverExecution": false
}
```

## 扫描本地 MCP 配置

MCP Scope 支持带有顶层 `mcpServers` 对象的 JSON 文件。对于 Claude Desktop 常见写法，如果条目省略 `type` 但包含 `command` 和 `args`，MCP Scope 会按 `stdio` 处理。

```bash
pnpm build
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json
node apps/cli/dist/index.js scan --config examples/http-server-with-redacted-auth.json --format json
```

## 检查本地工具元数据

MCP Scope 只支持用户本地提供的 MCP 工具元数据文件。它可以读取已经导出的 MCP `tools/list` JSON-RPC 响应，也可以读取带有 `serverName` 和 `tools` 的本地清单。MCP Scope 目前不会向实时 MCP 服务发送 `tools/list` 请求。

```bash
node apps/cli/dist/index.js scan --config examples/claude-code-project.mcp.json --tools examples/tools/poisoned-description-tools.json
node apps/cli/dist/index.js inspect-tools --tools examples/tools/credential-network-tools.json --format json
node apps/cli/dist/index.js inspect-tools --tools examples/tools/poisoned-description-tools.json --format markdown --lang zh-CN
```

## 报告

MCP Scope 报告包含执行摘要、检查范围、未检查范围、严重程度说明、config 摘要、tool metadata 摘要、排序后的发现项、脱敏说明和局限性。当前支持 Markdown、JSON 和本地自包含 HTML。

Markdown 输出片段示例：

```markdown
# MCP Scope Report

- 早期透明度报告
- 仅做静态分析
- MCP server execution: false
- External API calls: false
- Secret values redacted: true

## 执行摘要

- Server count: 1
- Tool count: 2
- Finding count: 4
```

报告文档：

- `docs/REPORT_SCHEMA.md`
- `docs/REPORT_GUIDE.md`
- `docs/REPORT_GUIDE.zh-CN.md`
- `docs/VIEWER_GUIDE.md`
- `docs/VIEWER_GUIDE.zh-CN.md`
- `docs/GITHUB_ACTION.md`
- `docs/GITHUB_ACTION.zh-CN.md`

MCP Scope 输出的是透明度提示和静态风险信号。它不会证明某个配置已经被攻击，也不会证明某个配置绝对安全；它不执行 MCP 服务，也不检查实时工具元数据。

## GitHub Action

可以在本仓库 workflow 中使用根目录 composite action。MCP Scope 还没有发布到 GitHub Marketplace。

```yaml
- uses: ./
  with:
    config: examples/claude-desktop-filesystem.json
    tools: examples/tools/filesystem-tools.json
    report-format: markdown
    report-path: mcp-scope-report.md
    fail-on: high
    lang: zh-CN
```

推荐权限：

```yaml
permissions:
  contents: read
```

输入、输出、阈值、job summary 和 artifact 上传示例见 `docs/GITHUB_ACTION.zh-CN.md`。

## 示例

- `examples/claude-desktop-filesystem.json`
- `examples/claude-code-project.mcp.json`
- `examples/http-server-with-redacted-auth.json`
- `examples/risky-local-command.json`
- `examples/tools/filesystem-tools.json`
- `examples/tools/poisoned-description-tools.json`
- `examples/tools/credential-network-tools.json`
- `examples/tools/schema-quality-tools.json`
- `examples/tools/multi-tool-suspicious-fragments.json`
- `examples/reports/sample-combined-report.md`
- `examples/reports/sample-combined-report.zh-CN.md`
- `examples/reports/sample-combined-report.json`
- `examples/reports/sample-tools-only-report.md`
- `examples/viewer/sample-combined-viewer.html`
- `examples/viewer/sample-combined-viewer.zh-CN.html`
- `examples/viewer/sample-tools-only-viewer.html`
- `docs/examples/github-action-basic.yml`
- `docs/examples/github-action-threshold-gate.yml`
- `docs/examples/github-action-zh-CN.yml`

## 本地开发

```bash
pnpm install
pnpm check
```

## 路线预览

- Phase 4：本地只读查看器。已实现。
- Phase 5：GitHub Action 质量门禁。已实现。
- Phase 6：工具元数据差异与审批记忆。

完整路线见 `ROADMAP.md`。

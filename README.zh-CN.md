# MCP Scope / MCP 透镜

MCP Scope 是一个本地优先的 MCP 工具元数据、服务配置与 AI Agent 工具权限透明化审计工具。

当前项目处于 Phase 2 / 早期预览阶段。它还不是可用于生产环境的完整安全产品，不做完整安全保证，也不会执行 MCP 服务。

## 当前边界

- 核心 Phase 2 检查不调用外部 API。
- 不需要登录。
- 不使用数据库。
- 默认不依赖云服务。
- 不执行 MCP 服务。
- 不拉取远程元数据。
- 不向实时 MCP 服务发送 `tools/list` 请求。
- `env` 和 `headers` 中的值会被隐藏，报告只展示键名。
- 工具元数据发现项是静态风险信号，不是被攻击的证明。

## CLI

当前命令：

```bash
mcp-scope --help
mcp-scope --version
mcp-scope status
mcp-scope scan --config <path>
mcp-scope scan --config <path> --tools <path>
mcp-scope scan --config <path> --format json
mcp-scope scan --config <path> --format markdown --output reports/mcp-scope-report.md
mcp-scope inspect-tools --tools <path>
```

`mcp-scope status` 输出当前静态扫描状态：

```json
{
  "project": "mcp-scope",
  "name": "MCP Scope",
  "phase": 2,
  "status": "tool-metadata-rules-ready",
  "scanner": "static-config-and-tool-metadata",
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

Phase 2 只支持用户本地提供的 MCP 工具元数据文件。它可以读取已经导出的 MCP `tools/list` JSON-RPC 响应，也可以读取带有 `serverName` 和 `tools` 的本地清单。MCP Scope 目前不会向实时 MCP 服务发送 `tools/list` 请求。

```bash
node apps/cli/dist/index.js scan --config examples/claude-code-project.mcp.json --tools examples/tools/poisoned-description-tools.json
node apps/cli/dist/index.js inspect-tools --tools examples/tools/credential-network-tools.json --format json
```

Markdown 输出片段示例：

```markdown
# MCP Scope Report

- Source file: examples/http-server-with-redacted-auth.json
- Server count: 1
- Env/header values redacted: true
- External API calls: false
- Server execution: false
- Tool count: 2
- Finding count: 4
```

MCP Scope 输出的是透明度提示和静态风险信号。它不会证明某个配置已经被攻击，也不会证明某个配置绝对安全；它不执行 MCP 服务，也不检查实时工具元数据。

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

## 本地开发

```bash
pnpm install
pnpm check
```

## 路线预览

- Phase 3：Markdown/JSON 透明度报告。
- Phase 4：本地只读查看器。
- Phase 5：GitHub Action 质量门禁。
- Phase 6：工具元数据差异与审批记忆。

完整路线见 `ROADMAP.md`。

# MCP Scope

A local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

MCP Scope is in Phase 2 / early preview. It is not production-ready, does not make complete security claims, and does not execute MCP servers.

## Current Guarantees

- No external API calls in the core Phase 2 checks.
- No login.
- No database.
- No cloud service by default.
- No MCP server execution.
- No remote metadata fetching.
- No live `tools/list` requests.
- Secret values from `env` and `headers` are redacted. Reports show key names only.
- Tool metadata findings are static risk signals, not proof of compromise.

## CLI

Current commands:

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

`mcp-scope status` reports the current static scanner state:

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

## Scan a Local MCP Config

MCP Scope supports JSON files with a top-level `mcpServers` object. It also supports Claude Desktop style entries where `type` is omitted but `command` and `args` exist; those entries are inferred as `stdio`.

```bash
pnpm build
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json
node apps/cli/dist/index.js scan --config examples/http-server-with-redacted-auth.json --format json
```

## Inspect Local Tool Metadata

Phase 2 supports local exported MCP tool metadata only. It can read a saved MCP `tools/list` JSON-RPC response or a portable local manifest with `serverName` and `tools`. MCP Scope does not send `tools/list` requests to live MCP servers yet.

```bash
node apps/cli/dist/index.js scan --config examples/claude-code-project.mcp.json --tools examples/tools/poisoned-description-tools.json
node apps/cli/dist/index.js inspect-tools --tools examples/tools/credential-network-tools.json --format json
```

Example Markdown excerpt:

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

MCP Scope reports transparency notes and static risk signals. It does not prove compromise, prove safety, run MCP servers, or inspect live tool metadata.

## Examples

- `examples/claude-desktop-filesystem.json`
- `examples/claude-code-project.mcp.json`
- `examples/http-server-with-redacted-auth.json`
- `examples/risky-local-command.json`
- `examples/tools/filesystem-tools.json`
- `examples/tools/poisoned-description-tools.json`
- `examples/tools/credential-network-tools.json`
- `examples/tools/schema-quality-tools.json`
- `examples/tools/multi-tool-suspicious-fragments.json`

## Development

```bash
pnpm install
pnpm check
```

## Roadmap Preview

- Phase 3: Markdown/JSON transparency reports.
- Phase 4: local read-only viewer.
- Phase 5: GitHub Action quality gate.
- Phase 6: tool metadata diff and approval memory.

See `ROADMAP.md` for the full roadmap.

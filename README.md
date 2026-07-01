# MCP Scope

A local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

MCP Scope is in Phase 1 / early preview. It is not production-ready, does not make complete security claims, and does not execute MCP servers.

## Current Guarantees

- No external API calls in the core Phase 1 checks.
- No login.
- No database.
- No cloud service by default.
- No MCP server execution.
- No remote metadata fetching.
- Secret values from `env` and `headers` are redacted. Reports show key names only.

## CLI

Current commands:

```bash
mcp-scope --help
mcp-scope --version
mcp-scope status
mcp-scope scan --config <path>
mcp-scope scan --config <path> --format json
mcp-scope scan --config <path> --format markdown --output reports/mcp-scope-report.md
```

`mcp-scope status` reports the current static scanner state:

```json
{
  "project": "mcp-scope",
  "name": "MCP Scope",
  "phase": 1,
  "status": "config-fingerprint-ready",
  "scanner": "static-config-fingerprint",
  "externalApiCalls": false,
  "serverExecution": false
}
```

## Scan a Local MCP Config

Phase 1 supports JSON files with a top-level `mcpServers` object. It also supports Claude Desktop style entries where `type` is omitted but `command` and `args` exist; those entries are inferred as `stdio`.

```bash
pnpm build
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json
node apps/cli/dist/index.js scan --config examples/http-server-with-redacted-auth.json --format json
```

Example Markdown excerpt:

```markdown
# MCP Scope Report

- Source file: examples/http-server-with-redacted-auth.json
- Server count: 1
- Env/header values redacted: true
- External API calls: false
- Server execution: false
```

MCP Scope reports transparency notes and risk signals. It does not prove compromise, prove safety, run MCP servers, or inspect live tool metadata in Phase 1.

## Examples

- `examples/claude-desktop-filesystem.json`
- `examples/claude-code-project.mcp.json`
- `examples/http-server-with-redacted-auth.json`
- `examples/risky-local-command.json`

## Development

```bash
pnpm install
pnpm check
```

## Roadmap Preview

- Phase 2: tool metadata schema and risk rule engine.
- Phase 3: Markdown/JSON transparency reports.
- Phase 4: local read-only viewer.
- Phase 5: GitHub Action quality gate.
- Phase 6: tool metadata diff and approval memory.

See `ROADMAP.md` for the full roadmap.

# MCP Scope

A local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

MCP Scope is in Phase 0 / early preview. It is not production-ready, does not make complete security claims, and does not execute MCP servers in Phase 0.

## Current Guarantees

- No external API calls in the core Phase 0 checks.
- No login.
- No database.
- No cloud service by default.
- No real MCP metadata scanning yet.
- No MCP server execution in Phase 0.

## CLI

Current placeholder commands:

```bash
mcp-scope --help
mcp-scope --version
mcp-scope status
```

`mcp-scope status` reports the foundation state only:

```json
{
  "project": "mcp-scope",
  "name": "MCP Scope",
  "phase": 0,
  "status": "foundation-ready",
  "scanner": "not-implemented-yet",
  "externalApiCalls": false
}
```

## Development

```bash
pnpm install
pnpm check
```

## Roadmap Preview

- Phase 1: first real MCP config fingerprint.
- Phase 2: tool metadata schema and risk rule engine.
- Phase 3: Markdown/JSON transparency reports.
- Phase 4: local read-only viewer.
- Phase 5: GitHub Action quality gate.
- Phase 6: tool metadata diff and approval memory.

See `ROADMAP.md` for the full roadmap.

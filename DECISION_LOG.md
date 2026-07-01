# Decision Log

## 2026-07-01

- Project name: MCP Scope.
- Chinese name: MCP 透镜.
- Repo slug: `mcp-scope`.
- Architecture: TypeScript pnpm local-first CLI monorepo.
- Early scope: static local MCP config and metadata transparency, not runtime blocking.
- Research anchor: MCP tool poisoning and tool metadata transparency.
- Bilingual structure from day one.

## 2026-07-01 Phase 1

- Phase 1 scanner is static-only and does not execute MCP servers.
- Phase 1 supports only the common top-level `mcpServers` JSON object shape.
- Env/header values are never rendered; reports show key names and redaction markers only.

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

## 2026-07-01 Phase 2

- Phase 2 supports local exported MCP tool metadata only and does not execute `tools/list` against live servers.
- Tool metadata findings are static risk signals and warnings, not confirmed vulnerabilities.
- Tool metadata schemas are sanitized before JSON/Markdown rendering to avoid emitting obvious secret example values.

## 2026-07-01 Phase 3

- Markdown reports support bilingual rendering through `--lang en` and `--lang zh-CN`.
- JSON reports remain stable English machine-readable schema fields.
- Curated report examples live under `examples/reports`; generated smoke reports remain ignored under `reports/`.

## 2026-07-01 Phase 4

- The viewer is a local static HTML file, not a hosted dashboard.
- HTML output requires `--output` to avoid dumping viewer markup to stdout.
- The `view` command renders an existing MCP Scope JSON report and does not execute MCP servers, start a web server, open a browser, or call external APIs.
- Curated viewer examples live under `examples/viewer`; generated smoke reports remain ignored under `reports/`.

## 2026-07-01 Phase 5

- Phase 5 uses a composite GitHub Action that wraps the local CLI and writes summary/output without publishing to GitHub Marketplace.
- The action generates JSON internally for CI evaluation, but artifact upload remains an explicit workflow step.
- Severity gates use static report severity only; findings remain risk signals, not confirmed vulnerabilities.

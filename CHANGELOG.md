# Changelog

## 0.0.0 - 2026-07-01

- Initialized MCP Scope Phase 0 foundation.
- Added governance documents and bilingual README files.
- Added TypeScript pnpm monorepo skeleton.
- Added placeholder CLI, core package, report package, and tests.
- Added Phase 1 static MCP config fingerprint command.
- Added Markdown/JSON scan reports with env/header value redaction.
- Added safe example MCP config files.
- Added Phase 2 local exported tool metadata parsing and static risk rule engine.
- Added combined `scan --tools` reports and `inspect-tools --tools` reports.
- Added safe tool metadata examples and rule coverage tests.
- Added Phase 3 stable JSON transparency report model.
- Added bilingual Markdown report rendering with `--lang en` and `--lang zh-CN`.
- Added report schema/user guides and curated sample reports.
- Added Phase 4 self-contained local HTML viewer rendering.
- Added `scan --format html --output`, `inspect-tools --format html --output`, and `view --report --output`.
- Added HTML viewer docs and curated viewer examples.
- Added Phase 5 root composite GitHub Action quality gate.
- Added CLI `--fail-on none|info|low|medium|high` threshold behavior for `scan` and `inspect-tools`.
- Added GitHub Action docs, example workflows, repository CI, and action runner tests.
- Added Phase 6 approval-memory snapshots with `mcp-scope snapshot`.
- Added static snapshot diffing with `mcp-scope diff`.
- Added `--fail-on-change none|info|low|medium|high` threshold behavior for diffs.
- Added Markdown, JSON, and self-contained HTML diff rendering.
- Added approval-memory docs and curated snapshot/diff examples.
- Added Phase 7 support for `projects[*].mcpServers`, `mcp.servers`, and top-level `servers` config shapes.
- Added client profile labels and curated client compatibility examples.
- Added `mcp-scope discover --root <path>` with Markdown, JSON, and self-contained HTML reports.
- Added discovery docs and curated discovery report examples.

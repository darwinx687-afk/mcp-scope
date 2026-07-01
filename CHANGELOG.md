# Changelog

## v0.1.0-preview - Draft prerelease

- Prepared the first public GitHub preview state for MCP Scope.
- Published the repository source to GitHub for early review.
- Kept npm publishing and GitHub Marketplace publishing out of scope.
- Kept findings framed as static risk signals, transparency notes, and warnings.

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
- Added Phase 8 open-source launch packaging.
- Added SVG logo and banner assets.
- Reworked English and Chinese README first screens for public launch review.
- Added documentation and examples index pages in English and Chinese.
- Added GitHub issue templates and PR template with redaction reminders.
- Added launch checklist, feedback guide, post-launch roadmap, release draft, and refreshed launch notes.
- Updated project status to Phase 8 launch packaging ready.

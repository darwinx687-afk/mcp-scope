# Run State

- Current phase: Phase 7
- Current status: Ecosystem compatibility examples and static config discovery ready
- Next loop: Phase 8 open-source launch packaging
- Current scope guard: local config compatibility and discovery only; no MCP server execution, no live tools/list requests, no external APIs, no config modification

## Latest Loop

- Objective: add common local config shape compatibility, curated client examples, and static discovery.
- Scanner state: static config fingerprint plus local exported tool metadata analysis; config parsing now supports `mcpServers`, `projects[*].mcpServers`, `mcp.servers`, and top-level `servers`.
- External API calls: false.
- MCP server execution: false.
- Live `tools/list` requests: false.
- Web server: not started.
- Browser auto-open: false.
- GitHub Actions: unchanged Phase 5 root composite action.
- Artifact upload: only via explicit workflow step.
- Approval memory: local redacted JSON snapshots under user-chosen paths.
- Diff outputs: Markdown, JSON, and self-contained HTML.
- Thresholds: `--fail-on-change none|info|low|medium|high`.
- Discovery: `mcp-scope discover --root <path>` lists candidates only; it does not auto-scan or modify files.
- Client profile labels: compatibility hints only, not official integrations.

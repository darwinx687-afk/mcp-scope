# MCP Scope

A local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

MCP Scope is in Phase 6 / early preview. It is not production-ready, does not make complete security claims, and does not execute MCP servers.

## Current Guarantees

- No external API calls in the core Phase 6 checks.
- No login.
- No database.
- No cloud service by default.
- No MCP server execution.
- No remote metadata fetching.
- No live `tools/list` requests.
- Secret values from `env` and `headers` are redacted. Reports show key names only.
- Tool metadata findings are static risk signals, not proof of compromise.
- Markdown reports support `--lang en` and `--lang zh-CN`.
- JSON reports keep stable English machine-readable keys.
- HTML reports are self-contained local files with inline CSS and no external assets.
- HTML reports require `--output`; MCP Scope does not open a browser or start a server.
- GitHub Action support wraps the local CLI; it does not upload files automatically.
- Approval memory snapshots are local redacted JSON files, not safety certification.

## CLI

Current commands:

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
mcp-scope snapshot --config <path> --tools <path> --output snapshots/approved.snapshot.json --label "reviewed"
mcp-scope diff --baseline snapshots/approved.snapshot.json --config <path> --tools <path>
mcp-scope diff --baseline snapshots/approved.snapshot.json --config <path> --tools <path> --fail-on-change high
```

`mcp-scope status` reports the current static scanner state:

```json
{
  "project": "mcp-scope",
  "name": "MCP Scope",
  "phase": 6,
  "status": "approval-memory-diff-ready",
  "scanner": "static-config-tool-metadata-approval-memory",
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

MCP Scope supports local exported MCP tool metadata only. It can read a saved MCP `tools/list` JSON-RPC response or a portable local manifest with `serverName` and `tools`. MCP Scope does not send `tools/list` requests to live MCP servers yet.

```bash
node apps/cli/dist/index.js scan --config examples/claude-code-project.mcp.json --tools examples/tools/poisoned-description-tools.json
node apps/cli/dist/index.js inspect-tools --tools examples/tools/credential-network-tools.json --format json
node apps/cli/dist/index.js inspect-tools --tools examples/tools/poisoned-description-tools.json --format markdown --lang zh-CN
```

## Reports

MCP Scope reports include an executive summary, checked/not-checked sections, severity legend, config summary, tool metadata summary, sorted findings, redaction guarantees, and limitations. Markdown, JSON, and self-contained HTML are available.

Example Markdown excerpt:

```markdown
# MCP Scope Report

- Early transparency report
- Static analysis only
- MCP server execution: false
- External API calls: false
- Secret values redacted: true

## Executive Summary

- Server count: 1
- Tool count: 2
- Finding count: 4
```

Report docs:

- `docs/REPORT_SCHEMA.md`
- `docs/REPORT_GUIDE.md`
- `docs/REPORT_GUIDE.zh-CN.md`
- `docs/VIEWER_GUIDE.md`
- `docs/VIEWER_GUIDE.zh-CN.md`
- `docs/GITHUB_ACTION.md`
- `docs/GITHUB_ACTION.zh-CN.md`
- `docs/APPROVAL_MEMORY.md`
- `docs/APPROVAL_MEMORY.zh-CN.md`

MCP Scope reports transparency notes and static risk signals. It does not prove compromise, prove safety, run MCP servers, or inspect live tool metadata.

## GitHub Action

Use the root composite action from this repository in local workflows. MCP Scope is not published to GitHub Marketplace yet.

```yaml
- uses: ./
  with:
    config: examples/claude-desktop-filesystem.json
    tools: examples/tools/filesystem-tools.json
    report-format: markdown
    report-path: mcp-scope-report.md
    fail-on: high
    lang: en
```

Recommended permissions:

```yaml
permissions:
  contents: read
```

See `docs/GITHUB_ACTION.md` for inputs, outputs, threshold behavior, job summaries, and artifact upload examples.

## Approval Memory Diff

Create a local redacted snapshot after a review, then compare a future config and tool metadata export against that baseline:

```bash
node apps/cli/dist/index.js snapshot \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.json \
  --output examples/snapshots/filesystem-approved.snapshot.json \
  --label "filesystem review"

node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.changed-description.json \
  --format markdown
```

Use `--fail-on-change none|info|low|medium|high` to make local scripts or CI fail when static drift reaches a chosen severity. See `docs/APPROVAL_MEMORY.md` for the full workflow.

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
- `examples/tools/filesystem-tools.changed-description.json`
- `examples/tools/filesystem-tools.changed-schema.json`
- `examples/tools/filesystem-tools.added-dangerous-tool.json`
- `examples/configs/claude-desktop-filesystem.changed-command.json`
- `examples/reports/sample-combined-report.md`
- `examples/reports/sample-combined-report.zh-CN.md`
- `examples/reports/sample-combined-report.json`
- `examples/reports/sample-tools-only-report.md`
- `examples/viewer/sample-combined-viewer.html`
- `examples/viewer/sample-combined-viewer.zh-CN.html`
- `examples/viewer/sample-tools-only-viewer.html`
- `examples/snapshots/filesystem-approved.snapshot.json`
- `examples/diffs/filesystem-description-change.diff.md`
- `examples/diffs/filesystem-description-change.diff.zh-CN.md`
- `examples/diffs/filesystem-added-dangerous-tool.diff.json`
- `examples/diffs/filesystem-added-dangerous-tool.diff.html`
- `docs/examples/github-action-basic.yml`
- `docs/examples/github-action-threshold-gate.yml`
- `docs/examples/github-action-zh-CN.yml`

## Development

```bash
pnpm install
pnpm check
```

## Roadmap Preview

- Phase 4: local read-only viewer. Implemented.
- Phase 5: GitHub Action quality gate. Implemented.
- Phase 6: approval memory snapshots and static diffing. Implemented.

See `ROADMAP.md` for the full roadmap.

# Dev.to Draft

Language: en

Selected image asset: `launch/assets/release-banner-en.svg`

Do not post automatically. Preview manually before publishing.

## GitHub Repo

https://github.com/darwinx687-afk/mcp-scope

## Title

MCP Scope: local-first transparency reports for MCP tools

## Tags

`opensource`, `typescript`, `githubactions`, `ai`

## Article

### Why I built this

MCP makes it easier to connect tools to AI agents, including coding agents. That also means developers need a better way to review what a tool appears to expose before trusting it.

MCP Scope is an early local-first CLI for inspecting MCP configs and exported tool metadata. It generates transparency reports that can be reviewed locally or in CI.

### What it does

Current preview features:

- discover likely local MCP config files
- scan local MCP server config entries
- inspect exported MCP tool metadata
- render Markdown, JSON, and self-contained HTML reports
- create local approval-memory snapshots
- diff later config/tool metadata changes
- run as a GitHub Action quality gate

### Commands

```bash
pnpm install
pnpm build

node apps/cli/dist/index.js discover --root examples/clients
node apps/cli/dist/index.js scan \
  --config examples/clients/claude-code-project.mcp.json \
  --tools examples/tools/filesystem-tools.json
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.changed-description.json
```

### Reports

MCP Scope can produce:

- Markdown for reviews
- JSON for automation
- static HTML for local reading

Sample reports live in the repository under `examples/reports` and `examples/viewer`.

### Limitations

MCP Scope is static analysis only. It does not execute MCP servers, send live `tools/list` requests, call external AI APIs, upload reports automatically, or prove safety/compromise.

Findings are risk signals and transparency notes.

### Feedback request

GitHub: https://github.com/darwinx687-afk/mcp-scope

I am looking for feedback on:

- unclear report sections
- noisy findings
- missed static signals
- config shapes from real local setups
- GitHub Action usability

Please redact secrets and private configs before opening issues.

## Shorter Variant

MCP Scope is an early local-first CLI for MCP config and exported tool metadata transparency reports.

It generates Markdown, JSON, and static HTML reports, supports snapshots/diffs, and can run as a GitHub Action quality gate.

GitHub:
https://github.com/darwinx687-afk/mcp-scope

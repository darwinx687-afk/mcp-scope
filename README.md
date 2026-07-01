![MCP Scope banner](assets/banner.svg)

# MCP Scope

Local-first transparency and risk audit reports for MCP tool metadata, server configs, and AI agent tool permissions.

Status: early preview. MCP Scope is useful for local review and CI visibility, but it is not a complete security product and does not claim production-grade protection.

## What Stays Local

- No MCP server execution.
- No live `tools/list` requests.
- No external AI API calls.
- No login, database, cloud sync, or telemetry.
- Secret values from `env`, `headers`, URL queries, and secret-like schema examples are redacted where MCP Scope renders them.
- Findings are static risk signals and transparency notes, not proof of compromise or proof of safety.

## Run Locally

```bash
pnpm install
pnpm build

node apps/cli/dist/index.js discover --root examples/clients
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json
node apps/cli/dist/index.js diff --baseline examples/snapshots/filesystem-approved.snapshot.json --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.changed-description.json
```

Three strong starting points:

- `discover`: list likely local MCP config files without scanning or modifying them.
- `scan`: inspect a local MCP config and optional exported tool metadata file.
- `diff`: compare current local config/tool metadata against a redacted approval-memory snapshot.

Example output:

- [Sample Markdown report](examples/reports/sample-combined-report.md)
- [Sample JSON report](examples/reports/sample-combined-report.json)
- [Sample HTML viewer](examples/viewer/sample-combined-viewer.html)

## What It Is

MCP Scope helps developers see what changed, what is exposed, and what looks risky before MCP tools are trusted by AI agents.

Current capabilities:

- Discover likely local MCP config files.
- Scan MCP config server entries.
- Inspect local exported MCP tool metadata.
- Detect static tool metadata risk signals.
- Generate Markdown, JSON, and self-contained HTML reports.
- Render English and Chinese Markdown reports.
- Create local approval-memory snapshots and static diffs.
- Run as a local repository GitHub Action quality gate.

## What It Is Not

- Not a malware scanner.
- Not a complete security product.
- Not an official integration with any MCP client.
- Not a SaaS, hosted dashboard, chatbot, or generic agent framework.
- Not a tool that executes MCP servers or secretly fetches live tool metadata.

## GitHub Action

Use the root composite action from this repository in local workflows. MCP Scope is not published to GitHub Marketplace.

```yaml
name: MCP Scope

on:
  pull_request:
  push:

permissions:
  contents: read

jobs:
  mcp-scope:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: ./
        with:
          config: examples/claude-desktop-filesystem.json
          tools: examples/tools/filesystem-tools.json
          report-format: markdown
          report-path: mcp-scope-report.md
          fail-on: high
          lang: en
```

See [GitHub Action docs](docs/GITHUB_ACTION.md) for inputs, outputs, threshold behavior, job summaries, and artifact upload examples.

## Launch / Feedback

The public repository is available at [github.com/darwinx687-afk/mcp-scope](https://github.com/darwinx687-afk/mcp-scope). The `v0.1.0-preview` release is public as a prerelease, not a final/stable release.

- [Launch notes](LAUNCH_NOTES.md)
- [Feedback guide](docs/FEEDBACK_GUIDE.md)
- [Launch pack](launch/README.md)
- [Remote launch state](docs/REMOTE_LAUNCH_STATE.md)

Please redact secrets, private configs, internal paths, and sensitive report excerpts before opening issues.

## Docs

- [Documentation index](docs/README.md)
- [Examples index](examples/README.md)
- [Report guide](docs/REPORT_GUIDE.md)
- [Report schema](docs/REPORT_SCHEMA.md)
- [HTML viewer guide](docs/VIEWER_GUIDE.md)
- [Approval memory](docs/APPROVAL_MEMORY.md)
- [Discovery](docs/DISCOVERY.md)
- [Ecosystem compatibility](docs/ECOSYSTEM_COMPATIBILITY.md)
- [Remote launch state](docs/REMOTE_LAUNCH_STATE.md)
- [Launch pack](launch/README.md)
- [Screenshot guide](docs/SCREENSHOT_GUIDE.md)
- [FAQ](docs/FAQ.md)
- [Security policy](SECURITY.md)
- [Contributing](CONTRIBUTING.md)
- [中文 README](README.zh-CN.md)

## Limitations

- Static analysis cannot prove a server is safe or compromised.
- Tool metadata must be supplied from a local exported file; MCP Scope does not query live servers.
- Client-profile-like labels are compatibility hints, not official integration claims.
- Discovery finds likely config files, but users choose what to scan.
- GitHub Action failure thresholds are based on static report severity only.

See [ROADMAP.md](ROADMAP.md) and [Roadmap after launch](docs/ROADMAP_AFTER_LAUNCH.md) for planned next steps.

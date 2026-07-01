# MCP Scope HTML Viewer Guide

The MCP Scope HTML viewer is a local, static, read-only presentation of an existing MCP Scope report.

## Generate HTML Directly

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json --format html --output reports/mcp-scope-viewer.html
```

For a tools-only review:

```bash
node apps/cli/dist/index.js inspect-tools --tools examples/tools/poisoned-description-tools.json --format html --output reports/mcp-scope-tools-viewer.html
```

HTML output requires `--output <path>`. MCP Scope does not print HTML to stdout.

## Render From Existing JSON

```bash
node apps/cli/dist/index.js view --report examples/reports/sample-combined-report.json --output reports/sample-viewer.html
```

Use `--lang zh-CN` for Chinese viewer headings:

```bash
node apps/cli/dist/index.js view --report examples/reports/sample-combined-report.json --output reports/sample-viewer.zh-CN.html --lang zh-CN
```

## Safety Boundaries

- The viewer is a self-contained HTML file.
- CSS is inline.
- There are no external fonts, CDNs, images, scripts, telemetry, or tracking pixels.
- MCP Scope does not start a web server.
- MCP Scope does not open a browser.
- MCP Scope does not execute MCP servers.
- MCP Scope does not send live `tools/list` requests.
- MCP Scope does not call external AI APIs.
- Env values and header values are not rendered.

## Sharing Guidance

The viewer is useful for local review, screenshots, or internal handoff. Do not publish private MCP configs, proprietary tool metadata, tokens, credentials, or sensitive local paths in public issues.

Curated examples live under `examples/viewer/`. Generated smoke outputs should stay under ignored `reports/`.

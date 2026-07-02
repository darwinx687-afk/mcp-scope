# v0.3.0-preview

Status: draft. Not published yet.

Theme: SARIF + one-command audit mode.

## What Changed

- Added SARIF 2.1.0 output for `scan`, `inspect-tools`, and `audit`.
- Added `mcp-scope audit --root <path>` for a config-focused first pass.
- Audit mode combines static discovery with static scans of parseable config candidates.
- Added optional GitHub Code Scanning workflow examples using generated SARIF.
- Updated report docs, GitHub Action docs, and examples for SARIF and audit mode.

## Why It Matters

v0.2 made MCP Scope easier to understand. v0.3 makes it more convenient to try in a repository and easier to review in GitHub-native workflows.

The intended first pass is now:

```bash
node apps/cli/dist/index.js audit --root examples/clients
```

For teams that already use GitHub Code Scanning, SARIF output gives MCP Scope findings a familiar review surface without changing the static-only scanner boundary.

## What Still Does Not Change

- No live MCP server execution.
- No live `tools/list` call.
- No external AI API calls.
- No npm package claim.
- No GitHub Marketplace claim.
- No production-ready security guarantee.
- Findings remain static risk signals, not proof of compromise or proof of safety.

## Publication State

No `v0.3.0-preview` tag exists yet.

No GitHub release has been created or published for `v0.3.0-preview`.

npm and GitHub Marketplace remain unpublished.

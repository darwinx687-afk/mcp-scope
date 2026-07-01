# MCP Scope Examples

The examples directory contains safe fixtures and sample outputs for local review. They are meant for tests, docs, screenshots, and first-run exploration.

Do not add real secrets, private repository paths, personal home paths, internal hostnames, customer data, or private MCP configs to this directory.

## Config Examples

- `claude-desktop-filesystem.json`: simple local `mcpServers` config.
- `claude-code-project.mcp.json`: project-style config fixture.
- `http-server-with-redacted-auth.json`: HTTP config that demonstrates redacted auth fields.
- `risky-local-command.json`: local command risk example.
- `configs/claude-desktop-filesystem.changed-command.json`: changed config for snapshot diff examples.

## Client-Style Examples

`clients/` contains local JSON shapes used to test compatibility parsing:

- `claude-code-project.mcp.json`
- `claude-code-user.claude.json`
- `claude-desktop-config.json`
- `cursor-like.mcp.json`
- `cline-like.mcp-settings.json`
- `continue-like.mcp.json`
- `gemini-cli-like.settings.json`
- `plugin-like.plugin.json`
- `generic-mcp-servers.json`
- `generic-mcp-servers-wrapper.json`

Client-profile-like labels are compatibility hints only. They are not official integrations.

## Tool Metadata Examples

`tools/` contains exported tool metadata fixtures:

- `filesystem-tools.json`
- `poisoned-description-tools.json`
- `credential-network-tools.json`
- `schema-quality-tools.json`
- `multi-tool-suspicious-fragments.json`
- changed variants for diff tests

These files are local sample metadata only. MCP Scope does not call live `tools/list` endpoints.

## Report And Viewer Examples

- `reports/`: curated Markdown and JSON transparency reports.
- `viewer/`: self-contained local HTML viewer examples.
- `discovery/`: sample discovery reports.
- `snapshots/`: local approval-memory snapshot examples.
- `diffs/`: sample static diff reports.

For screenshots, open the committed HTML files in `examples/viewer/` or generate a fresh local report under ignored `reports/`.

## Snapshot And Diff Examples

```bash
node apps/cli/dist/index.js snapshot \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.json \
  --output reports/local-approved.snapshot.json \
  --label "local review"

node apps/cli/dist/index.js diff \
  --baseline reports/local-approved.snapshot.json \
  --config examples/configs/claude-desktop-filesystem.changed-command.json \
  --tools examples/tools/filesystem-tools.changed-description.json \
  --output reports/local-diff.md
```

Generated `reports/` files are ignored and should not be committed unless intentionally curated.

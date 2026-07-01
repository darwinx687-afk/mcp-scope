# MCP Scope Discovery Report

- Static discovery only
- MCP server execution: false
- External API calls: false
- Live tools/list requests: false
- File contents rendered: false

## Summary

- Root path: ~/.../clients
- Max depth: 4
- Include home root: false
- Candidate count: 10
- Parsed count: 10
- Skipped count: 0
- Invalid JSON count: 0
- Unsupported count: 0

## Candidates

| Path | Status | Shape | Profile | Servers | Risk | Notes |
| --- | --- | --- | --- | ---: | --- | --- |
examples/clients/claude-code-project.mcp.json | parsed | top-level-mcpServers | claude-code-project | 1 | low | none
examples/clients/claude-code-user.claude.json | parsed | projects-mcpServers | claude-code-user | 2 | medium | info:nested_project_mcp_servers
examples/clients/claude-desktop-config.json | parsed | top-level-mcpServers | claude-desktop | 1 | medium | none
examples/clients/cline-like.mcp-settings.json | parsed | top-level-mcpServers | cline-like | 1 | medium | none
examples/clients/continue-like.mcp.json | parsed | top-level-servers | continue-like | 1 | low | none
examples/clients/cursor-like.mcp.json | parsed | mcp.servers | cursor-like | 1 | low | none
examples/clients/gemini-cli-like.settings.json | parsed | mcp.servers | gemini-cli-like | 1 | medium | none
examples/clients/generic-mcp-servers-wrapper.json | parsed | mcp.servers | generic | 1 | info | none
examples/clients/generic-mcp-servers.json | parsed | top-level-servers | generic | 1 | low | none
examples/clients/plugin-like.plugin.json | parsed | top-level-mcpServers | plugin-like | 1 | low | none

## Next Steps

- Run `mcp-scope scan --config <path>` for a selected candidate.
- Add `--tools <path>` if you have a local exported tools/list metadata file.
- Discovery does not auto-scan every candidate and does not modify config files.

## Redaction

- Discovery does not print file contents.
- Env/header values are not rendered.
- Home-like paths are displayed safely.

## Limitations

- Static file discovery only.
- Client profile labels are compatibility hints, not official integrations.
- Candidates are review starting points, not proof of safety or compromise.
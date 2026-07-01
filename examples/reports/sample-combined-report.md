# MCP Scope Report

- Early transparency report
- Static analysis only
- MCP server execution: false
- External API calls: false
- Secret values redacted: true

## Executive Summary

- Report version: 0.3.0
- Generated: 2026-07-01T12:55:52.971Z
- Scan mode: combined
- Config source: examples/claude-desktop-filesystem.json
- Tool metadata source: examples/tools/filesystem-tools.json
- Metadata source type: mcp-scope-tool-manifest
- Server count: 1
- Tool count: 2
- Finding count: 7
- Highest severity: medium
- Top categories: config-transparency (3), filesystem-access (2), annotation-trust (2)
- Top capability hints: filesystem (3), shell (1)

## What MCP Scope Checked

- Local MCP config files with a top-level `mcpServers` object.
- Local exported MCP tool metadata files, when provided.
- Tool descriptions, input schemas, output schemas, and annotations.
- Startup command and URL visibility from config entries.
- Environment and header key visibility, with values redacted.

## What MCP Scope Did Not Do

- Did not execute MCP servers.
- Did not connect to live `tools/list` endpoints.
- Did not call external AI APIs.
- Did not prove compromise or prove safety.
- Did not replace professional security review.

## Severity Legend

- `info`: context that improves transparency.
- `low`: weak signal or quality issue worth reviewing.
- `medium`: meaningful risk signal that deserves attention before approval.
- `high`: strong static warning that should block casual approval until reviewed.

## Config Summary

- Source file: examples/claude-desktop-filesystem.json
- Server count: 1
- Highest config risk level: medium

| Name | Transport | Command/URL | Env keys | Header keys | Capability hints | Risk level |
| --- | --- | --- | ---: | ---: | --- | --- |
filesystem | stdio | npx | 0 | 0 | filesystem, shell | medium

### Config Transparency Notes

- info / filesystem: Transport type was omitted and command is present, so MCP Scope inferred stdio.
- low / filesystem: This stdio server starts a local process when used by an MCP client.
- medium / filesystem: Argument "~/Documents/demo-project" references a broad local path.

## Tool Metadata Summary

- Tool metadata source file: examples/tools/filesystem-tools.json
- Metadata source type: mcp-scope-tool-manifest
- Tool count: 2
- Finding count: 4
- Highest tool risk level: medium
- External API calls: false
- MCP server execution: false
- tools/list request sent: false

| Tool name | Title | Capability hints | Finding count | Highest severity | Categories |
| --- | --- | --- | ---: | --- | --- |
read_file | Read File | filesystem | 2 | medium | filesystem-access, annotation-trust
write_file | Write File | filesystem | 2 | medium | filesystem-access, annotation-trust

## Findings

### MEDIUM / config-transparency / broad_path_argument

- Target: config-server:filesystem (examples/claude-desktop-filesystem.json)
- Message: Argument "~/Documents/demo-project" references a broad local path.
- Evidence: server "filesystem"
- Recommendation: Review this config entry before approving the MCP server.

### MEDIUM / filesystem-access / filesystem_access_signal

- Target: tool:read_file (examples/tools/filesystem-tools.json)
- Message: Tool metadata references files, paths, directories, or filesystem operations.
- Evidence: metadata contains "read_file"
- Recommendation: Review allowed paths and confirm values are visible before approval.

### MEDIUM / filesystem-access / filesystem_access_signal

- Target: tool:write_file (examples/tools/filesystem-tools.json)
- Message: Tool metadata references files, paths, directories, or filesystem operations.
- Evidence: metadata contains "write_file"
- Recommendation: Review allowed paths and confirm values are visible before approval.

### LOW / config-transparency / local_stdio_command

- Target: config-server:filesystem (examples/claude-desktop-filesystem.json)
- Message: This stdio server starts a local process when used by an MCP client.
- Evidence: server "filesystem"
- Recommendation: Review this config entry before approving the MCP server.

### INFO / annotation-trust / annotation_trust_note

- Target: tool:read_file (examples/tools/filesystem-tools.json)
- Message: Annotations can help review, but they are metadata claims until server trust is established.
- Evidence: annotations include readOnlyHint
- Recommendation: Treat annotations as review hints, not proof of behavior.

### INFO / annotation-trust / annotation_trust_note

- Target: tool:write_file (examples/tools/filesystem-tools.json)
- Message: Annotations can help review, but they are metadata claims until server trust is established.
- Evidence: annotations include destructiveHint, openWorldHint
- Recommendation: Treat annotations as review hints, not proof of behavior.

### INFO / config-transparency / inferred_stdio_transport

- Target: config-server:filesystem (examples/claude-desktop-filesystem.json)
- Message: Transport type was omitted and command is present, so MCP Scope inferred stdio.
- Evidence: server "filesystem"
- Recommendation: Review this config entry before approving the MCP server.

## Redaction

- Env values rendered: false
- Header values rendered: false
- Secret-like values rendered: false
- Environment variable values are never rendered.
- Header values are never rendered.
- Secret-like values in tool metadata examples are redacted before report rendering.
- Do not paste private configs, tokens, or local secrets into public issues.

## Limitations

- Static only: true
- No runtime verification: true
- No exploit execution: true
- No external registry check: true
- Not proof of compromise: true
- This report is static analysis of local files only.
- MCP Scope did not execute MCP servers or tools.
- MCP Scope did not connect to live tools/list endpoints.
- MCP Scope did not call external AI APIs or registries.
- Findings are risk signals and warnings, not proof of compromise.

## Footer

MCP Scope is an early transparency tool. Findings are static risk signals, not proof of compromise.

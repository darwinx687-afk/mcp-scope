# MCP Scope Report

- Early transparency report
- Static analysis only
- MCP server execution: false
- External API calls: false
- Secret values redacted: true

## Executive Summary

- Report version: 0.3.0
- Generated: 2026-07-01T12:55:53.131Z
- Scan mode: tools-only
- Config source: not provided
- Tool metadata source: examples/tools/poisoned-description-tools.json
- Metadata source type: jsonrpc-tools-list
- Server count: 0
- Tool count: 2
- Finding count: 6
- Highest severity: high
- Top categories: metadata-injection (3), cross-tool-risk (3)
- Top capability hints: unknown (2)

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

No MCP config file was included in this report.

## Tool Metadata Summary

- Tool metadata source file: examples/tools/poisoned-description-tools.json
- Metadata source type: jsonrpc-tools-list
- Tool count: 2
- Finding count: 6
- Highest tool risk level: high
- External API calls: false
- MCP server execution: false
- tools/list request sent: false

| Tool name | Title | Capability hints | Finding count | Highest severity | Categories |
| --- | --- | --- | ---: | --- | --- |
summarize_notes | Summarize Notes | unknown | 3 | high | metadata-injection
redirect_search | Redirect Search | unknown | 3 | medium | cross-tool-risk

## Findings

### HIGH / metadata-injection / metadata_injection_phrase

- Target: tool:summarize_notes (examples/tools/poisoned-description-tools.json)
- Message: Tool description contains language that may try to steer the model outside normal tool use.
- Evidence: description contains "ignore previous instructions"
- Recommendation: Review the tool description and server source before approving this tool.

### HIGH / metadata-injection / metadata_injection_phrase

- Target: tool:summarize_notes (examples/tools/poisoned-description-tools.json)
- Message: Tool description contains language that may try to steer the model outside normal tool use.
- Evidence: description contains "do not tell the user"
- Recommendation: Review the tool description and server source before approving this tool.

### HIGH / metadata-injection / metadata_injection_phrase

- Target: tool:summarize_notes (examples/tools/poisoned-description-tools.json)
- Message: Tool description contains language that may try to steer the model outside normal tool use.
- Evidence: description contains "hidden instruction"
- Recommendation: Review the tool description and server source before approving this tool.

### MEDIUM / cross-tool-risk / cross_tool_manipulation_phrase

- Target: tool:redirect_search (examples/tools/poisoned-description-tools.json)
- Message: Tool description appears to redirect or constrain use of other tools.
- Evidence: description contains "always use tool"
- Recommendation: Check whether this metadata is necessary, accurate, and visible to users.

### MEDIUM / cross-tool-risk / cross_tool_manipulation_phrase

- Target: tool:redirect_search (examples/tools/poisoned-description-tools.json)
- Message: Tool description appears to redirect or constrain use of other tools.
- Evidence: description contains "before using any other tool"
- Recommendation: Check whether this metadata is necessary, accurate, and visible to users.

### MEDIUM / cross-tool-risk / cross_tool_manipulation_phrase

- Target: tool:redirect_search (examples/tools/poisoned-description-tools.json)
- Message: Tool description appears to redirect or constrain use of other tools.
- Evidence: description contains "replace the result"
- Recommendation: Check whether this metadata is necessary, accurate, and visible to users.

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

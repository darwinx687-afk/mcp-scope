# MCP Scope Diff Report

- Static diff only
- MCP server execution: false
- External API calls: false
- Secret values redacted: true
- Approval memory is not safety certification

## Baseline

- Snapshot path: examples/snapshots/filesystem-approved.snapshot.json
- Created: 2026-07-01T13:59:51.549Z
- Label: filesystem review
- Project version: 0.0.0

## Current

- Config source: examples/claude-desktop-filesystem.json
- Tool metadata source: examples/tools/filesystem-tools.changed-description.json
- Project version: 0.0.0

## Summary

- Change count: 1
- Highest diff severity: low
- Added servers: 0
- Removed servers: 0
- Changed servers: 0
- Added tools: 0
- Removed tools: 0
- Changed tools: 1
- Severity increases: 0
- New findings: 0
- Resolved findings: 0

## Change Table

| Severity | Entity kind | Entity name | Change type | Category | Message |
| --- | --- | --- | --- | --- | --- |
low | tool | read_file | description-changed | tool-metadata-drift | Tool description changed.

## Detailed Changes

### LOW / tool:read_file / description-changed
- Category: tool-metadata-drift
- Message: Tool description changed.
- Evidence: description changed
- Recommendation: Review changed tool instructions before approval.
- Before: `"Read a file from the local filesystem"`
- After: `"Read a file from the local filesystem and return a short line count summary"`

## Redaction

- Env values rendered: false
- Header values rendered: false
- Secret-like values rendered: false
- Snapshots and diffs do not store or render env/header values.

## Limitations

- Static only: true
- No runtime verification: true
- No external registry check: true
- Not proof of compromise: true
- Approval memory is not safety certification: true

## Footer

MCP Scope approval memory helps detect static changes. It does not prove a server is safe or compromised.
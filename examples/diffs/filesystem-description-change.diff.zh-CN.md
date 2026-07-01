# MCP Scope Diff Report

- 仅做静态 diff
- MCP server execution: false
- External API calls: false
- Secret values redacted: true
- Approval memory 不是安全认证

## Baseline

- Snapshot path: examples/snapshots/filesystem-approved.snapshot.json
- Created: 2026-07-01T13:59:51.549Z
- Label: filesystem review
- Project version: 0.0.0

## Current

- Config source: examples/claude-desktop-filesystem.json
- Tool metadata source: examples/tools/filesystem-tools.changed-description.json
- Project version: 0.0.0

## 摘要

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

## 变更表

| Severity | Entity kind | Entity name | Change type | Category | Message |
| --- | --- | --- | --- | --- | --- |
low | tool | read_file | description-changed | tool-metadata-drift | Tool description changed.

## 变更详情

### LOW / tool:read_file / description-changed
- Category: tool-metadata-drift
- 说明: Tool description changed.
- 证据: description changed
- 建议: Review changed tool instructions before approval.
- Before: `"Read a file from the local filesystem"`
- After: `"Read a file from the local filesystem and return a short line count summary"`

## 脱敏说明

- Env values rendered: false
- Header values rendered: false
- Secret-like values rendered: false
- snapshot 和 diff 不会存储或展示 env/header values。

## 局限性

- Static only: true
- No runtime verification: true
- No external registry check: true
- Not proof of compromise: true
- Approval memory is not safety certification: true

## 页脚

MCP Scope approval memory 用来发现静态变化。它不能证明 server 安全，也不能证明已被攻击。
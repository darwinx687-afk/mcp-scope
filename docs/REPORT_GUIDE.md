# MCP Scope Report Guide

MCP Scope reports are local transparency artifacts for code review, MCP server approval, and internal platform review.

## Generate Markdown

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json
```

Markdown is best for GitHub PRs, issues, review docs, and handoff notes.

## Generate JSON

```bash
node apps/cli/dist/index.js scan --config examples/claude-code-project.mcp.json --tools examples/tools/poisoned-description-tools.json --format json
```

JSON is intended for automation. Keys remain English and stable.

## Generate Chinese Markdown

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json --lang zh-CN
```

The Markdown headings and explanations are localized. Rule IDs and JSON keys stay English.

## Use Reports in GitHub PRs or Issues

Use the executive summary and findings section to show:

- what local files were checked
- what was not checked
- which values were redacted
- which findings need review

Do not paste private MCP configs, tokens, credentials, local secret paths, or proprietary server metadata into public issues.

## Interpret Findings

Findings are static risk signals. They are not proof that a server is malicious, and they are not proof that a server is safe.

Use high and medium findings as prompts for human review before approving a server or tool.

## Redaction

MCP Scope reports do not render env values or header values. Tool metadata example values that look secret-like are redacted before rendering.

## Limits

MCP Scope does not execute MCP servers, call live `tools/list`, run exploit payloads, call external AI APIs, or replace professional security review.

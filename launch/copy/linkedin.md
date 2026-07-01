# LinkedIn Draft

Do not post automatically.

## Suggested Image

`launch/assets/social-card-en.svg`

## Link

https://github.com/darwinx687-afk/mcp-scope

## Headline

I built MCP Scope: local-first transparency reports for MCP tools.

## Main Post

I have been working on a small open-source project called MCP Scope.

The problem is simple: as developers connect MCP servers to AI coding tools and agents, it can be hard to see what a tool exposes before trusting it.

MCP Scope is a local-first CLI that reads local MCP config files and exported tool metadata, then generates transparency reports.

The preview includes:

- local config discovery
- static MCP server config scanning
- exported tool metadata inspection
- Markdown / JSON / self-contained HTML reports
- local approval-memory snapshots and diffs
- a GitHub Action quality gate

Boundaries matter here:

- no MCP server execution
- no live `tools/list` requests
- no external AI API calls
- secret values are redacted where rendered
- findings are static risk signals, not proof of safety or compromise

GitHub:
https://github.com/darwinx687-afk/mcp-scope

I would love feedback from people using MCP, AI coding agents, or internal developer platforms: is the report useful, too noisy, or missing the config shapes you actually see?

## Shorter Variant

I built MCP Scope, an early local-first CLI for MCP config and tool metadata transparency reports.

It does not execute MCP servers or call external APIs. It reads local files and helps reviewers see what is exposed, what changed, and what looks worth checking before tools are trusted by AI agents.

GitHub: https://github.com/darwinx687-afk/mcp-scope

Feedback welcome.

## Hashtags

`#opensource` `#AIEngineering` `#MCP` `#DeveloperTools`

## Posting Note

Wait for human release approval before posting.

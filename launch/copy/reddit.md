# Reddit Draft

Do not post automatically.

## Subreddit Suggestions

Review rules first. Possible fits may include MCP, AI engineering, or developer tooling communities. Do not post if the community rules discourage project links.

## Suggested Image

None by default.

## Title

I built a local-first MCP config and tool metadata transparency tool. Feedback welcome.

## Body

I have been working on MCP Scope, an early open-source CLI for reviewing local MCP configs and exported tool metadata.

The goal is to help developers see what changed, what is exposed, and what looks worth checking before MCP tools are trusted by AI agents.

It currently supports:

- local config discovery
- static server config scanning
- exported tool metadata inspection
- Markdown / JSON / self-contained HTML reports
- local snapshot + diff
- GitHub Action quality gate

It does not execute MCP servers, request live `tools/list`, call external AI APIs, or claim to prove safety.

GitHub:
https://github.com/darwinx687-afk/mcp-scope

For people using MCP or AI coding tools: what would make a report like this more useful? Are there config shapes or review workflows I should support better?

## Posting Note

Post only after explicit approval and subreddit rule review. Keep it non-promotional.

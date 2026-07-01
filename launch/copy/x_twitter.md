# X / Twitter Draft

Do not post automatically.

## Suggested Image

`launch/assets/social-card-en.svg`

## Link

https://github.com/darwinx687-afk/mcp-scope

## Short Post

I built MCP Scope, an early local-first CLI for MCP config and tool metadata transparency reports.

It helps developers see what changed, what is exposed, and what looks risky before MCP tools are trusted by AI agents.

No server execution. No live `tools/list`. No external AI API calls.

https://github.com/darwinx687-afk/mcp-scope

## Thread Version

1/ I built MCP Scope, a small open-source tool for MCP config and tool metadata transparency.

It is early, local-first, and focused on review evidence rather than big security claims.

2/ The problem: when MCP tools are connected to AI agents, it is not always obvious what config entries expose, what tool metadata says, or what changed after approval.

3/ MCP Scope can discover likely local config files, scan server entries, inspect exported tool metadata, and generate Markdown / JSON / self-contained HTML reports.

4/ It also supports local approval-memory snapshots and static diffs, so reviewers can see when config or tool metadata changed.

5/ Boundaries:

- no MCP server execution
- no live `tools/list` requests
- no external AI API calls
- findings are static signals, not proof

6/ There is also a composite GitHub Action quality gate for local repository workflows.

7/ GitHub: https://github.com/darwinx687-afk/mcp-scope

If you use MCP or AI coding tools, I would love feedback on report clarity, noisy findings, and missing config shapes.

## Hashtags

`#MCP` `#OpenSource` `#AIEngineering`

## Posting Note

Post manually only after release review. Do not auto-post.

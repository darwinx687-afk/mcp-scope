# LinkedIn Update Draft

Language: en

Do not post automatically. Preview manually before publishing.

GitHub repo:
https://github.com/darwinx687-afk/mcp-scope

GitHub prerelease:
Not published yet. Fill in the `v0.3.0-preview` prerelease URL only after a human publishes it.

## Draft

Small MCP Scope update direction for `v0.3.0-preview`:

I am adding two practical pieces:

- SARIF output for `scan`, `inspect-tools`, and `audit`
- a new `mcp-scope audit --root <path>` command that combines static discovery with static config scan summaries

The goal is to make MCP Scope easier to try in a repo and easier to review in GitHub-native workflows. If a team already uses GitHub Code Scanning, MCP Scope can now generate SARIF locally and the workflow can explicitly upload it with `github/codeql-action/upload-sarif`.

The boundary is unchanged: local-first, static analysis only, no MCP server execution, no live `tools/list`, no external AI API calls, and no production-ready security claim.

Repo:
https://github.com/darwinx687-afk/mcp-scope

# Feedback Guide

MCP Scope is early. Useful feedback is specific, redacted, and tied to a local file shape or report output.

Do not paste live credentials, full private MCP configs, private file paths, internal hostnames, customer data, or secret values into public issues.

## Feedback Types

- Bug: MCP Scope crashes, exits incorrectly, writes invalid output, or contradicts documented behavior.
- False positive: a static finding appears too severe or noisy for a safe local pattern.
- False negative: MCP Scope misses a static risk signal that should be visible from local config or exported metadata.
- Docs confusion: wording, examples, command snippets, or boundary language are unclear.
- Config shape request: a local MCP config shape is not parsed or discovered.
- Integration request: a request for a workflow around a client, CI provider, package manager, or review tool.
- Feature request: a new local report, CLI, or review feature.
- Security-sensitive: a possible vulnerability in MCP Scope itself or a sensitive report concern.
- Not in scope: requests for SaaS, login, telemetry, secret collection, exploit generation, or silent MCP execution.

## What To Include

- MCP Scope command used.
- Redacted report excerpt or report summary.
- Redacted config shape when relevant.
- Expected behavior.
- Actual behavior.
- Operating system and Node/pnpm versions when relevant.

## What Not To Include

- API keys, tokens, cookies, SSH keys, OAuth material, or database URLs.
- Full private configs.
- Real env/header values.
- Private local usernames or home paths.
- Private repository names when they are not needed.

If the issue is sensitive, open a minimal public issue asking for a private reporting path instead of posting details.

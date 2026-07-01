# Security Policy

MCP Scope is an early transparency tool, not a complete security product.

## Reporting Security Issues

Please do not paste secrets, live credentials, private MCP configs, private file paths, or sensitive logs into public issues.

If you believe you found a security issue in MCP Scope itself, open a minimal public issue that avoids sensitive details and ask for a private reporting path, or use the private channel listed by the maintainers once one is available.

## Current Project State

Phase 2 implements static local MCP config fingerprinting and local exported tool metadata analysis. It does not execute MCP servers, send live `tools/list` requests, or call external APIs.

Future MCP Scope reports should be treated as transparency warnings and review evidence. They are not full vulnerability proof, and they are not a guarantee that a server, config, or tool is safe.

## Handling Sensitive Inputs

- Do not submit live credentials.
- Do not submit private MCP configs publicly.
- Do not submit private environment files publicly.
- Redact local usernames, tokens, database URLs, API keys, email addresses, and private repository paths before sharing examples.

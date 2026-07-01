# Product Spec

## Positioning

MCP Scope is a local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

## Target Users

- AI coding agent users.
- MCP users.
- Developers installing community MCP servers.
- FDE and AI implementation engineers.
- Internal platform teams.
- Open-source maintainers.
- Security-conscious AI builders.

## Core Problem

Developers are connecting MCP servers to AI coding tools and agent environments. Before they approve tools, they need a simple local way to understand what the tools expose, what the descriptions tell the model, what parameters are visible, and whether local config choices introduce obvious risk.

## Future Core Capabilities

- MCP config discovery.
- MCP server entry fingerprinting.
- Tool metadata extraction.
- Tool description static checks.
- Suspicious instruction detection.
- Input schema and parameter visibility checks.
- Environment variable exposure checks.
- Sensitive path detection.
- Command and startup risk notes.
- Network endpoint risk notes.
- Capability classification.
- Tool-change diff after approval.
- Markdown and JSON reports.
- GitHub Action quality gate.

## Phase 1 Scope

Phase 1 adds the first real local MCP configuration fingerprint.

Included now:

- Governance documents.
- TypeScript pnpm monorepo skeleton.
- CLI command: `mcp-scope scan --config <path>`.
- Static parsing for JSON files with a top-level `mcpServers` object.
- Claude Desktop style inference where omitted `type` plus `command` means `stdio`.
- Server fingerprints for transport, command presence, args preview, env/header key names, URL host, capability hints, transparency notes, and risk level.
- Markdown and JSON report rendering.
- Example configs and tests.

Not included now:

- Prompt-injection detection.
- MCP server execution.
- External MCP registry connections.
- Remote metadata fetching.
- Web dashboard.
- GitHub Actions.
- npm publishing.
- External AI APIs.
- Login, database, billing, or cloud services.
- Production-grade security claims.

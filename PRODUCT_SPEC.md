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

## Phase 0 Scope

Phase 0 is foundation only.

Included now:

- Governance documents.
- TypeScript pnpm monorepo skeleton.
- Minimal CLI placeholder.
- Minimal core constants and placeholder types.
- Minimal report placeholder.
- Basic tests and checks.

Not included now:

- Real MCP metadata scanning.
- Prompt-injection detection.
- MCP server execution.
- External MCP registry connections.
- Web dashboard.
- GitHub Actions.
- npm publishing.
- External AI APIs.
- Login, database, billing, or cloud services.

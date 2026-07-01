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
- Local self-contained HTML viewer.
- GitHub Action quality gate.

## Phase 5 Scope

Phase 5 adds a GitHub Action quality gate on top of the local CLI and stable report system.

Included now:

- Governance documents.
- TypeScript pnpm monorepo skeleton.
- CLI command: `mcp-scope scan --config <path>`.
- CLI command: `mcp-scope scan --config <path> --tools <path>`.
- CLI command: `mcp-scope inspect-tools --tools <path>`.
- Static parsing for JSON files with a top-level `mcpServers` object.
- Static parsing for local exported MCP `tools/list` JSON-RPC responses.
- Static parsing for MCP Scope portable local tool manifests.
- Claude Desktop style inference where omitted `type` plus `command` means `stdio`.
- Server fingerprints for transport, command presence, args preview, env/header key names, URL host, capability hints, transparency notes, and risk level.
- Tool metadata normalization for names, titles, descriptions, input schemas, output schemas, annotations, and parameters.
- Conservative tool-level rules for metadata-injection signals, cross-tool manipulation, destructive actions, filesystem access, credential exposure, network access, schema quality, annotation trust, and permission mismatch.
- Stable JSON report model with `reportVersion`, execution flags, summaries, findings, redaction guarantees, and limitations.
- Bilingual Markdown report rendering with `--lang en` and `--lang zh-CN`.
- Markdown reports suitable for GitHub PRs, issues, and review notes.
- Self-contained HTML report rendering with `--format html --output <path>`.
- `view --report <path> --output <path>` for rendering an existing MCP Scope JSON report as HTML.
- HTML viewer localization with `--lang en` and `--lang zh-CN`.
- Inline CSS only; no CDN, external assets, tracking, telemetry, browser automation, or web server.
- CLI severity threshold option: `--fail-on none|info|low|medium|high`.
- Root composite GitHub Action in `action.yml`.
- Action runner script that reuses the built local CLI and writes safe GitHub outputs.
- GitHub job summary generation with counts and boundary language.
- Optional workflow failure based on static highest severity threshold.
- Documentation example workflows under `docs/examples`.
- Repository CI workflow under `.github/workflows/ci.yml`.
- Curated report examples under `examples/reports`.
- Curated viewer examples under `examples/viewer`.
- Example configs and tests.

Not included now:

- Prompt-injection detection.
- MCP server execution.
- Live `tools/list` requests.
- External MCP registry connections.
- Remote metadata fetching.
- Hosted web dashboard.
- npm publishing.
- External AI APIs.
- Login, database, billing, or cloud services.
- Production-grade security claims.
- GitHub Marketplace publication.
- Remote repository creation or push.
- Automatic artifact upload from the action itself.

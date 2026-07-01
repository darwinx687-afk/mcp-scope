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
- Local approval-memory snapshots.
- Markdown and JSON reports.
- Local self-contained HTML viewer.
- GitHub Action quality gate.

## Phase 7 Scope

Phase 7 adds ecosystem compatibility examples and static local config discovery on top of the local CLI, stable report system, HTML viewer, GitHub Action quality gate, and approval-memory diffing.

Included now:

- Governance documents.
- TypeScript pnpm monorepo skeleton.
- CLI command: `mcp-scope scan --config <path>`.
- CLI command: `mcp-scope scan --config <path> --tools <path>`.
- CLI command: `mcp-scope inspect-tools --tools <path>`.
- CLI command: `mcp-scope snapshot [--config <path>] [--tools <path>] --output <path> [--label <text>]`.
- CLI command: `mcp-scope diff --baseline <snapshot-path> [--config <path>] [--tools <path>]`.
- CLI command: `mcp-scope discover --root <path>`.
- Static parsing for JSON files with a top-level `mcpServers` object.
- Static parsing for local JSON files with `projects[*].mcpServers`, `mcp.servers`, and top-level `servers`.
- Client profile labels for common local config styles, including `cursor-like`, `cline-like`, `continue-like`, `gemini-cli-like`, and `plugin-like`.
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
- Diff severity threshold option: `--fail-on-change none|info|low|medium|high`.
- Root composite GitHub Action in `action.yml`.
- Action runner script that reuses the built local CLI and writes safe GitHub outputs.
- GitHub job summary generation with counts and boundary language.
- Optional workflow failure based on static highest severity threshold.
- Documentation example workflows under `docs/examples`.
- Repository CI workflow under `.github/workflows/ci.yml`.
- Curated report examples under `examples/reports`.
- Curated viewer examples under `examples/viewer`.
- Curated approval snapshot and diff examples under `examples/snapshots` and `examples/diffs`.
- Snapshot fingerprints for reviewed config servers, tool metadata, finding rule IDs, redaction guarantees, limitations, and SHA-256 digests.
- Static diff reports for added/removed servers, added/removed tools, command/args/key/URL drift, tool description/schema/annotation drift, severity changes, and finding-rule changes.
- Diff output formats: Markdown, JSON, and self-contained HTML.
- Bilingual diff Markdown with `--lang en` and `--lang zh-CN`.
- Static discovery reports in Markdown, JSON, and self-contained HTML.
- Bilingual discovery Markdown with `--lang en` and `--lang zh-CN`.
- Safe path display for home-like nested project paths.
- Curated client examples under `examples/clients`.
- Curated discovery examples under `examples/discovery`.
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
- GitHub Action approval-memory diff integration.
- `scan --compare-to` shortcut.
- Treating snapshots as approval certificates or safety badges.
- Official integration claims for Cursor, Cline, Continue, Gemini CLI, Claude Code, or Claude Desktop.
- Automatic scanning of every discovered candidate.
- Automatic modification of user config files.

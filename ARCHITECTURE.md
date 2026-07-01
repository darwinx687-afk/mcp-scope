# Architecture

MCP Scope starts as a small TypeScript pnpm monorepo.

## Repository Structure

- `apps/cli`: command-line entrypoint.
- `packages/core`: shared constants, types, and future scanning domain model.
- `packages/report`: report rendering utilities.
- `docs`: supporting documentation.
- `examples`: intentionally committed examples only.
- `assets`: brand and visual assets later.

## Phase 4 Runtime Boundaries

- No external API calls in core checks.
- No database, cloud service, or login by default.
- No MCP server execution.
- No live `tools/list` requests.
- No remote metadata fetching.
- No hosted web dashboard.
- No background services.
- HTML viewer output is a static file only.
- No external CSS, JavaScript, fonts, images, telemetry, or tracking pixels.

## Current Scanner Direction

The Phase 4 scanner remains static-first. It reads local JSON config files with a top-level `mcpServers` object and local exported tool metadata files. It produces stable JSON reports, bilingual Markdown reports, and self-contained HTML viewers without executing commands, connecting to MCP servers, sending `tools/list` requests, starting a web server, or calling external APIs.

The scanner redacts env/header values and reports only key names. URL query strings are redacted in displayed output. Tool metadata schemas are sanitized before rendering so obvious example secret values are not emitted.

## Future Scanner Direction

Future scanner work should continue to be static-first. It should inspect local MCP configuration files and available metadata without executing remote code by default.

Any future dynamic checks must be explicitly gated, documented, and visible to the user before they run. Dynamic checks must explain what command or server process will be started, what files or environment variables may be read, and what network access may occur.

## Package Responsibilities

`packages/core` owns stable names, shared types, MCP config parsing, local tool metadata parsing, static fingerprinting, rule evaluation, capability hints, risk levels, and transparency notes.

`packages/report` owns the stable report model, JSON rendering, bilingual Markdown rendering, and self-contained HTML viewer rendering. It must avoid exposing raw env/header values or secret-like tool metadata examples.

`apps/cli` owns user commands, argument parsing, exit codes, terminal output, report file writes, and the local `view` command.

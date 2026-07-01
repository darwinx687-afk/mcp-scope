# Architecture

MCP Scope starts as a small TypeScript pnpm monorepo.

## Repository Structure

- `apps/cli`: command-line entrypoint.
- `packages/core`: shared constants, types, and future scanning domain model.
- `packages/report`: report rendering utilities.
- `docs`: supporting documentation.
- `examples`: intentionally committed examples only.
- `assets`: brand and visual assets later.

## Phase 1 Runtime Boundaries

- No external API calls in core checks.
- No database, cloud service, or login by default.
- No MCP server execution.
- No remote metadata fetching.
- No web dashboard.
- No background services.

## Current Scanner Direction

The Phase 1 scanner is static-first. It reads local JSON config files with a top-level `mcpServers` object and produces a fingerprint report without executing commands, connecting to MCP servers, or calling external APIs.

The scanner redacts env/header values and reports only key names. URL query strings are redacted in displayed output.

## Future Scanner Direction

Future scanner work should continue to be static-first. It should inspect local MCP configuration files and available metadata without executing remote code by default.

Any future dynamic checks must be explicitly gated, documented, and visible to the user before they run. Dynamic checks must explain what command or server process will be started, what files or environment variables may be read, and what network access may occur.

## Package Responsibilities

`packages/core` owns stable names, shared types, MCP config parsing, static fingerprinting, capability hints, risk levels, and transparency notes.

`packages/report` owns rendering of status and transparency reports. It must avoid exposing raw env/header values.

`apps/cli` owns user commands, argument parsing, exit codes, and terminal output.

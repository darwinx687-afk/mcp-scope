# Architecture

MCP Scope starts as a small TypeScript pnpm monorepo.

## Repository Structure

- `apps/cli`: command-line entrypoint.
- `packages/core`: shared constants, types, and future scanning domain model.
- `packages/report`: report rendering utilities.
- `docs`: supporting documentation.
- `examples`: intentionally committed examples only.
- `assets`: brand and visual assets later.

## Phase 0 Runtime Boundaries

- No external API calls in core checks.
- No database, cloud service, or login by default.
- No MCP server execution in Phase 0.
- No web dashboard.
- No background services.

## Future Scanner Direction

Future scanner work should be static-first. It should inspect local MCP configuration files and available metadata without executing remote code by default.

Any future dynamic checks must be explicitly gated, documented, and visible to the user before they run. Dynamic checks must explain what command or server process will be started, what files or environment variables may be read, and what network access may occur.

## Package Responsibilities

`packages/core` owns stable names, shared placeholder types, future capability categories, risk levels, and scanner-independent constants.

`packages/report` owns rendering of status and future transparency reports. It must avoid claiming that a scan happened when no scan was performed.

`apps/cli` owns user commands, argument parsing, exit codes, and terminal output.

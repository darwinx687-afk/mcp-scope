# Architecture

MCP Scope starts as a small TypeScript pnpm monorepo.

## Repository Structure

- `apps/cli`: command-line entrypoint.
- `packages/core`: shared constants, types, and future scanning domain model.
- `packages/report`: report rendering utilities.
- `docs`: supporting documentation.
- `examples`: intentionally committed examples only.
- `assets`: brand and visual assets later.

## Phase 5 Runtime Boundaries

- No external API calls in core checks.
- No database, cloud service, or login by default.
- No MCP server execution.
- No live `tools/list` requests.
- No remote metadata fetching.
- No hosted web dashboard.
- No background services.
- HTML viewer output is a static file only.
- No external CSS, JavaScript, fonts, images, telemetry, or tracking pixels.
- GitHub Action support is a composite action that wraps the local CLI.
- The action writes local report files, GitHub outputs, and optional job summary only.
- The action does not upload artifacts unless the workflow adds an upload step.

## Current Scanner Direction

The Phase 5 scanner remains static-first. It reads local JSON config files with a top-level `mcpServers` object and local exported tool metadata files. It produces stable JSON reports, bilingual Markdown reports, self-contained HTML viewers, and CI threshold outputs without executing commands, connecting to MCP servers, sending `tools/list` requests, starting a web server, or calling external APIs.

The scanner redacts env/header values and reports only key names. URL query strings are redacted in displayed output. Tool metadata schemas are sanitized before rendering so obvious example secret values are not emitted.

## Future Scanner Direction

Future scanner work should continue to be static-first. It should inspect local MCP configuration files and available metadata without executing remote code by default.

Any future dynamic checks must be explicitly gated, documented, and visible to the user before they run. Dynamic checks must explain what command or server process will be started, what files or environment variables may be read, and what network access may occur.

## Package Responsibilities

`packages/core` owns stable names, shared types, MCP config parsing, local tool metadata parsing, static fingerprinting, rule evaluation, capability hints, risk levels, and transparency notes.

`packages/report` owns the stable report model, JSON rendering, bilingual Markdown rendering, and self-contained HTML viewer rendering. It must avoid exposing raw env/header values or secret-like tool metadata examples.

`apps/cli` owns user commands, argument parsing, exit codes, terminal output, report file writes, and the local `view` command.

## GitHub Action Architecture

Phase 5 uses a root composite action in `action.yml`. The action enables corepack, installs dependencies in the action checkout, builds MCP Scope, then runs `scripts/github-action-runner.mjs`.

The runner resolves paths relative to `GITHUB_WORKSPACE` and `working-directory`, invokes the built CLI with absolute paths, always writes a JSON report for CI evaluation, optionally writes Markdown or HTML reports, computes the fail-on threshold, writes `$GITHUB_OUTPUT`, and appends a safe `$GITHUB_STEP_SUMMARY` when enabled.

There is no hosted service, no cloud sync, no telemetry, no Marketplace publishing step, and no write-token requirement.

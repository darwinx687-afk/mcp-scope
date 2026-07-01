# Architecture

MCP Scope starts as a small TypeScript pnpm monorepo.

## Repository Structure

- `apps/cli`: command-line entrypoint.
- `packages/core`: shared constants, types, and future scanning domain model.
- `packages/report`: report rendering utilities.
- `docs`: supporting documentation.
- `examples`: intentionally committed examples only.
- `assets`: local SVG brand and launch assets.

## Phase 8 Runtime Boundaries

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
- Approval memory snapshots and diffs are local files only.
- Approval memory does not certify safety or confirm compromise.
- Discovery lists likely config files only and does not auto-scan every candidate.
- Client profile labels are compatibility hints, not official integrations.
- Launch packaging is repository-local only and does not publish to GitHub, npm, or GitHub Marketplace.

## Current Scanner Direction

The Phase 8 scanner remains static-first. It reads local JSON config files with supported server shapes and local exported tool metadata files. It produces stable JSON reports, bilingual Markdown reports, self-contained HTML viewers, approval-memory snapshots, static diff reports, discovery reports, and CI threshold outputs without executing commands, connecting to MCP servers, sending `tools/list` requests, starting a web server, or calling external APIs.

The scanner redacts env/header values and reports only key names. URL query strings are redacted in displayed output. Tool metadata schemas are sanitized before rendering so obvious example secret values are not emitted.

## Future Scanner Direction

Future scanner work should continue to be static-first. It should inspect local MCP configuration files and available metadata without executing remote code by default.

Any future dynamic checks must be explicitly gated, documented, and visible to the user before they run. Dynamic checks must explain what command or server process will be started, what files or environment variables may be read, and what network access may occur.

## Package Responsibilities

`packages/core` owns stable names, shared types, MCP config parsing, static config discovery, local tool metadata parsing, static fingerprinting, rule evaluation, capability hints, risk levels, and transparency notes.

`packages/report` owns the stable report model, JSON rendering, bilingual Markdown rendering, self-contained HTML viewer rendering, approval-memory snapshot generation, static diff rendering, and discovery report rendering. It must avoid exposing raw env/header values or secret-like tool metadata examples.

`apps/cli` owns user commands, argument parsing, exit codes, terminal output, report file writes, and the local `view` command.

## Ecosystem Compatibility Architecture

Phase 7 extends `parseMcpConfig` from one JSON shape to a small set of local static shapes: top-level `mcpServers`, `projects[*].mcpServers`, `mcp.servers`, and top-level `servers`.

The scan result remains a flat list of server fingerprints for report compatibility. Each server now also carries source context: source shape, client profile label, source context label, safe project path display when nested, config path, and JSON-pointer-like server key path.

`streamable-http` is normalized to `http` with a transparency note. Unknown transport strings warn instead of crashing. Extra fields such as `timeout`, `alwaysLoad`, `disabled`, `oauth`, `headersHelper`, `roots`, `allowedTools`, and `deniedTools` are summarized without executing helper commands or rendering secret-like values.

`mcp-scope discover` walks only under a requested root, skips common generated or dependency directories, avoids symlinks, limits file size, and reports candidates. Discovery does not scan tool metadata, create snapshots, modify files, or auto-scan every candidate.

## Approval Memory Architecture

Phase 6 adds local approval memory through the existing CLI and report package.

`mcp-scope snapshot` builds the same stable transparency report used by `scan` and `inspect-tools`, then converts it into a redacted approval-memory JSON snapshot. The snapshot records reviewed config server fingerprints, tool metadata fingerprints, finding rule IDs, risk summaries, limitation flags, and SHA-256 digests. It does not store env values or header values.

`mcp-scope diff` reads a baseline snapshot from disk, builds a new static report from local inputs, converts that current report to an in-memory snapshot, and compares the two snapshots. Diff output can be Markdown, JSON, or self-contained HTML. The command can optionally fail with `--fail-on-change` after output generation.

The diff layer is still static analysis. It reports drift in visible metadata and risk signals; it does not execute tools, prove behavior, certify safety, or prove compromise.

## GitHub Action Architecture

Phase 5 uses a root composite action in `action.yml`. The action enables corepack, installs dependencies in the action checkout, builds MCP Scope, then runs `scripts/github-action-runner.mjs`.

The runner resolves paths relative to `GITHUB_WORKSPACE` and `working-directory`, invokes the built CLI with absolute paths, always writes a JSON report for CI evaluation, optionally writes Markdown or HTML reports, computes the fail-on threshold, writes `$GITHUB_OUTPUT`, and appends a safe `$GITHUB_STEP_SUMMARY` when enabled.

There is no hosted service, no cloud sync, no telemetry, no Marketplace publishing step, and no write-token requirement.

## Open-Source Launch Packaging Architecture

Phase 8 adds repository packaging rather than new scanner behavior. The launch surface is made of static files: README first screens, bilingual docs indexes, examples indexes, SVG assets, community templates, launch notes, release draft, feedback guide, and checklist.

These files are part of the local repository and do not require a hosted service. The launch package avoids publication claims until a human maintainer creates a remote repository, tag, release, npm package, or Marketplace listing in a later phase.

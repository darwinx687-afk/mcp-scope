# MCP Scope Approval Memory

Approval memory lets you save a reviewed static MCP state as a local redacted JSON snapshot, then compare later local config and tool metadata exports against that baseline.

It is designed for pull requests, repository reviews, and local pre-approval checks. It does not execute MCP servers, connect to MCP servers, send live `tools/list` requests, call external AI APIs, upload files, or prove that a server is safe.

## Commands

Create a snapshot:

```bash
node apps/cli/dist/index.js snapshot \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.json \
  --output examples/snapshots/filesystem-approved.snapshot.json \
  --label "filesystem review"
```

Diff against that snapshot:

```bash
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.changed-description.json
```

Generate JSON or HTML diff output:

```bash
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.added-dangerous-tool.json \
  --format json \
  --output reports/filesystem.diff.json

node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.added-dangerous-tool.json \
  --format html \
  --output reports/filesystem.diff.html
```

## What A Snapshot Stores

A snapshot stores a redacted static fingerprint:

- Project and schema version fields.
- Scan mode: `config-only`, `tools-only`, or `combined`.
- Config server fingerprints: transport, command summary, args preview, URL host or redacted URL, env key names, header key names, capability hints, risk notes.
- Tool fingerprints: names, titles, descriptions, schemas, annotations, parameters, capability hints, finding rule IDs.
- Manifest-level tool metadata signals when available.
- Summary counts, categories, severities, and SHA-256 digests.
- Redaction and limitation fields.

Snapshots do not store env values or header values. Obvious secret-like example values in tool metadata are redacted before snapshot and diff rendering.

## What Diff Checks

`mcp-scope diff` compares a baseline snapshot to a new local static scan. It reports:

- Added or removed config servers.
- Added or removed tools.
- Server command, args, env key, header key, URL, capability, and severity changes.
- Tool title, description, input schema, output schema, annotation, capability, severity, and finding rule changes.
- New or resolved finding rule signals.
- Highest diff severity and change counts.

Findings remain static risk signals. A diff can show that metadata changed; it does not confirm malicious behavior or prove compromise.

## Diff Formats

Supported formats:

- `markdown` by default.
- `json` for automation.
- `html` for a self-contained local review file.

Localized Markdown is available with `--lang zh-CN`. JSON keys remain stable English machine-readable fields.

## fail-on-change

Use `--fail-on-change <threshold>` to make the command exit non-zero after generating output.

Threshold behavior:

- `none`: never fail based on changes.
- `high`: fail if highest diff severity is high.
- `medium`: fail if highest diff severity is medium or high.
- `low`: fail if highest diff severity is low, medium, or high.
- `info`: fail if any static change exists.

Example:

```bash
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.added-dangerous-tool.json \
  --fail-on-change high
```

## Examples In This Repository

- `examples/snapshots/filesystem-approved.snapshot.json`
- `examples/diffs/filesystem-description-change.diff.md`
- `examples/diffs/filesystem-description-change.diff.zh-CN.md`
- `examples/diffs/filesystem-added-dangerous-tool.diff.json`
- `examples/diffs/filesystem-added-dangerous-tool.diff.html`

Fixture inputs:

- `examples/tools/filesystem-tools.changed-description.json`
- `examples/tools/filesystem-tools.changed-schema.json`
- `examples/tools/filesystem-tools.added-dangerous-tool.json`
- `examples/configs/claude-desktop-filesystem.changed-command.json`

## What Not To Commit Publicly

Do not commit private MCP configs, private local paths, proprietary tool metadata, internal server names, tokens, secrets, or snapshots derived from sensitive projects into a public repository.

Snapshots are redacted by design, but they can still contain tool names, descriptions, schemas, local path hints, server names, and review context. Treat them as review artifacts, not public safety badges.

## Boundaries

Approval memory is local-first and static:

- No MCP server execution.
- No live `tools/list`.
- No external API calls.
- No hosted service.
- No telemetry.
- No cloud sync.
- No automatic upload.
- No production-grade security guarantee.

# MCP Scope Report Schema

MCP Scope reports use a stable JSON shape for automation, localized Markdown for human review, self-contained HTML for local read-only viewing, SARIF for optional GitHub Code Scanning upload, GitHub Action threshold evaluation, approval-memory diffing, static discovery reports, and one-command audit reports.

## Version Fields

- `reportVersion`: report contract version. Current reports use `0.3.0`.
- `schemaVersion`: machine-readable schema version. Current reports use `1`.
- `generatedAt`: ISO timestamp from the local scan run.

## Stable vs Display Fields

JSON keys are stable English machine-readable fields. Markdown and HTML headings and explanatory text can be localized with `--lang`.

Rule IDs, categories, severities, target types, and JSON keys should not be translated.

## Top-Level Shape

```json
{
  "reportVersion": "0.3.0",
  "schemaVersion": 1,
  "generatedAt": "2026-07-01T00:00:00.000Z",
  "project": {},
  "scan": {},
  "sources": {},
  "summary": {},
  "config": {},
  "tools": {},
  "findings": [],
  "redaction": {},
  "limitations": {}
}
```

## Scan Model

`scan.mode` is one of:

- `config-only`
- `tools-only`
- `combined`

Execution flags are always explicit:

- `externalApiCalls: false`
- `mcpServerExecution: false`
- `dynamicAnalysis: false`
- `secretValuesRedacted: true`

## Summary Model

`summary` contains:

- `serverCount`
- `toolCount`
- `findingCount`
- `highestSeverity`
- `severityCounts`
- `categoryCounts`
- `capabilityHintCounts`
- `configRiskSummary`
- `toolRiskSummary`

Severity values are:

- `info`
- `low`
- `medium`
- `high`

## Finding Model

Each item in `findings` includes:

- `id`
- `ruleId`
- `category`
- `severity`
- `target`
- `title`
- `message`
- `evidence`
- `recommendation`

Evidence must be short and safe. Findings are static risk signals, not confirmed compromise.

## Config Source Context

Current config scan results include source context fields:

- `config.sourceShape`
- `config.clientProfile`
- `config.sourceContexts`
- per-server `sourceShape`
- per-server `clientProfile`
- per-server `sourceContextLabel`
- per-server `projectPathDisplay`, when nested project context exists
- per-server `serverKeyPath`

Client profile labels ending in `-like` are compatibility hints, not official integrations.

## Redaction Model

`redaction` includes:

- `envValuesRendered: false`
- `headerValuesRendered: false`
- `secretLikeValuesRendered: false`
- `notes`

Reports must not include env values, header values, or obvious secret-like example values.

## HTML Viewer Contract

The HTML viewer renders this same JSON report model. It does not introduce a new schema.

Viewer requirements:

- Use only local report data.
- Escape report-derived strings before rendering.
- Include inline CSS only.
- Do not use external CSS, JavaScript, fonts, images, CDNs, telemetry, or tracking pixels.
- Do not render env values, header values, or obvious secret-like example values.
- Do not start a web server or open a browser.

## Approval Memory Snapshot Model

`mcp-scope snapshot` writes a local redacted JSON snapshot. Snapshot files are separate from scan reports and currently use:

- `snapshotVersion: "0.1.0"`
- `schemaVersion: 1`

Top-level snapshot shape:

```json
{
  "snapshotVersion": "0.1.0",
  "schemaVersion": 1,
  "createdAt": "2026-07-01T00:00:00.000Z",
  "label": "filesystem review",
  "project": {},
  "scan": {},
  "sources": {},
  "redaction": {},
  "configServers": [],
  "tools": [],
  "manifest": {},
  "riskSummary": {},
  "findingSummary": {},
  "digests": {},
  "limitations": {}
}
```

Snapshots record redacted static fingerprints only. They do not store env values or header values. They may still contain tool names, descriptions, schemas, local path hints, server names, and review labels.

## Approval Memory Diff Model

`mcp-scope diff` compares a baseline snapshot to a fresh local static scan and can render Markdown, JSON, or self-contained HTML. JSON diff files currently use:

- `diffVersion: "0.1.0"`
- `schemaVersion: 1`

Top-level diff shape:

```json
{
  "diffVersion": "0.1.0",
  "schemaVersion": 1,
  "generatedAt": "2026-07-01T00:00:00.000Z",
  "baseline": {},
  "current": {},
  "summary": {},
  "changes": [],
  "redaction": {},
  "limitations": {}
}
```

Each `changes` item includes:

- `id`
- `changeType`
- `severity`
- `category`
- `entity`
- `message`
- `evidence`
- `recommendation`
- optional `before`
- optional `after`

Diff severities use the same `info`, `low`, `medium`, and `high` scale. Diff findings remain static drift signals, not proof of compromise or proof of safety.

## Discovery Report Model

`mcp-scope discover` writes discovery reports as Markdown, JSON, or self-contained HTML. JSON discovery files currently use:

- `schemaVersion: 1`

Top-level discovery shape:

```json
{
  "schemaVersion": 1,
  "generatedAt": "2026-07-01T00:00:00.000Z",
  "rootPathDisplay": "examples/clients",
  "maxDepth": 4,
  "includeHome": false,
  "maxFileSizeBytes": 1048576,
  "externalApiCalls": false,
  "serverExecution": false,
  "toolsListRequestSent": false,
  "summary": {},
  "candidates": [],
  "notes": []
}
```

Each `candidates` item includes:

- `path`
- `pathDisplay`
- `fileName`
- `sizeBytes`
- `detectedShape`
- `clientProfile`
- `serverCount`
- `hasToolsPath`
- `parseStatus`
- `riskPreview`
- `notes`

Discovery reports must not print file contents, env values, header values, or secret-like values.

## Audit Report Model

`mcp-scope audit --root <path>` combines static discovery with static config scans for parseable discovered candidates. JSON audit files currently use:

- `auditVersion: "0.1.0"`
- `schemaVersion: 1`

Top-level audit shape:

```json
{
  "auditVersion": "0.1.0",
  "schemaVersion": 1,
  "generatedAt": "2026-07-02T00:00:00.000Z",
  "rootPathDisplay": "examples/clients",
  "maxDepth": 4,
  "includeHome": false,
  "maxFileSizeBytes": 1048576,
  "staticOnly": true,
  "externalApiCalls": false,
  "mcpServerExecution": false,
  "toolsListRequestSent": false,
  "secretValuesRedacted": true,
  "discovery": {},
  "summary": {},
  "scannedConfigs": [],
  "skippedCandidates": [],
  "nextSteps": [],
  "limitations": {}
}
```

Audit mode does not infer tool metadata. It only scans parseable local config candidates and suggests running `scan --config <path> --tools <tools.json>` when exported tool metadata is available.

## SARIF Report Model

`scan`, `inspect-tools`, and `audit` can render SARIF 2.1.0 with `--format sarif --output <path>`.

SARIF output includes:

- `version: "2.1.0"`
- `$schema: "https://json.schemastore.org/sarif-2.1.0.json"`
- `runs[0].tool.driver.name: "MCP Scope"`
- `runs[0].tool.driver.semanticVersion`
- stable rule IDs from MCP Scope findings
- result locations with `artifactLocation.uri`
- `partialFingerprints.mcpScopeStableId`
- result properties:
  - `mcpScopeSeverity`
  - `category`
  - `target`
  - `sourceKind`
  - `staticOnly: true`
  - `secretValuesRedacted: true`
  - `notProofOfCompromise: true`

Severity mapping:

- `high` -> `error`
- `medium` -> `warning`
- `low` -> `warning`
- `info` -> `note`

SARIF output requires `--output` so large SARIF files are not printed to stdout by default.

## Limitations Model

`limitations` includes:

- `staticOnly: true`
- `noRuntimeVerification: true`
- `noExploitExecution: true`
- `noExternalRegistryCheck: true`
- `notProofOfCompromise: true`
- `notes`

## Compatibility Expectations

Future GitHub Action, SARIF, audit, approval-memory, and discovery work should treat `reportVersion`, `auditVersion`, `snapshotVersion`, `diffVersion`, `schemaVersion`, `scan`, `summary`, `findings`, `changes`, `candidates`, `redaction`, and `limitations` as compatibility-sensitive fields.

New fields may be added in later phases, but existing keys should remain stable unless `reportVersion` changes.

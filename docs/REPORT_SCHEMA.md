# MCP Scope Report Schema

MCP Scope Phase 3 reports use a stable JSON shape for automation and localized Markdown for human review.

## Version Fields

- `reportVersion`: report contract version. Phase 3 uses `0.3.0`.
- `schemaVersion`: machine-readable schema version. Phase 3 uses `1`.
- `generatedAt`: ISO timestamp from the local scan run.

## Stable vs Display Fields

JSON keys are stable English machine-readable fields. Markdown headings and explanatory text can be localized with `--lang`.

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

## Redaction Model

`redaction` includes:

- `envValuesRendered: false`
- `headerValuesRendered: false`
- `secretLikeValuesRendered: false`
- `notes`

Reports must not include env values, header values, or obvious secret-like example values.

## Limitations Model

`limitations` includes:

- `staticOnly: true`
- `noRuntimeVerification: true`
- `noExploitExecution: true`
- `noExternalRegistryCheck: true`
- `notProofOfCompromise: true`
- `notes`

## Compatibility Expectations

Future GitHub Action work should treat `reportVersion`, `schemaVersion`, `scan`, `summary`, `findings`, `redaction`, and `limitations` as compatibility-sensitive fields.

New fields may be added in later phases, but existing keys should remain stable unless `reportVersion` changes.

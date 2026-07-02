# MCP Scope GitHub Action

The MCP Scope GitHub Action runs the local MCP Scope CLI inside a GitHub Actions job. It generates a transparency report, writes safe CI outputs, can append a concise job summary, and can optionally fail the job when static findings meet a configured severity threshold.

This is local repository usage. MCP Scope is not published to GitHub Marketplace yet.

## What It Does

- Reads local MCP config JSON and/or local exported MCP tool metadata JSON from the checked-out repository.
- Generates a Markdown, JSON, HTML, or SARIF report.
- Always generates a JSON report internally for CI outputs and threshold evaluation.
- Optionally generates an HTML viewer next to the main report.
- Writes action outputs such as finding count and highest severity.
- Appends a GitHub job summary when enabled.

## Safety Boundaries

The action does not execute MCP servers, connect to MCP servers, send live `tools/list` requests, call external AI APIs, upload files automatically, add telemetry, or render env/header values.

Findings remain static risk signals and review evidence. They are not proof of compromise and not a guarantee of safety.

## Basic Workflow

```yaml
name: MCP Scope

on:
  pull_request:
  push:

permissions:
  contents: read

jobs:
  mcp-scope:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: ./
        with:
          config: examples/claude-desktop-filesystem.json
          tools: examples/tools/filesystem-tools.json
          report-format: markdown
          report-path: mcp-scope-report.md
          fail-on: none
          lang: en

      - uses: actions/upload-artifact@v7
        with:
          name: mcp-scope-report
          path: mcp-scope-report.md
```

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `config` | empty | Local MCP config JSON path. |
| `tools` | empty | Local exported MCP tool metadata JSON path. |
| `report-format` | `markdown` | `markdown`, `json`, `html`, or `sarif`. |
| `report-path` | by format | Output report path. |
| `lang` | `en` | `en` or `zh-CN`. |
| `fail-on` | `none` | `none`, `info`, `low`, `medium`, or `high`. |
| `working-directory` | `.` | Base directory for relative paths. |
| `include-html-viewer` | `false` | Generate an HTML viewer next to non-HTML reports. |
| `summary` | `true` | Append a Markdown job summary. |

Provide `config`, `tools`, or both. If neither is provided, the action fails clearly.

## Outputs

- `report-path`
- `json-report-path`
- `html-report-path`
- `highest-severity`
- `finding-count`
- `server-count`
- `tool-count`
- `passed`
- `failed-threshold`

## Fail-On Thresholds

- `none`: never fail based on findings.
- `high`: fail if highest severity is `high`.
- `medium`: fail if highest severity is `medium` or `high`.
- `low`: fail if highest severity is `low`, `medium`, or `high`.
- `info`: fail if any finding exists.

The default is `none` because early MCP Scope findings are static signals, not confirmed vulnerabilities.

## Artifact Upload

The action never uploads anything automatically. Add `actions/upload-artifact` when you want to keep reports:

```yaml
- uses: actions/upload-artifact@v7
  if: always()
  with:
    name: mcp-scope-report
    path: |
      mcp-scope-report.md
      mcp-scope-report.json
      mcp-scope-report.html
```

## Optional SARIF Upload

SARIF is useful when you want MCP Scope findings to appear in GitHub Code Scanning. MCP Scope only writes the SARIF file; upload remains an explicit workflow step.

```yaml
permissions:
  contents: read
  security-events: write

jobs:
  mcp-scope:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: ./
        with:
          config: examples/clients/claude-code-project.mcp.json
          tools: examples/tools/filesystem-tools.json
          report-format: sarif
          report-path: reports/mcp-scope.sarif
          fail-on: none

      - uses: github/codeql-action/upload-sarif@v4
        with:
          sarif_file: reports/mcp-scope.sarif
          category: mcp-scope
```

See [SARIF docs](SARIF.md) for local commands, Code Scanning notes, and an audit-mode SARIF workflow.

## What Not To Commit Publicly

Do not commit or upload private MCP configs, live credentials, token values, private env/header values, sensitive local paths, or proprietary server metadata to public issues or repositories.

More examples:

- `docs/examples/github-action-basic.yml`
- `docs/examples/github-action-threshold-gate.yml`
- `docs/examples/github-action-zh-CN.yml`
- `docs/examples/github-action-sarif.yml`
- `docs/examples/github-action-audit-sarif.yml`

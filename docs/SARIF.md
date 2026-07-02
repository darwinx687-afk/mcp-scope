# MCP Scope SARIF Output

SARIF output is for GitHub-native review surfaces such as Code Scanning. It lets MCP Scope static findings appear in a familiar security review UI when you choose to upload the generated SARIF file.

MCP Scope writes SARIF 2.1.0 JSON. It does not upload SARIF automatically. The CLI only writes a local SARIF file.

## Safety Boundaries

- No MCP server execution.
- No live `tools/list` requests.
- No external AI API calls from MCP Scope core checks.
- Env/header values and secret-like examples are redacted before report rendering.
- SARIF findings are static risk signals, not proof of compromise or proof of safety.

## Generate SARIF Locally

Scan a config plus exported tool metadata:

```bash
node apps/cli/dist/index.js scan \
  --config examples/clients/claude-code-project.mcp.json \
  --tools examples/tools/filesystem-tools.json \
  --format sarif \
  --output reports/mcp-scope.sarif
```

Inspect only exported tool metadata:

```bash
node apps/cli/dist/index.js inspect-tools \
  --tools examples/tools/poisoned-description-tools.json \
  --format sarif \
  --output reports/tools.sarif
```

Run one-command static audit:

```bash
node apps/cli/dist/index.js audit \
  --root examples/clients \
  --format sarif \
  --output reports/audit.sarif
```

`--format sarif` requires `--output`. MCP Scope does not print large SARIF to stdout by default.

## Use With GitHub Code Scanning

Use `github/codeql-action/upload-sarif` in your workflow when you explicitly want GitHub Code Scanning ingestion.

```yaml
name: MCP Scope SARIF

on:
  pull_request:
  push:

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

Use `fail-on` separately from SARIF upload. The default `none` is conservative because MCP Scope findings are static review signals.

## Permissions

Use minimal permissions:

- `contents: read`
- `security-events: write`

Do not add deployment, package publishing, Marketplace, or token write permissions for MCP Scope SARIF upload examples.

## More Examples

- `docs/examples/github-action-sarif.yml`
- `docs/examples/github-action-audit-sarif.yml`

## What Not To Commit Publicly

Do not commit or upload private MCP configs, live credentials, token values, private env/header values, sensitive local paths, or proprietary server metadata to public issues or repositories.

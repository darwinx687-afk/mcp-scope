# MCP Scope GitHub Action

MCP Scope GitHub Action 会在 GitHub Actions job 里运行本地 MCP Scope CLI。它可以生成透明度报告，写入安全的 CI outputs，追加简洁的 job summary，并可按严重程度阈值让 workflow 失败。

这是本地仓库用法。MCP Scope 还没有发布到 GitHub Marketplace。

## 它会做什么

- 从 checkout 后的仓库读取本地 MCP config JSON 和/或本地导出的 MCP tool metadata JSON。
- 生成 Markdown、JSON、HTML 或 SARIF 报告。
- 总是内部生成 JSON 报告，用于 CI outputs 和阈值判断。
- 可选生成一个 HTML viewer。
- 输出 finding count、highest severity 等 action outputs。
- 可选写入 GitHub job summary。

## 安全边界

Action 不执行 MCP servers，不连接 MCP servers，不发送实时 `tools/list` 请求，不调用外部 AI APIs，不自动上传文件，不添加 telemetry，也不会展示 env/header values。

发现项仍然是静态风险提示和审查证据，不是被攻击的证明，也不是安全保证。

## 基础 workflow

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
          lang: zh-CN

      - uses: actions/upload-artifact@v7
        with:
          name: mcp-scope-report
          path: mcp-scope-report.md
```

## Inputs

| Input | 默认值 | 说明 |
| --- | --- | --- |
| `config` | 空 | 本地 MCP config JSON 路径。 |
| `tools` | 空 | 本地导出的 MCP tool metadata JSON 路径。 |
| `report-format` | `markdown` | `markdown`、`json`、`html` 或 `sarif`。 |
| `report-path` | 按格式决定 | 输出报告路径。 |
| `lang` | `en` | `en` 或 `zh-CN`。 |
| `fail-on` | `none` | `none`、`info`、`low`、`medium` 或 `high`。 |
| `working-directory` | `.` | 相对路径的基础目录。 |
| `include-html-viewer` | `false` | 主报告不是 HTML 时，额外生成 HTML viewer。 |
| `summary` | `true` | 写入 Markdown job summary。 |

至少提供 `config` 或 `tools` 其中之一。两者都不提供时，action 会清楚失败。

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

## fail-on 阈值

- `none`：不会因为 findings 失败。
- `high`：最高严重程度为 `high` 时失败。
- `medium`：最高严重程度为 `medium` 或 `high` 时失败。
- `low`：最高严重程度为 `low`、`medium` 或 `high` 时失败。
- `info`：只要存在 finding 就失败。

默认是 `none`，因为早期 MCP Scope 的发现项是静态信号，不是已确认漏洞。

## 上传报告 artifact

Action 不会自动上传任何东西。需要保留报告时，显式添加 `actions/upload-artifact`：

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

## 可选上传 SARIF

如果你希望 MCP Scope findings 出现在 GitHub Code Scanning，可以生成 SARIF 并显式上传。MCP Scope 只写本地 SARIF 文件，不会自动上传。

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

本地命令、Code Scanning 说明和 audit-mode SARIF workflow 见 [SARIF 文档](SARIF.zh-CN.md)。

## 不要公开提交什么

不要把私有 MCP config、真实 credential、token 值、私有 env/header values、敏感本地路径或专有 server metadata 提交到公开 issue 或公开仓库。

更多示例：

- `docs/examples/github-action-basic.yml`
- `docs/examples/github-action-threshold-gate.yml`
- `docs/examples/github-action-zh-CN.yml`
- `docs/examples/github-action-sarif.yml`
- `docs/examples/github-action-audit-sarif.yml`

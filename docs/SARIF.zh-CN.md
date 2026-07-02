# MCP Scope SARIF 输出

SARIF 输出用于 GitHub Code Scanning 这类 GitHub 原生审查页面。你可以选择把 MCP Scope 的静态发现项上传到 Code Scanning，让审查入口更统一。

MCP Scope 写出的是 SARIF 2.1.0 JSON。它不会自动上传 SARIF。CLI 只会在本地写出 SARIF 文件。

## 安全边界

- 不执行 MCP server。
- 不发送实时 `tools/list` 请求。
- MCP Scope 核心检查不调用外部 AI API。
- env/header values 和疑似 secret 示例会在报告渲染前脱敏。
- SARIF findings 是静态风险信号，不是被攻击的证明，也不是安全证明。

## 本地生成 SARIF

扫描 config 和已导出的 tool metadata：

```bash
node apps/cli/dist/index.js scan \
  --config examples/clients/claude-code-project.mcp.json \
  --tools examples/tools/filesystem-tools.json \
  --format sarif \
  --output reports/mcp-scope.sarif
```

只检查已导出的 tool metadata：

```bash
node apps/cli/dist/index.js inspect-tools \
  --tools examples/tools/poisoned-description-tools.json \
  --format sarif \
  --output reports/tools.sarif
```

运行一条静态 audit 命令：

```bash
node apps/cli/dist/index.js audit \
  --root examples/clients \
  --format sarif \
  --output reports/audit.sarif
```

`--format sarif` 必须搭配 `--output`。MCP Scope 默认不会把大型 SARIF 打到 stdout。

## 接入 GitHub Code Scanning

如果你明确希望把 SARIF 放进 GitHub Code Scanning，可以在 workflow 里使用 `github/codeql-action/upload-sarif`。

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

SARIF 上传和 `fail-on` 是两件事。默认 `fail-on: none` 更保守，因为 MCP Scope 的 findings 是静态审查信号。

## 权限

建议只给最小权限：

- `contents: read`
- `security-events: write`

不要为了 MCP Scope SARIF 示例增加 deployment、package publishing、Marketplace 或 token write 权限。

## 更多示例

- `docs/examples/github-action-sarif.yml`
- `docs/examples/github-action-audit-sarif.yml`

## 不要公开提交什么

不要把私有 MCP config、真实 credential、token 值、私有 env/header values、敏感本地路径或专有 server metadata 提交到公开 issue 或公开仓库。

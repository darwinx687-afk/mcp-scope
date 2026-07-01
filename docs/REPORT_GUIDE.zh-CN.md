# MCP Scope 报告指南

MCP Scope 报告是本地透明度产物，适合用于代码审查、MCP server 批准前检查、内部平台评审和交接说明。

## 生成 Markdown 报告

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json
```

Markdown 适合贴到 GitHub PR、issue、评审文档或交接记录中。

## 生成 JSON 报告

```bash
node apps/cli/dist/index.js scan --config examples/claude-code-project.mcp.json --tools examples/tools/poisoned-description-tools.json --format json
```

JSON 主要给自动化流程使用。字段名保持英文且尽量稳定。

## 生成 HTML 报告

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json --format html --output reports/mcp-scope-viewer.html
```

HTML 适合本地审查和内部交接。它是自包含本地文件，使用内联 CSS，不依赖外部资源。

也可以从已有 JSON 报告生成查看器：

```bash
node apps/cli/dist/index.js view --report examples/reports/sample-combined-report.json --output reports/sample-viewer.html
```

## 生成中文 Markdown 报告

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json --lang zh-CN
```

Markdown 的标题和解释会使用中文。rule IDs、JSON keys、MCP、tool metadata、inputSchema、JSON-RPC 等技术名词保留英文。

## 生成 Discovery 报告

```bash
node apps/cli/dist/index.js discover --root examples/clients
node apps/cli/dist/index.js discover --root examples/clients --format json
node apps/cli/dist/index.js discover --root examples/clients --format html --output reports/discovery.html
```

Discovery 报告只列出可能的 config 候选文件。发现后，选择一个路径再运行 `scan --config <path>`。

## 如何阅读发现项

发现项是静态风险信号，不是被攻击的证明，也不是安全证明。

建议重点看：

- `high`：批准前应该人工审查。
- `medium`：有明确风险信号，建议认真确认。
- `low`：质量或透明度问题。
- `info`：帮助理解上下文的信息。

## 不要公开分享什么

不要把这些内容贴到公开 issue 或 PR：

- 私有 MCP config
- token、API key、password
- 私有 header 或 env 值
- 敏感本地路径
- 专有 server metadata

## “risk signal” 是什么

risk signal 表示 MCP Scope 在本地静态文件中看到了值得人工审查的信号。它不等于漏洞证明，也不等于恶意证明。

## 局限性

MCP Scope 不执行 MCP servers，不连接实时 `tools/list`，不运行 exploit payload，不调用外部 AI APIs，不为报告启动 web server，也不能替代专业安全审查。

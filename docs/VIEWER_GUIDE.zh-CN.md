# MCP Scope HTML 查看器指南

MCP Scope HTML 查看器是本地、静态、只读的报告展示文件，用来阅读已有的 MCP Scope 报告。

## 直接生成 HTML

```bash
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json --format html --output reports/mcp-scope-viewer.html
```

只检查工具元数据时：

```bash
node apps/cli/dist/index.js inspect-tools --tools examples/tools/poisoned-description-tools.json --format html --output reports/mcp-scope-tools-viewer.html
```

HTML 输出必须提供 `--output <path>`。MCP Scope 不会把 HTML 打印到 stdout。

## 从已有 JSON 报告生成

```bash
node apps/cli/dist/index.js view --report examples/reports/sample-combined-report.json --output reports/sample-viewer.html
```

使用 `--lang zh-CN` 生成中文标题：

```bash
node apps/cli/dist/index.js view --report examples/reports/sample-combined-report.json --output reports/sample-viewer.zh-CN.html --lang zh-CN
```

## 安全边界

- 查看器是自包含 HTML 文件。
- CSS 使用内联样式。
- 不使用外部字体、CDN、图片、脚本、遥测或 tracking pixel。
- MCP Scope 不会启动 web server。
- MCP Scope 不会自动打开浏览器。
- MCP Scope 不会执行 MCP servers。
- MCP Scope 不会发送实时 `tools/list` 请求。
- MCP Scope 不会调用外部 AI APIs。
- env values 和 header values 不会展示。

## 分享建议

查看器适合本地审查、截图或内部交接。不要把私有 MCP config、专有 tool metadata、token、credential 或敏感本地路径发布到公开 issue。

精选示例放在 `examples/viewer/`。本地 smoke 输出应保留在已忽略的 `reports/`。

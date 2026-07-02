# v0.3.0-preview

状态：草稿，尚未发布。

主题：GitHub 原生报告与一键审计版。

## 这次改了什么

- 为 `scan`、`inspect-tools` 和 `audit` 增加 SARIF 2.1.0 输出。
- 增加 `mcp-scope audit --root <path>`，用于更方便地做 config-focused 第一轮检查。
- Audit mode 会组合静态 discovery 和可解析 config 候选文件的静态扫描。
- 增加可选 GitHub Code Scanning workflow 示例，使用本地生成的 SARIF。
- 更新报告文档、GitHub Action 文档和示例。

## 为什么重要

v0.2 让项目更容易理解。v0.3 让它更方便试用，也更容易放进 GitHub 原生审查页面。

现在可以先从这一条命令开始：

```bash
node apps/cli/dist/index.js audit --root examples/clients
```

如果团队已经使用 GitHub Code Scanning，SARIF 输出可以把 MCP Scope 的静态 findings 放到熟悉的审查入口里，同时不改变 static-only 边界。

## 仍然没有改变什么

- 不执行实时 MCP server。
- 不发送实时 `tools/list` 请求。
- 不调用外部 AI API。
- 不声明 npm package 可用。
- 不声明 GitHub Marketplace 可用。
- 不做生产级安全保证。
- 发现项仍然是静态风险信号，不证明被攻击，也不证明安全。

## 发布状态

目前还没有 `v0.3.0-preview` tag。

目前还没有创建或发布 `v0.3.0-preview` GitHub release。

npm 和 GitHub Marketplace 仍未发布。

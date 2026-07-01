# Release Notes: v0.1.0-preview

这是公开 GitHub prerelease 的 release notes 来源。该 release 是 prerelease，不是正式稳定版。

## 摘要

MCP Scope 是一个早期、本地优先的透明度和风险审计工具，用来审查 MCP 工具元数据、server 配置和 AI Agent 工具权限。

它帮助开发者在信任 MCP 工具前，看清楚发生了什么变化、暴露了什么、哪些地方值得审查。

## 本预览版包含

- 发现可能的本地 MCP config 文件。
- 静态扫描本地 MCP server 配置项。
- 检查本地已导出的 MCP 工具元数据。
- 针对工具描述、权限、schema、文件系统访问、网络访问、凭据和破坏性动作的保守静态风险信号。
- Markdown、JSON 和本地自包含 HTML 报告。
- 英文和中文 Markdown 报告。
- 本地审批记忆 snapshot 和静态 diff 报告。
- 用于本地仓库 workflow 的 composite GitHub Action 质量门禁。
- 安全示例、viewer 示例和文档。

## 它不做什么

- 不执行 MCP server。
- 不连接 MCP server。
- 不发送实时 `tools/list` 请求。
- 不调用外部 AI API。
- 不自动上传报告。
- 不是恶意软件扫描器，也不是完整安全产品。
- 不代表任何 MCP 客户端的官方集成。

## 希望收到的反馈

- 哪些 config 形态需要更清楚地解析。
- 哪些发现项太吵或太保守。
- 哪些报告字段对审查有帮助或造成干扰。
- 文档缺口。
- GitHub Action 使用问题。

请先脱敏私有配置，不要在公开 issue 里粘贴 secret。

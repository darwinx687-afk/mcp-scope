# 发布说明

MCP Scope 现在已经有公开 GitHub 仓库和一个 draft prerelease，用于第一次公开发布前的人工审查。当前 release 仍然只是 draft/prerelease，还没有转为正式发布。

## MCP Scope 做什么

MCP Scope 是一个本地优先的透明度和风险审计工具，用来审查 MCP 工具元数据、server 配置和 AI Agent 工具权限。

它帮助开发者在信任 MCP 工具前，看清楚发生了什么变化、暴露了什么、哪些地方值得审查。

## 为什么需要它

MCP 工具可能把文件系统、网络、凭据、shell 和工作流能力暴露给 AI Agent。开发者需要一个本地方式，在信任这些配置前先审查可见 config 和已导出的工具元数据。

## v0.1.0-preview 草稿包含

- 发现可能的本地 MCP config 文件。
- 静态扫描本地 MCP server 配置项。
- 检查本地已导出的 MCP 工具元数据。
- 针对描述、权限、schema、文件系统访问、网络访问、凭据和破坏性动作的静态风险信号。
- Markdown、JSON 和本地自包含 HTML 报告。
- 英文和中文 Markdown 报告。
- 本地审批记忆 snapshot 和静态 diff。
- 用于本地仓库 workflow 的 composite GitHub Action 质量门禁。
- 面向发布前审查的 README、文档索引、示例索引、issue template 和 release 草稿。
- 已创建公开 GitHub 仓库，并完成 CI 验证。
- 已创建 `v0.1.0-preview` tag 和 draft prerelease。
- 已准备中英文发布素材包，包括平台文案草稿、SVG 社交卡片、发布记录表、反馈监控手册和 issue 分流指南。

## 本地优先保证

- 不执行 MCP server。
- 不发送实时 `tools/list` 请求。
- 不调用外部 AI API。
- 不做遥测。
- 不自动上传 artifact。
- 不需要登录、数据库、计费或托管服务。

## 它不做什么

- 不证明某个 server 安全。
- 不证明已经被攻击。
- 不是恶意软件扫描器。
- 不是完整安全产品。
- 不是任何 MCP 客户端的官方集成。
- 还没有发布到 npm 或 GitHub Marketplace。
- GitHub release 仍是 draft/prerelease，只有维护者明确确认后才会转为正式发布。
- 社交平台发布文案已经准备好，但不会自动发布。

## 已知局限

- 静态分析只能看到用户提供的本地文件。
- 工具元数据需要用户单独导出。
- Discovery 只列出候选文件，不自动选择或扫描。
- 带 `-like` 的 client profile 只是兼容性提示。
- CI 阈值基于静态严重程度，不代表已确认漏洞。

## 希望收到的反馈

- 缺失的 config 形态。
- 太吵的发现项。
- 漏掉的静态信号。
- 需要更清楚证据的报告字段。
- GitHub Action workflow 使用阻力。
- 不清楚或太含糊的文档。

不要把 secret、完整私有配置、内部路径或敏感报告片段贴到公开 issue。

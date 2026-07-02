# FAQ

## MCP Scope 是安全扫描器吗？

它是早期透明度和风险审计工具。它从本地文件中输出静态信号和警告。它不是完整安全产品，也不保证能发现所有问题。

## 它会执行 MCP server 吗？

不会。MCP Scope 不执行 MCP server，不启动 server command，也不连接它们。

## 它会调用外部 API 吗？

不会。核心检查不调用外部 AI API、registry 或托管服务。

## 能和 Claude Code、Cursor、Cline、Continue、Gemini CLI 或其他 MCP 客户端一起用吗？

可以把 MCP Scope 用在它支持的本地 JSON config 形态上。带 `-like` 的 client profile 是兼容性提示，不是官方集成或认证。

## 为什么发现项叫风险信号，而不是漏洞？

MCP Scope 读取的是静态 config 和已导出的 metadata。这些证据可以显示风险模式，但通常不能证明运行时行为、被攻击或安全。

## Snapshot 可以提交吗？

经过人工确认、适合放进仓库的 snapshot 可以提交。提交前要先审查，因为它们可能包含 server 名称、工具名、描述、路径提示、URL host 和 config 字段名。

## Approval memory 是什么意思？

Approval memory 是一次本地审查后的脱敏 snapshot。之后 `mcp-scope diff` 可以把当前本地文件和这个 snapshot 对比，报告静态变化。它不是安全证书。

## 目前还不支持什么？

MCP Scope 不执行 MCP server，不请求实时 `tools/list`，不抓取远程 registry，不发布 npm package，不提供托管 dashboard，也没有发布 GitHub Marketplace action。

版本化边界见 [局限与路线图](LIMITATIONS.zh-CN.md)。

## 怎么提供工具元数据？

MCP Scope 用 `--tools <tools.json>` 分析本地已导出的工具元数据文件。支持形态和脱敏建议见 [工具元数据导出指南](TOOL_METADATA_EXPORT_GUIDE.zh-CN.md)。

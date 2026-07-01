# Issue 分流指南

## 标签

- `bug`
- `false-positive`
- `false-negative`
- `docs`
- `config-shape`
- `github-action`
- `report-output`
- `approval-memory`
- `local-viewer`
- `security-sensitive`
- `not-in-scope`
- `good-first-issue`
- `help-wanted`

## 首次回复模板

谢谢反馈。请不要贴 secret、完整私有 config、私有路径或敏感日志。如果方便，请提供已脱敏的 MCP Scope 命令、报告片段，以及你预期和实际看到的行为。

## False Positive 模板

谢谢。可以提供 rule ID、严重程度和最小脱敏示例吗？MCP Scope 的发现项是静态风险信号，降低噪音是很有价值的反馈。

## Config Shape 模板

谢谢。请只提供最小脱敏 JSON 形态，以及你希望 `discover` 或 `scan` 怎么处理。不要包含 token、私有路径或完整私有配置。

## Not In Scope 模板

谢谢这个想法。这个请求会超出 MCP Scope 当前本地优先、静态检查的预览范围。我先标记为 `not-in-scope`，如果后续项目阶段明确改变，可以再讨论。

## Security-Sensitive 模板

请不要在公开 issue 里贴敏感细节。可以先开一个最小 issue，询问私下报告方式；如果维护者提供了私下渠道，再走私下渠道。

## 什么时候转私下安全报告

- 可能暴露真实凭据。
- 复现需要私有 config 或内部路径。
- 问题涉及 MCP Scope 自身漏洞。
- 讨论需要不适合公开的日志或 artifact。

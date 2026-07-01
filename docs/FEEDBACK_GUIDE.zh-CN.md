# 反馈指南

MCP Scope 还在早期。最有用的反馈通常是具体、已脱敏，并且能对应到某个本地文件形态或报告输出。

不要在公开 issue 里粘贴真实凭据、完整私有 MCP config、私有路径、内部 hostname、客户数据或 secret 值。

## 反馈类型

- Bug：MCP Scope 崩溃、退出码不对、输出无效，或与文档说明不一致。
- False positive：某个静态发现项对安全的本地写法来说太严重或太吵。
- False negative：MCP Scope 漏掉了本地 config 或已导出 metadata 中可见的静态风险信号。
- Docs confusion：说明文字、示例、命令片段或边界表达不清楚。
- Config shape request：某种本地 MCP config 形态还不能解析或发现。
- Integration request：围绕某个客户端、CI provider、包管理器或 review 工具的流程请求。
- Feature request：新的本地报告、CLI 或审查功能。
- Security-sensitive：MCP Scope 自身可能存在漏洞，或报告内容涉及敏感信息。
- Not in scope：SaaS、登录、遥测、收集 secret、生成 exploit、静默执行 MCP server 等请求。

## 建议提供

- 使用的 MCP Scope 命令。
- 已脱敏的报告片段或报告摘要。
- 相关的已脱敏 config 形态。
- 你预期的行为。
- 实际行为。
- 必要时提供操作系统和 Node/pnpm 版本。

## 不要提供

- API key、token、cookie、SSH key、OAuth 材料或数据库 URL。
- 完整私有配置。
- 真实 env/header 值。
- 私有本地用户名或 home 路径。
- 非必要的私有仓库名。

如果问题敏感，请先开一个最小公开 issue，询问维护者的私下报告方式，不要直接贴细节。

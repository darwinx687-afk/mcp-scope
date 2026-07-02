# 局限与路线图

MCP Scope 是早期、本地优先的透明度工具。它的发现项是静态风险信号和审查证据，不证明某个 server 安全，也不证明它已经被攻击。

## 当前局限

- 只做静态分析。
- 不执行实时 MCP server。
- 不发送实时 `tools/list` 请求。
- 不检查外部 MCP registry。
- 不证明已经发生攻击。
- 还没有 npm package。
- 还没有发布 GitHub Marketplace。
- 还没有 SARIF 输出。
- 还没有覆盖所有 MCP 客户端。
- 工具元数据需要本地导出或本地提供。

## 为什么有这些局限

- 安全：MCP Scope 不应该为了检查而启动未知 server command。
- 本地优先：核心审查不依赖登录、遥测、托管服务或外部 API。
- 诚实边界：静态证据能显示风险模式，但不能证明运行时行为。
- 早期预览阶段：先减少使用和理解成本，再考虑更广的打包和动态助手。

## v0.2 会改善什么

- README 第一屏有更清楚的双语入口。
- 文档导航更清楚，覆盖局限、报告、discovery 和已导出的工具元数据。
- 补充工具元数据导出指南，说明支持的本地 JSON 形态。
- discovery 找到候选 config 后，给出更清楚的下一步命令提示。
- 报告里的局限说明更清楚。
- 准备 LinkedIn 和小红书的可重复更新发布流程。

## 后续版本候选方向

- v0.3：SARIF 输出或更强的 GitHub Action 集成。
- v0.4：面向团队静态审查规则的 policy packs。
- v0.5：可选的显式 `tools/list` 导出助手，只能在用户明确同意后运行。
- 更以后：npm package、GitHub Marketplace action、更丰富的 diff memory。

## 仍然不是目标

- Chatbot。
- 通用 Agent 框架。
- SaaS dashboard。
- 运行时 exploit 工具。
- 做绝对安全承诺的恶意软件扫描器。

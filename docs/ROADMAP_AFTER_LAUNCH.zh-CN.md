# 发布后路线

这是一份计划文档，不是承诺。MCP Scope 后续仍应保持本地优先、报告优先和安全表达克制。

## Phase 9: GitHub Remote And Prerelease

- 维护者人工确认后，再创建公开 GitHub 仓库。
- Push 当前准备好的本地仓库。
- 最终审查后再打 preview release tag。
- Release notes 明确说明这是早期预览。
- 除非有新的明确决策，本阶段不发布 npm，也不发布 GitHub Marketplace。

## Phase 10: Bilingual Launch And Feedback

- 发布英文和中文 launch notes。
- 把 README 和文档发给早期开发者试用。
- 收集 bug、false positive、false negative、文档疑惑和 config shape 请求。
- 示例继续保持安全和脱敏。

## Phase 11: Feedback-Driven Iteration

- 优先修复影响报告可信度、脱敏、解析正确性和 CLI 易用性的问题。
- 只在能保持静态、本地的前提下增加 config shape 支持。
- 用户看不懂的地方先改文档。
- 发现项继续表达为信号，而不是证明。

## 可能的未来工作

- npm package。
- GitHub Action Marketplace 打包。
- 更细的 metadata diff。
- 明确用户同意后才运行的实时 `tools/list` 导出助手。
- 更多 client profile。
- Policy packs。
- SARIF 输出。
- Benchmark corpus。
- 在安全且清楚说明联网行为的前提下，对比 MCP registry。

任何未来动态行为都必须显式、可选择、先写清楚，并在运行前让用户看见。

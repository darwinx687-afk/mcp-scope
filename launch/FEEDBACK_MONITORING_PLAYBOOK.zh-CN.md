# 反馈监控手册

不要把每条评论都立刻变成功能。先看重复出现的问题、明确 bug 和可验证证据。

## 前 24 小时

- 看 GitHub issues 和评论。
- 留意安装或命令使用疑惑。
- 判断 README 首屏是否回答了基本问题。
- 记录 false positive、false negative 和 config shape 请求。
- 如果 GitHub Action 失败，记录 run 链接。

## 前 72 小时

- 按类型归类反馈。
- 如果是表达不清，先改文档，不急着改产品范围。
- 需要材料时，请对方提供已脱敏报告。
- 安全敏感细节不要放在公开讨论里。
- 在 `FEEDBACK_TO_ROADMAP_REVIEW.zh-CN.md` 里总结前三个阻力点。

## 前 7 天

- 检查 issue 标签和重复问题。
- 判断是否先用文档修复就够。
- 优先做风险低的解析和报告改进。
- 没有明确同意设计前，不要加入实时执行或云功能。

## 观察项

- GitHub stars。
- Issues 和评论。
- 安装问题。
- 报告理解问题。
- False positives。
- False negatives。
- Config shape 请求。
- GitHub Action 失败。
- README 理解问题。
- 对实时 `tools/list` 导出助手的请求。
- 对 npm package 的请求。
- 对 GitHub Marketplace action 的请求。

## 反馈分类

- `bug`
- `false-positive`
- `false-negative`
- `docs-confusion`
- `config-shape-request`
- `integration-request`
- `feature-request`
- `security-sensitive`
- `not-in-scope`

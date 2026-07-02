# v0.3.0-preview 最终检查草稿

状态：草稿。没有发布 release、tag 或社交平台帖子。

## 准备状态摘要

`v0.3.0-preview` 正处于实现检查阶段。这个更新方向是增加 SARIF 输出和一条 audit 命令，同时保持 MCP Scope 只做静态检查。

## 相比 v0.2.0-preview 的计划变化

- `scan`、`inspect-tools` 和 `audit` 支持 SARIF 输出。
- 新增 `audit --root <path>`，组合静态 discovery 和静态 config scan 摘要。
- 增加 GitHub Code Scanning 示例；只有 workflow 显式添加 `github/codeql-action/upload-sarif` 时才上传 SARIF。
- 为 LinkedIn 和小红书准备 v0.3 更新草稿和资产。

## 检查清单

- SARIF 输出必须提供 `--output`。
- SARIF 不展示 env/header values 或疑似 secret placeholder。
- Audit mode 不执行 MCP server。
- Audit mode 不发送实时 `tools/list`。
- Audit mode 不推断 tool metadata。
- GitHub Code Scanning 上传仍然是可选、显式步骤。
- 文案避免 npm、Marketplace、官方集成和生产级安全保证声明。

## 发布准备判断

建议：尚未发布。

这份草稿用于实现检查通过后的人工 review gate，不代表 release 已经创建。

## 未发布声明

没有创建或发布 GitHub release。

没有创建 git tag。

没有发布 LinkedIn、小红书、X / Twitter、Dev.to、Hacker News、掘金、即刻、微信、V2EX 或 Reddit 帖子。

没有发布 npm package 或 GitHub Marketplace listing。

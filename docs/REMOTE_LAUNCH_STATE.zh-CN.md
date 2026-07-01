# MCP Scope 远程发布状态

记录时间：2026-07-01，Phase 9 远程仓库设置完成后。

## 仓库

- Repo 名称：`mcp-scope`
- Owner：`darwinx687-afk`
- Remote URL：`https://github.com/darwinx687-afk/mcp-scope`
- Git remote：`origin https://github.com/darwinx687-afk/mcp-scope.git`
- 可见性：public
- 默认分支：`main`
- Homepage：空

## Commit 和 CI

- 最新已推送 release/tag commit：`89a45c0858db6b627932d4a2bbf2c9d16f445f17`
- `main` 上的 CI：已通过，run `28528079909`
- `v0.1.0-preview` 上的 CI：已通过，run `28528155196`
- 远程验证中修复过的 CI 问题：在 corepack 启用 pnpm 前关闭 setup-node 的 package-manager cache；给 action manifest 中带冒号的 description 加引号。

## Release 和 Tag

- Tag：`v0.1.0-preview`
- Tag 指向：`89a45c0858db6b627932d4a2bbf2c9d16f445f17`
- Draft prerelease：已创建
- Draft 状态：`isDraft: true`
- Prerelease 状态：`isPrerelease: true`
- Published 状态：还不是正式 release；`publishedAt` 为 null

## 仓库信息

- Description：`Local-first transparency reports for MCP configs and tool metadata.`
- Issues：已启用
- Wiki：已关闭
- Topics：
  - `agent-safety`
  - `ai-agents`
  - `ai-security`
  - `cli`
  - `github-action`
  - `local-first`
  - `mcp`
  - `model-context-protocol`
  - `tool-use`
  - `typescript`

## 人工后续事项

- 维护者需要先审查 draft prerelease，再决定是否转为正式 release。
- Phase 9 不发布 npm。
- Phase 9 不发布 GitHub Marketplace。
- Phase 10 前不发社区或社交平台发布帖。
- 继续保持生成的 `reports/` smoke 输出被忽略，不提交进仓库。

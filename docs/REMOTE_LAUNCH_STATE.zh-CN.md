# MCP Scope 远程发布状态

记录时间：2026-07-01，Phase 9 远程仓库设置完成后。

更新时间：2026-07-01，`v0.1.0-preview` GitHub prerelease 已公开后。

更新时间：2026-07-02，`v0.2.0-preview` release execution 已批准。

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
- `main` 上最新 launch-pack commit：`f0af9c4`
- `main` 上的 CI：已通过，run `28531824152`
- `v0.1.0-preview` 上的 CI：已通过，run `28528155196`
- 远程验证中修复过的 CI 问题：在 corepack 启用 pnpm 前关闭 setup-node 的 package-manager cache；给 action manifest 中带冒号的 description 加引号。

## Release 和 Tag

- Tag：`v0.1.0-preview`
- Tag 指向：`89a45c0858db6b627932d4a2bbf2c9d16f445f17`
- Prerelease URL：`https://github.com/darwinx687-afk/mcp-scope/releases/tag/v0.1.0-preview`
- Draft prerelease：已作为公开 prerelease 发布
- Draft 状态：`isDraft: false`
- Prerelease 状态：`isPrerelease: true`
- Published 状态：公开 prerelease；`publishedAt` 为 `2026-07-01T16:24:27Z`

## v0.2.0-preview Release Execution

- 状态：本轮 release execution 已批准发布公开 prerelease。
- 主题：双语入口与使用体验完善版。
- 计划 tag：`v0.2.0-preview`
- 计划 prerelease URL：`https://github.com/darwinx687-afk/mcp-scope/releases/tag/v0.2.0-preview`
- npm 发布：false。
- GitHub Marketplace 发布：false。
- Phase 11 状态：等待真实可行动反馈。
- 最终 tag 指向、发布时间和更新帖 URL 必须在发布后记录。

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

- GitHub prerelease 已公开，但仍然是 prerelease，不是 final/stable release。
- 不发布 npm。
- 不发布 GitHub Marketplace。
- 社区和社交平台发布仍需人工执行，并记录到 `launch/POSTING_TRACKER.md`。
- 继续保持生成的 `reports/` smoke 输出被忽略，不提交进仓库。

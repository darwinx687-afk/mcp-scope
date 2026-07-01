# MCP Scope 发布检查清单

MCP Scope 现在有公开 GitHub 仓库和公开 prerelease。继续发社交或社区帖、或未来决定是否转为正式稳定版前，先按这份清单检查。

## 本地检查

- `pnpm install --frozen-lockfile` 可以在干净 checkout 上运行。
- `pnpm build` 通过。
- `pnpm typecheck` 通过。
- `pnpm test` 通过。
- `pnpm check` 通过。
- README 里的 CLI smoke 命令仍然可用。
- 使用安全示例文件的本地 action runner smoke 可用。
- 仓库 CI workflow 只使用最小权限：`contents: read`。

## 报告和示例

- Markdown、JSON、HTML 示例报告是最新的。
- Viewer 示例可以作为本地静态 HTML 打开。
- Discovery 示例是最新的。
- Snapshot 和 diff 示例是最新的。
- 被忽略的 `reports/` 目录没有误提交生成文件。
- 示例里的占位值清楚是假的，不像真实凭据。

## 脱敏和 secret 检查

- 搜索明显的 secret 名称和真实 token 模式。
- 确认示例不包含私有 hostname、用户名、邮箱、内部路径或真实 API key。
- 确认报告只展示 env/header 键名，不展示值。
- 确认 issue template 提醒用户不要粘贴 secret 或完整私有配置。

## 文档检查

- README 首屏简洁、诚实。
- README.zh-CN.md 不像营销稿，并避开禁用中文词。
- 英文和中文文档索引链接可用。
- 示例索引说明安全占位值规则。
- GitHub Action 文档没有声称已发布到 Marketplace。
- Security 文档说明发现项是静态信号，不是被攻击的证明。

## 仓库信息建议

建议 description：

```text
Local-first transparency reports for MCP configs and tool metadata.
```

建议 topics：

```text
mcp, model-context-protocol, ai-security, agent-safety, tool-use, ai-agents, cli, github-action, typescript, local-first
```

## 首个版本检查

- 维护者人工审查所有文档和示例。
- 维护者确认 license 和仓库可见性。
- 维护者决定是否使用 `v0.1.0-preview` 作为第一个 tag。
- 维护者基于 `docs/RELEASE_DRAFT.md` 准备 release note。
- 维护者确认本轮不发布 npm。
- 维护者确认本轮不发布 GitHub Marketplace。

## Phase 9 已记录状态

- 公开 GitHub repo 已创建：`https://github.com/darwinx687-afk/mcp-scope`。
- `main` 已 push，并设为默认分支。
- GitHub Actions 已在 `main` 上验证。
- `v0.1.0-preview` tag 已创建并 push。
- `v0.1.0-preview` 已公开为 prerelease。
- Tag CI 已验证。
- npm 和 GitHub Marketplace 仍未发布。
- Phase 10 双语发布素材包已准备在 `launch/` 下。
- 发布记录表和反馈监控手册已准备。

未完成人工审查前，不要把 prerelease 转为正式稳定版，不要发布 npm，不要发布 GitHub Marketplace，也不要发布社交平台公告。

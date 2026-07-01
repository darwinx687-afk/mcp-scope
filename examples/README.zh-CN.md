# MCP Scope 示例

`examples/` 目录放的是安全 fixture 和示例输出，方便测试、文档、截图和第一次本地试用。

不要把真实 secret、私有仓库路径、个人 home 路径、内部 hostname、客户数据或私有 MCP config 放进这个目录。

## 配置示例

- `claude-desktop-filesystem.json`：简单的本地 `mcpServers` 配置。
- `claude-code-project.mcp.json`：项目风格配置 fixture。
- `http-server-with-redacted-auth.json`：展示 auth 字段脱敏的 HTTP 配置。
- `risky-local-command.json`：本地命令风险示例。
- `configs/claude-desktop-filesystem.changed-command.json`：用于 snapshot diff 的变化配置。

## 客户端风格示例

`clients/` 用来测试本地 JSON 形态解析：

- `claude-code-project.mcp.json`
- `claude-code-user.claude.json`
- `claude-desktop-config.json`
- `cursor-like.mcp.json`
- `cline-like.mcp-settings.json`
- `continue-like.mcp.json`
- `gemini-cli-like.settings.json`
- `plugin-like.plugin.json`
- `generic-mcp-servers.json`
- `generic-mcp-servers-wrapper.json`

带 `-like` 的 client profile 只是兼容性提示，不代表官方集成。

## 工具元数据示例

`tools/` 放的是已导出的工具元数据 fixture：

- `filesystem-tools.json`
- `poisoned-description-tools.json`
- `credential-network-tools.json`
- `schema-quality-tools.json`
- `multi-tool-suspicious-fragments.json`
- 用于 diff 测试的变化版本

这些只是本地示例元数据。MCP Scope 不会请求实时 `tools/list`。

## 报告和查看器示例

- `reports/`：精选 Markdown 和 JSON 透明度报告。
- `viewer/`：本地自包含 HTML 查看器示例。
- `discovery/`：discovery 示例报告。
- `snapshots/`：本地审批记忆 snapshot 示例。
- `diffs/`：静态 diff 示例报告。

如果需要截图，可以打开 `examples/viewer/` 里的 HTML 文件，或者在被忽略的 `reports/` 目录生成新的本地报告。

## Snapshot 和 Diff 示例

```bash
node apps/cli/dist/index.js snapshot \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.json \
  --output reports/local-approved.snapshot.json \
  --label "local review"

node apps/cli/dist/index.js diff \
  --baseline reports/local-approved.snapshot.json \
  --config examples/configs/claude-desktop-filesystem.changed-command.json \
  --tools examples/tools/filesystem-tools.changed-description.json \
  --output reports/local-diff.md
```

生成的 `reports/` 文件默认被忽略。只有经过人工整理的示例才应该提交。

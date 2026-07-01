# MCP Scope 审批记忆

审批记忆用于把一次已经审查过的 MCP 静态状态保存成本地脱敏 JSON snapshot，然后把后续的本地 config 和 tool metadata 导出文件与这个 baseline 做对比。

它适合 PR 审查、仓库检查和本地批准前复查。它不会执行 MCP server，不会连接 MCP server，不会发送实时 `tools/list` 请求，不会调用外部 AI API，不会上传文件，也不会证明某个 server 是安全的。

## 命令

创建 snapshot：

```bash
node apps/cli/dist/index.js snapshot \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.json \
  --output examples/snapshots/filesystem-approved.snapshot.json \
  --label "filesystem review"
```

与 snapshot 做 diff：

```bash
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.changed-description.json \
  --lang zh-CN
```

生成 JSON 或 HTML diff：

```bash
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.added-dangerous-tool.json \
  --format json \
  --output reports/filesystem.diff.json

node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.added-dangerous-tool.json \
  --format html \
  --output reports/filesystem.diff.html
```

## Snapshot 保存什么

snapshot 保存的是脱敏后的静态指纹：

- 项目、schema 和 snapshot 版本字段。
- 扫描模式：`config-only`、`tools-only` 或 `combined`。
- config server 指纹：transport、command 摘要、args 预览、URL host 或脱敏 URL、env key 名称、header key 名称、capability hints、风险提示。
- tool 指纹：名称、标题、描述、schema、annotations、参数、capability hints、finding rule IDs。
- 如果存在 manifest 级别的 tool metadata 信号，也会记录。
- 汇总计数、类别、严重程度和 SHA-256 digest。
- 脱敏说明和局限性说明。

snapshot 不保存 env value 或 header value。tool metadata 里的明显 secret-like 示例值会在生成 snapshot 和 diff 前脱敏。

## Diff 检查什么

`mcp-scope diff` 会把 baseline snapshot 与新的本地静态扫描结果对比，报告：

- 新增或移除的 config server。
- 新增或移除的 tool。
- server command、args、env key、header key、URL、capability、severity 变化。
- tool title、description、input schema、output schema、annotation、capability、severity、finding rule 变化。
- 新增或消失的 finding rule 信号。
- 最高 diff 严重程度和变更数量。

这些发现项仍然是静态风险信号。diff 可以说明元数据发生了变化，但不能确认恶意行为，也不能证明已经被攻击。

## Diff 格式

支持的格式：

- 默认 `markdown`。
- `json` 用于自动化。
- `html` 用于本地自包含审查文件。

Markdown 可用 `--lang zh-CN` 输出中文说明。JSON key 保持稳定的英文机器可读字段。

## fail-on-change

使用 `--fail-on-change <threshold>` 可以在输出生成之后，根据静态变化严重程度让命令以非零状态退出。

阈值行为：

- `none`：不因为变化失败。
- `high`：最高 diff 严重程度为 high 时失败。
- `medium`：最高 diff 严重程度为 medium 或 high 时失败。
- `low`：最高 diff 严重程度为 low、medium 或 high 时失败。
- `info`：只要存在任何静态变化就失败。

示例：

```bash
node apps/cli/dist/index.js diff \
  --baseline examples/snapshots/filesystem-approved.snapshot.json \
  --config examples/claude-desktop-filesystem.json \
  --tools examples/tools/filesystem-tools.added-dangerous-tool.json \
  --fail-on-change high
```

## 本仓库示例

- `examples/snapshots/filesystem-approved.snapshot.json`
- `examples/diffs/filesystem-description-change.diff.md`
- `examples/diffs/filesystem-description-change.diff.zh-CN.md`
- `examples/diffs/filesystem-added-dangerous-tool.diff.json`
- `examples/diffs/filesystem-added-dangerous-tool.diff.html`

输入 fixture：

- `examples/tools/filesystem-tools.changed-description.json`
- `examples/tools/filesystem-tools.changed-schema.json`
- `examples/tools/filesystem-tools.added-dangerous-tool.json`
- `examples/configs/claude-desktop-filesystem.changed-command.json`

## 不要公开提交什么

不要把私有 MCP config、私有本地路径、专有 tool metadata、内部 server 名称、token、secret，或者来自敏感项目的 snapshot 提交到公开仓库。

snapshot 默认会脱敏，但仍可能包含 tool 名称、描述、schema、本地路径提示、server 名称和审查上下文。请把它当作审查材料，不要当作公开安全徽章。

## 边界

审批记忆是本地优先、静态分析：

- 不执行 MCP server。
- 不请求实时 `tools/list`。
- 不调用外部 API。
- 不提供 hosted service。
- 不做 telemetry。
- 不做 cloud sync。
- 不自动上传。
- 不提供生产级安全保证。

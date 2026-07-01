# MCP Scope Report

- 早期透明度报告
- 仅做静态分析
- MCP server execution: false
- External API calls: false
- Secret values redacted: true

## 执行摘要

- Report version: 0.3.0
- Generated: 2026-07-01T12:55:52.997Z
- Scan mode: combined
- Config source: examples/claude-desktop-filesystem.json
- Tool metadata source: examples/tools/filesystem-tools.json
- Metadata source type: mcp-scope-tool-manifest
- Server count: 1
- Tool count: 2
- Finding count: 7
- Highest severity: medium
- 主要类别: config-transparency (3), filesystem-access (2), annotation-trust (2)
- 主要 capability hints: filesystem (3), shell (1)

## MCP Scope 检查了什么

- 带有顶层 `mcpServers` 对象的本地 MCP config 文件。
- 用户本地提供的已导出 tool metadata 文件。
- tool descriptions、input schemas、output schemas 和 annotations。
- 配置中的启动命令、URL、env key、header key 可见性。
- env/header 的值不会展示，只展示 key 和风险提示。

## MCP Scope 没有做什么

- 没有执行 MCP servers。
- 没有连接实时 `tools/list` 端点。
- 没有调用外部 AI APIs。
- 没有证明配置已被攻击，也没有证明配置绝对安全。
- 不能替代专业安全审查。

## 严重程度说明

- `info`：用于理解配置和元数据的背景信息。
- `low`：较弱信号或质量问题，建议顺手检查。
- `medium`：需要在批准前认真看的风险信号。
- `high`：较强的静态警告，不建议未经审查直接批准。

## Config 摘要

- Source file: examples/claude-desktop-filesystem.json
- Server count: 1
- Highest config risk level: medium

| Name | Transport | Command/URL | Env keys | Header keys | Capability hints | Risk level |
| --- | --- | --- | ---: | ---: | --- | --- |
filesystem | stdio | npx | 0 | 0 | filesystem, shell | medium

### Config 透明度提示

- info / filesystem: 配置省略了 transport type，但存在 command，因此 MCP Scope 按 stdio 处理。
- low / filesystem: 这个 stdio server 被 MCP client 使用时会启动本地进程。
- medium / filesystem: Argument "~/Documents/demo-project" 引用了范围较宽的本地路径.

## Tool Metadata 摘要

- Tool metadata source file: examples/tools/filesystem-tools.json
- Metadata source type: mcp-scope-tool-manifest
- Tool count: 2
- Finding count: 4
- Highest tool risk level: medium
- External API calls: false
- MCP server execution: false
- tools/list request sent: false

| Tool name | Title | Capability hints | Finding count | Highest severity | Categories |
| --- | --- | --- | ---: | --- | --- |
read_file | Read File | filesystem | 2 | medium | filesystem-access, annotation-trust
write_file | Write File | filesystem | 2 | medium | filesystem-access, annotation-trust

## 发现项

### MEDIUM / config-transparency / broad_path_argument

- Target: config-server:filesystem (examples/claude-desktop-filesystem.json)
- 说明: Argument "~/Documents/demo-project" 引用了范围较宽的本地路径.
- 安全证据: server "filesystem"
- 建议: 批准 MCP server 前，请审查这个 config 条目。

### MEDIUM / filesystem-access / filesystem_access_signal

- Target: tool:read_file (examples/tools/filesystem-tools.json)
- 说明: 工具元数据提到了文件、路径、目录或 filesystem 操作。
- 安全证据: metadata contains "read_file"
- 建议: 批准前检查允许访问的路径，并确认关键值对用户可见。

### MEDIUM / filesystem-access / filesystem_access_signal

- Target: tool:write_file (examples/tools/filesystem-tools.json)
- 说明: 工具元数据提到了文件、路径、目录或 filesystem 操作。
- 安全证据: metadata contains "write_file"
- 建议: 批准前检查允许访问的路径，并确认关键值对用户可见。

### LOW / config-transparency / local_stdio_command

- Target: config-server:filesystem (examples/claude-desktop-filesystem.json)
- 说明: 这个 stdio server 被 MCP client 使用时会启动本地进程。
- 安全证据: server "filesystem"
- 建议: 批准 MCP server 前，请审查这个 config 条目。

### INFO / annotation-trust / annotation_trust_note

- Target: tool:read_file (examples/tools/filesystem-tools.json)
- 说明: Annotations 可以辅助审查，但在建立 server 信任前，它们只是元数据声明。
- 安全证据: annotations include readOnlyHint
- 建议: 把 annotations 当作审查提示，不要当作行为证明。

### INFO / annotation-trust / annotation_trust_note

- Target: tool:write_file (examples/tools/filesystem-tools.json)
- 说明: Annotations 可以辅助审查，但在建立 server 信任前，它们只是元数据声明。
- 安全证据: annotations include destructiveHint, openWorldHint
- 建议: 把 annotations 当作审查提示，不要当作行为证明。

### INFO / config-transparency / inferred_stdio_transport

- Target: config-server:filesystem (examples/claude-desktop-filesystem.json)
- 说明: 配置省略了 transport type，但存在 command，因此 MCP Scope 按 stdio 处理。
- 安全证据: server "filesystem"
- 建议: 批准 MCP server 前，请审查这个 config 条目。

## 脱敏说明

- Env values rendered: false
- Header values rendered: false
- Secret-like values rendered: false
- env values 永远不会在报告中展示。
- header values 永远不会在报告中展示。
- tool metadata 示例中的疑似 secret 值会在渲染前脱敏。
- 不要把私有 config、token 或本地敏感路径贴到公开 issue。

## 局限性

- Static only: true
- No runtime verification: true
- No exploit execution: true
- No external registry check: true
- Not proof of compromise: true
- 本报告只分析本地文件。
- MCP Scope 没有执行 MCP servers 或 tools。
- MCP Scope 没有连接实时 `tools/list` 端点。
- MCP Scope 没有调用外部 AI APIs 或 registry。
- 发现项是风险信号和警告，不是被攻击的证明。

## 页脚

MCP Scope 是早期透明度工具。发现项是静态风险信号，不是被攻击的证明。

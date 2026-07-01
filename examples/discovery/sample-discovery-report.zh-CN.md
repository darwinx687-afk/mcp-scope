# MCP Scope Discovery Report

- 仅做静态发现
- MCP server execution: false
- External API calls: false
- Live tools/list requests: false
- File contents rendered: false

## 摘要

- Root path: ~/.../clients
- Max depth: 4
- Include home root: false
- Candidate count: 10
- Parsed count: 10
- Skipped count: 0
- Invalid JSON count: 0
- Unsupported count: 0

## 候选文件

| Path | Status | Shape | Profile | Servers | Risk | Notes |
| --- | --- | --- | --- | ---: | --- | --- |
examples/clients/claude-code-project.mcp.json | parsed | top-level-mcpServers | claude-code-project | 1 | low | none
examples/clients/claude-code-user.claude.json | parsed | projects-mcpServers | claude-code-user | 2 | medium | info:nested_project_mcp_servers
examples/clients/claude-desktop-config.json | parsed | top-level-mcpServers | claude-desktop | 1 | medium | none
examples/clients/cline-like.mcp-settings.json | parsed | top-level-mcpServers | cline-like | 1 | medium | none
examples/clients/continue-like.mcp.json | parsed | top-level-servers | continue-like | 1 | low | none
examples/clients/cursor-like.mcp.json | parsed | mcp.servers | cursor-like | 1 | low | none
examples/clients/gemini-cli-like.settings.json | parsed | mcp.servers | gemini-cli-like | 1 | medium | none
examples/clients/generic-mcp-servers-wrapper.json | parsed | mcp.servers | generic | 1 | info | none
examples/clients/generic-mcp-servers.json | parsed | top-level-servers | generic | 1 | low | none
examples/clients/plugin-like.plugin.json | parsed | top-level-mcpServers | plugin-like | 1 | low | none

## 下一步

- 选择一个候选路径后运行 `mcp-scope scan --config <path>`。
- 如果你已经导出了本地 tools/list metadata，可以额外加 `--tools <path>`。
- discovery 不会自动扫描每个候选文件，也不会修改配置。

## 脱敏说明

- discovery 不打印文件内容。
- env/header values 不会展示。
- 类似 home 目录的路径会安全显示。

## 局限性

- 只做本地文件静态发现。
- client profile labels 是兼容性提示，不代表官方集成。
- 候选文件只是审查起点，不是安全或被攻击的证明。
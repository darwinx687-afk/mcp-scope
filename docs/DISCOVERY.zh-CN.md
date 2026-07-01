# MCP Scope Discovery

`mcp-scope discover` 会在本地 root 目录下寻找可能的 MCP config 文件。它只列出候选文件，不执行 MCP server，不连接 server，不扫描 tool metadata，不创建 snapshot，也不修改文件。

## 基本用法

```bash
node apps/cli/dist/index.js discover --root .
node apps/cli/dist/index.js discover --root . --format json
node apps/cli/dist/index.js discover --root . --format markdown --lang zh-CN
node apps/cli/dist/index.js discover --root . --format html --output reports/discovery.html
```

发现候选文件后，选择一个路径再运行：

```bash
node apps/cli/dist/index.js scan --config <path>
```

如果你有已经导出的 tools/list metadata：

```bash
node apps/cli/dist/index.js scan --config <path> --tools <tools-path>
```

## 候选文件匹配

Discovery 会寻找这些常见文件名：

- `.mcp.json`
- `mcp.json`
- `*.mcp.json`
- `*.mcp-settings.json`
- `claude_desktop_config.json`
- `claude-desktop-config.json`
- `.claude.json`
- `*.claude.json`
- `*.plugin.json`
- 文件名包含 `mcp` 的 JSON 文件
- `settings.json` 或 `*.settings.json`，但只在明显的 client/example 目录里匹配

候选文件只会按本地 JSON 解析，用来判断是否是已支持的 config 形态。

## 忽略目录

Discovery 会跳过：

- `node_modules`
- `.git`
- `dist`
- `build`
- `coverage`
- `reports`
- `.next`
- `.turbo`
- `vendor`
- `target`
- `.venv`
- `__pycache__`

它不会跟随 symlink。

## 选项

- `--root <path>`：必填，发现范围根目录。
- `--format markdown|json|html`：默认 `markdown`。
- `--output <path>`：HTML 输出必填。
- `--lang en|zh-CN`：默认 `en`。
- `--max-depth <number>`：默认 `4`。
- `--include-home`：允许把 home 目录本身作为发现 root。

默认会跳过超过 1 MB 的文件。

## 安全路径显示

Discovery 会安全显示 home-like 路径和嵌套 project 路径。公开报告默认不应暴露完整私有 home 目录路径。

## 局限性

Discovery 只是静态候选文件发现：

- 不能证明配置正在生效。
- 不能证明配置安全。
- 不代表任何客户端官方集成。
- 不保证发现所有客户端私有设置。
- 不上传，也不修改文件。

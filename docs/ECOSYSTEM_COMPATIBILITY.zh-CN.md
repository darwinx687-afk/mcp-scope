# MCP Scope 客户端兼容说明

MCP Scope 支持几类本地 JSON 配置形态，方便开发者把常见 MCP 客户端风格的配置文件拿来做静态检查。

这只是静态兼容，不代表官方集成。MCP Scope 不会执行 MCP server，不会连接 MCP server，不会请求实时 `tools/list`，不会调用外部 API，也不会修改配置文件。

## 支持的本地 JSON 形态

当前支持这些形态：

```json
{
  "mcpServers": {
    "server-name": {}
  }
}
```

```json
{
  "projects": {
    "/path/to/project": {
      "mcpServers": {
        "server-name": {}
      }
    }
  }
}
```

```json
{
  "mcp": {
    "servers": {
      "server-name": {}
    }
  }
}
```

```json
{
  "servers": {
    "server-name": {}
  }
}
```

如果 plugin-like 文件里包含这些形态，例如顶层 `mcpServers` 和 `name`、version 字段并存，也可以被静态解析。

## Client Profile Labels

当路径或 JSON 字段像某类客户端配置时，MCP Scope 会输出 `clientProfile`：

- `generic`
- `claude-code-project`
- `claude-code-user`
- `claude-desktop`
- `cursor-like`
- `cline-like`
- `continue-like`
- `gemini-cli-like`
- `plugin-like`
- `unknown`

带 `-like` 的标签只表示“形态相似，MCP Scope 可以按通用规则解析”。它不代表官方支持、认证，也不代表覆盖了某个客户端所有私有设置。

## Transport 处理

MCP Scope 识别：

- `stdio`
- `http`
- `streamable-http`，会作为 HTTP alias 展示
- `sse`
- `ws`

未知 transport 会变成警告，不会让扫描崩溃。

## 额外字段

MCP Scope 会安全摘要这些字段，不执行、不展开：

- `timeout`
- `alwaysLoad`
- `disabled`
- `oauth`
- `headersHelper`
- `roots`
- `allowedTools`
- `deniedTools`

`headersHelper` 会被当作 command-like 元数据提示，但不会执行。OAuth 的值不会展示。env 和 header 的值仍然脱敏，只展示 key。

## 示例扫描

```bash
node apps/cli/dist/index.js scan --config examples/clients/claude-code-project.mcp.json
node apps/cli/dist/index.js scan --config examples/clients/claude-code-user.claude.json
node apps/cli/dist/index.js scan --config examples/clients/claude-desktop-config.json
node apps/cli/dist/index.js scan --config examples/clients/cursor-like.mcp.json
node apps/cli/dist/index.js scan --config examples/clients/cline-like.mcp-settings.json
node apps/cli/dist/index.js scan --config examples/clients/continue-like.mcp.json
node apps/cli/dist/index.js scan --config examples/clients/gemini-cli-like.settings.json
node apps/cli/dist/index.js scan --config examples/clients/plugin-like.plugin.json
```

如果你有本地导出的 tool metadata，可以单独提供：

```bash
node apps/cli/dist/index.js scan \
  --config examples/clients/claude-code-project.mcp.json \
  --tools examples/tools/filesystem-tools.json
```

## 隐私提示

嵌套 project config 里的 home-like 路径会被缩短显示。报告仍可能包含 server 名称、tool 名称、URL host、路径提示和字段名。公开前请先检查。

不要把私有 config、token、内部 server 名称或私有 snapshot 贴到公开 issue。

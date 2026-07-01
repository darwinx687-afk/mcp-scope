# MCP Scope Ecosystem Compatibility

MCP Scope Phase 7 supports more local JSON config shapes so developers can try the scanner against common MCP client-style files.

This is static compatibility, not official client integration. MCP Scope does not execute MCP servers, connect to MCP servers, request live `tools/list`, call external APIs, or modify config files.

## Supported Local JSON Shapes

MCP Scope currently recognizes these shapes:

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

Plugin-like files are supported when they include one of these shapes, for example a top-level `mcpServers` object next to `name` or version fields.

## Client Profile Labels

MCP Scope reports a `clientProfile` label when a path or JSON field suggests a familiar client-style config:

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

Labels ending in `-like` mean compatibility hints only. They do not claim official support, certification, or exact coverage of a client’s private settings.

## Transport Handling

MCP Scope recognizes:

- `stdio`
- `http`
- `streamable-http`, displayed as an HTTP alias
- `sse`
- `ws`

Unknown transport strings are reported as warnings instead of crashing the scan.

## Additional Fields

MCP Scope summarizes these fields without executing or expanding them:

- `timeout`
- `alwaysLoad`
- `disabled`
- `oauth`
- `headersHelper`
- `roots`
- `allowedTools`
- `deniedTools`

`headersHelper` is treated as command-like metadata and is never executed. OAuth values are not rendered. Env and header values remain redacted; only key names are shown.

## Example Scans

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

If you have local exported tool metadata, provide it separately:

```bash
node apps/cli/dist/index.js scan \
  --config examples/clients/claude-code-project.mcp.json \
  --tools examples/tools/filesystem-tools.json
```

## Privacy Notes

MCP Scope shortens home-like project paths discovered in nested project configs. Reports still can contain server names, tool names, URL hosts, path hints, and field names. Review reports before posting them publicly.

Do not paste private configs, tokens, internal server names, or private snapshots into public issues.

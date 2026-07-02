# 工具元数据导出指南

MCP Scope 可以用 `--tools <tools.json>` 检查本地已导出的 MCP 工具元数据。它不会执行 MCP server，不会连接 server，也不会发送实时 `tools/list` 请求。

当你已经通过可信流程、测试 fixture 或内部审查流程拿到安全的本地工具元数据文件时，可以参考本指南。

## 配合 Config 一起扫描

```bash
mcp-scope scan --config <config> --tools <tools.json>
```

`<config>` 是本地 MCP config JSON 文件。`<tools.json>` 是本地工具元数据文件，使用下面任一支持形态。

## 形态 A：JSON-RPC `tools/list` Response

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "tools": [
      {
        "name": "read_file",
        "description": "Read a file from an allowed workspace path.",
        "inputSchema": {
          "type": "object",
          "properties": {
            "path": { "type": "string" }
          },
          "required": ["path"]
        }
      }
    ]
  }
}
```

## 形态 B：Portable Local Manifest

```json
{
  "serverName": "local-filesystem",
  "source": "manual-export",
  "tools": [
    {
      "name": "write_file",
      "title": "Write File",
      "description": "Write content to an allowed workspace path.",
      "inputSchema": {
        "type": "object",
        "properties": {
          "path": { "type": "string" },
          "content": { "type": "string" }
        },
        "required": ["path", "content"]
      }
    }
  ]
}
```

## 安全脱敏

分享或提交已导出的工具元数据前：

- 移除 token、API key、password、session ID 和私有 header。
- 如果用户名、仓库名、客户名、内部 host 敏感，请替换掉。
- 检查 tool description 里是否有误贴的 secret 或内部指令。
- 检查 schema examples、defaults 和 enum values 里是否有疑似 secret 的字符串。
- 保留足够结构方便审查：tool name、description、schema、annotation 通常有用，但 secret 没有必要出现。

MCP Scope 会在渲染报告前隐藏明显疑似 secret 的 schema 示例值，但源文件仍然需要人工检查后再分享。

## 不要做什么

- 不要为了生成 metadata 而运行未知 MCP server。
- 不要把私有 config 或 secret 贴到公开 issue。
- 不要把已导出的 metadata 当作运行时行为证明。
- 不要把“没有发现项”理解成工具安全。

## 当前边界

MCP Scope 目前只分析本地已导出的工具元数据。未来可以考虑显式导出助手，但必须有清楚的用户同意和可见命令说明。

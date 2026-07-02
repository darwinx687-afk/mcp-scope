# Tool Metadata Export Guide

MCP Scope can inspect local exported MCP tool metadata with `--tools <tools.json>`. It does not execute MCP servers, connect to them, or send live `tools/list` requests.

Use this guide when you already have a safe local metadata export from a trusted workflow, test fixture, or internal review process.

## Pair Config And Tools

```bash
mcp-scope scan --config <config> --tools <tools.json>
```

`<config>` is a local MCP config JSON file. `<tools.json>` is a local file containing exported tool metadata in one of the supported shapes below.

## Shape A: JSON-RPC `tools/list` Response

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

## Shape B: Portable Local Manifest

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

## Safe Redaction

Before sharing or committing exported metadata:

- Remove tokens, API keys, passwords, session IDs, and private headers.
- Replace private usernames, repo names, customer names, and internal hostnames when they are sensitive.
- Review tool descriptions for pasted secrets or private instructions.
- Review schema examples, defaults, and enum values for secret-like strings.
- Keep enough structure for review: tool names, descriptions, schemas, and annotations are useful, but secrets are not.

MCP Scope redacts obvious secret-like schema examples before rendering reports, but you should still review source files before sharing them.

## What Not To Do

- Do not run unknown MCP servers just to create metadata.
- Do not paste private configs or secrets into public issues.
- Do not treat exported metadata as proof of runtime behavior.
- Do not assume a missing finding means a tool is safe.

## Current Boundary

MCP Scope currently analyzes local exported metadata only. A future explicit export helper may be considered, but only with clear user consent and visible command disclosure.

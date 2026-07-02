# FAQ

## Is MCP Scope a security scanner?

It is an early transparency and risk audit tool. It reports static signals and warnings from local files. It is not a complete security product and does not guarantee detection.

## Does it execute MCP servers?

No. MCP Scope does not execute MCP servers, start server commands, or connect to them.

## Does it call external APIs?

No. Core checks do not call external AI APIs, registries, or hosted services.

## Can I use it with Claude Code, Cursor, Cline, Continue, Gemini CLI, or other MCP clients?

You can use MCP Scope against local JSON config shapes that it supports. Client-profile-like labels are compatibility hints, not official integrations or certifications.

## Why do findings say risk signal instead of vulnerability?

MCP Scope reads static config and exported metadata. That evidence can show risk patterns, but it usually cannot prove runtime behavior, compromise, or safety.

## Can I commit snapshots?

You can commit curated snapshots if they are safe for your repository. Review them first because they may contain server names, tool names, descriptions, path hints, URL hosts, and config field names.

## What does approval memory mean?

Approval memory is a local redacted snapshot of what was reviewed. Later, `mcp-scope diff` can compare current local files against that snapshot and report static drift. It is not a safety certificate.

## What is not supported yet?

MCP Scope does not execute MCP servers, request live `tools/list`, fetch remote registries, publish npm packages, provide a hosted dashboard, or publish a GitHub Marketplace action.

See [Limitations and roadmap](LIMITATIONS.md) for the versioned boundary list.

## How do I provide tool metadata?

MCP Scope analyzes local exported tool metadata files with `--tools <tools.json>`. See [Tool metadata export guide](TOOL_METADATA_EXPORT_GUIDE.md) for supported shapes and redaction guidance.

# Draft Release Notes: v0.1.0-preview

This is the release-note source for the draft GitHub prerelease. The release remains draft/prerelease until a human maintainer explicitly publishes it.

Launch copy and feedback tracking materials are prepared under `launch/`. They are drafts only and should not be posted automatically.

## Summary

MCP Scope is an early local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

It helps developers see what changed, what is exposed, and what looks risky before MCP tools are trusted by AI agents.

## Included In This Preview

- Static discovery for likely local MCP config files.
- Static scanning for local MCP server config entries.
- Local exported MCP tool metadata inspection.
- Conservative static risk signals for tool descriptions, permissions, schemas, filesystem access, network access, credentials, and destructive actions.
- Markdown, JSON, and self-contained HTML reports.
- English and Chinese Markdown report rendering.
- Local approval-memory snapshots and static diff reports.
- Composite GitHub Action quality gate for local repository workflows.
- Safe examples, viewer examples, and documentation.

## What It Does Not Do

- It does not execute MCP servers.
- It does not connect to MCP servers.
- It does not send live `tools/list` requests.
- It does not call external AI APIs.
- It does not upload reports automatically.
- It is not a malware scanner or complete security product.
- It is not an official integration with any MCP client.

## Feedback Requested

- Config shapes MCP Scope should parse more clearly.
- Findings that are too noisy or too quiet.
- Report fields that help or hurt review.
- Documentation gaps.
- GitHub Action usability issues.

Please redact private config values and do not paste secrets into public issues.

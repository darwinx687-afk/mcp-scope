# MCP Scope Project Constitution

MCP Scope is a local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

Its Chinese name is MCP 透镜.

## What It Is

- A CLI-first open-source project for inspecting MCP-related configuration and metadata.
- A report-first tool that should help developers understand what an MCP server appears to expose before they approve or run it.
- A security-honest project focused on risk notes, transparency warnings, and review evidence.
- A TypeScript-first monorepo designed to stay small in early phases.
- A bilingual project from day one.

## What It Is Not

- Not a general MCP server framework.
- Not a generic AI agent framework.
- Not a chatbot, RAG app, prompt manager, or agent UI.
- Not a cloud SaaS product.
- Not a runtime firewall in Phase 0.
- Not an exploit generator.
- Not a malware scanner making absolute security claims.
- Not a replacement for professional security review.

## Principles

- Local-first: core checks must work without cloud services or login.
- CLI-first: the first useful interface is command-line output and files.
- Report-first: the main output should be clear Markdown or JSON evidence.
- Security-honest: findings are signals and warnings, not proof of complete safety or compromise.
- No external AI API calls in core checks.
- No MCP server execution in Phase 0.
- No exploit generation in early phases.
- No fake production-ready claims.

## Research-Backed Focus

MCP Scope is inspired by recent MCP security research around tool poisoning, malicious tool metadata, hidden instructions in tool descriptions, shadowing, rug pulls, weak parameter visibility, and insufficient user transparency.

The project starts with transparency. Before deeper enforcement or automation, users need a local way to see what tool metadata says, what permissions a config implies, and what changed after approval.

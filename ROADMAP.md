# Roadmap

## Phase 0: Foundation

Create governance docs, TypeScript monorepo structure, CLI placeholder, core/report placeholders, and checks.

## Phase 1: First Real MCP Config Fingerprint

Read local MCP config files and produce a basic static fingerprint without executing MCP servers.

## Phase 2: Tool Metadata Schema and Risk Rule Engine

Define tool metadata structures, risk rule inputs, and capability categories.

Status: implemented for local exported tool metadata files only.

## Phase 3: Markdown/JSON Transparency Reports

Generate reviewable local reports with clear warnings, evidence, and non-goal language.

Status: implemented with stable JSON report model and bilingual Markdown rendering.

## Phase 4: Local Read-Only Viewer

Provide a local viewer for generated reports. It must remain read-only.

Status: implemented as self-contained HTML output plus `view --report`.

## Phase 5: GitHub Action Quality Gate

Add optional CI checks for committed MCP config and metadata snapshots.

Status: implemented as a local composite action and CLI `--fail-on` threshold.

## Phase 6: Tool Metadata Diff and Approval Memory

Track approved fingerprints and report meaningful changes.

## Phase 7: Ecosystem Examples

Add examples for Claude Desktop, Claude Code, Cursor, Cline, Continue, and Gemini CLI.

## Phase 8: Open-Source Launch Packaging

Prepare docs, examples, security language, and release assets for public launch.

## Phase 9: GitHub Remote and Prerelease

Create the remote repository and publish a prerelease when the project is ready.

## Phase 10: Bilingual Launch and Feedback

Launch with English and Chinese docs and collect early feedback.

## Phase 11: Feedback-Driven Iteration

Prioritize real user feedback while preserving local-first and security-honest boundaries.

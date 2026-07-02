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

Status: implemented as local redacted approval-memory snapshots and static diff reports.

## Phase 7: Ecosystem Examples

Add examples for Claude Desktop, Claude Code, Cursor, Cline, Continue, and Gemini CLI.

Status: implemented with local compatibility examples and static config discovery.

## Phase 8: Open-Source Launch Packaging

Prepare docs, examples, security language, and release assets for public launch.

Status: implemented as local repository launch packaging. No remote, release, npm package, or Marketplace publication has been created.

## Phase 9: GitHub Remote and Prerelease

Create the remote repository and publish a prerelease when the project is ready.

Status: implemented as a public GitHub repository with CI verification, `v0.1.0-preview` tag, and draft prerelease. The release is draft/prerelease only; npm and GitHub Marketplace remain unpublished.

## Phase 10: Bilingual Launch and Feedback

Launch with English and Chinese docs and collect early feedback.

Status: launch and feedback pack prepared in English and Chinese. The public GitHub prerelease, LinkedIn post, and Xiaohongshu post are live, but there is no actionable feedback yet. v0.2.0-preview is prepared as a bilingual onboarding and limitation reduction public prerelease. No npm package or GitHub Marketplace listing exists.

## v0.2.0-preview Maintenance Plan

Positioning: bilingual onboarding and limitation reduction release.

Planned improvements:

- README language switch visible near the first screen.
- Repository metadata recommendation documented before changing GitHub settings.
- Limitations separated into current limits, reasons, v0.2 improvements, future versions, and non-goals.
- Tool metadata export guide for local JSON shapes.
- Discovery next-step hints for parsed candidates.
- Clearer report limitation wording.
- Versioned update-post workflow for LinkedIn and Xiaohongshu.

Status: release execution approved for public prerelease publication. Keep Phase 11 waiting until real actionable feedback appears.

## Phase 11: Feedback-Driven Iteration

Prioritize real user feedback while preserving local-first and security-honest boundaries.

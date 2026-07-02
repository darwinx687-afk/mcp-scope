# Decision Log

## 2026-07-01

- Project name: MCP Scope.
- Chinese name: MCP 透镜.
- Repo slug: `mcp-scope`.
- Architecture: TypeScript pnpm local-first CLI monorepo.
- Early scope: static local MCP config and metadata transparency, not runtime blocking.
- Research anchor: MCP tool poisoning and tool metadata transparency.
- Bilingual structure from day one.

## 2026-07-01 Phase 1

- Phase 1 scanner is static-only and does not execute MCP servers.
- Phase 1 supports only the common top-level `mcpServers` JSON object shape.
- Env/header values are never rendered; reports show key names and redaction markers only.

## 2026-07-01 Phase 2

- Phase 2 supports local exported MCP tool metadata only and does not execute `tools/list` against live servers.
- Tool metadata findings are static risk signals and warnings, not confirmed vulnerabilities.
- Tool metadata schemas are sanitized before JSON/Markdown rendering to avoid emitting obvious secret example values.

## 2026-07-01 Phase 3

- Markdown reports support bilingual rendering through `--lang en` and `--lang zh-CN`.
- JSON reports remain stable English machine-readable schema fields.
- Curated report examples live under `examples/reports`; generated smoke reports remain ignored under `reports/`.

## 2026-07-01 Phase 4

- The viewer is a local static HTML file, not a hosted dashboard.
- HTML output requires `--output` to avoid dumping viewer markup to stdout.
- The `view` command renders an existing MCP Scope JSON report and does not execute MCP servers, start a web server, open a browser, or call external APIs.
- Curated viewer examples live under `examples/viewer`; generated smoke reports remain ignored under `reports/`.

## 2026-07-01 Phase 5

- Phase 5 uses a composite GitHub Action that wraps the local CLI and writes summary/output without publishing to GitHub Marketplace.
- The action generates JSON internally for CI evaluation, but artifact upload remains an explicit workflow step.
- Severity gates use static report severity only; findings remain risk signals, not confirmed vulnerabilities.

## 2026-07-01 Phase 6

- Phase 6 stores local redacted approval-memory snapshots as JSON and compares future local static scans against them.
- Approval-memory snapshots are review artifacts, not safety certificates or public trust badges.
- Diffing stays in the local CLI for this phase; GitHub Action diff integration and `scan --compare-to` remain out of scope until the core workflow has more usage feedback.

## 2026-07-01 Phase 7

- Phase 7 supports common local JSON config shapes and client-profile-like labels without claiming official integration.
- Discovery lists likely local config candidates and requires users to choose a path before scanning; it does not auto-scan every candidate.
- Home-like nested project paths are displayed safely by default to reduce accidental private path exposure.

## 2026-07-01 Phase 8

- Phase 8 treats launch packaging as repository-local static assets and documentation, not as publication.
- The project can look ready for first public GitHub launch review without creating a remote repository, publishing a release, publishing npm, or claiming GitHub Marketplace availability.
- Community templates ask for redacted reports and minimal shapes, not full private configs or secret values.

## 2026-07-01 Phase 9

- Phase 9 created the public GitHub repository under the authenticated user account `darwinx687-afk` because `gh auth status` reported a single active account and no existing target repo.
- Phase 9 uses a draft prerelease for `v0.1.0-preview`; the release remains draft/prerelease and is not a final launch announcement.
- GitHub Actions CI is part of the public repository launch gate. Repository-side CI bootstrap and action manifest parsing issues were fixed before recording the launch state.

## 2026-07-01 Phase 10

- Phase 10 treats launch materials as prepared drafts and static assets only; no social platform posting or release publication is automated.
- Feedback monitoring is tracked through repository files under `launch/` so Phase 11 can prioritize evidence from issues, comments, and review friction without expanding scope too quickly.
- The refined first-wave launch plan prioritizes GitHub prerelease, Juejin, LinkedIn, X / Twitter, Xiaohongshu, Jike, WeChat, Hacker News, and Dev.to; V2EX is skipped for this wave and Reddit remains optional later with explicit human approval.

## 2026-07-02 v0.2.0-preview Planning

- `v0.2.0-preview` is positioned as a bilingual onboarding and limitation reduction maintenance release, not a feature expansion driven by invented feedback.
- The update workflow is versioned under `launch/updates/v0.2.0-preview/` and remains draft-only until a human explicitly approves release publication and social posting.
- Discovery next-step hints may show safe local `mcp-scope scan --config <path>` commands, but discovery still does not execute MCP servers, send live `tools/list` requests, call external APIs, or auto-scan candidates.

## 2026-07-02 v0.2.0-preview Final Review

- The v0.2.0-preview human review gate recommends `ready` for a manually approved preview release.
- The review did not create a tag, publish a GitHub release, post to social platforms, publish npm, or publish GitHub Marketplace.
- Phase 11 remains blocked until real actionable feedback appears; low exposure and engagement-only signals are not enough to create roadmap work.

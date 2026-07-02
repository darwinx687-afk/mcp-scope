# v0.3.0-preview Final Review Draft

Status: draft. No release, tag, or social post has been published.

## Readiness Summary

`v0.3.0-preview` is in implementation review. The intended update adds SARIF output and one-command audit mode while keeping MCP Scope static-only.

## Intended Changes Since v0.2.0-preview

- SARIF output for `scan`, `inspect-tools`, and `audit`.
- New `audit --root <path>` command for static discovery plus static config scan summaries.
- GitHub Code Scanning examples that upload SARIF only when the workflow explicitly adds `github/codeql-action/upload-sarif`.
- Versioned v0.3 update-post drafts and assets for LinkedIn and Xiaohongshu.

## Review Checklist

- SARIF output requires `--output`.
- SARIF does not render env/header values or secret-like placeholders.
- Audit mode does not execute MCP servers.
- Audit mode does not call live `tools/list`.
- Audit mode does not infer tool metadata.
- GitHub Code Scanning upload remains optional and explicit.
- Copy avoids npm, Marketplace, official integration, and production-ready security claims.

## Release Readiness

Recommendation: not published yet.

This draft is for a future human review gate after implementation checks pass. It does not mean a release has been created.

## No Publication Statement

No GitHub release was created or published.

No git tag was created.

No LinkedIn, Xiaohongshu, X / Twitter, Dev.to, Hacker News, Juejin, Jike, WeChat, V2EX, or Reddit post was published.

No npm package or GitHub Marketplace listing was published.

# MCP Scope Launch Checklist

MCP Scope is not published yet. Use this checklist before creating a public remote, prerelease, or release announcement.

## Local Checks

- `pnpm install --frozen-lockfile` works on a clean checkout.
- `pnpm build` passes.
- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm check` passes.
- CLI smoke commands in the README still work.
- Local action runner smoke works with safe example files.
- Repository CI workflow uses minimal permissions: `contents: read`.

## Reports And Examples

- Markdown, JSON, and HTML sample reports are current.
- Viewer examples open as local static files.
- Discovery examples are current.
- Snapshot and diff examples are current.
- No generated files under ignored `reports/` are staged by accident.
- Example placeholders are clearly fake and do not resemble live credentials.

## Redaction And Secret Review

- Search for obvious secret names and live token patterns.
- Confirm examples do not contain private hostnames, usernames, emails, internal paths, or real API keys.
- Confirm reports show env/header key names only, not values.
- Confirm issue templates warn users not to paste secrets or full private configs.

## Docs Review

- README first screen is concise and honest.
- README.zh-CN.md avoids marketing tone and banned Chinese phrases.
- Docs index links work in English and Chinese.
- Examples index explains safe placeholder policy.
- GitHub Action docs do not claim Marketplace availability.
- Security docs state that findings are static signals, not confirmed compromise.

## Repository Metadata Suggestions

Suggested description:

```text
Local-first transparency reports for MCP configs and tool metadata.
```

Suggested topics:

```text
mcp, model-context-protocol, ai-security, agent-safety, tool-use, ai-agents, cli, github-action, typescript, local-first
```

## First Release Checklist

- Human maintainer reviews all docs and examples.
- Human maintainer confirms license and repository visibility.
- Human maintainer decides whether `v0.1.0-preview` is the first tag.
- Human maintainer prepares release notes from `docs/RELEASE_DRAFT.md`.
- Human maintainer confirms no npm publish is planned for this loop.
- Human maintainer confirms no GitHub Marketplace publication is planned for this loop.

Do not publish, tag, announce, or push a remote until human review is complete.

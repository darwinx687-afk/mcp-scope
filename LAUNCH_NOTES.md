# Launch Notes

MCP Scope now has a public GitHub repository and a public GitHub prerelease for first public launch review. The release is still a prerelease and has not been made final/stable.

## What MCP Scope Does

MCP Scope is a local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

It helps developers see what changed, what is exposed, and what looks risky before MCP tools are trusted by AI agents.

## Why It Exists

MCP tools can expose filesystem, network, credential, shell, and workflow capabilities to AI agents. Developers need a local way to review visible config and exported tool metadata before trusting that setup.

## Included In v0.1.0-preview Prerelease

- Static discovery for likely local MCP config files.
- Static scanning for local MCP server config entries.
- Local exported MCP tool metadata inspection.
- Static risk signals for descriptions, permissions, schemas, filesystem access, network access, credentials, and destructive actions.
- Markdown, JSON, and self-contained HTML reports.
- English and Chinese Markdown reports.
- Local approval-memory snapshots and static diffs.
- Composite GitHub Action quality gate for local repository workflows.
- Launch-ready README, docs indexes, examples indexes, issue templates, and release draft.
- Public GitHub repository with CI verification.
- `v0.1.0-preview` tag and public prerelease.
- Bilingual launch pack with platform copy drafts, SVG social cards, posting tracker, feedback monitoring playbook, and issue triage guide.

## Local-First Guarantees

- No MCP server execution.
- No live `tools/list` requests.
- No external AI API calls.
- No telemetry.
- No automatic artifact upload.
- No login, database, billing, or hosted service.

## What It Does Not Do

- It does not prove a server is safe.
- It does not prove compromise.
- It is not a malware scanner.
- It is not a complete security product.
- It is not an official integration with any MCP client.
- It has not been published to npm or GitHub Marketplace.
- The GitHub release is a public prerelease, not a final/stable release.
- Social/community launch copy is prepared but not posted automatically.

## Known Limitations

- Static analysis only sees local files users provide.
- Tool metadata must be exported separately.
- Discovery lists candidates but does not choose or scan them automatically.
- Client-profile-like labels are compatibility hints.
- CI thresholds are based on static severity, not confirmed vulnerability status.

## Feedback Requested

- Missing config shapes.
- Noisy findings.
- Missed static signals.
- Report fields that need clearer evidence.
- GitHub Action workflow friction.
- Docs that are unclear or too vague.

Do not paste secrets, full private configs, internal paths, or sensitive report excerpts into public issues.

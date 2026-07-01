# Release Protocol

MCP Scope is not ready for package release in the early preview phases.

## Before Any Release

- Confirm the current phase allows release work.
- Run `pnpm check`.
- Review `SECURITY.md` for accurate claims.
- Review English and Chinese docs together.
- Confirm generated reports are not accidentally committed unless they are intentional examples.
- Confirm no secrets, private MCP configs, or local paths are included.

## Early Preview Rule

No npm publishing, prerelease, GitHub remote creation, or launch packaging should happen until the roadmap explicitly reaches release work.

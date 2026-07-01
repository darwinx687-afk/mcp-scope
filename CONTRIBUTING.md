# Contributing

Thanks for helping build MCP Scope.

## Local Setup

```bash
pnpm install
pnpm check
```

## Checks

Before opening a change, run:

```bash
pnpm build
pnpm typecheck
pnpm test
```

`pnpm check` runs the same required checks together.

For launch packaging changes, also make sure the launch check stays green:

```bash
pnpm check:launch
```

## Docs Requirement

Changes that affect behavior, scope, safety language, or user output must update relevant docs.

## Bilingual Docs Requirement

User-facing positioning and launch-facing docs should stay available in English and Chinese. Avoid machine-translation tone. Keep security claims modest and exact in both languages.

## Security-Sensitive Contributions

- Do not submit live credentials.
- Do not paste private MCP configs into public issues.
- Do not add exploit generation.
- Do not add MCP server execution without an explicit phase decision and documentation.
- Treat findings as risk notes, signals, or warnings unless there is strong evidence and careful wording.

## Rule Contribution Guidelines

- Keep rules static-first unless a future phase explicitly changes that boundary.
- Prefer transparent evidence over broad claims.
- Explain why a finding is `info`, `low`, `medium`, or `high`.
- Add focused tests for new matching behavior.
- Avoid matching on private values that reports should never render.
- Do not include exploit payloads or instructions for attack execution.

## Example And Fixture Guidelines

- Use fake placeholders such as `REDACTED_EXAMPLE_TOKEN`.
- Do not use real API keys, tokens, cookies, SSH keys, OAuth material, database URLs, or private configs.
- Avoid private local usernames, home paths, internal hostnames, customer names, and private repository names.
- Keep generated files under ignored `reports/` unless they are intentionally curated examples.

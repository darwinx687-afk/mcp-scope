# Issue Triage Guide

## Labels

- `bug`
- `false-positive`
- `false-negative`
- `docs`
- `config-shape`
- `github-action`
- `report-output`
- `approval-memory`
- `local-viewer`
- `security-sensitive`
- `not-in-scope`
- `good-first-issue`
- `help-wanted`

## First Response Template

Thanks for the report. Please avoid posting secrets, full private configs, private paths, or sensitive logs. If possible, share a redacted MCP Scope command, report excerpt, and expected vs actual behavior.

## False Positive Template

Thanks. Could you share the rule ID, severity, and a minimal redacted example? MCP Scope findings are static risk signals, so tuning noisy cases is useful feedback.

## Config Shape Template

Thanks. Please share only a minimal redacted JSON shape and the behavior you expected from `discover` or `scan`. Do not include tokens, private paths, or full private configs.

## Not In Scope Template

Thanks for the idea. This request would move MCP Scope outside its current local-first/static-only preview scope. I am marking it `not-in-scope` for now, but it can be reconsidered if the project explicitly changes phase.

## Security-Sensitive Template

Please do not post sensitive details publicly. Open a minimal issue asking for a private reporting path, or use the maintainer-provided private channel once available.

## Move To Private Security Report When

- A report may expose live credentials.
- A private config or internal path is needed to reproduce.
- The issue concerns a vulnerability in MCP Scope itself.
- The discussion needs logs or artifacts that should not be public.

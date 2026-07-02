# Limitations And Roadmap

MCP Scope is an early local-first transparency tool. Its findings are static risk signals and review evidence, not proof that a server is safe or compromised.

## Current Limitations

- Static-only analysis.
- No live MCP server execution.
- No live `tools/list` request.
- No external MCP registry check.
- No proof of compromise.
- No npm package yet.
- No GitHub Marketplace publication yet.
- No SARIF output yet.
- No complete coverage of every MCP client.
- Tool metadata must be exported or provided locally.

## Why These Limitations Exist

- Safety: MCP Scope should not start unknown server commands just to inspect them.
- Local-first design: core review should work without login, telemetry, hosted services, or external APIs.
- Honest scope: static evidence can show risk patterns, but it cannot prove runtime behavior.
- Early preview stage: the project should reduce confusion before adding wider packaging or dynamic helpers.

## What v0.2 Will Improve

- Clearer bilingual entry from the first README screen.
- Clearer docs navigation for limitations, reports, discovery, and exported tool metadata.
- Tool metadata export guidance for supported local JSON shapes.
- Better discovery next-step hints after config candidates are found.
- Clearer report limitation wording.
- Repeatable update-post workflow for LinkedIn and Xiaohongshu.

## Future Version Candidates

- v0.3: SARIF output or stronger GitHub Action integration.
- v0.4: policy packs for team-specific static review rules.
- v0.5: optional explicit `tools/list` export helper, only with visible user consent.
- Future: npm package, GitHub Marketplace action, and richer diff memory.

## Still Non-Goals

- Chatbot.
- Generic agent framework.
- SaaS dashboard.
- Runtime exploit tool.
- Malware scanner with absolute claims.

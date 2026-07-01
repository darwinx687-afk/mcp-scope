# Roadmap After Launch

This is a planning document, not a promise. MCP Scope should continue to stay local-first, report-first, and security-honest.

## Phase 9: GitHub Remote And Prerelease

- Create the public GitHub repository when a human maintainer approves.
- Push the prepared local repo.
- Tag a preview release only after final review.
- Keep release notes explicit that this is an early preview.
- Do not publish npm or GitHub Marketplace in this phase unless there is a new explicit decision.

## Phase 10: Bilingual Launch And Feedback

- Publish English and Chinese launch notes.
- Share the README and docs with early developers.
- Collect bug reports, false positives, false negatives, docs confusion, and config shape requests.
- Keep examples safe and redacted.

## Phase 11: Feedback-Driven Iteration

- Prioritize fixes that improve report trust, redaction, parsing correctness, and CLI usability.
- Add config shape support only when it can stay static and local.
- Improve docs where users stumble.
- Keep findings framed as signals, not proof.

## Possible Future Work

- npm package.
- GitHub Action Marketplace packaging.
- Richer metadata diff.
- Live `tools/list` export helper with explicit user consent.
- More client profiles.
- Policy packs.
- SARIF output.
- Benchmark corpus.
- MCP registry comparison if it can be done safely and with clear network disclosure.

Any future dynamic behavior must be explicit, opt-in, documented, and visible before it runs.

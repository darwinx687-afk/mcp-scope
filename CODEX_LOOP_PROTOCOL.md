# Codex Loop Protocol

Every future Codex loop must read these files before making scoped changes:

1. `PROJECT_CONSTITUTION.md`
2. `PRODUCT_SPEC.md`
3. `ARCHITECTURE.md`
4. `CODEX_LOOP_PROTOCOL.md`
5. `ROADMAP.md`
6. `RUN_STATE.md`
7. `DECISION_LOG.md`
8. `NON_GOALS.md`
9. `BILINGUAL_STYLE_GUIDE.md`

Every loop must:

- Stay inside the current phase scope.
- Update `RUN_STATE.md`.
- Update `DECISION_LOG.md` only when a real product or architecture decision is made.
- Update necessary docs.
- Run checks.
- Commit the completed loop.
- Not hide failures.

Every loop must end with this exact report format:

```text
Loop Completed:
Phase:
Objective:
Files Changed:
New Files:
Commands Run:
Check Results:
Git Status:
Commit:
Decisions Made:
Risks / Blockers:
Next Recommended Loop:
```

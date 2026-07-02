# Run State

- Current phase: Phase 10
- Current status: `v0.2.0-preview` is published as a public GitHub prerelease; version update posts for LinkedIn and Xiaohongshu remain manual-needed because Codex in-app browser could not complete post composition/upload
- Next loop: manually post or browser-assist only the approved LinkedIn and Xiaohongshu update posts after preview and explicit confirmation; keep monitoring feedback and do not start Phase 11 unless real actionable feedback arrives
- Current scope guard: release tracking and approved update posting only; no MCP server execution, no live tools/list requests, no external APIs in scanning, no npm publish, no Marketplace claim, no security guarantee claim, no Phase 11 work, and no new social/community posts outside LinkedIn and Xiaohongshu

## Latest Loop

- Objective: publish the v0.2.0-preview maintenance release and prepare approved LinkedIn/Xiaohongshu update posts.
- Scanner state: static config fingerprint plus local exported tool metadata analysis; config parsing now supports `mcpServers`, `projects[*].mcpServers`, `mcp.servers`, and top-level `servers`.
- External API calls: false.
- MCP server execution: false.
- Live `tools/list` requests: false.
- Web server: not started.
- Browser auto-open: false.
- GitHub Actions: CI verified on `main`, `v0.1.0-preview`, and `v0.2.0-preview`; v0.2 main run `28596477360` and tag run `28596494978` both passed.
- Artifact upload: only via explicit workflow step.
- Approval memory: local redacted JSON snapshots under user-chosen paths.
- Diff outputs: Markdown, JSON, and self-contained HTML.
- Thresholds: `--fail-on-change none|info|low|medium|high`.
- Discovery: `mcp-scope discover --root <path>` lists candidates only; it does not auto-scan or modify files.
- Client profile labels: compatibility hints only, not official integrations.
- Launch packaging: README first screens, SVG assets, docs indexes, examples indexes, community templates, launch checklist, feedback guide, post-launch roadmap, release draft, and launch notes are prepared locally.
- Launch pack: prepared under `launch/` with English and Chinese copy, social SVG assets, browser posting rules, posting tracker, feedback monitoring, and issue triage docs.
- Channel strategy: refined under `launch/CHANNEL_STRATEGY.md` and `launch/CHANNEL_STRATEGY.zh-CN.md`; Chinese platforms use zh-CN copy/assets, overseas platforms use en copy/assets, V2EX is skipped, Reddit is optional later, and Hacker News is manual high-reach only after GitHub/README review.
- Final human launch review: ready under `launch/FINAL_HUMAN_REVIEW.md` and `launch/FINAL_HUMAN_REVIEW.zh-CN.md`; no release or platform post was published automatically.
- Remote: `https://github.com/darwinx687-afk/mcp-scope`.
- Preview tags: `v0.1.0-preview`, `v0.2.0-preview`.
- GitHub prereleases: public prerelease at `https://github.com/darwinx687-afk/mcp-scope/releases/tag/v0.1.0-preview`; public prerelease at `https://github.com/darwinx687-afk/mcp-scope/releases/tag/v0.2.0-preview`; neither is a final/stable release.
- PNG launch assets: exported under `launch/assets/exports/` from repository-local SVG sources.
- Social channel state: LinkedIn and Xiaohongshu are posted; Juejin, Jike, WeChat group, WeChat moments, X / Twitter, and Dev.to remain manual-needed; Hacker News remains ready-to-post; V2EX and Reddit are skipped.
- Publishing state: public GitHub source repository, v0.1 public GitHub prerelease, v0.2 public GitHub prerelease, LinkedIn launch post, and Xiaohongshu launch post exist; no npm package, Marketplace listing, Pages site, deployment, or final/stable release was published.
- Feedback state: snapshots appended in `launch/FEEDBACK_SNAPSHOT.md` and `launch/FEEDBACK_SNAPSHOT.zh-CN.md`; exposure decision recorded in `launch/EXPOSURE_DECISION.md` and `launch/EXPOSURE_DECISION.zh-CN.md`; latest visible signals are GitHub 1 star/0 forks/0 issues/0 PRs, LinkedIn 1 reaction and 9 impressions, Xiaohongshu 40 views and 1 collect; no actionable feedback yet, so Phase 11 should wait.
- v0.2 planning state: README language switch, repo metadata recommendations, limitations docs, tool metadata export guide, discovery next-step hints, clearer report limitation wording, and versioned update workflow are the maintenance release focus.
- v0.2 review state: final review reports live under `launch/updates/v0.2.0-preview/FINAL_REVIEW.md` and `launch/updates/v0.2.0-preview/FINAL_REVIEW.zh-CN.md`; recommendation was `ready`, and the public prerelease is now live at `https://github.com/darwinx687-afk/mcp-scope/releases/tag/v0.2.0-preview`.
- v0.2 update-post state: LinkedIn and Xiaohongshu update copy/images are ready under `launch/updates/v0.2.0-preview/`; both are marked manual-needed with Codex in-app browser limitation notes. LinkedIn could open while logged in, but the post editor could not be filled through available in-app browser input paths. Xiaohongshu could open and switch to image posting, but file upload is not supported by Codex in-app browser.

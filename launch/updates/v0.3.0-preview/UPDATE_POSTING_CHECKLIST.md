# v0.3.0-preview Update Posting Checklist

Status: draft update posting workflow. Do not publish automatically.

## Before Any Post

- Confirm `v0.3.0-preview` is public as a prerelease before posting update logs.
- Confirm the tag points to the intended release commit.
- Confirm no npm package has been published.
- Confirm no GitHub Marketplace listing has been published.
- Confirm copy does not claim official integration or a security guarantee.
- Confirm images come from approved repository assets only.
- Confirm SARIF wording says optional upload, not automatic upload.

## LinkedIn

- Use `linkedin.md`.
- Use `assets/update-card-en.png`.
- English only.
- Preview before publishing.
- Add the real GitHub prerelease URL only after it exists.
- Record the final URL in `UPDATE_POSTING_TRACKER.md` after manual publication.

## Xiaohongshu

- Use `xiaohongshu.md`.
- Use `assets/update-card-square-zh-CN.png`.
- Chinese only.
- Preview before publishing.
- Confirm banned Chinese phrases are absent.
- Add the real GitHub prerelease URL only after it exists.
- Record the final URL in `UPDATE_POSTING_TRACKER.md` after manual publication.

## Stop Rules

- Stop for login, captcha, 2FA, or security checks.
- Stop if the platform changes the post text in a way that creates unsafe claims.
- Stop if the release status cannot be verified.
- Stop if the SARIF or audit wording implies runtime protection.

# v0.3.0-preview 更新发布检查清单

状态：更新发布流程草稿。不要自动发布。

## 发布任何内容前

- 确认 `v0.3.0-preview` 已经作为 public prerelease 发布后，再发布更新帖。
- 确认 tag 指向预期 commit。
- 确认没有发布 npm package。
- 确认没有发布 GitHub Marketplace listing。
- 确认文案没有声称官方集成或安全保证。
- 确认图片只使用仓库内批准的资产。
- 确认 SARIF 文案写的是可选上传，不是自动上传。

## LinkedIn

- 使用 `linkedin.md`。
- 使用 `assets/update-card-en.png`。
- 只发英文。
- 发布前预览。
- 只有真实 GitHub prerelease 存在后，才补链接。
- 人工发布后，把最终 URL 记录到 `UPDATE_POSTING_TRACKER.md`。

## 小红书

- 使用 `xiaohongshu.md`。
- 使用 `assets/update-card-square-zh-CN.png`。
- 只发中文。
- 发布前预览。
- 确认没有中文禁用词。
- 只有真实 GitHub prerelease 存在后，才补链接。
- 人工发布后，把最终 URL 记录到 `UPDATE_POSTING_TRACKER.md`。

## 停止规则

- 遇到登录、captcha、2FA 或安全检查时停止。
- 如果平台改写文案并产生不安全声明，停止。
- 如果 release 状态无法确认，停止。
- 如果 SARIF 或 audit 文案让人误解成运行时防护，停止。

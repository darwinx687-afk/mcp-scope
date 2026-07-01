# 最终人工发布审查

日期：2026-07-01

## 发布准备状态

状态：可以进入维护者人工审查，但还不能由自动化执行任何公开发布动作。

MCP Scope 已经准备好进行 `v0.1.0-preview` 的人工发布前审查。仓库、draft prerelease、CI、发布文案、SVG 图片、反馈监控手册、渠道策略、图片映射和发布记录表都已准备好。本次审查没有自动发布任何内容。

建议结论：

- 可以开始人工审查 GitHub draft prerelease。
- 只有维护者确认 release 页面和所选文案后，才可以手动发布。
- 不允许自动发布 release，不允许自动发布社交平台内容，不发布 npm，不发布 GitHub Marketplace，不修改仓库可见性。

## 已核对的状态

- 本报告生成前，Git tracked 文件是干净的；只有被忽略的 `reports/` 输出存在。
- 预期 remote：`https://github.com/darwinx687-afk/mcp-scope.git`。
- GitHub release：`v0.1.0-preview` 仍然是 draft/prerelease。
- 发布状态：`publishedAt` 是 `null`。
- 本报告生成前，最新 `main` CI 已通过，对应提交信息为 `chore: add final human launch review`。
- 本地检查：`pnpm check` 通过；`pnpm check:launch` 通过。
- CLI smoke：`discover` 和 `scan` 均通过。
- 必需的发布图片和平台文案草稿都存在。
- 中文平台使用中文文案和 zh-CN 图片。
- 英文平台使用英文文案和 en 图片，Hacker News 按纯文字处理。
- 不安全声明扫描：没有发现阻塞发布的正向声明。类似“未发布到 npm”“不是官方集成”的边界说明是有意保留的。

## GitHub Release 状态

GitHub prerelease 仍然是 draft prerelease。只有维护者人工检查 release 标题、release notes、需要附带的素材以及仓库首页后，才可以把它转为公开发布状态。

不要用自动化发布这个 release。

## 建议首发顺序

建议顺序：

1. GitHub prerelease，在人工审查后发布。
2. 掘金和 LinkedIn，作为 GitHub prerelease 后更稳妥的首批公开帖子。
3. X / Twitter，用来发简短英文反馈请求。
4. 小红书，先检查中文卡片，再把文案改得更轻、更少技术细节。
5. 即刻、微信群和朋友圈，用中文卡片做社区分享。
6. Hacker News，只有 GitHub 页面和 README 人工检查后再发。
7. Dev.to，可以放在 LinkedIn/X 后，作为长尾技术内容。

V2EX 本轮跳过。Reddit 放到之后可选，必须明确人工批准。

## 平台对应文件和图片

| 平台 | 文案文件 | 图片路径 | 备注 |
| --- | --- | --- | --- |
| GitHub prerelease | `launch/copy/github_release_final_review.md` | `launch/assets/release-banner-en.svg` | 转公开前必须人工审查。 |
| 掘金 | `launch/copy/juejin.md` | `launch/assets/release-banner-zh-CN.svg` | 更稳妥的中文技术首发。 |
| LinkedIn | `launch/copy/linkedin.md` | `launch/assets/social-card-en.svg` | 更稳妥的英文 builder 首发。 |
| X / Twitter | `launch/copy/x_twitter.md` | `launch/assets/social-card-en.svg` | 短帖或 thread。 |
| 小红书 | `launch/copy/xiaohongshu.md` | `launch/assets/social-card-square-zh-CN.svg` | 技术渠道确认后再发，语气更轻。 |
| 即刻 | `launch/copy/jike.md` | `launch/assets/social-card-zh-CN.svg` | 简短中文项目更新。 |
| 微信群 | `launch/copy/wechat_group.md` | `launch/assets/social-card-zh-CN.svg` | 只发相关群。 |
| 朋友圈 | `launch/copy/wechat_moments.md` | `launch/assets/social-card-square-zh-CN.svg` | 偏个人记录。 |
| Hacker News | `launch/copy/hackernews.md` | 无 | 纯文字 Show HN，除非人工另行决定。 |
| Dev.to | `launch/copy/devto.md` | `launch/assets/release-banner-en.svg` | 技术文章草稿。 |
| Reddit | `launch/copy/reddit.md` | 无 | 之后可选，必须明确人工批准。 |
| V2EX | `launch/copy/v2ex.md` | 无 | 本轮跳过，只保留文案归档。 |

## 手动发布提醒

- 每次发布前都要先预览。
- 登录、captcha、2FA 和安全检查都要暂停，交给人工处理。
- 不要在浏览器自动化里保存密码。
- 中文平台必须使用中文文案和 zh-CN 图片。
- 海外平台必须使用英文文案和 en 图片。
- 只使用 `launch/assets/` 里的 SVG 图片。
- 不要使用个人照片、随机相册图片、外部图片或远程图片。
- 不要声称已经发布 npm、已经发布 GitHub Marketplace、是任何 MCP 客户端的官方集成，也不要声称具备成熟安全保护或已有用户规模。
- 不要把 secret、完整私有配置、内部路径或敏感报告片段贴到公开讨论里。
- 安全相关输出继续使用“静态风险信号”“警告”“审查证据”这样的表达。

## 发布后要更新什么

任何手动发布完成后，都要更新 `launch/POSTING_TRACKER.md`：

- 把 `Status` 改为 `posted`、`failed` 或 `skipped`。
- 填写计划日期或实际日期。
- 填写发布 URL。
- 记录实际使用的图片。
- 记录发布前做过哪些修改。
- 摘要记录收到的反馈。
- 标记是否已经创建后续 GitHub issue。

## 首批反馈观察点

前 24 小时：

- GitHub issues 和评论。
- 安装或命令使用困惑。
- README 首屏是否讲清楚。
- false positive、false negative 和 config 形态请求。
- GitHub Action 失败，并保留 run link。

前 72 小时：

- 重复出现的措辞困惑。
- 重复出现的功能请求。
- 关于 npm 或 GitHub Marketplace 的请求。
- 需要提醒脱敏的安全敏感评论。
- 写入 `launch/FEEDBACK_TO_ROADMAP_REVIEW.md` 的前三个阻力点。

## 明确未发布声明

本次审查没有发布 GitHub prerelease，没有发布到任何平台，没有发布 npm，没有发布 GitHub Marketplace，也没有修改仓库可见性。

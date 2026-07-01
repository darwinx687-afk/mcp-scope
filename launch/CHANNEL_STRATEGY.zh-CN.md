# 发布渠道策略

所有发布都必须人工执行。不要用自动化发布 GitHub prerelease、社交平台内容、npm 包或 GitHub Marketplace listing。

## 首批渠道

中文：

1. 掘金
2. 小红书
3. 即刻
4. 微信群
5. 朋友圈

英文：

1. GitHub prerelease
2. LinkedIn
3. X / Twitter
4. Hacker News / Show HN
5. Dev.to

之后可选：

- Reddit，只有明确人工批准后再考虑。

V2EX 本轮跳过。

## 推荐发布顺序

1. 人工发布 GitHub prerelease。
2. 用中文 banner/card 发掘金技术文章。
3. 用英文 card 发 LinkedIn builder update。
4. 用英文 card 发 X / Twitter 短帖或 thread。
5. 用中文方形 card 发小红书，文案降低技术密度。
6. 用中文 card 分享到微信群、朋友圈和即刻。
7. GitHub 页面和 README 人工检查完成后，再考虑 Hacker News Show HN。
8. Dev.to 技术文章可以放在 LinkedIn/X 后，作为长尾内容。

## 平台映射

| 平台 | 语言 | 图片 | 文案文件 | 目标 |
| --- | --- | --- | --- | --- |
| GitHub prerelease | en | `launch/assets/release-banner-en.svg` | `launch/copy/github_release_final_review.md` | 让 preview 可以从仓库公开审查。 |
| 掘金 | zh-CN | `launch/assets/release-banner-zh-CN.svg` | `launch/copy/juejin.md` | 触达希望看技术细节的中文开发者。 |
| LinkedIn | en | `launch/assets/social-card-en.svg` | `launch/copy/linkedin.md` | 触达英文 builder 和平台工程受众。 |
| X / Twitter | en | `launch/assets/social-card-en.svg` | `launch/copy/x_twitter.md` | 发出简短公开反馈请求。 |
| 小红书 | zh-CN | `launch/assets/social-card-square-zh-CN.svg` | `launch/copy/xiaohongshu.md` | 用更轻的表达触达更宽的中文技术受众。 |
| 即刻 | zh-CN | `launch/assets/social-card-zh-CN.svg` | `launch/copy/jike.md` | 发一条简短中文项目更新。 |
| 微信群 | zh-CN | `launch/assets/social-card-zh-CN.svg` | `launch/copy/wechat_group.md` | 向相关群收集真实使用反馈。 |
| 朋友圈 | zh-CN | `launch/assets/social-card-square-zh-CN.svg` | `launch/copy/wechat_moments.md` | 以个人记录方式低压力分享。 |
| Hacker News | en | 无 | `launch/copy/hackernews.md` | 人工检查后，用 Show HN 获取高触达反馈。 |
| Dev.to | en | `launch/assets/release-banner-en.svg` | `launch/copy/devto.md` | 长尾技术说明。 |
| Reddit | en | 无 | `launch/copy/reddit.md` | 之后可选，必须明确人工批准。 |
| V2EX | zh-CN | 无 | `launch/copy/v2ex.md` | 本轮跳过，只保留文案归档。 |

## 为什么跳过 V2EX

本轮跳过 V2EX，是为了把首批发布集中在更适合这个 preview 的渠道：掘金承接技术细节，小红书/即刻/微信承接中文触达，GitHub/LinkedIn/X/HN/Dev.to 承接英文开发者可见度。

保留 `launch/copy/v2ex.md` 作为归档，但不要发布。

## 为什么 Reddit 放到之后可选

Reddit 有价值，但不同 subreddit 的规则和审核预期差异很大。先作为之后可选项处理，只有明确人工批准并检查具体社区规则后再发。

## 为什么 HN 触达高但更严格

Hacker News 触达高，但 Show HN 对表达清晰度、项目新意和可审查状态都比较敏感。只有 GitHub prerelease 已公开、README 已人工检查后，再考虑发布。

## 第一条应该发什么

第一步应该是 GitHub prerelease。之后更稳妥的首批公开帖子是掘金和 LinkedIn。

## 不要自动发布

不要自动发布。每次发布前都要人工预览。不要使用个人照片、随机相册图片、外部图片、远程图片，也不要编造 npm、Marketplace、官方集成、成熟安全保护或用户规模相关说法。

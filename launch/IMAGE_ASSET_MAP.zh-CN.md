# 图片素材映射

只使用 `launch/assets/` 下的本地文件。不要使用外部图片、远程图片、个人照片、随机相册图片或嵌入式位图。`launch/assets/exports/` 下的 PNG 文件由本仓库里的 SVG 源文件导出。

## 中文图片

- SVG 源文件：`launch/assets/social-card-zh-CN.svg`
- PNG 上传文件：`launch/assets/exports/social-card-zh-CN.png`
- SVG 源文件：`launch/assets/social-card-square-zh-CN.svg`
- PNG 上传文件：`launch/assets/exports/social-card-square-zh-CN.png`
- SVG 源文件：`launch/assets/release-banner-zh-CN.svg`
- PNG 上传文件：`launch/assets/exports/release-banner-zh-CN.png`

这些图片只配中文文案。

## 英文图片

- SVG 源文件：`launch/assets/social-card-en.svg`
- PNG 上传文件：`launch/assets/exports/social-card-en.png`
- SVG 源文件：`launch/assets/social-card-square-en.svg`
- PNG 上传文件：`launch/assets/exports/social-card-square-en.png`
- SVG 源文件：`launch/assets/release-banner-en.svg`
- PNG 上传文件：`launch/assets/exports/release-banner-en.png`

这些图片只配英文文案。

## 平台映射

| 平台 | 语言 | SVG 源文件 | PNG 上传路径 | 备注 |
| --- | --- | --- | --- | --- |
| GitHub prerelease | en | `launch/assets/release-banner-en.svg` | `launch/assets/exports/release-banner-en.png` | 公开 prerelease 已发布；GitHub release 未上传图片。 |
| 掘金 | zh-CN | `launch/assets/release-banner-zh-CN.svg` | `launch/assets/exports/release-banner-zh-CN.png` | 中文技术文章。 |
| 小红书 | zh-CN | `launch/assets/social-card-square-zh-CN.svg` | `launch/assets/exports/social-card-square-zh-CN.png` | 只使用中文方形卡片。 |
| 即刻 | zh-CN | `launch/assets/social-card-zh-CN.svg` | `launch/assets/exports/social-card-zh-CN.png` | 只使用中文社交卡片。 |
| 微信群 | zh-CN | `launch/assets/social-card-zh-CN.svg` | `launch/assets/exports/social-card-zh-CN.png` | 只使用中文社交卡片。 |
| 朋友圈 | zh-CN | `launch/assets/social-card-square-zh-CN.svg` | `launch/assets/exports/social-card-square-zh-CN.png` | 只使用中文方形卡片。 |
| LinkedIn | en | `launch/assets/social-card-en.svg` | `launch/assets/exports/social-card-en.png` | 只使用英文社交卡片。 |
| X / Twitter | en | `launch/assets/social-card-en.svg` | `launch/assets/exports/social-card-en.png` | 只使用英文社交卡片。 |
| Dev.to | en | `launch/assets/release-banner-en.svg` | `launch/assets/exports/release-banner-en.png` | 只使用英文 release banner。 |
| Hacker News | en | 无 | 无 | 默认纯文字，除非人工另行决定。 |
| Reddit | en | 无 | 无 | 本轮跳过。 |
| V2EX | zh-CN | 无 | 无 | 本轮跳过。 |

## 卡片文字

中文卡片：

- 标题：MCP 透镜
- 副标题：在信任 MCP 工具前，先看清配置和工具元数据
- 标签：静态分析、不执行 MCP server、不调用外部 API、secret 值已隐藏

英文卡片：

- Title: MCP Scope
- Subtitle: Local-first transparency reports for MCP tools
- Badges: Static analysis only, No server execution, No external API calls, Secret values redacted

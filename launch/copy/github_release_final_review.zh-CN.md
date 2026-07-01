# GitHub Release 最终审查文案

不要自动发布。维护者没有明确确认前，不要把 draft prerelease 转为正式发布。

## 标题

`v0.1.0-preview`

## Release 正文

以 `docs/RELEASE_DRAFT.md` 作为 release notes 来源。

发布前确认：

- Draft prerelease 仍是 `isDraft: true`。
- 最新 `main` CI 已通过。
- Tag CI 已通过。
- README 和文档没有 npm、Marketplace、生产级安全保证等说法。
- Launch 文案和 SVG 图片已审查。
- 反馈监控已准备好。

## 链接

https://github.com/darwinx687-afk/mcp-scope

## 建议图片

`launch/assets/release-banner-zh-CN.svg`

## 发布备注

等待 release 最终确认。本文件只是审查辅助，不是发布命令。

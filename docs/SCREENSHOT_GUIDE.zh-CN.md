# 截图指南

Phase 8 不要求生成截图。当前 SVG 资产已经足够用于发布前包装，本轮不生成 PNG 截图。

## 安全来源

- `examples/viewer/sample-combined-viewer.html`
- `examples/viewer/sample-combined-viewer.zh-CN.html`
- 使用安全示例文件得到的本地 CLI 输出。
- 使用安全示例文件得到的 GitHub Action job summary。

## 建议截图

- README 首屏，能看到 banner。
- `discover` 的 CLI 输出。
- HTML viewer 的 summary 区域。
- Diff report 的 summary。
- GitHub Action summary 表格。

## 安全规则

- 不使用个人照片。
- 不使用随机相册图片。
- 不展示真实 secret。
- 不展示私有 config。
- 不展示私有路径、用户名、内部 hostname 或客户名称。
- 不使用暗示官方集成或生产级防护的截图。

公开发布前请人工检查每张截图。报告和 summary 可能包含工具名、描述、路径提示、URL host 和 config 字段名。

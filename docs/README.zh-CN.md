# MCP Scope 文档

这里整理 MCP Scope 的本地报告、静态审查流程和发布前准备文档。

## 先看这些

- [局限与路线图](LIMITATIONS.zh-CN.md)：当前边界、v0.2 会改善什么，以及后续版本候选方向。
- [工具元数据导出指南](TOOL_METADATA_EXPORT_GUIDE.zh-CN.md)：如何安全准备本地 `--tools` JSON。
- [报告指南](REPORT_GUIDE.zh-CN.md)：如何阅读 Markdown、JSON 和 HTML 透明度报告。
- [报告 schema](REPORT_SCHEMA.md)：给自动化和审查使用的稳定 JSON 字段。
- [SARIF 输出](SARIF.zh-CN.md)：生成 SARIF，并可选上传到 GitHub Code Scanning。
- [HTML 查看器指南](VIEWER_GUIDE.zh-CN.md)：本地自包含 HTML 查看器。
- [GitHub Action](GITHUB_ACTION.zh-CN.md)：在 PR 检查中使用本仓库 composite action。
- [审批记忆](APPROVAL_MEMORY.zh-CN.md)：本地脱敏 snapshot 和静态 diff。
- [客户端兼容说明](ECOSYSTEM_COMPATIBILITY.zh-CN.md)：当前支持的本地配置形态和 client-profile-like 标签。
- [Discovery](DISCOVERY.zh-CN.md)：只查找可能的本地 MCP config 文件，不自动扫描。
- [截图指南](SCREENSHOT_GUIDE.zh-CN.md)：安全截图来源和发布前检查规则。
- [FAQ](FAQ.zh-CN.md)：常见问题的简短回答。
- [示例索引](../examples/README.zh-CN.md)：安全的示例配置、工具元数据和报告。
- [发布素材包](../launch/README.zh-CN.md)：准备好的文案、社交卡片、发布记录表和反馈手册。
- [仓库元数据建议](REPO_METADATA.zh-CN.md)：建议的 GitHub 描述和 topics。

## 项目协作

- [贡献说明](../CONTRIBUTING.md)
- [安全政策](../SECURITY.md)
- [发布检查清单](LAUNCH_CHECKLIST.zh-CN.md)
- [远程发布状态](REMOTE_LAUNCH_STATE.zh-CN.md)
- [反馈指南](FEEDBACK_GUIDE.zh-CN.md)
- [发布后路线](ROADMAP_AFTER_LAUNCH.zh-CN.md)
- [Release 草稿](RELEASE_DRAFT.zh-CN.md)
- [v0.2 更新流程](../launch/updates/README.zh-CN.md)
- [发布素材包](../launch/README.zh-CN.md)

## English Docs

- [Docs index](README.md)
- [Report guide](REPORT_GUIDE.md)
- [Limitations and roadmap](LIMITATIONS.md)
- [Tool metadata export guide](TOOL_METADATA_EXPORT_GUIDE.md)
- [HTML viewer guide](VIEWER_GUIDE.md)
- [GitHub Action](GITHUB_ACTION.md)
- [SARIF output](SARIF.md)
- [Approval memory](APPROVAL_MEMORY.md)
- [Ecosystem compatibility](ECOSYSTEM_COMPATIBILITY.md)
- [Discovery](DISCOVERY.md)
- [Screenshot guide](SCREENSHOT_GUIDE.md)
- [FAQ](FAQ.md)
- [Examples index](../examples/README.md)
- [Launch pack](../launch/README.md)
- [Repository metadata recommendation](REPO_METADATA.md)

## 边界

MCP Scope 不执行 MCP server，不发送实时 `tools/list` 请求，不调用外部 AI API，不自动上传报告，也不做完整安全保证。发现项是静态风险信号和透明度提示。

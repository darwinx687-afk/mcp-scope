![MCP Scope banner](assets/banner.svg)

# MCP Scope / MCP 透镜

本地优先的 MCP 工具元数据、server 配置和 AI Agent 工具权限透明度审计报告工具。

状态：早期预览。MCP Scope 适合本地审查和 CI 可见性检查，但它不是完整安全产品，也不做生产级安全保证。

## 哪些事情留在本地

- 不执行 MCP server。
- 不发送实时 `tools/list` 请求。
- 不调用外部 AI API。
- 不需要登录、数据库、云同步或遥测。
- MCP Scope 渲染报告时会隐藏 `env`、`headers`、URL query 和疑似 secret 的 schema 示例值。
- 发现项是静态风险信号和透明度提示，不是被攻击的证明，也不是安全证明。

## 本地运行

```bash
pnpm install
pnpm build

node apps/cli/dist/index.js discover --root examples/clients
node apps/cli/dist/index.js scan --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.json
node apps/cli/dist/index.js diff --baseline examples/snapshots/filesystem-approved.snapshot.json --config examples/claude-desktop-filesystem.json --tools examples/tools/filesystem-tools.changed-description.json
```

三个最常用入口：

- `discover`：列出可能的本地 MCP config 文件，不自动扫描，也不修改文件。
- `scan`：检查一个本地 MCP config，可选检查已导出的工具元数据。
- `diff`：把当前本地 config/工具元数据和脱敏审批记忆 snapshot 做静态对比。

示例输出：

- [Markdown 示例报告](examples/reports/sample-combined-report.md)
- [JSON 示例报告](examples/reports/sample-combined-report.json)
- [HTML 查看器示例](examples/viewer/sample-combined-viewer.html)

## 它是什么

MCP Scope 帮助开发者在信任 MCP 工具前，看清楚发生了什么变化、暴露了什么、哪些地方值得审查。

当前能力：

- 发现可能的本地 MCP config 文件。
- 扫描 MCP config server 条目。
- 检查本地已导出的 MCP 工具元数据。
- 识别静态工具元数据风险信号。
- 生成 Markdown、JSON 和本地自包含 HTML 报告。
- 生成英文和中文 Markdown 报告。
- 创建本地审批记忆 snapshot，并做静态 diff。
- 作为本地仓库 GitHub Action 质量门禁运行。

## 它不是什么

- 不是恶意软件扫描器。
- 不是完整安全产品。
- 不是任何 MCP 客户端的官方集成。
- 不是 SaaS、托管 dashboard、chatbot 或通用 Agent 框架。
- 不会执行 MCP server，也不会偷偷拉取实时工具元数据。

## GitHub Action

可以在本仓库 workflow 中使用根目录 composite action。MCP Scope 还没有发布到 GitHub Marketplace。

```yaml
name: MCP Scope

on:
  pull_request:
  push:

permissions:
  contents: read

jobs:
  mcp-scope:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v5

      - uses: ./
        with:
          config: examples/claude-desktop-filesystem.json
          tools: examples/tools/filesystem-tools.json
          report-format: markdown
          report-path: mcp-scope-report.md
          fail-on: high
          lang: zh-CN
```

输入、输出、阈值、job summary 和 artifact 上传示例见 [GitHub Action 文档](docs/GITHUB_ACTION.zh-CN.md)。

## 发布 / 反馈

公开仓库在 [github.com/darwinx687-afk/mcp-scope](https://github.com/darwinx687-afk/mcp-scope)。`v0.1.0-preview` 已公开为 prerelease，不是正式稳定版。

- [发布说明](LAUNCH_NOTES.zh-CN.md)
- [反馈指南](docs/FEEDBACK_GUIDE.zh-CN.md)
- [发布素材包](launch/README.zh-CN.md)
- [远程发布状态](docs/REMOTE_LAUNCH_STATE.zh-CN.md)

开 issue 前请先脱敏 secret、私有配置、内部路径和敏感报告片段。

## 文档

- [文档索引](docs/README.zh-CN.md)
- [示例索引](examples/README.zh-CN.md)
- [报告指南](docs/REPORT_GUIDE.zh-CN.md)
- [报告 schema](docs/REPORT_SCHEMA.md)
- [HTML 查看器指南](docs/VIEWER_GUIDE.zh-CN.md)
- [审批记忆](docs/APPROVAL_MEMORY.zh-CN.md)
- [Discovery](docs/DISCOVERY.zh-CN.md)
- [客户端兼容说明](docs/ECOSYSTEM_COMPATIBILITY.zh-CN.md)
- [远程发布状态](docs/REMOTE_LAUNCH_STATE.zh-CN.md)
- [发布素材包](launch/README.zh-CN.md)
- [截图指南](docs/SCREENSHOT_GUIDE.zh-CN.md)
- [FAQ](docs/FAQ.zh-CN.md)
- [安全政策](SECURITY.md)
- [贡献说明](CONTRIBUTING.md)
- [English README](README.md)

## 局限

- 静态分析不能证明某个 server 安全，也不能证明它已被攻击。
- 工具元数据需要来自本地导出文件；MCP Scope 不查询实时 server。
- 带 `-like` 的 client profile 是兼容性提示，不是官方集成声明。
- Discovery 只找可能的 config 文件，用户自己选择要扫描哪个。
- GitHub Action 的失败阈值只基于静态报告严重程度。

后续计划见 [ROADMAP.md](ROADMAP.md) 和 [发布后路线](docs/ROADMAP_AFTER_LAUNCH.zh-CN.md)。

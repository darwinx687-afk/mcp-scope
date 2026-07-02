# 小红书更新草稿

Language: zh-CN

不要自动发布。发布前必须人工预览。

项目地址：
https://github.com/darwinx687-afk/mcp-scope

GitHub prerelease：
尚未发布。只有人工发布 `v0.3.0-preview` 之后，才能补真实 prerelease 链接。

## 草稿

MCP Scope / MCP 透镜的 v0.3 方向准备做得更方便试用一点。

这次主题是：GitHub 原生报告与一键审计版。

主要变化：

- 一条 `audit --root <path>` 命令，先做静态 discovery，再扫描可解析的 MCP config 候选文件
- `scan`、`inspect-tools` 和 `audit` 都可以输出 SARIF
- 如果你在 GitHub 上用 Code Scanning，可以选择把 SARIF 上传进去
- 报告里会继续写清楚哪些事情没有做

边界还是不变：

- 不执行 MCP server
- 不发送实时 `tools/list`
- 不调用外部 AI API
- 不声明 npm 或 GitHub Marketplace 可用
- 发现项只是静态风险信号，不是安全证明

我希望这个版本让第一次试用更顺：先跑一条 audit 命令看仓库里有哪些可解析配置，再决定是否补本地导出的 tools metadata。

项目地址：
https://github.com/darwinx687-afk/mcp-scope

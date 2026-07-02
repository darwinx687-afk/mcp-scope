# v0.2.0-preview

状态：draft，尚未发布。

主题：双语入口与使用体验完善版。

## 这次改了什么

- README 第一屏增加清楚的语言切换。
- 增加 GitHub 仓库 description 和 topics 建议文档。
- 增加局限说明文档，把当前边界、v0.2 改进、后续版本和非目标分开写清楚。
- 增加工具元数据导出指南，说明支持的本地 JSON 形态。
- 改进 discovery 下一步提示，让可解析候选文件显示安全的 scan 命令。
- 准备 LinkedIn 和小红书的可重复更新发布流程文件。

## 为什么重要

v0.1 让 MCP Scope 可以公开审查。v0.2 计划先降低理解和上手成本：双语入口更清楚，局限说明更直接，工具元数据准备方式更安全，discovery 之后下一步也更明确。

## 仍然没有改变什么

- 不执行 MCP server。
- 不发送实时 `tools/list` 请求。
- 不调用外部 AI API。
- 不声明 npm package 可用。
- 不声明 GitHub Marketplace 可用。
- 不做生产级安全保护声明。
- 发现项仍然是静态风险信号，不证明被攻击，也不证明安全。

## 发布状态

这只是 draft update note。没有明确人工批准前，不要基于本文件发布 release 或创建 tag。

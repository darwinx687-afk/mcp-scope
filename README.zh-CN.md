# MCP Scope / MCP 透镜

MCP Scope 是一个本地优先的 MCP 工具元数据、服务配置与 AI Agent 工具权限透明化审计工具。

当前项目处于 Phase 0 / 早期预览阶段。它还不是可用于生产环境的完整安全产品，不做完整安全保证，也不会在 Phase 0 执行 MCP 服务。

## 当前边界

- 核心 Phase 0 检查不调用外部 API。
- 不需要登录。
- 不使用数据库。
- 默认不依赖云服务。
- 还没有真正的 MCP 元数据扫描。
- Phase 0 不执行 MCP 服务。

## CLI

当前只有占位命令：

```bash
mcp-scope --help
mcp-scope --version
mcp-scope status
```

`mcp-scope status` 只输出项目基础状态：

```json
{
  "project": "mcp-scope",
  "name": "MCP Scope",
  "phase": 0,
  "status": "foundation-ready",
  "scanner": "not-implemented-yet",
  "externalApiCalls": false
}
```

## 本地开发

```bash
pnpm install
pnpm check
```

## 路线预览

- Phase 1：第一个真实的 MCP 配置指纹。
- Phase 2：工具元数据结构与风险规则引擎。
- Phase 3：Markdown/JSON 透明度报告。
- Phase 4：本地只读查看器。
- Phase 5：GitHub Action 质量门禁。
- Phase 6：工具元数据差异与审批记忆。

完整路线见 `ROADMAP.md`。

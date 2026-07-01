# 发布说明

MCP Scope 还没有正式发布。

Phase 5 增加了稳定 JSON 透明度报告、双语 Markdown 报告、本地自包含 HTML 查看器、本地 composite GitHub Action 质量门禁、报告文档和精选示例报告。

不要把当前项目描述成可用于生产环境的完整安全产品。不要声称它能发现所有恶意 MCP 服务，也不要做安全保证。当前扫描和 action 不会执行 MCP 服务，不会向实时服务发送 `tools/list` 请求，不会为报告启动 web server，不会自动上传文件，也不会调用外部 API。

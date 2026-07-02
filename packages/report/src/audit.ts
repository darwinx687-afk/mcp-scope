import type { McpScopeAuditResult, McpScopeAuditSkippedCandidate, McpScopeScanResult } from "@mcp-scope/core";
import type { ReportRenderOptions } from "./index.js";
import { escapeHtml } from "./html.js";

export function renderAuditJson(audit: McpScopeAuditResult): string {
  return `${JSON.stringify(audit, null, 2)}\n`;
}

export function renderAuditMarkdown(
  audit: McpScopeAuditResult,
  options: ReportRenderOptions = {}
): string {
  return options.lang === "zh-CN" ? renderAuditMarkdownZh(audit) : renderAuditMarkdownEn(audit);
}

export function renderAuditHtml(
  audit: McpScopeAuditResult,
  options: ReportRenderOptions = {}
): string {
  const lang = options.lang ?? "en";
  const zh = lang === "zh-CN";

  return [
    "<!doctype html>",
    `<html lang="${escapeAttribute(lang)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>MCP Scope Audit Report</title>",
    `<style>${css()}</style>`,
    "</head>",
    "<body>",
    '<main class="page">',
    "<header>",
    `<p>${escapeHtml(zh ? "仅做静态审计" : "Static audit only")}</p>`,
    "<h1>MCP Scope Audit Report</h1>",
    `<p>${escapeHtml(zh ? "发现候选配置并扫描可解析 config，不执行 MCP server，不请求 tools/list。" : "Discovers config candidates and scans parseable configs without MCP server execution or live tools/list requests.")}</p>`,
    "</header>",
    '<section class="cards">',
    card(zh ? "候选文件" : "Candidates", audit.summary.candidateCount),
    card(zh ? "已扫描配置" : "Scanned configs", audit.summary.parsedConfigCount),
    card(zh ? "Servers" : "Servers", audit.summary.serverCount),
    card(zh ? "最高严重程度" : "Highest severity", audit.summary.highestSeverity),
    "</section>",
    section(zh ? "审计范围" : "Audit Scope", keyValues([
      ["rootPathDisplay", audit.rootPathDisplay],
      ["maxDepth", audit.maxDepth],
      ["includeHome", audit.includeHome],
      ["mcpServerExecution", audit.mcpServerExecution],
      ["externalApiCalls", audit.externalApiCalls],
      ["toolsListRequestSent", audit.toolsListRequestSent],
      ["secretValuesRedacted", audit.secretValuesRedacted]
    ])),
    section(zh ? "Discovery 摘要" : "Discovery Summary", keyValues([
      ["candidateCount", audit.discovery.summary.candidateCount],
      ["parsedCount", audit.discovery.summary.parsedCount],
      ["skippedCount", audit.discovery.summary.skippedCount],
      ["invalidJsonCount", audit.discovery.summary.invalidJsonCount],
      ["unsupportedCount", audit.discovery.summary.unsupportedCount]
    ])),
    section(zh ? "候选文件" : "Candidates", candidateTable(audit)),
    section(zh ? "逐个配置摘要" : "Per-Config Findings And Notes", perConfigHtml(audit.scannedConfigs, zh)),
    section(zh ? "下一步" : "Next Steps", list(zh ? zhNextSteps() : audit.nextSteps)),
    section(zh ? "局限性" : "Limitations", list(zh ? zhLimitations() : audit.limitations.notes)),
    "</main>",
    "</body>",
    "</html>"
  ].join("\n");
}

function renderAuditMarkdownEn(audit: McpScopeAuditResult): string {
  return [
    "# MCP Scope Audit Report",
    "",
    "- Static audit only",
    `- MCP server execution: ${String(audit.mcpServerExecution)}`,
    `- External API calls: ${String(audit.externalApiCalls)}`,
    `- Live tools/list requests: ${String(audit.toolsListRequestSent)}`,
    `- Secret values redacted: ${String(audit.secretValuesRedacted)}`,
    "",
    "## Discovery Summary",
    "",
    `- Root path: ${audit.rootPathDisplay}`,
    `- Candidate count: ${audit.summary.candidateCount}`,
    `- Parsed config count: ${audit.summary.parsedConfigCount}`,
    `- Skipped count: ${audit.summary.skippedCount}`,
    `- Server count: ${audit.summary.serverCount}`,
    "",
    "## Scanned Config Summary",
    "",
    `- Highest severity: ${audit.summary.highestSeverity}`,
    `- Finding/note count: ${audit.summary.findingCount}`,
    "",
    "## Candidate Table",
    "",
    candidateTableMarkdown(audit),
    "",
    "## Per-Config Findings And Notes",
    "",
    ...perConfigMarkdown(audit.scannedConfigs, "en"),
    "",
    "## Next Steps",
    "",
    ...audit.nextSteps.map((step) => `- ${step}`),
    "",
    "## Limitations",
    "",
    ...audit.limitations.notes.map((note) => `- ${note}`)
  ].join("\n");
}

function renderAuditMarkdownZh(audit: McpScopeAuditResult): string {
  return [
    "# MCP Scope Audit Report",
    "",
    "- 仅做静态审计",
    `- MCP server execution: ${String(audit.mcpServerExecution)}`,
    `- External API calls: ${String(audit.externalApiCalls)}`,
    `- Live tools/list requests: ${String(audit.toolsListRequestSent)}`,
    `- Secret values redacted: ${String(audit.secretValuesRedacted)}`,
    "",
    "## Discovery 摘要",
    "",
    `- Root path: ${audit.rootPathDisplay}`,
    `- Candidate count: ${audit.summary.candidateCount}`,
    `- Parsed config count: ${audit.summary.parsedConfigCount}`,
    `- Skipped count: ${audit.summary.skippedCount}`,
    `- Server count: ${audit.summary.serverCount}`,
    "",
    "## 已扫描 Config 摘要",
    "",
    `- Highest severity: ${audit.summary.highestSeverity}`,
    `- Finding/note count: ${audit.summary.findingCount}`,
    "",
    "## 候选文件",
    "",
    candidateTableMarkdown(audit),
    "",
    "## 逐个 Config 发现项和提示",
    "",
    ...perConfigMarkdown(audit.scannedConfigs, "zh-CN"),
    "",
    "## 下一步",
    "",
    ...zhNextSteps().map((step) => `- ${step}`),
    "",
    "## 局限性",
    "",
    ...zhLimitations().map((note) => `- ${note}`)
  ].join("\n");
}

function candidateTableMarkdown(audit: McpScopeAuditResult): string {
  if (audit.discovery.candidates.length === 0) {
    return "No candidates found.";
  }

  return [
    "| Path | Status | Shape | Profile | Servers | Risk | Notes |",
    "| --- | --- | --- | --- | ---: | --- | --- |",
    ...audit.discovery.candidates.map((candidate) => [
      tableCell(candidate.pathDisplay),
      tableCell(candidate.parseStatus),
      tableCell(candidate.detectedShape),
      tableCell(candidate.clientProfile),
      String(candidate.serverCount),
      tableCell(candidate.riskPreview),
      tableCell(candidate.notes.join(", ") || "none")
    ].join(" | "))
  ].join("\n");
}

function perConfigMarkdown(scans: readonly McpScopeScanResult[], lang: "en" | "zh-CN"): string[] {
  if (scans.length === 0) {
    return [lang === "zh-CN" ? "没有可扫描的 config。" : "No parseable configs were scanned."];
  }

  return scans.flatMap((scan) => [
    `### ${scan.sourceFile ?? "unknown"}`,
    "",
    `- Source shape: ${scan.sourceShape}`,
    `- Client profile: ${scan.clientProfile}`,
    `- Server count: ${scan.serverCount}`,
    `- Highest severity: ${scan.highestRiskLevel}`,
    "",
    serverTableMarkdown(scan),
    "",
    ...noteLines(scan, lang),
    ""
  ]);
}

function serverTableMarkdown(scan: McpScopeScanResult): string {
  if (scan.servers.length === 0) {
    return "No MCP server entries found.";
  }

  return [
    "| Server | Transport | Command/URL | Env keys | Header keys | Risk |",
    "| --- | --- | --- | ---: | ---: | --- |",
    ...scan.servers.map((server) => [
      tableCell(server.name),
      tableCell(server.transport),
      tableCell(server.hasCommand ? server.commandSummary : server.rawUrlRedacted ?? "none"),
      String(server.envKeyCount),
      String(server.headerKeyCount),
      tableCell(server.riskLevel)
    ].join(" | "))
  ].join("\n");
}

function noteLines(scan: McpScopeScanResult, lang: "en" | "zh-CN"): string[] {
  const notes = [
    ...scan.transparencyNotes.map((note) => ({ label: "config", note })),
    ...scan.servers.flatMap((server) => server.transparencyNotes.map((note) => ({ label: server.name, note })))
  ];

  if (notes.length === 0) {
    return [lang === "zh-CN" ? "- 没有额外透明度提示。" : "- No additional transparency notes."];
  }

  return notes.map(({ label, note }) => `- ${note.level} / ${label} / ${note.code}: ${note.message}`);
}

function candidateTable(audit: McpScopeAuditResult): string {
  if (audit.discovery.candidates.length === 0) {
    return `<p class="muted">${escapeHtml("No candidates found.")}</p>`;
  }

  return table(
    ["Path", "Status", "Shape", "Profile", "Servers", "Risk", "Notes"],
    audit.discovery.candidates.map((candidate) => [
      candidate.pathDisplay,
      candidate.parseStatus,
      candidate.detectedShape,
      candidate.clientProfile,
      candidate.serverCount,
      candidate.riskPreview,
      candidate.notes.join(", ") || "none"
    ])
  );
}

function perConfigHtml(scans: readonly McpScopeScanResult[], zh: boolean): string {
  if (scans.length === 0) {
    return `<p class="muted">${escapeHtml(zh ? "没有可扫描的 config。" : "No parseable configs were scanned.")}</p>`;
  }

  return scans.map((scan) => `
    <article class="config">
      <h3>${escapeHtml(scan.sourceFile ?? "unknown")}</h3>
      ${keyValues([
        ["sourceShape", scan.sourceShape],
        ["clientProfile", scan.clientProfile],
        ["serverCount", scan.serverCount],
        ["highestSeverity", scan.highestRiskLevel]
      ])}
      ${table(
        ["Server", "Transport", "Command/URL", "Env keys", "Header keys", "Risk"],
        scan.servers.map((server) => [
          server.name,
          server.transport,
          server.hasCommand ? server.commandSummary : server.rawUrlRedacted ?? "none",
          server.envKeyCount,
          server.headerKeyCount,
          server.riskLevel
        ])
      )}
      ${list(noteLines(scan, zh ? "zh-CN" : "en").map((line) => line.replace(/^- /, "")))}
    </article>`
  ).join("");
}

function zhNextSteps(): readonly string[] {
  return [
    "查看已扫描 config 摘要；如果已有本地导出的 tool metadata，再运行 `mcp-scope scan --config <path> --tools <tools.json>`。",
    "需要 SARIF 时运行 `mcp-scope audit --root <path> --format sarif --output reports/mcp-scope.sarif`。",
    "只有在你明确需要 GitHub Code Scanning 展示时，才在 GitHub Actions 里添加 upload-sarif。"
  ];
}

function zhLimitations(): readonly string[] {
  return [
    "audit mode 只组合静态 discovery 和静态 config scan。",
    "MCP Scope 没有执行 MCP server。",
    "MCP Scope 没有请求实时 tools/list。",
    "audit mode 不推断 tool metadata；需要时请手动提供已导出的 tools JSON。",
    "发现项是静态风险信号，不是被攻击的证明，也不是安全证明。"
  ];
}

function section(title: string, body: string): string {
  return `<section><h2>${escapeHtml(title)}</h2>${body}</section>`;
}

function keyValues(rows: readonly [string, unknown][]): string {
  return `<dl>${rows.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
}

function card(label: string, value: unknown): string {
  return `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`;
}

function list(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  if (rows.length === 0) {
    return `<p class="muted">${escapeHtml("None")}</p>`;
  }

  return [
    '<div class="table-wrap"><table>',
    `<thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>`,
    "<tbody>",
    ...rows.map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join("")}</tr>`),
    "</tbody></table></div>"
  ].join("");
}

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\s+/g, " ");
}

function escapeAttribute(value: unknown): string {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function css(): string {
  return `
    :root { --ink: #172033; --muted: #64748b; --line: #dbe3ef; --panel: #ffffff; --bg: #eef3f8; --accent: #0f766e; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--bg); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; }
    .page { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 40px; }
    header, section { margin-top: 18px; padding: 22px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
    header { margin-top: 0; }
    header p { margin: 0 0 8px; color: var(--muted); }
    h1, h2, h3 { margin: 0 0 14px; letter-spacing: 0; }
    .cards { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 12px; }
    .cards article, .config { min-width: 0; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfe; }
    .cards span { display: block; color: var(--muted); font-size: 13px; }
    .cards strong { display: block; margin-top: 8px; font-size: 26px; overflow-wrap: anywhere; }
    dl { display: grid; gap: 8px; margin: 0 0 16px; }
    dl div { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
    dt { color: var(--muted); font-weight: 750; }
    dd { margin: 0; overflow-wrap: anywhere; }
    .table-wrap { overflow-x: auto; margin: 10px 0 16px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 11px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0; }
    .muted { color: var(--muted); }
    @media (max-width: 780px) { .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } dl div { grid-template-columns: 1fr; } }
  `;
}

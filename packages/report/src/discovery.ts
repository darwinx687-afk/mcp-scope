import type { McpConfigCandidate, McpConfigDiscoveryResult } from "@mcp-scope/core";
import type { ReportRenderOptions } from "./index.js";

export function renderDiscoveryJson(result: McpConfigDiscoveryResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function renderDiscoveryMarkdown(
  result: McpConfigDiscoveryResult,
  options: ReportRenderOptions = {}
): string {
  return options.lang === "zh-CN" ? renderDiscoveryMarkdownZh(result) : renderDiscoveryMarkdownEn(result);
}

export function renderDiscoveryHtml(
  result: McpConfigDiscoveryResult,
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
    "<title>MCP Scope Discovery Report</title>",
    `<style>${css()}</style>`,
    "</head>",
    "<body>",
    '<main class="page">',
    "<header>",
    `<p>${escapeHtml(zh ? "仅做静态发现" : "Static discovery only")}</p>`,
    "<h1>MCP Scope Discovery Report</h1>",
    `<p>${escapeHtml(zh ? "不执行 MCP server，不联网，不读取工具列表。" : "No MCP server execution, no network calls, no live tools/list requests.")}</p>`,
    "</header>",
    '<section class="cards">',
    card(zh ? "候选文件" : "Candidates", result.summary.candidateCount),
    card(zh ? "可解析" : "Parsed", result.summary.parsedCount),
    card(zh ? "跳过" : "Skipped", result.summary.skippedCount),
    card(zh ? "不支持" : "Unsupported", result.summary.unsupportedCount),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "发现范围" : "Discovery Scope")}</h2>`,
    keyValues([
      ["rootPathDisplay", result.rootPathDisplay],
      ["maxDepth", result.maxDepth],
      ["includeHome", result.includeHome],
      ["externalApiCalls", result.externalApiCalls],
      ["serverExecution", result.serverExecution]
    ]),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "候选文件" : "Candidates")}</h2>`,
    result.candidates.length === 0
      ? `<p class="muted">${escapeHtml(zh ? "没有发现候选文件。" : "No candidates found.")}</p>`
      : table(result.candidates),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "下一步" : "Next Steps")}</h2>`,
    list(zh
      ? [
        "选择一个候选路径后运行 `mcp-scope scan --config <path>`。",
        "如果你已经导出了 tools/list metadata，可以额外提供 `--tools <path>`。",
        "discover 不会自动扫描每个候选文件，也不会修改配置。"
      ]
      : [
        "Pick a candidate path and run `mcp-scope scan --config <path>`.",
        "If you have exported tools/list metadata, add `--tools <path>`.",
        "discover does not auto-scan every candidate or modify config files."
      ]),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "局限性" : "Limitations")}</h2>`,
    list(zh
      ? [
        "只根据文件名和本地 JSON 结构做静态判断。",
        "不代表任何客户端官方集成。",
        "发现项是候选路径，不是安全结论。"
      ]
      : [
        "Discovery uses filename patterns and local JSON shape checks only.",
        "Client profile labels are not official integration claims.",
        "Candidates are review starting points, not security conclusions."
      ]),
    "</section>",
    "</main>",
    "</body>",
    "</html>"
  ].join("\n");
}

function renderDiscoveryMarkdownEn(result: McpConfigDiscoveryResult): string {
  return [
    "# MCP Scope Discovery Report",
    "",
    "- Static discovery only",
    "- MCP server execution: false",
    "- External API calls: false",
    "- Live tools/list requests: false",
    "- File contents rendered: false",
    "",
    "## Summary",
    "",
    `- Root path: ${result.rootPathDisplay}`,
    `- Max depth: ${result.maxDepth}`,
    `- Include home root: ${String(result.includeHome)}`,
    `- Candidate count: ${result.summary.candidateCount}`,
    `- Parsed count: ${result.summary.parsedCount}`,
    `- Skipped count: ${result.summary.skippedCount}`,
    `- Invalid JSON count: ${result.summary.invalidJsonCount}`,
    `- Unsupported count: ${result.summary.unsupportedCount}`,
    "",
    "## Candidates",
    "",
    renderCandidateTable(result.candidates),
    "",
    "## Next Steps",
    "",
    "- Parsed candidates include a concrete `mcp-scope scan --config ...` command in the table.",
    "- If you have exported tools/list metadata, run `mcp-scope scan --config <path> --tools <tools.json>`.",
    "- Discovery does not auto-scan every candidate and does not modify config files.",
    "",
    "## Redaction",
    "",
    "- Discovery does not print file contents.",
    "- Env/header values are not rendered.",
    "- Home-like paths are displayed safely.",
    "",
    "## Limitations",
    "",
    "- Static file discovery only.",
    "- Client profile labels are compatibility hints, not official integrations.",
    "- Candidates are review starting points, not proof of safety or compromise."
  ].join("\n");
}

function renderDiscoveryMarkdownZh(result: McpConfigDiscoveryResult): string {
  return [
    "# MCP Scope Discovery Report",
    "",
    "- 仅做静态发现",
    "- MCP server execution: false",
    "- External API calls: false",
    "- Live tools/list requests: false",
    "- File contents rendered: false",
    "",
    "## 摘要",
    "",
    `- Root path: ${result.rootPathDisplay}`,
    `- Max depth: ${result.maxDepth}`,
    `- Include home root: ${String(result.includeHome)}`,
    `- Candidate count: ${result.summary.candidateCount}`,
    `- Parsed count: ${result.summary.parsedCount}`,
    `- Skipped count: ${result.summary.skippedCount}`,
    `- Invalid JSON count: ${result.summary.invalidJsonCount}`,
    `- Unsupported count: ${result.summary.unsupportedCount}`,
    "",
    "## 候选文件",
    "",
    renderCandidateTable(result.candidates),
    "",
    "## 下一步",
    "",
    "- 可解析候选文件会在表格里显示具体的 `mcp-scope scan --config ...` 命令。",
    "- 如果你已经导出了本地 tools/list metadata，可以运行 `mcp-scope scan --config <path> --tools <tools.json>`。",
    "- discovery 不会自动扫描每个候选文件，也不会修改配置。",
    "",
    "## 脱敏说明",
    "",
    "- discovery 不打印文件内容。",
    "- env/header values 不会展示。",
    "- 类似 home 目录的路径会安全显示。",
    "",
    "## 局限性",
    "",
    "- 只做本地文件静态发现。",
    "- client profile labels 是兼容性提示，不代表官方集成。",
    "- 候选文件只是审查起点，不是安全或被攻击的证明。"
  ].join("\n");
}

function renderCandidateTable(candidates: readonly McpConfigCandidate[]): string {
  if (candidates.length === 0) {
    return "No candidates found.";
  }

  return [
    "| Path | Status | Shape | Profile | Servers | Risk | Next command | Notes |",
    "| --- | --- | --- | --- | ---: | --- | --- | --- |",
    ...candidates.map((candidate) => [
      tableCell(candidate.pathDisplay),
      tableCell(candidate.parseStatus),
      tableCell(candidate.detectedShape),
      tableCell(candidate.clientProfile),
      String(candidate.serverCount),
      tableCell(candidate.riskPreview),
      tableCell(nextCommand(candidate)),
      tableCell(candidate.notes.join(", ") || "none")
    ].join(" | "))
  ].join("\n");
}

function table(candidates: readonly McpConfigCandidate[]): string {
  return [
    '<div class="table-wrap"><table>',
    "<thead><tr><th>Path</th><th>Status</th><th>Shape</th><th>Profile</th><th>Servers</th><th>Risk</th><th>Next command</th><th>Notes</th></tr></thead>",
    "<tbody>",
    ...candidates.map((candidate) => `<tr><td>${escapeHtml(candidate.pathDisplay)}</td><td>${escapeHtml(candidate.parseStatus)}</td><td>${escapeHtml(candidate.detectedShape)}</td><td>${escapeHtml(candidate.clientProfile)}</td><td>${escapeHtml(candidate.serverCount)}</td><td>${escapeHtml(candidate.riskPreview)}</td><td><code>${escapeHtml(nextCommand(candidate))}</code></td><td>${escapeHtml(candidate.notes.join(", ") || "none")}</td></tr>`),
    "</tbody></table></div>"
  ].join("");
}

function nextCommand(candidate: McpConfigCandidate): string {
  if (candidate.parseStatus !== "parsed") {
    return "Fix or review candidate before scanning.";
  }

  return `mcp-scope scan --config ${shellQuote(candidate.pathDisplay)}`;
}

function shellQuote(value: string): string {
  if (/^[A-Za-z0-9_./:@%+=,-]+$/.test(value)) {
    return value;
  }

  return `'${value.replaceAll("'", "'\\''")}'`;
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

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\s+/g, " ");
}

function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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
    h1, h2 { margin: 0 0 14px; letter-spacing: 0; }
    .cards { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 12px; }
    .cards article { min-width: 0; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfe; }
    .cards span { display: block; color: var(--muted); font-size: 13px; }
    .cards strong { display: block; margin-top: 8px; font-size: 26px; overflow-wrap: anywhere; }
    dl { display: grid; gap: 8px; margin: 0; }
    dl div { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
    dt { color: var(--muted); font-weight: 750; }
    dd { margin: 0; overflow-wrap: anywhere; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 11px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0; }
    .muted { color: var(--muted); }
    @media (max-width: 780px) { .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); } dl div { grid-template-columns: 1fr; } }
  `;
}

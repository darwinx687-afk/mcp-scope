import type {
  McpCapabilityCategory,
  McpServerFingerprint,
  ToolMetadataToolResult
} from "@mcp-scope/core";
import type {
  ReportLanguage,
  ReportRenderOptions,
  StableReportFinding,
  TransparencyReportModel
} from "./index.js";

type ViewerText = {
  readonly documentTitle: string;
  readonly subtitle: string;
  readonly early: string;
  readonly staticOnly: string;
  readonly externalApiCalls: string;
  readonly serverExecution: string;
  readonly secretValuesRedacted: string;
  readonly summary: string;
  readonly sourceScope: string;
  readonly severityDistribution: string;
  readonly categoryDistribution: string;
  readonly capabilityHints: string;
  readonly config: string;
  readonly tools: string;
  readonly findings: string;
  readonly checked: string;
  readonly notChecked: string;
  readonly redaction: string;
  readonly limitations: string;
  readonly footer: string;
  readonly none: string;
  readonly notProvided: string;
  readonly cards: Record<"servers" | "tools" | "findings" | "highest" | "high" | "medium" | "low" | "info", string>;
  readonly checkedItems: readonly string[];
  readonly notCheckedItems: readonly string[];
  readonly redactionItems: readonly string[];
};

const TEXT: Record<ReportLanguage, ViewerText> = {
  en: {
    documentTitle: "MCP Scope Report",
    subtitle: "Local MCP transparency report",
    early: "Early transparency tool",
    staticOnly: "Static analysis only",
    externalApiCalls: "External API calls",
    serverExecution: "MCP server execution",
    secretValuesRedacted: "Secret values redacted",
    summary: "Summary",
    sourceScope: "Source and Scan Scope",
    severityDistribution: "Severity Distribution",
    categoryDistribution: "Category Distribution",
    capabilityHints: "Capability Hints",
    config: "Config",
    tools: "Tool Metadata",
    findings: "Findings",
    checked: "What MCP Scope Checked",
    notChecked: "What MCP Scope Did Not Check",
    redaction: "Redaction and Sharing Notice",
    limitations: "Limitations",
    footer: "MCP Scope is an early transparency tool. Findings are static risk signals, not proof of compromise or proof of safety.",
    none: "None",
    notProvided: "not provided",
    cards: {
      servers: "Servers",
      tools: "Tools",
      findings: "Findings",
      highest: "Highest",
      high: "High",
      medium: "Medium",
      low: "Low",
      info: "Info"
    },
    checkedItems: [
      "Local MCP config files using supported static JSON shapes.",
      "Local exported tool metadata, when provided.",
      "Tool descriptions, inputSchema, outputSchema, and annotations.",
      "Startup command and URL visibility.",
      "Environment and header key visibility."
    ],
    notCheckedItems: [
      "No MCP server execution.",
      "No live tools/list request.",
      "No external AI API call.",
      "No exploit simulation.",
      "No proof of compromise or proof of safety.",
      "Not a replacement for security review."
    ],
    redactionItems: [
      "Env values are never rendered.",
      "Header values are never rendered.",
      "Secret-like values are redacted before rendering.",
      "Do not post private configs in public issues."
    ]
  },
  "zh-CN": {
    documentTitle: "MCP Scope Report",
    subtitle: "本地 MCP 透明度报告",
    early: "早期透明度工具",
    staticOnly: "仅做静态分析",
    externalApiCalls: "External API calls",
    serverExecution: "MCP server execution",
    secretValuesRedacted: "Secret values redacted",
    summary: "摘要",
    sourceScope: "来源与扫描范围",
    severityDistribution: "严重程度分布",
    categoryDistribution: "类别分布",
    capabilityHints: "Capability Hints",
    config: "Config",
    tools: "Tool Metadata",
    findings: "发现项",
    checked: "MCP Scope 检查了什么",
    notChecked: "MCP Scope 没有检查什么",
    redaction: "脱敏与分享提示",
    limitations: "局限性",
    footer: "MCP Scope 是早期透明度工具。发现项是静态风险信号，不是被攻击的证明。",
    none: "无",
    notProvided: "未提供",
    cards: {
      servers: "Servers",
      tools: "Tools",
      findings: "Findings",
      highest: "Highest",
      high: "High",
      medium: "Medium",
      low: "Low",
      info: "Info"
    },
    checkedItems: [
      "使用已支持静态 JSON 形态的本地 MCP config 文件。",
      "用户本地提供的已导出 tool metadata。",
      "tool descriptions、inputSchema、outputSchema 和 annotations。",
      "启动命令和 URL 可见性。",
      "env/header key 可见性。"
    ],
    notCheckedItems: [
      "没有执行 MCP servers。",
      "没有请求实时 tools/list。",
      "没有调用外部 AI API。",
      "没有运行 exploit simulation。",
      "没有证明配置已被攻击。",
      "不能替代安全审查。"
    ],
    redactionItems: [
      "env values 永远不会展示。",
      "header values 永远不会展示。",
      "疑似 secret 值会在渲染前脱敏。",
      "不要在公开 issue 中贴私有配置。"
    ]
  }
};

const SEVERITIES = ["high", "medium", "low", "info"] as const;
const CAPABILITIES: readonly McpCapabilityCategory[] = [
  "filesystem",
  "network",
  "credentials",
  "shell",
  "database",
  "browser",
  "github",
  "email",
  "unknown"
];

export function renderHtmlViewer(
  report: TransparencyReportModel,
  options: ReportRenderOptions = {}
): string {
  const lang = options.lang ?? "en";
  const text = TEXT[lang];

  return [
    "<!doctype html>",
    `<html lang="${escapeAttribute(lang)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(text.documentTitle)}</title>`,
    `<style>${css()}</style>`,
    "</head>",
    "<body>",
    '<main class="page">',
    renderHero(report, text),
    renderSummary(report, text),
    renderSourceScope(report, text),
    '<section class="grid two">',
    renderDistribution(text.severityDistribution, severityEntries(report.summary.severityCounts), text.none),
    renderDistribution(text.categoryDistribution, sortedEntries(report.summary.categoryCounts), text.none),
    "</section>",
    renderCapabilities(report.summary.capabilityHintCounts, text),
    renderConfig(report.config?.servers ?? [], text),
    renderTools(report.tools?.tools ?? [], text),
    renderFindings(report.findings, text),
    renderChecked(text),
    renderRedaction(report, text),
    renderLimitations(report, text),
    `<footer>${escapeHtml(text.footer)}</footer>`,
    "</main>",
    "</body>",
    "</html>"
  ].join("\n");
}

export function renderHtmlFromJsonReport(
  reportJson: string,
  options: ReportRenderOptions = {}
): string {
  let parsed: unknown;

  try {
    parsed = JSON.parse(reportJson);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid MCP Scope JSON report: ${detail}`);
  }

  assertReportModel(parsed);
  return renderHtmlViewer(parsed, options);
}

export function escapeHtml(value: unknown): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderHero(report: TransparencyReportModel, text: ViewerText): string {
  return `
    <header class="hero">
      <div>
        <p class="eyebrow">${escapeHtml(text.early)}</p>
        <h1>MCP Scope</h1>
        <p class="subtitle">${escapeHtml(text.subtitle)}</p>
      </div>
      <div class="status-grid">
        ${statusPill(text.staticOnly, true)}
        ${statusPill(`${text.externalApiCalls}: ${String(report.scan.externalApiCalls)}`, !report.scan.externalApiCalls)}
        ${statusPill(`${text.serverExecution}: ${String(report.scan.mcpServerExecution)}`, !report.scan.mcpServerExecution)}
        ${statusPill(`${text.secretValuesRedacted}: ${String(report.scan.secretValuesRedacted)}`, report.scan.secretValuesRedacted)}
      </div>
    </header>`;
}

function renderSummary(report: TransparencyReportModel, text: ViewerText): string {
  const cards: readonly [string, string | number][] = [
    [text.cards.servers, report.summary.serverCount],
    [text.cards.tools, report.summary.toolCount],
    [text.cards.findings, report.summary.findingCount],
    [text.cards.highest, report.summary.highestSeverity],
    [text.cards.high, report.summary.severityCounts.high],
    [text.cards.medium, report.summary.severityCounts.medium],
    [text.cards.low, report.summary.severityCounts.low],
    [text.cards.info, report.summary.severityCounts.info]
  ];

  return `
    <section>
      <h2>${escapeHtml(text.summary)}</h2>
      <div class="cards">
        ${cards.map(([label, value]) => `<article class="card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`).join("")}
      </div>
    </section>`;
}

function renderSourceScope(report: TransparencyReportModel, text: ViewerText): string {
  return `
    <section>
      <h2>${escapeHtml(text.sourceScope)}</h2>
      ${keyValueList([
        ["configPath", report.sources.configPath ?? text.notProvided],
        ["toolsPath", report.sources.toolsPath ?? text.notProvided],
        ["metadataSourceType", report.sources.metadataSourceType ?? text.notProvided],
        ["sourceShape", report.config?.sourceShape ?? text.notProvided],
        ["clientProfile", report.config?.clientProfile ?? text.notProvided],
        ["generatedAt", report.generatedAt],
        ["reportVersion", report.reportVersion],
        ["schemaVersion", report.schemaVersion],
        ["scanMode", report.scan.mode]
      ])}
    </section>`;
}

function renderDistribution(
  title: string,
  entries: readonly [string, number][],
  noneLabel: string
): string {
  const visible = entries.filter(([, count]) => count > 0);
  const total = Math.max(1, visible.reduce((sum, [, count]) => sum + count, 0));

  return `
    <section>
      <h2>${escapeHtml(title)}</h2>
      ${visible.length === 0 ? `<p class="muted">${escapeHtml(noneLabel)}</p>` : visible.map(([label, count]) => {
        const width = Math.max(8, Math.round((count / total) * 100));
        return `<div class="bar-row">
          <span class="badge ${slugClass(label)}">${escapeHtml(label)}</span>
          <div class="bar" aria-hidden="true"><span style="width:${width}%"></span></div>
          <strong>${escapeHtml(count)}</strong>
        </div>`;
      }).join("")}
    </section>`;
}

function renderCapabilities(
  counts: Partial<Record<McpCapabilityCategory, number>>,
  text: ViewerText
): string {
  const chips = CAPABILITIES
    .filter((capability) => Number(counts[capability] ?? 0) > 0)
    .map((capability) => `<span class="chip">${escapeHtml(capability)}: ${escapeHtml(counts[capability] ?? 0)}</span>`);

  return `
    <section>
      <h2>${escapeHtml(text.capabilityHints)}</h2>
      <div class="chips">${chips.length === 0 ? `<span class="muted">${escapeHtml(text.none)}</span>` : chips.join("")}</div>
    </section>`;
}

function renderConfig(servers: readonly McpServerFingerprint[], text: ViewerText): string {
  return `
    <section>
      <h2>${escapeHtml(text.config)}</h2>
      ${servers.length === 0 ? `<p class="muted">${escapeHtml(text.none)}</p>` : table(
        ["Name", "Profile", "Shape", "Context", "Transport", "Command/URL", "Env keys", "Header keys", "Permissions", "Capabilities", "Risk"],
        servers.map((server) => [
          server.name,
          server.clientProfile ?? text.notProvided,
          server.sourceShape ?? text.notProvided,
          server.projectPathDisplay ?? server.sourceContextLabel ?? text.notProvided,
          server.transport,
          server.hasCommand ? server.commandSummary : server.rawUrlRedacted ?? text.none,
          server.envKeys.join(", ") || text.none,
          server.headerKeys.join(", ") || text.none,
          server.permissionHints?.join(", ") || text.none,
          server.capabilityHints.join(", ") || text.none,
          server.riskLevel
        ])
      )}
    </section>`;
}

function renderTools(tools: readonly ToolMetadataToolResult[], text: ViewerText): string {
  return `
    <section>
      <h2>${escapeHtml(text.tools)}</h2>
      ${tools.length === 0 ? `<p class="muted">${escapeHtml(text.none)}</p>` : table(
        ["Name", "Title", "Capabilities", "Findings", "Highest", "Categories"],
        tools.map((tool) => [
          tool.name,
          tool.title ?? text.none,
          tool.capabilityHints.join(", ") || text.none,
          tool.findingCount,
          tool.highestSeverity,
          [...new Set(tool.findings.map((finding) => finding.category))].join(", ") || text.none
        ])
      )}
    </section>`;
}

function renderFindings(findings: readonly StableReportFinding[], text: ViewerText): string {
  return `
    <section>
      <h2>${escapeHtml(text.findings)}</h2>
      ${findings.length === 0 ? `<p class="muted">${escapeHtml(text.none)}</p>` : `<div class="findings">${findings.map((finding) => `
        <article class="finding ${escapeAttribute(finding.severity)}">
          <div class="finding-head">
            <span class="severity ${escapeAttribute(finding.severity)}">${escapeHtml(finding.severity.toUpperCase())}</span>
            <span class="badge">${escapeHtml(finding.category)}</span>
            <code>${escapeHtml(finding.ruleId)}</code>
          </div>
          <h3>${escapeHtml(finding.title)}</h3>
          ${keyValueList([
            ["Target", formatTarget(finding.target)],
            ["Message", finding.message],
            ["Evidence", finding.evidence],
            ["Recommendation", finding.recommendation]
          ])}
        </article>`).join("")}</div>`}
    </section>`;
}

function renderChecked(text: ViewerText): string {
  return `
    <section class="grid two">
      <div>
        <h2>${escapeHtml(text.checked)}</h2>
        ${list(text.checkedItems)}
      </div>
      <div>
        <h2>${escapeHtml(text.notChecked)}</h2>
        ${list(text.notCheckedItems)}
      </div>
    </section>`;
}

function renderRedaction(report: TransparencyReportModel, text: ViewerText): string {
  return `
    <section>
      <h2>${escapeHtml(text.redaction)}</h2>
      ${keyValueList([
        ["envValuesRendered", report.redaction.envValuesRendered],
        ["headerValuesRendered", report.redaction.headerValuesRendered],
        ["secretLikeValuesRendered", report.redaction.secretLikeValuesRendered]
      ])}
      ${list(text.redactionItems)}
    </section>`;
}

function renderLimitations(report: TransparencyReportModel, text: ViewerText): string {
  return `
    <section>
      <h2>${escapeHtml(text.limitations)}</h2>
      ${keyValueList([
        ["staticOnly", report.limitations.staticOnly],
        ["noRuntimeVerification", report.limitations.noRuntimeVerification],
        ["noExploitExecution", report.limitations.noExploitExecution],
        ["noExternalRegistryCheck", report.limitations.noExternalRegistryCheck],
        ["notProofOfCompromise", report.limitations.notProofOfCompromise]
      ])}
      ${list(report.limitations.notes)}
    </section>`;
}

function statusPill(label: string, good: boolean): string {
  return `<span class="status ${good ? "good" : "warn"}">${escapeHtml(label)}</span>`;
}

function table(headers: readonly string[], rows: readonly (readonly unknown[])[]): string {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `<tr>${row.map((value) => `<td>${escapeHtml(value)}</td>`).join("")}</tr>`).join("")}</tbody>
      </table>
    </div>`;
}

function keyValueList(rows: readonly (readonly [string, unknown])[]): string {
  return `
    <dl class="kv">
      ${rows.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}
    </dl>`;
}

function list(items: readonly string[]): string {
  return `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
}

function formatTarget(target: StableReportFinding["target"]): string {
  const name = target.name === undefined ? "" : `:${target.name}`;
  const path = target.path === undefined ? "" : ` (${target.path})`;

  return `${target.type}${name}${path}`;
}

function severityEntries(counts: Record<"info" | "low" | "medium" | "high", number>): readonly [string, number][] {
  return SEVERITIES.map((severity) => [severity, counts[severity]]);
}

function sortedEntries(counts: Record<string, number>): readonly [string, number][] {
  return Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function escapeAttribute(value: unknown): string {
  return escapeHtml(value).replaceAll("`", "&#96;");
}

function slugClass(value: string): string {
  return `tag-${value.toLowerCase().replace(/[^a-z0-9_-]+/g, "-")}`;
}

function assertReportModel(value: unknown): asserts value is TransparencyReportModel {
  if (!isRecord(value)) {
    throw new Error("MCP Scope JSON report must be a JSON object.");
  }

  if (value["reportVersion"] !== "0.3.0" || value["schemaVersion"] !== 1) {
    throw new Error("MCP Scope JSON report must use reportVersion 0.3.0 and schemaVersion 1.");
  }

  if (!isRecord(value["scan"]) || !isRecord(value["summary"]) || !Array.isArray(value["findings"])) {
    throw new Error("MCP Scope JSON report is missing scan, summary, or findings fields.");
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function css(): string {
  return `
    :root {
      --ink: #172033;
      --muted: #64748b;
      --line: #dbe3ef;
      --panel: #ffffff;
      --panel-2: #f6f8fb;
      --accent: #0f766e;
      --high: #b42318;
      --medium: #b45309;
      --low: #4d7c0f;
      --info: #2563eb;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      color: var(--ink);
      background: #eef3f8;
      font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.5;
    }
    .page { width: min(1120px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 38px; }
    .hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(280px, 420px);
      gap: 24px;
      align-items: end;
      padding: 30px;
      border: 1px solid var(--line);
      border-radius: 8px;
      background: linear-gradient(135deg, #ffffff 0%, #f6f8fb 100%);
      box-shadow: 0 14px 36px rgba(15, 23, 42, 0.08);
    }
    .eyebrow { margin: 0 0 8px; color: var(--accent); font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0; }
    h1 { margin: 0; font-size: clamp(34px, 5vw, 58px); line-height: 1; letter-spacing: 0; }
    h2 { margin: 0 0 16px; font-size: 22px; letter-spacing: 0; }
    h3 { margin: 12px 0; font-size: 18px; letter-spacing: 0; }
    .subtitle { margin: 12px 0 0; color: var(--muted); font-size: 18px; }
    section { min-width: 0; margin-top: 18px; padding: 22px; background: var(--panel); border: 1px solid var(--line); border-radius: 8px; }
    .grid { display: grid; gap: 18px; }
    .two { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .status-grid, .chips { display: flex; flex-wrap: wrap; gap: 8px; }
    .status-grid { justify-content: flex-end; }
    .status, .chip, .badge, .severity {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 4px 9px;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--panel-2);
      font-size: 13px;
      font-weight: 750;
      white-space: nowrap;
    }
    .status.good { color: var(--accent); border-color: rgba(15, 118, 110, 0.28); background: #ecfdf5; }
    .status.warn { color: var(--medium); border-color: rgba(180, 83, 9, 0.28); background: #fffbeb; }
    .cards { display: grid; grid-template-columns: repeat(4, minmax(120px, 1fr)); gap: 12px; }
    .card { min-width: 0; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: #fbfcfe; }
    .card span { display: block; color: var(--muted); font-size: 13px; }
    .card strong { display: block; margin-top: 8px; font-size: 26px; overflow-wrap: anywhere; }
    .kv { display: grid; gap: 8px; margin: 0; }
    .kv div { display: grid; grid-template-columns: 180px minmax(0, 1fr); gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
    .kv dt { color: var(--muted); font-weight: 750; }
    .kv dd { margin: 0; overflow-wrap: anywhere; }
    .bar-row { display: grid; grid-template-columns: 132px minmax(0, 1fr) 42px; gap: 10px; align-items: center; margin: 10px 0; }
    .bar { height: 12px; border-radius: 999px; background: var(--panel-2); overflow: hidden; }
    .bar span { display: block; height: 100%; background: var(--accent); }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 11px 10px; border-bottom: 1px solid var(--line); text-align: left; vertical-align: top; overflow-wrap: anywhere; }
    th { color: var(--muted); font-size: 12px; text-transform: uppercase; letter-spacing: 0; }
    code { padding: 2px 6px; border-radius: 6px; background: var(--panel-2); overflow-wrap: anywhere; }
    .findings { display: grid; gap: 14px; }
    .finding { padding: 18px; border: 1px solid var(--line); border-left: 5px solid var(--muted); border-radius: 8px; background: #fff; }
    .finding.high { border-left-color: var(--high); }
    .finding.medium { border-left-color: var(--medium); }
    .finding.low { border-left-color: var(--low); }
    .finding.info { border-left-color: var(--info); }
    .finding-head { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
    .severity.high { color: var(--high); background: #fef3f2; border-color: rgba(180, 35, 24, 0.28); }
    .severity.medium { color: var(--medium); background: #fffbeb; border-color: rgba(180, 83, 9, 0.28); }
    .severity.low { color: var(--low); background: #f7fee7; border-color: rgba(77, 124, 15, 0.28); }
    .severity.info { color: var(--info); background: #eff6ff; border-color: rgba(37, 99, 235, 0.28); }
    ul { margin: 0; padding-left: 20px; }
    li { margin: 8px 0; }
    .muted { color: var(--muted); }
    footer { margin-top: 24px; color: var(--muted); font-size: 14px; text-align: center; }
    @media (max-width: 780px) {
      .hero, .two { grid-template-columns: 1fr; }
      .status-grid { justify-content: flex-start; }
      .cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .kv div, .bar-row { grid-template-columns: 1fr; }
    }
  `;
}

import {
  FOUNDATION_STATUS,
  PROJECT_NAME,
  PROJECT_SLUG,
  PROJECT_VERSION
} from "@mcp-scope/core";
import type {
  McpCapabilityCategory,
  McpScopeScanResult,
  McpServerFingerprint,
  RiskLevel,
  ToolMetadataScanResult,
  ToolMetadataToolResult,
  ToolRiskFinding,
  TransparencyNote
} from "@mcp-scope/core";
import { renderSarifReport } from "./sarif.js";
import { renderHtmlViewer } from "./html.js";

export {
  renderAuditHtml,
  renderAuditJson,
  renderAuditMarkdown
} from "./audit.js";
export {
  renderAuditSarif,
  renderSarifReport
} from "./sarif.js";
export {
  buildMcpScopeSnapshot,
  diffMcpScopeSnapshot,
  parseMcpScopeSnapshotJson,
  renderDiffHtml,
  renderDiffJson,
  renderDiffMarkdown,
  shouldFailOnDiffSeverity
} from "./approval-memory.js";
export type {
  DiffCategory,
  DiffChange,
  DiffChangeType,
  DiffSeverity,
  EntityKind,
  McpScopeDiffResult,
  McpScopeSnapshot,
  McpScopeSnapshotEntry,
  SnapshotCreationOptions,
  SnapshotDigest,
  SnapshotDiffOptions,
  SnapshotSource
} from "./approval-memory.js";
export {
  compareSeverity,
  isFailOnThreshold,
  shouldFailOnSeverity,
  summarizeReportForCi
} from "./ci.js";
export type { CiReportSummary, FailOnThreshold, ReportSeverity } from "./ci.js";
export {
  renderDiscoveryHtml,
  renderDiscoveryJson,
  renderDiscoveryMarkdown
} from "./discovery.js";
export { escapeHtml, renderHtmlFromJsonReport, renderHtmlViewer } from "./html.js";

export type ReportLanguage = "en" | "zh-CN";

export type ReportRenderOptions = {
  readonly lang?: ReportLanguage;
};

type Severity = Exclude<RiskLevel, "unknown">;
type ScanMode = "config-only" | "tools-only" | "combined";

export type StableReportFinding = {
  readonly id: string;
  readonly ruleId: string;
  readonly category: string;
  readonly severity: Severity;
  readonly target: {
    readonly type: "config" | "config-server" | "tool" | "tool-manifest";
    readonly name?: string;
    readonly path?: string;
  };
  readonly title: string;
  readonly message: string;
  readonly evidence: string;
  readonly recommendation: string;
};

export type TransparencyReportModel = {
  readonly reportVersion: "0.3.0";
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly project: {
    readonly name: typeof PROJECT_NAME;
    readonly slug: typeof PROJECT_SLUG;
    readonly version: typeof PROJECT_VERSION;
  };
  readonly scan: {
    readonly mode: ScanMode;
    readonly externalApiCalls: false;
    readonly mcpServerExecution: false;
    readonly dynamicAnalysis: false;
    readonly secretValuesRedacted: true;
  };
  readonly sources: {
    readonly configPath?: string;
    readonly toolsPath?: string;
    readonly metadataSourceType?: string;
  };
  readonly summary: {
    readonly serverCount: number;
    readonly toolCount: number;
    readonly findingCount: number;
    readonly highestSeverity: Severity;
    readonly severityCounts: Record<Severity, number>;
    readonly categoryCounts: Record<string, number>;
    readonly capabilityHintCounts: Partial<Record<McpCapabilityCategory, number>>;
    readonly configRiskSummary: {
      readonly highestRiskLevel: Severity;
      readonly serverRiskCounts: Record<Severity, number>;
    };
    readonly toolRiskSummary: {
      readonly highestSeverity: Severity;
      readonly findingCount: number;
      readonly manifestFindingCount: number;
    };
  };
  readonly config?: McpScopeScanResult;
  readonly tools?: ToolMetadataScanResult;
  readonly findings: readonly StableReportFinding[];
  readonly redaction: {
    readonly envValuesRendered: false;
    readonly headerValuesRendered: false;
    readonly secretLikeValuesRendered: false;
    readonly notes: readonly string[];
  };
  readonly limitations: {
    readonly staticOnly: true;
    readonly noRuntimeVerification: true;
    readonly noExploitExecution: true;
    readonly noExternalRegistryCheck: true;
    readonly notProofOfCompromise: true;
    readonly notes: readonly string[];
  };
};

const SEVERITIES: readonly Severity[] = ["info", "low", "medium", "high"];
const SEVERITY_RANK: Record<Severity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};

export function renderFoundationStatusReport(): string {
  return [
    "# MCP Scope Foundation Status",
    "",
    `- project: ${PROJECT_SLUG}`,
    `- name: ${PROJECT_NAME}`,
    `- phase: ${FOUNDATION_STATUS.phase}`,
    `- status: ${FOUNDATION_STATUS.status}`,
    `- scanner: ${FOUNDATION_STATUS.scanner}`,
    `- externalApiCalls: ${String(FOUNDATION_STATUS.externalApiCalls)}`,
    "",
    "Phase 10 prepares bilingual launch and feedback materials. Scanner behavior remains static-only and does not execute MCP servers, call tools/list, or call external APIs."
  ].join("\n");
}

export function buildScanReportModel(result: McpScopeScanResult): TransparencyReportModel {
  return buildReportModel({
    mode: result.toolMetadata === undefined ? "config-only" : "combined",
    generatedAt: result.generatedAt,
    config: result,
    tools: result.toolMetadata
  });
}

export function buildToolMetadataReportModel(result: ToolMetadataScanResult): TransparencyReportModel {
  return buildReportModel({
    mode: "tools-only",
    generatedAt: result.generatedAt,
    tools: result
  });
}

export function renderScanResultMarkdown(
  result: McpScopeScanResult,
  options: ReportRenderOptions = {}
): string {
  return renderTransparencyReportMarkdown(buildScanReportModel(result), options);
}

export function renderScanResultHtml(
  result: McpScopeScanResult,
  options: ReportRenderOptions = {}
): string {
  return renderHtmlViewer(buildScanReportModel(result), options);
}

export function renderScanResultJson(result: McpScopeScanResult): string {
  return `${JSON.stringify(buildScanReportModel(result), null, 2)}\n`;
}

export function renderScanResultSarif(
  result: McpScopeScanResult
): string {
  return renderSarifReport(buildScanReportModel(result));
}

export function renderToolMetadataMarkdown(
  result: ToolMetadataScanResult,
  options: ReportRenderOptions = {}
): string {
  return renderTransparencyReportMarkdown(buildToolMetadataReportModel(result), options);
}

export function renderToolMetadataHtml(
  result: ToolMetadataScanResult,
  options: ReportRenderOptions = {}
): string {
  return renderHtmlViewer(buildToolMetadataReportModel(result), options);
}

export function renderToolMetadataJson(result: ToolMetadataScanResult): string {
  return `${JSON.stringify(buildToolMetadataReportModel(result), null, 2)}\n`;
}

export function renderToolMetadataSarif(result: ToolMetadataScanResult): string {
  return renderSarifReport(buildToolMetadataReportModel(result));
}

export function renderTransparencyReportMarkdown(
  report: TransparencyReportModel,
  options: ReportRenderOptions = {}
): string {
  const lang = options.lang ?? "en";

  return lang === "zh-CN" ? renderMarkdownZh(report) : renderMarkdownEn(report);
}

function buildReportModel(input: {
  readonly mode: ScanMode;
  readonly generatedAt: string;
  readonly config?: McpScopeScanResult;
  readonly tools?: ToolMetadataScanResult;
}): TransparencyReportModel {
  const findings = sortFindings([
    ...flattenConfigFindings(input.config),
    ...flattenToolFindings(input.tools)
  ]);
  const severityCounts = countSeverities(findings.map((finding) => finding.severity));
  const categoryCounts = countBy(findings.map((finding) => finding.category));
  const capabilityHintCounts = countCapabilities(input.config, input.tools);

  return {
    reportVersion: "0.3.0",
    schemaVersion: 1,
    generatedAt: input.generatedAt,
    project: {
      name: PROJECT_NAME,
      slug: PROJECT_SLUG,
      version: PROJECT_VERSION
    },
    scan: {
      mode: input.mode,
      externalApiCalls: false,
      mcpServerExecution: false,
      dynamicAnalysis: false,
      secretValuesRedacted: true
    },
    sources: {
      configPath: input.config?.sourceFile,
      toolsPath: input.tools?.sourceFile,
      metadataSourceType: input.tools?.sourceType
    },
    summary: {
      serverCount: input.config?.serverCount ?? 0,
      toolCount: input.tools?.toolCount ?? 0,
      findingCount: findings.length,
      highestSeverity: highestSeverity(findings.map((finding) => finding.severity)),
      severityCounts,
      categoryCounts,
      capabilityHintCounts,
      configRiskSummary: {
        highestRiskLevel: input.config?.highestRiskLevel ?? "info",
        serverRiskCounts: countSeverities(input.config?.servers.map((server) => server.riskLevel) ?? [])
      },
      toolRiskSummary: {
        highestSeverity: input.tools?.highestSeverity ?? "info",
        findingCount: input.tools?.findingCount ?? 0,
        manifestFindingCount: input.tools?.manifestFindings.length ?? 0
      }
    },
    config: input.config,
    tools: input.tools,
    findings,
    redaction: {
      envValuesRendered: false,
      headerValuesRendered: false,
      secretLikeValuesRendered: false,
      notes: [
        "Environment variable values are never rendered.",
        "Header values are never rendered.",
        "Secret-like values in tool metadata examples are redacted before report rendering.",
        "Do not paste private configs, tokens, or local secrets into public issues."
      ]
    },
    limitations: {
      staticOnly: true,
      noRuntimeVerification: true,
      noExploitExecution: true,
      noExternalRegistryCheck: true,
      notProofOfCompromise: true,
      notes: [
        "This report is static analysis of local files only.",
        "MCP Scope did not execute MCP servers or tools.",
        "MCP Scope did not connect to live tools/list endpoints.",
        "MCP Scope did not call external AI APIs or registries.",
        "Findings are risk signals and warnings, not proof of compromise or proof of safety."
      ]
    }
  };
}

function renderMarkdownEn(report: TransparencyReportModel): string {
  return [
    "# MCP Scope Report",
    "",
    "- Early transparency report",
    "- Static analysis only",
    `- MCP server execution: ${String(report.scan.mcpServerExecution)}`,
    `- External API calls: ${String(report.scan.externalApiCalls)}`,
    `- Secret values redacted: ${String(report.scan.secretValuesRedacted)}`,
    "",
    "## Executive Summary",
    "",
    ...renderExecutiveSummaryEn(report),
    "",
    "## What MCP Scope Checked",
    "",
    "- Local MCP config files using supported static JSON shapes.",
    "- Local exported MCP tool metadata files, when provided.",
    "- Tool descriptions, input schemas, output schemas, and annotations.",
    "- Startup command and URL visibility from config entries.",
    "- Environment and header key visibility, with values redacted.",
    "",
    "## What MCP Scope Did Not Do",
    "",
    "- Did not execute MCP servers.",
    "- Did not connect to live `tools/list` endpoints.",
    "- Did not call external AI APIs.",
    "- Did not prove compromise or prove safety.",
    "- Did not replace professional security review.",
    "",
    "## Severity Legend",
    "",
    "- `info`: context that improves transparency.",
    "- `low`: weak signal or quality issue worth reviewing.",
    "- `medium`: meaningful risk signal that deserves attention before approval.",
    "- `high`: strong static warning that should block casual approval until reviewed.",
    "",
    ...renderConfigSectionEn(report),
    ...renderToolSectionEn(report),
    ...renderFindingsSectionEn(report),
    ...renderRedactionSectionEn(report),
    ...renderLimitationsSectionEn(report),
    "## Footer",
    "",
    "MCP Scope is an early transparency tool. Findings are static risk signals, not proof of compromise or proof of safety."
  ].join("\n");
}

function renderMarkdownZh(report: TransparencyReportModel): string {
  return [
    "# MCP Scope Report",
    "",
    "- 早期透明度报告",
    "- 仅做静态分析",
    `- MCP server execution: ${String(report.scan.mcpServerExecution)}`,
    `- External API calls: ${String(report.scan.externalApiCalls)}`,
    `- Secret values redacted: ${String(report.scan.secretValuesRedacted)}`,
    "",
    "## 执行摘要",
    "",
    ...renderExecutiveSummaryZh(report),
    "",
    "## MCP Scope 检查了什么",
    "",
    "- 使用已支持静态 JSON 形态的本地 MCP config 文件。",
    "- 用户本地提供的已导出 tool metadata 文件。",
    "- tool descriptions、input schemas、output schemas 和 annotations。",
    "- 配置中的启动命令、URL、env key、header key 可见性。",
    "- env/header 的值不会展示，只展示 key 和风险提示。",
    "",
    "## MCP Scope 没有做什么",
    "",
    "- 没有执行 MCP servers。",
    "- 没有连接实时 `tools/list` 端点。",
    "- 没有调用外部 AI APIs。",
    "- 没有证明配置已被攻击，也没有证明配置绝对安全。",
    "- 不能替代专业安全审查。",
    "",
    "## 严重程度说明",
    "",
    "- `info`：用于理解配置和元数据的背景信息。",
    "- `low`：较弱信号或质量问题，建议顺手检查。",
    "- `medium`：需要在批准前认真看的风险信号。",
    "- `high`：较强的静态警告，不建议未经审查直接批准。",
    "",
    ...renderConfigSectionZh(report),
    ...renderToolSectionZh(report),
    ...renderFindingsSectionZh(report),
    ...renderRedactionSectionZh(report),
    ...renderLimitationsSectionZh(report),
    "## 页脚",
    "",
    "MCP Scope 是早期透明度工具。发现项是静态风险信号，不是被攻击的证明。"
  ].join("\n");
}

function renderExecutiveSummaryEn(report: TransparencyReportModel): string[] {
  return [
    `- Report version: ${report.reportVersion}`,
    `- Generated: ${report.generatedAt}`,
    `- Scan mode: ${report.scan.mode}`,
    `- Config source: ${report.sources.configPath ?? "not provided"}`,
    `- Tool metadata source: ${report.sources.toolsPath ?? "not provided"}`,
    `- Metadata source type: ${report.sources.metadataSourceType ?? "not provided"}`,
    `- Server count: ${report.summary.serverCount}`,
    `- Tool count: ${report.summary.toolCount}`,
    `- Finding count: ${report.summary.findingCount}`,
    `- Highest severity: ${report.summary.highestSeverity}`,
    `- Top categories: ${formatTopEntries(report.summary.categoryCounts)}`,
    `- Top capability hints: ${formatTopEntries(report.summary.capabilityHintCounts)}`
  ];
}

function renderExecutiveSummaryZh(report: TransparencyReportModel): string[] {
  return [
    `- Report version: ${report.reportVersion}`,
    `- Generated: ${report.generatedAt}`,
    `- Scan mode: ${report.scan.mode}`,
    `- Config source: ${report.sources.configPath ?? "未提供"}`,
    `- Tool metadata source: ${report.sources.toolsPath ?? "未提供"}`,
    `- Metadata source type: ${report.sources.metadataSourceType ?? "未提供"}`,
    `- Server count: ${report.summary.serverCount}`,
    `- Tool count: ${report.summary.toolCount}`,
    `- Finding count: ${report.summary.findingCount}`,
    `- Highest severity: ${report.summary.highestSeverity}`,
    `- 主要类别: ${formatTopEntries(report.summary.categoryCounts, "无")}`,
    `- 主要 capability hints: ${formatTopEntries(report.summary.capabilityHintCounts, "无")}`
  ];
}

function renderConfigSectionEn(report: TransparencyReportModel): string[] {
  const config = report.config;

  if (config === undefined) {
    return ["## Config Summary", "", "No MCP config file was included in this report.", ""];
  }

  return [
    "## Config Summary",
    "",
    `- Source file: ${config.sourceFile ?? "unknown"}`,
    `- Source shape: ${config.sourceShape}`,
    `- Client profile: ${config.clientProfile}`,
    `- Server count: ${config.serverCount}`,
    `- Highest config risk level: ${config.highestRiskLevel}`,
    "",
    renderServerTable(config.servers),
    "",
    "### Config Transparency Notes",
    "",
    ...renderConfigNotes(config, "en"),
    ""
  ];
}

function renderConfigSectionZh(report: TransparencyReportModel): string[] {
  const config = report.config;

  if (config === undefined) {
    return ["## Config 摘要", "", "本报告没有包含 MCP config 文件。", ""];
  }

  return [
    "## Config 摘要",
    "",
    `- Source file: ${config.sourceFile ?? "unknown"}`,
    `- Source shape: ${config.sourceShape}`,
    `- Client profile: ${config.clientProfile}`,
    `- Server count: ${config.serverCount}`,
    `- Highest config risk level: ${config.highestRiskLevel}`,
    "",
    renderServerTable(config.servers),
    "",
    "### Config 透明度提示",
    "",
    ...renderConfigNotes(config, "zh-CN"),
    ""
  ];
}

function renderToolSectionEn(report: TransparencyReportModel): string[] {
  const tools = report.tools;

  if (tools === undefined) {
    return ["## Tool Metadata Summary", "", "No local tool metadata file was included in this report.", ""];
  }

  return [
    "## Tool Metadata Summary",
    "",
    `- Tool metadata source file: ${tools.sourceFile ?? "unknown"}`,
    `- Metadata source type: ${tools.sourceType}`,
    `- Tool count: ${tools.toolCount}`,
    `- Finding count: ${tools.findingCount}`,
    `- Highest tool risk level: ${tools.highestSeverity}`,
    `- External API calls: ${String(tools.externalApiCalls)}`,
    `- MCP server execution: ${String(tools.serverExecution)}`,
    `- tools/list request sent: ${String(tools.toolsListRequestSent)}`,
    "",
    renderToolTable(tools.tools),
    ""
  ];
}

function renderToolSectionZh(report: TransparencyReportModel): string[] {
  const tools = report.tools;

  if (tools === undefined) {
    return ["## Tool Metadata 摘要", "", "本报告没有包含本地 tool metadata 文件。", ""];
  }

  return [
    "## Tool Metadata 摘要",
    "",
    `- Tool metadata source file: ${tools.sourceFile ?? "unknown"}`,
    `- Metadata source type: ${tools.sourceType}`,
    `- Tool count: ${tools.toolCount}`,
    `- Finding count: ${tools.findingCount}`,
    `- Highest tool risk level: ${tools.highestSeverity}`,
    `- External API calls: ${String(tools.externalApiCalls)}`,
    `- MCP server execution: ${String(tools.serverExecution)}`,
    `- tools/list request sent: ${String(tools.toolsListRequestSent)}`,
    "",
    renderToolTable(tools.tools),
    ""
  ];
}

function renderFindingsSectionEn(report: TransparencyReportModel): string[] {
  return [
    "## Findings",
    "",
    ...(
      report.findings.length === 0
        ? ["No static risk signals were found.", ""]
        : report.findings.flatMap((finding) => renderFindingBlockEn(finding))
    )
  ];
}

function renderFindingsSectionZh(report: TransparencyReportModel): string[] {
  return [
    "## 发现项",
    "",
    ...(
      report.findings.length === 0
        ? ["没有发现静态风险信号。", ""]
        : report.findings.flatMap((finding) => renderFindingBlockZh(finding))
    )
  ];
}

function renderFindingBlockEn(finding: StableReportFinding): string[] {
  return [
    `### ${finding.severity.toUpperCase()} / ${finding.category} / ${finding.ruleId}`,
    "",
    `- Target: ${formatTarget(finding.target)}`,
    `- Message: ${finding.message}`,
    `- Evidence: ${finding.evidence}`,
    `- Recommendation: ${finding.recommendation}`,
    ""
  ];
}

function renderFindingBlockZh(finding: StableReportFinding): string[] {
  return [
    `### ${finding.severity.toUpperCase()} / ${finding.category} / ${finding.ruleId}`,
    "",
    `- Target: ${formatTarget(finding.target)}`,
    `- 说明: ${translateFindingMessage(finding.message)}`,
    `- 安全证据: ${finding.evidence}`,
    `- 建议: ${translateRecommendation(finding.recommendation)}`,
    ""
  ];
}

function renderRedactionSectionEn(report: TransparencyReportModel): string[] {
  return [
    "## Redaction",
    "",
    `- Env values rendered: ${String(report.redaction.envValuesRendered)}`,
    `- Header values rendered: ${String(report.redaction.headerValuesRendered)}`,
    `- Secret-like values rendered: ${String(report.redaction.secretLikeValuesRendered)}`,
    ...report.redaction.notes.map((note) => `- ${note}`),
    ""
  ];
}

function renderRedactionSectionZh(report: TransparencyReportModel): string[] {
  return [
    "## 脱敏说明",
    "",
    `- Env values rendered: ${String(report.redaction.envValuesRendered)}`,
    `- Header values rendered: ${String(report.redaction.headerValuesRendered)}`,
    `- Secret-like values rendered: ${String(report.redaction.secretLikeValuesRendered)}`,
    "- env values 永远不会在报告中展示。",
    "- header values 永远不会在报告中展示。",
    "- tool metadata 示例中的疑似 secret 值会在渲染前脱敏。",
    "- 不要把私有 config、token 或本地敏感路径贴到公开 issue。",
    ""
  ];
}

function renderLimitationsSectionEn(report: TransparencyReportModel): string[] {
  return [
    "## Limitations",
    "",
    `- Static only: ${String(report.limitations.staticOnly)}`,
    `- No runtime verification: ${String(report.limitations.noRuntimeVerification)}`,
    `- No exploit execution: ${String(report.limitations.noExploitExecution)}`,
    `- No external registry check: ${String(report.limitations.noExternalRegistryCheck)}`,
    `- Not proof of compromise: ${String(report.limitations.notProofOfCompromise)}`,
    ...report.limitations.notes.map((note) => `- ${note}`),
    ""
  ];
}

function renderLimitationsSectionZh(report: TransparencyReportModel): string[] {
  return [
    "## 局限性",
    "",
    `- Static only: ${String(report.limitations.staticOnly)}`,
    `- No runtime verification: ${String(report.limitations.noRuntimeVerification)}`,
    `- No exploit execution: ${String(report.limitations.noExploitExecution)}`,
    `- No external registry check: ${String(report.limitations.noExternalRegistryCheck)}`,
    `- Not proof of compromise: ${String(report.limitations.notProofOfCompromise)}`,
    "- 本报告只分析本地文件。",
    "- MCP Scope 没有执行 MCP servers 或 tools。",
    "- MCP Scope 没有连接实时 `tools/list` 端点。",
    "- MCP Scope 没有调用外部 AI APIs 或 registry。",
    "- 发现项是风险信号和警告，不是被攻击的证明。",
    ""
  ];
}

function renderServerTable(servers: readonly McpServerFingerprint[]): string {
  if (servers.length === 0) {
    return "No MCP server entries found.";
  }

  return [
    "| Name | Profile | Shape | Context | Transport | Command/URL | Env keys | Header keys | Permission hints | Capability hints | Risk level |",
    "| --- | --- | --- | --- | --- | --- | ---: | ---: | --- | --- | --- |",
    ...servers.map((server) =>
      [
        tableCell(server.name),
        tableCell(server.clientProfile),
        tableCell(server.sourceShape),
        tableCell(server.projectPathDisplay ?? server.sourceContextLabel),
        tableCell(server.transport),
        tableCell(commandOrUrl(server)),
        String(server.envKeyCount),
        String(server.headerKeyCount),
        tableCell(server.permissionHints.join(", ") || "none"),
        tableCell(server.capabilityHints.join(", ")),
        tableCell(server.riskLevel)
      ].join(" | ")
    )
  ].join("\n");
}

function renderToolTable(tools: readonly ToolMetadataToolResult[]): string {
  if (tools.length === 0) {
    return "No tool metadata entries found.";
  }

  return [
    "| Tool name | Title | Capability hints | Finding count | Highest severity | Categories |",
    "| --- | --- | --- | ---: | --- | --- |",
    ...tools.map((tool) =>
      [
        tableCell(tool.name),
        tableCell(tool.title ?? ""),
        tableCell(tool.capabilityHints.join(", ")),
        String(tool.findingCount),
        tableCell(tool.highestSeverity),
        tableCell([...new Set(tool.findings.map((finding) => finding.category))].join(", ") || "none")
      ].join(" | ")
    )
  ].join("\n");
}

function renderConfigNotes(config: McpScopeScanResult, lang: ReportLanguage): string[] {
  const notes = [
    ...config.transparencyNotes.map((note) => ({ serverName: "config", note })),
    ...config.servers.flatMap((server) => server.transparencyNotes.map((note) => ({ serverName: server.name, note })))
  ];

  if (notes.length === 0) {
    return [lang === "zh-CN" ? "- info: 没有额外 config 透明度提示。" : "- info: No additional config transparency notes."];
  }

  return notes.map(({ serverName, note }) =>
    `- ${note.level} / ${serverName}: ${lang === "zh-CN" ? translateFindingMessage(note.message) : note.message}`
  );
}

function flattenConfigFindings(config?: McpScopeScanResult): StableReportFinding[] {
  if (config === undefined) {
    return [];
  }

  return [
    ...config.transparencyNotes.map((note, index) =>
      configFinding(note, `config:${note.code}:${index}`, { type: "config", path: config.sourceFile })
    ),
    ...config.servers.flatMap((server) =>
      server.transparencyNotes.map((note, index) =>
        configFinding(note, `config-server:${server.name}:${note.code}:${index}`, {
          type: "config-server",
          name: server.name,
          path: config.sourceFile
        })
      )
    )
  ];
}

function flattenToolFindings(tools?: ToolMetadataScanResult): StableReportFinding[] {
  if (tools === undefined) {
    return [];
  }

  return [
    ...tools.manifestFindings.map((finding, index) => toolFinding(finding, `tool-manifest:${finding.ruleId}:${index}`, tools.sourceFile)),
    ...tools.tools.flatMap((tool) =>
      tool.findings.map((finding, index) => toolFinding(finding, `tool:${tool.name}:${finding.ruleId}:${index}`, tools.sourceFile))
    )
  ];
}

function configFinding(
  note: TransparencyNote,
  id: string,
  target: StableReportFinding["target"]
): StableReportFinding {
  return {
    id,
    ruleId: note.code,
    category: "config-transparency",
    severity: note.level,
    target,
    title: humanizeCode(note.code),
    message: note.message,
    evidence: target.name === undefined ? "config-level note" : `server "${target.name}"`,
    recommendation: "Review this config entry before approving the MCP server."
  };
}

function toolFinding(finding: ToolRiskFinding, id: string, sourceFile?: string): StableReportFinding {
  return {
    id,
    ruleId: finding.ruleId,
    category: finding.category,
    severity: finding.severity,
    target: {
      type: finding.target.type === "manifest" ? "tool-manifest" : "tool",
      name: finding.target.toolName,
      path: sourceFile
    },
    title: finding.title,
    message: finding.message,
    evidence: finding.evidence,
    recommendation: finding.recommendation
  };
}

function sortFindings(findings: readonly StableReportFinding[]): StableReportFinding[] {
  return [...findings].sort((a, b) => {
    const severityDiff = SEVERITY_RANK[b.severity] - SEVERITY_RANK[a.severity];

    if (severityDiff !== 0) {
      return severityDiff;
    }

    const categoryDiff = a.category.localeCompare(b.category);

    if (categoryDiff !== 0) {
      return categoryDiff;
    }

    return formatTarget(a.target).localeCompare(formatTarget(b.target));
  });
}

function countSeverities(levels: readonly Severity[]): Record<Severity, number> {
  return {
    info: levels.filter((level) => level === "info").length,
    low: levels.filter((level) => level === "low").length,
    medium: levels.filter((level) => level === "medium").length,
    high: levels.filter((level) => level === "high").length
  };
}

function countBy(values: readonly string[]): Record<string, number> {
  return values.reduce<Record<string, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {});
}

function countCapabilities(config?: McpScopeScanResult, tools?: ToolMetadataScanResult): Partial<Record<McpCapabilityCategory, number>> {
  return countBy([
    ...(config?.servers.flatMap((server) => server.capabilityHints) ?? []),
    ...(tools?.tools.flatMap((tool) => tool.capabilityHints) ?? [])
  ]) as Partial<Record<McpCapabilityCategory, number>>;
}

function highestSeverity(levels: readonly Severity[]): Severity {
  if (levels.length === 0) {
    return "info";
  }

  return levels.reduce((highest, level) => (SEVERITY_RANK[level] > SEVERITY_RANK[highest] ? level : highest), "info");
}

function formatTopEntries(counts: Record<string, number> | Partial<Record<McpCapabilityCategory, number>>, emptyLabel = "none"): string {
  const entries = Object.entries(counts)
    .filter(([, count]) => Number(count) > 0)
    .sort((a, b) => Number(b[1]) - Number(a[1]))
    .slice(0, 5)
    .map(([key, count]) => `${key} (${count})`);

  return entries.length === 0 ? emptyLabel : entries.join(", ");
}

function formatTarget(target: StableReportFinding["target"]): string {
  const name = target.name === undefined ? "" : `:${target.name}`;
  const path = target.path === undefined ? "" : ` (${target.path})`;

  return `${target.type}${name}${path}`;
}

function commandOrUrl(server: McpServerFingerprint): string {
  if (server.hasCommand) {
    return server.commandSummary;
  }

  if (server.rawUrlRedacted !== undefined) {
    return server.rawUrlRedacted;
  }

  return "none";
}

function humanizeCode(code: string): string {
  return code
    .split("_")
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function translateFindingMessage(message: string): string {
  if (message.includes("references a broad local path")) {
    return message.replace("references a broad local path", "引用了范围较宽的本地路径");
  }

  if (message.includes("references a sensitive-looking local path")) {
    return message.replace("references a sensitive-looking local path", "引用了看起来敏感的本地路径");
  }

  const exact: Record<string, string> = {
    "Transport type was omitted and command is present, so MCP Scope inferred stdio.": "配置省略了 transport type，但存在 command，因此 MCP Scope 按 stdio 处理。",
    "This stdio server starts a local process when used by an MCP client.": "这个 stdio server 被 MCP client 使用时会启动本地进程。",
    "Environment variable values are redacted; only key names are shown.": "环境变量的值已隐藏，报告只展示 key 名称。",
    "Header values are redacted; only key names are shown.": "header 的值已隐藏，报告只展示 key 名称。",
    "Tool description contains language that may try to steer the model outside normal tool use.": "工具描述包含可能引导模型偏离正常工具使用边界的文字。",
    "Tool description appears to redirect or constrain use of other tools.": "工具描述看起来在重定向或限制其他工具的使用。",
    "Tool metadata suggests write, execution, or destructive behavior without clear destructive/open-world annotation.": "工具元数据暗示写入、执行或破坏性行为，但没有清楚的 destructive/open-world annotation。",
    "Tool metadata references files, paths, directories, or filesystem operations.": "工具元数据提到了文件、路径、目录或 filesystem 操作。",
    "Tool metadata references sensitive-looking local paths.": "工具元数据提到了看起来敏感的本地路径。",
    "Tool metadata references credential-like names or fields. Values are not included in evidence.": "工具元数据提到了类似凭证的名称或字段；证据中不会包含值。",
    "Tool metadata references URLs, requests, endpoints, uploads, or webhooks.": "工具元数据提到了 URL、request、endpoint、upload 或 webhook。",
    "MCP Scope expected an object-style input schema for transparent parameter review.": "为了清楚审查参数，MCP Scope 期望看到 object 风格的 inputSchema。",
    "A tool parameter is missing a description, reducing user transparency.": "某个工具参数缺少描述，会降低用户可见性。",
    "The tool appears action-oriented but does not mark any input fields as required.": "该工具看起来会执行动作，但没有把任何输入字段标记为 required。",
    "The tool description is very short, which weakens user transparency.": "工具描述过短，会削弱用户理解。",
    "Very long descriptions can hide important instructions or warnings.": "过长的描述可能掩盖重要说明或警告。",
    "Annotations can help review, but they are metadata claims until server trust is established.": "Annotations 可以辅助审查，但在建立 server 信任前，它们只是元数据声明。",
    "Description suggests read-only behavior, while name or parameters suggest write, delete, update, or execution.": "描述暗示只读行为，但名称或参数又暗示写入、删除、更新或执行。",
    "More than one tool description contains fragment-sharing or reconstruction language.": "多个工具描述包含片段共享或重组相关表达。"
  };

  return exact[message] ?? message;
}

function translateRecommendation(recommendation: string): string {
  const exact: Record<string, string> = {
    "Review the tool description and server source before approving this tool.": "批准前请审查该工具描述和 server 源码。",
    "Check whether this metadata is necessary, accurate, and visible to users.": "检查这段元数据是否必要、准确，并且对用户可见。",
    "Require explicit review and clear user-facing permission language before use.": "使用前应进行明确审查，并提供清楚的用户可见权限说明。",
    "Review allowed paths and confirm values are visible before approval.": "批准前检查允许访问的路径，并确认关键值对用户可见。",
    "Avoid approving broad or sensitive path access without a clear need and review boundary.": "如果没有明确需求和审查边界，不要批准宽泛或敏感路径访问。",
    "Confirm the tool does not expose credential values and that users understand credential scope.": "确认工具不会暴露凭证值，并让用户理解凭证作用范围。",
    "Review destination visibility and whether network access is expected.": "检查目标地址是否清楚可见，以及网络访问是否符合预期。",
    "Prefer explicit object schemas with described properties.": "优先使用 object schema，并为属性写清楚描述。",
    "Add a concise parameter description.": "为参数补充简洁描述。",
    "Check whether required parameters should be explicit.": "检查是否应该明确 required 参数。",
    "Add a clear description of what the tool reads, changes, or sends.": "补充清楚说明：该工具会读取、修改或发送什么。",
    "Review long metadata manually and prefer concise descriptions.": "手动审查过长元数据，并优先使用简洁描述。",
    "Treat annotations as review hints, not proof of behavior.": "把 annotations 当作审查提示，不要当作行为证明。",
    "Review whether the description accurately reflects tool behavior.": "检查描述是否准确反映工具行为。",
    "Review tool descriptions together for hidden or distributed instruction patterns.": "把相关工具描述放在一起审查，查看是否存在隐藏或分布式指令模式。",
    "Review this config entry before approving the MCP server.": "批准 MCP server 前，请审查这个 config 条目。"
  };

  return exact[recommendation] ?? recommendation;
}

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\s+/g, " ");
}

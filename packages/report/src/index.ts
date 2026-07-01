import { FOUNDATION_STATUS, PROJECT_NAME, PROJECT_SLUG } from "@mcp-scope/core";
import type {
  McpScopeScanResult,
  McpServerFingerprint,
  ToolMetadataScanResult,
  ToolMetadataToolResult,
  ToolRiskFinding,
  TransparencyNote
} from "@mcp-scope/core";

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
    "Phase 2 statically fingerprints local MCP config files and local exported tool metadata. It does not execute MCP servers or call external APIs."
  ].join("\n");
}

export function renderScanResultMarkdown(result: McpScopeScanResult): string {
  return [
    "# MCP Scope Report",
    "",
    `- Source file: ${result.sourceFile ?? "unknown"}`,
    `- Generated: ${result.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Server count: ${result.serverCount}`,
    `- Highest risk level: ${result.highestRiskLevel}`,
    `- Env/header values redacted: ${String(result.secretsRedacted)}`,
    `- External API calls: ${String(result.externalApiCalls)}`,
    `- Server execution: ${String(result.serverExecution)}`,
    "",
    renderGlobalNotes(result.transparencyNotes),
    "## Servers",
    "",
    renderServerTable(result.servers),
    "",
    "## Server Details",
    "",
    ...result.servers.flatMap((server) => renderServerDetails(server)),
    ...renderOptionalToolMetadataSection(result.toolMetadata),
    "## Footer",
    "",
    "MCP Scope is an early transparency tool. Findings are static risk signals, not proof of compromise."
  ].join("\n");
}

export function renderScanResultJson(result: McpScopeScanResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

export function renderToolMetadataMarkdown(result: ToolMetadataScanResult): string {
  return [
    "# MCP Scope Tool Metadata Report",
    "",
    ...renderToolMetadataSummary(result),
    "",
    ...renderToolMetadataDetails(result),
    "## Footer",
    "",
    "MCP Scope is an early transparency tool. Findings are static risk signals, not proof of compromise."
  ].join("\n");
}

export function renderToolMetadataJson(result: ToolMetadataScanResult): string {
  return `${JSON.stringify(result, null, 2)}\n`;
}

function renderGlobalNotes(notes: readonly TransparencyNote[]): string {
  if (notes.length === 0) {
    return "";
  }

  return [
    "## Global Transparency Notes",
    "",
    ...notes.map((note) => `- ${note.level}: ${note.message}`),
    ""
  ].join("\n");
}

function renderServerTable(servers: readonly McpServerFingerprint[]): string {
  if (servers.length === 0) {
    return "No MCP server entries found.";
  }

  return [
    "| Name | Transport | Command/URL | Capability hints | Risk level |",
    "| --- | --- | --- | --- | --- |",
    ...servers.map((server) =>
      [
        tableCell(server.name),
        tableCell(server.transport),
        tableCell(commandOrUrl(server)),
        tableCell(server.capabilityHints.join(", ")),
        tableCell(server.riskLevel)
      ].join(" | ")
    )
  ].join("\n");
}

function renderServerDetails(server: McpServerFingerprint): string[] {
  return [
    `### ${server.name}`,
    "",
    `- Transport: ${server.transport}`,
    `- Command: ${server.commandSummary}`,
    `- URL: ${server.rawUrlRedacted ?? "none"}`,
    `- Args preview: ${server.argsPreview.length === 0 ? "none" : server.argsPreview.join(", ")}`,
    `- Env keys: ${server.envKeys.length === 0 ? "none" : server.envKeys.join(", ")}`,
    `- Header keys: ${server.headerKeys.length === 0 ? "none" : server.headerKeys.join(", ")}`,
    `- Risk level: ${server.riskLevel}`,
    `- Capability hints: ${server.capabilityHints.join(", ")}`,
    "",
    "Transparency notes:",
    ...renderNotes(server.transparencyNotes),
    ""
  ];
}

function renderOptionalToolMetadataSection(result?: ToolMetadataScanResult): string[] {
  if (result === undefined) {
    return [];
  }

  return [
    ...renderToolMetadataSummary(result),
    "",
    ...renderToolMetadataDetails(result)
  ];
}

function renderToolMetadataSummary(result: ToolMetadataScanResult): string[] {
  return [
    "## Tool Metadata Summary",
    "",
    `- Tool metadata source file: ${result.sourceFile ?? "unknown"}`,
    `- Metadata source type: ${result.sourceType}`,
    `- Tool count: ${result.toolCount}`,
    `- Finding count: ${result.findingCount}`,
    `- Highest tool risk level: ${result.highestSeverity}`,
    `- External API calls: ${String(result.externalApiCalls)}`,
    `- MCP server execution: ${String(result.serverExecution)}`,
    `- tools/list request sent: ${String(result.toolsListRequestSent)}`
  ];
}

function renderToolMetadataDetails(result: ToolMetadataScanResult): string[] {
  return [
    "## Tool Table",
    "",
    renderToolTable(result.tools),
    "",
    ...renderManifestFindings(result.manifestFindings),
    "## Per-Tool Findings",
    "",
    ...result.tools.flatMap((tool) => renderToolDetails(tool))
  ];
}

function renderToolTable(tools: readonly ToolMetadataToolResult[]): string {
  if (tools.length === 0) {
    return "No tool metadata entries found.";
  }

  return [
    "| Tool name | Title | Capability hints | Finding count | Highest severity |",
    "| --- | --- | --- | --- | --- |",
    ...tools.map((tool) =>
      [
        tableCell(tool.name),
        tableCell(tool.title ?? ""),
        tableCell(tool.capabilityHints.join(", ")),
        tableCell(String(tool.findingCount)),
        tableCell(tool.highestSeverity)
      ].join(" | ")
    )
  ].join("\n");
}

function renderManifestFindings(findings: readonly ToolRiskFinding[]): string[] {
  if (findings.length === 0) {
    return [];
  }

  return [
    "## Manifest-Level Findings",
    "",
    ...findings.flatMap((finding) => renderFinding(finding)),
    ""
  ];
}

function renderToolDetails(tool: ToolMetadataToolResult): string[] {
  return [
    `### ${tool.name}`,
    "",
    `- Title: ${tool.title ?? "none"}`,
    `- Capability hints: ${tool.capabilityHints.join(", ")}`,
    `- Finding count: ${tool.findingCount}`,
    `- Highest severity: ${tool.highestSeverity}`,
    "",
    ...(
      tool.findings.length === 0
        ? ["- info: No static tool metadata risk signals found.", ""]
        : tool.findings.flatMap((finding) => renderFinding(finding))
    )
  ];
}

function renderFinding(finding: ToolRiskFinding): string[] {
  return [
    `- ${finding.severity} / ${finding.category}: ${finding.title}`,
    `  - Message: ${finding.message}`,
    `  - Evidence: ${finding.evidence}`,
    `  - Recommendation: ${finding.recommendation}`,
    ""
  ];
}

function renderNotes(notes: readonly TransparencyNote[]): string[] {
  if (notes.length === 0) {
    return ["- info: No specific risk signals found in this static config entry."];
  }

  return notes.map((note) => `- ${note.level}: ${note.message}`);
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

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replace(/\s+/g, " ");
}

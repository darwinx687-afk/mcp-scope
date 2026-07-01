import { FOUNDATION_STATUS, PROJECT_NAME, PROJECT_SLUG } from "@mcp-scope/core";
import type { McpScopeScanResult, McpServerFingerprint, TransparencyNote } from "@mcp-scope/core";

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
    "Phase 1 statically fingerprints local MCP config files. It does not execute MCP servers or call external APIs."
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
    "## Footer",
    "",
    "MCP Scope is an early transparency tool. Findings are risk notes, not proof of compromise."
  ].join("\n");
}

export function renderScanResultJson(result: McpScopeScanResult): string {
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

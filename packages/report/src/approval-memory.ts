import { createHash } from "node:crypto";

import {
  PROJECT_NAME,
  PROJECT_SLUG,
  PROJECT_VERSION
} from "@mcp-scope/core";
import type {
  McpCapabilityCategory,
  McpServerFingerprint,
  RiskLevel,
  ToolMetadataToolResult,
  TransparencyNote
} from "@mcp-scope/core";
import type {
  FailOnThreshold,
  ReportLanguage,
  ReportRenderOptions,
  StableReportFinding,
  TransparencyReportModel
} from "./index.js";

export type SnapshotDigest = {
  readonly algorithm: "sha256";
  readonly value: string;
};

export type SnapshotCreationOptions = {
  readonly label?: string;
  readonly createdAt?: string;
};

export type SnapshotSource = {
  readonly configPath?: string;
  readonly toolsPath?: string;
  readonly metadataSourceType?: string;
};

export type McpScopeSnapshotEntry = SnapshotConfigServerEntry | SnapshotToolEntry | SnapshotManifestEntry;

export type SnapshotConfigServerEntry = {
  readonly entityKind: "config-server";
  readonly name: string;
  readonly digest: SnapshotDigest;
  readonly fingerprint: {
    readonly transport: string;
    readonly rawTransport?: string;
    readonly hasCommand: boolean;
    readonly commandSummary: string;
    readonly argCount: number;
    readonly argsPreview: readonly string[];
    readonly envKeys: readonly string[];
    readonly headerKeys: readonly string[];
    readonly hasUrl: boolean;
    readonly urlHost?: string;
    readonly rawUrlRedacted?: string;
    readonly capabilityHints: readonly McpCapabilityCategory[];
    readonly riskLevel: DiffSeverity;
    readonly transparencyNotes: readonly SnapshotFindingSignal[];
  };
};

export type SnapshotToolEntry = {
  readonly entityKind: "tool";
  readonly name: string;
  readonly digest: SnapshotDigest;
  readonly fingerprint: {
    readonly title?: string;
    readonly description: string;
    readonly inputSchema?: unknown;
    readonly outputSchema?: unknown;
    readonly annotations?: Record<string, unknown>;
    readonly inputParameters: readonly {
      readonly name: string;
      readonly type?: string;
      readonly description: string;
      readonly required: boolean;
    }[];
    readonly capabilityHints: readonly McpCapabilityCategory[];
    readonly findingCount: number;
    readonly highestSeverity: DiffSeverity;
    readonly findingRules: readonly SnapshotFindingSignal[];
  };
};

export type SnapshotManifestEntry = {
  readonly entityKind: "manifest";
  readonly name: "tool-metadata-manifest";
  readonly digest: SnapshotDigest;
  readonly fingerprint: {
    readonly sourceType?: string;
    readonly findingRules: readonly SnapshotFindingSignal[];
  };
};

export type SnapshotFindingSignal = {
  readonly id: string;
  readonly category: string;
  readonly severity: DiffSeverity;
};

export type McpScopeSnapshot = {
  readonly snapshotVersion: "0.1.0";
  readonly schemaVersion: 1;
  readonly createdAt: string;
  readonly label?: string;
  readonly project: {
    readonly name: typeof PROJECT_NAME;
    readonly slug: typeof PROJECT_SLUG;
    readonly version: typeof PROJECT_VERSION;
  };
  readonly scan: {
    readonly mode: "config-only" | "tools-only" | "combined";
    readonly externalApiCalls: false;
    readonly mcpServerExecution: false;
    readonly dynamicAnalysis: false;
    readonly secretValuesRedacted: true;
  };
  readonly sources: SnapshotSource;
  readonly redaction: {
    readonly envValuesRendered: false;
    readonly headerValuesRendered: false;
    readonly secretLikeValuesRendered: false;
    readonly notes: readonly string[];
  };
  readonly configServers: readonly SnapshotConfigServerEntry[];
  readonly tools: readonly SnapshotToolEntry[];
  readonly manifest?: SnapshotManifestEntry;
  readonly riskSummary: {
    readonly highestSeverity: DiffSeverity;
    readonly serverCount: number;
    readonly toolCount: number;
    readonly findingCount: number;
    readonly severityCounts: Record<DiffSeverity, number>;
    readonly categoryCounts: Record<string, number>;
  };
  readonly findingSummary: {
    readonly ruleIds: readonly string[];
    readonly categories: readonly string[];
  };
  readonly digests: {
    readonly snapshot: SnapshotDigest;
  };
  readonly limitations: {
    readonly staticOnly: true;
    readonly noRuntimeVerification: true;
    readonly noExternalRegistryCheck: true;
    readonly notProofOfCompromise: true;
    readonly approvalMemoryIsNotSafetyCertification: true;
    readonly notes: readonly string[];
  };
};

export type DiffChangeType =
  | "added"
  | "removed"
  | "changed"
  | "unchanged"
  | "severity-increased"
  | "severity-decreased"
  | "capability-changed"
  | "command-changed"
  | "args-changed"
  | "env-keys-changed"
  | "header-keys-changed"
  | "url-changed"
  | "description-changed"
  | "schema-changed"
  | "annotations-changed"
  | "risk-findings-changed";

export type DiffSeverity = Exclude<RiskLevel, "unknown">;

export type DiffCategory =
  | "config-drift"
  | "tool-metadata-drift"
  | "approval-memory"
  | "risk-change"
  | "capability-change"
  | "redaction"
  | "unknown";

export type EntityKind = "config-server" | "tool" | "manifest" | "report" | "unknown";

export type DiffChange = {
  readonly id: string;
  readonly changeType: DiffChangeType;
  readonly severity: DiffSeverity;
  readonly category: DiffCategory;
  readonly entity: {
    readonly kind: EntityKind;
    readonly name: string;
  };
  readonly message: string;
  readonly evidence: string;
  readonly recommendation: string;
  readonly before?: unknown;
  readonly after?: unknown;
};

export type SnapshotDiffOptions = {
  readonly snapshotPath?: string;
  readonly generatedAt?: string;
};

export type McpScopeDiffResult = {
  readonly diffVersion: "0.1.0";
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly baseline: {
    readonly snapshotPath?: string;
    readonly createdAt: string;
    readonly label?: string;
    readonly projectVersion: string;
  };
  readonly current: {
    readonly sources: SnapshotSource;
    readonly projectVersion: string;
  };
  readonly summary: {
    readonly addedServers: number;
    readonly removedServers: number;
    readonly changedServers: number;
    readonly addedTools: number;
    readonly removedTools: number;
    readonly changedTools: number;
    readonly severityIncreases: number;
    readonly newFindings: number;
    readonly resolvedFindings: number;
    readonly highestDiffSeverity: DiffSeverity;
    readonly changeCount: number;
  };
  readonly changes: readonly DiffChange[];
  readonly redaction: {
    readonly envValuesRendered: false;
    readonly headerValuesRendered: false;
    readonly secretLikeValuesRendered: false;
    readonly notes: readonly string[];
  };
  readonly limitations: {
    readonly staticOnly: true;
    readonly noRuntimeVerification: true;
    readonly noExternalRegistryCheck: true;
    readonly notProofOfCompromise: true;
    readonly approvalMemoryIsNotSafetyCertification: true;
    readonly notes: readonly string[];
  };
};

const SEVERITY_RANK: Record<DiffSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};

const REDACTION_NOTES = [
  "Environment variable values are never stored or rendered.",
  "Header values are never stored or rendered.",
  "Secret-like values in tool metadata examples are redacted before snapshot and diff rendering.",
  "Snapshots may contain tool metadata text and should be reviewed before committing publicly."
] as const;

const LIMITATION_NOTES = [
  "This snapshot and diff are static analysis of local files only.",
  "MCP Scope did not execute MCP servers or tools.",
  "MCP Scope did not connect to live tools/list endpoints.",
  "MCP Scope did not call external AI APIs or registries.",
  "Approval memory records a reviewed state; it is not safety certification."
] as const;

export function buildMcpScopeSnapshot(
  report: TransparencyReportModel,
  options: SnapshotCreationOptions = {}
): McpScopeSnapshot {
  const configServers = (report.config?.servers ?? []).map(snapshotServer);
  const tools = (report.tools?.tools ?? []).map(snapshotTool);
  const manifest = report.tools === undefined
    ? undefined
    : snapshotManifest(report.tools.sourceType, report.tools.manifestFindings);
  const ruleIds = uniqueSorted(report.findings.map((finding) => finding.ruleId));
  const categories = uniqueSorted(report.findings.map((finding) => finding.category));
  const withoutSnapshotDigest = {
    snapshotVersion: "0.1.0" as const,
    schemaVersion: 1 as const,
    createdAt: options.createdAt ?? new Date().toISOString(),
    label: options.label,
    project: {
      name: PROJECT_NAME,
      slug: PROJECT_SLUG,
      version: PROJECT_VERSION
    },
    scan: report.scan,
    sources: report.sources,
    redaction: {
      envValuesRendered: false as const,
      headerValuesRendered: false as const,
      secretLikeValuesRendered: false as const,
      notes: REDACTION_NOTES
    },
    configServers,
    tools,
    manifest,
    riskSummary: {
      highestSeverity: report.summary.highestSeverity,
      serverCount: report.summary.serverCount,
      toolCount: report.summary.toolCount,
      findingCount: report.summary.findingCount,
      severityCounts: report.summary.severityCounts,
      categoryCounts: report.summary.categoryCounts
    },
    findingSummary: {
      ruleIds,
      categories
    },
    limitations: limitations()
  };

  return {
    ...withoutSnapshotDigest,
    digests: {
      snapshot: digest(withoutSnapshotDigest)
    }
  };
}

export function parseMcpScopeSnapshotJson(json: string): McpScopeSnapshot {
  let parsed: unknown;

  try {
    parsed = JSON.parse(json);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid MCP Scope snapshot JSON: ${detail}`);
  }

  assertSnapshot(parsed);
  return parsed;
}

export function diffMcpScopeSnapshot(
  baseline: McpScopeSnapshot,
  currentReport: TransparencyReportModel,
  options: SnapshotDiffOptions = {}
): McpScopeDiffResult {
  const current = buildMcpScopeSnapshot(currentReport, { createdAt: currentReport.generatedAt });
  const changes: DiffChange[] = [];

  diffServers(baseline, current, changes);
  diffTools(baseline, current, changes);
  diffManifest(baseline, current, changes);

  const baselineFindings = aggregateFindingSignals(baseline);
  const currentFindings = aggregateFindingSignals(current);
  const newFindings = difference(currentFindings, baselineFindings).length;
  const resolvedFindings = difference(baselineFindings, currentFindings).length;
  const changedServers = uniqueEntityCount(changes, "config-server", ["changed", "severity-increased", "severity-decreased", "capability-changed", "command-changed", "args-changed", "env-keys-changed", "header-keys-changed", "url-changed", "risk-findings-changed"]);
  const changedTools = uniqueEntityCount(changes, "tool", ["changed", "severity-increased", "severity-decreased", "capability-changed", "description-changed", "schema-changed", "annotations-changed", "risk-findings-changed"]);

  return {
    diffVersion: "0.1.0",
    schemaVersion: 1,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    baseline: {
      snapshotPath: options.snapshotPath,
      createdAt: baseline.createdAt,
      label: baseline.label,
      projectVersion: baseline.project.version
    },
    current: {
      sources: current.sources,
      projectVersion: current.project.version
    },
    summary: {
      addedServers: changes.filter((change) => change.entity.kind === "config-server" && change.changeType === "added").length,
      removedServers: changes.filter((change) => change.entity.kind === "config-server" && change.changeType === "removed").length,
      changedServers,
      addedTools: changes.filter((change) => change.entity.kind === "tool" && change.changeType === "added").length,
      removedTools: changes.filter((change) => change.entity.kind === "tool" && change.changeType === "removed").length,
      changedTools,
      severityIncreases: changes.filter((change) => change.changeType === "severity-increased").length,
      newFindings,
      resolvedFindings,
      highestDiffSeverity: highestSeverity(changes.map((change) => change.severity)),
      changeCount: changes.length
    },
    changes: sortChanges(changes),
    redaction: {
      envValuesRendered: false,
      headerValuesRendered: false,
      secretLikeValuesRendered: false,
      notes: REDACTION_NOTES
    },
    limitations: limitations()
  };
}

export function renderDiffJson(diff: McpScopeDiffResult): string {
  return `${JSON.stringify(diff, null, 2)}\n`;
}

export function renderDiffMarkdown(diff: McpScopeDiffResult, options: ReportRenderOptions = {}): string {
  return options.lang === "zh-CN" ? renderDiffMarkdownZh(diff) : renderDiffMarkdownEn(diff);
}

export function renderDiffHtml(diff: McpScopeDiffResult, options: ReportRenderOptions = {}): string {
  const lang = options.lang ?? "en";
  const zh = lang === "zh-CN";
  const title = zh ? "MCP Scope Diff Report" : "MCP Scope Diff Report";
  const cards: readonly [string, number | string][] = [
    [zh ? "变更数" : "Changes", diff.summary.changeCount],
    [zh ? "最高 Diff 严重程度" : "Highest Diff Severity", diff.summary.highestDiffSeverity],
    [zh ? "新增 Tools" : "Added Tools", diff.summary.addedTools],
    [zh ? "变更 Tools" : "Changed Tools", diff.summary.changedTools],
    [zh ? "新增 Servers" : "Added Servers", diff.summary.addedServers],
    [zh ? "变更 Servers" : "Changed Servers", diff.summary.changedServers]
  ];

  return [
    "<!doctype html>",
    `<html lang="${escapeAttribute(lang)}">`,
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    `<title>${escapeHtml(title)}</title>`,
    `<style>${diffCss()}</style>`,
    "</head>",
    "<body>",
    '<main class="page">',
    "<header>",
    `<p>${escapeHtml(zh ? "静态 diff only" : "Static diff only")}</p>`,
    `<h1>${escapeHtml(title)}</h1>`,
    `<p>${escapeHtml(zh ? "Approval memory 不是安全认证。" : "Approval memory is not safety certification.")}</p>`,
    "</header>",
    '<section class="cards">',
    ...cards.map(([label, value]) => `<article><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></article>`),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "Baseline / Current" : "Baseline / Current")}</h2>`,
    keyValues([
      ["baseline.createdAt", diff.baseline.createdAt],
      ["baseline.label", diff.baseline.label ?? "none"],
      ["current.configPath", diff.current.sources.configPath ?? "not provided"],
      ["current.toolsPath", diff.current.sources.toolsPath ?? "not provided"]
    ]),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "Changes" : "Changes")}</h2>`,
    diff.changes.length === 0
      ? `<p class="muted">${escapeHtml(zh ? "没有检测到静态变化。" : "No static changes detected.")}</p>`
      : diff.changes.map((change) => changeCard(change)).join("\n"),
    "</section>",
    "<section>",
    `<h2>${escapeHtml(zh ? "Redaction and Limits" : "Redaction and Limits")}</h2>`,
    `<p>${escapeHtml("Env/header values rendered: false. Secret-like values rendered: false.")}</p>`,
    `<p>${escapeHtml(zh ? "本 diff 不执行 MCP servers，不请求实时 tools/list，也不调用外部 API。" : "This diff does not execute MCP servers, request live tools/list, or call external APIs.")}</p>`,
    "</section>",
    `<footer>${escapeHtml(zh ? "MCP Scope approval memory helps detect static changes. It does not prove a server is safe or compromised." : "MCP Scope approval memory helps detect static changes. It does not prove a server is safe or compromised.")}</footer>`,
    "</main>",
    "</body>",
    "</html>"
  ].join("\n");
}

export function shouldFailOnDiffSeverity(diff: McpScopeDiffResult, threshold: FailOnThreshold): boolean {
  if (threshold === "none" || diff.summary.changeCount === 0) {
    return false;
  }

  if (threshold === "info") {
    return diff.summary.changeCount > 0;
  }

  return compareSeverity(diff.summary.highestDiffSeverity, threshold) >= 0;
}

function snapshotServer(server: McpServerFingerprint): SnapshotConfigServerEntry {
  const fingerprint = {
    transport: server.transport,
    rawTransport: server.rawTransport,
    hasCommand: server.hasCommand,
    commandSummary: server.commandSummary,
    argCount: server.argCount,
    argsPreview: [...server.argsPreview],
    envKeys: sorted(server.envKeys),
    headerKeys: sorted(server.headerKeys),
    hasUrl: server.hasUrl,
    urlHost: server.urlHost,
    rawUrlRedacted: server.rawUrlRedacted,
    capabilityHints: sorted(server.capabilityHints),
    riskLevel: server.riskLevel,
    transparencyNotes: snapshotNotes(server.transparencyNotes)
  };

  return {
    entityKind: "config-server",
    name: server.name,
    digest: digest(fingerprint),
    fingerprint
  };
}

function snapshotTool(tool: ToolMetadataToolResult): SnapshotToolEntry {
  const fingerprint = {
    title: tool.title,
    description: safeText(tool.description),
    inputSchema: sanitizeForSnapshot(tool.inputSchema),
    outputSchema: sanitizeForSnapshot(tool.outputSchema),
    annotations: sanitizeForSnapshot(tool.annotations) as Record<string, unknown> | undefined,
    inputParameters: tool.inputParameters.map((parameter) => ({
      name: parameter.name,
      type: parameter.type,
      description: safeText(parameter.description),
      required: parameter.required
    })),
    capabilityHints: sorted(tool.capabilityHints),
    findingCount: tool.findingCount,
    highestSeverity: tool.highestSeverity,
    findingRules: snapshotToolFindings(tool.findings)
  };

  return {
    entityKind: "tool",
    name: tool.name,
    digest: digest(fingerprint),
    fingerprint
  };
}

function snapshotManifest(sourceType: string, findings: readonly { readonly ruleId: string; readonly category: string; readonly severity: DiffSeverity }[]): SnapshotManifestEntry {
  const fingerprint = {
    sourceType,
    findingRules: snapshotToolFindings(findings)
  };

  return {
    entityKind: "manifest",
    name: "tool-metadata-manifest",
    digest: digest(fingerprint),
    fingerprint
  };
}

function diffServers(baseline: McpScopeSnapshot, current: McpScopeSnapshot, changes: DiffChange[]): void {
  const before = mapByName(baseline.configServers);
  const after = mapByName(current.configServers);

  for (const name of sorted([...new Set([...before.keys(), ...after.keys()])])) {
    const oldEntry = before.get(name);
    const newEntry = after.get(name);

    if (oldEntry === undefined && newEntry !== undefined) {
      changes.push(change("added", severityForAddedRisk(newEntry.fingerprint.riskLevel), "config-drift", "config-server", name, "Config server was added.", `server "${name}" exists only in current scan`, "Review the new MCP server before approval.", undefined, summarizeServer(newEntry)));
      continue;
    }

    if (oldEntry !== undefined && newEntry === undefined) {
      changes.push(change("removed", "low", "config-drift", "config-server", name, "Config server was removed.", `server "${name}" exists only in baseline snapshot`, "Confirm the removal is expected.", summarizeServer(oldEntry), undefined));
      continue;
    }

    if (oldEntry === undefined || newEntry === undefined || oldEntry.digest.value === newEntry.digest.value) {
      continue;
    }

    comparePrimitive(changes, "config-server", name, "transport", oldEntry.fingerprint.transport, newEntry.fingerprint.transport, "changed", "config-drift", "medium", "Transport changed.", "Review whether the transport change alters runtime expectations.");
    comparePrimitive(changes, "config-server", name, "commandSummary", oldEntry.fingerprint.commandSummary, newEntry.fingerprint.commandSummary, "command-changed", "config-drift", commandSeverity(newEntry.fingerprint.commandSummary), "Startup command changed.", "Review the changed command before approval.");
    compareArray(changes, "config-server", name, "argsPreview", oldEntry.fingerprint.argsPreview, newEntry.fingerprint.argsPreview, "args-changed", "config-drift", argsSeverity(newEntry.fingerprint.argsPreview), "Startup args changed.", "Review changed args for paths, shell behavior, and network access.");
    compareArray(changes, "config-server", name, "envKeys", oldEntry.fingerprint.envKeys, newEntry.fingerprint.envKeys, "env-keys-changed", "config-drift", keySeverity(oldEntry.fingerprint.envKeys, newEntry.fingerprint.envKeys), "Env key set changed.", "Confirm the changed environment variable scope is expected.");
    compareArray(changes, "config-server", name, "headerKeys", oldEntry.fingerprint.headerKeys, newEntry.fingerprint.headerKeys, "header-keys-changed", "config-drift", keySeverity(oldEntry.fingerprint.headerKeys, newEntry.fingerprint.headerKeys), "Header key set changed.", "Confirm the changed header scope is expected.");
    comparePrimitive(changes, "config-server", name, "rawUrlRedacted", oldEntry.fingerprint.rawUrlRedacted ?? "", newEntry.fingerprint.rawUrlRedacted ?? "", "url-changed", "config-drift", "medium", "URL changed.", "Review the new destination before approval.");
    compareArray(changes, "config-server", name, "capabilityHints", oldEntry.fingerprint.capabilityHints, newEntry.fingerprint.capabilityHints, "capability-changed", "capability-change", "medium", "Capability hints changed.", "Review whether the new capability scope is expected.");
    compareSeverityField(changes, "config-server", name, oldEntry.fingerprint.riskLevel, newEntry.fingerprint.riskLevel);
    compareFindingRules(changes, "config-server", name, oldEntry.fingerprint.transparencyNotes, newEntry.fingerprint.transparencyNotes);
  }
}

function diffTools(baseline: McpScopeSnapshot, current: McpScopeSnapshot, changes: DiffChange[]): void {
  const before = mapByName(baseline.tools);
  const after = mapByName(current.tools);

  for (const name of sorted([...new Set([...before.keys(), ...after.keys()])])) {
    const oldEntry = before.get(name);
    const newEntry = after.get(name);

    if (oldEntry === undefined && newEntry !== undefined) {
      changes.push(change("added", severityForAddedRisk(newEntry.fingerprint.highestSeverity), "tool-metadata-drift", "tool", name, "Tool was added.", `tool "${name}" exists only in current scan`, "Review the new tool metadata and server source before approval.", undefined, summarizeTool(newEntry)));
      continue;
    }

    if (oldEntry !== undefined && newEntry === undefined) {
      changes.push(change("removed", "low", "tool-metadata-drift", "tool", name, "Tool was removed.", `tool "${name}" exists only in baseline snapshot`, "Confirm the removal is expected.", summarizeTool(oldEntry), undefined));
      continue;
    }

    if (oldEntry === undefined || newEntry === undefined || oldEntry.digest.value === newEntry.digest.value) {
      continue;
    }

    comparePrimitive(changes, "tool", name, "title", oldEntry.fingerprint.title ?? "", newEntry.fingerprint.title ?? "", "changed", "tool-metadata-drift", "low", "Tool title changed.", "Review whether the changed title matches expected behavior.");
    comparePrimitive(changes, "tool", name, "description", oldEntry.fingerprint.description, newEntry.fingerprint.description, "description-changed", "tool-metadata-drift", descriptionSeverity(newEntry), "Tool description changed.", "Review changed tool instructions before approval.");
    compareObject(changes, "tool", name, "inputSchema", oldEntry.fingerprint.inputSchema, newEntry.fingerprint.inputSchema, "schema-changed", "tool-metadata-drift", schemaSeverity(newEntry), "Input schema changed.", "Review changed parameters and required fields before approval.");
    compareObject(changes, "tool", name, "outputSchema", oldEntry.fingerprint.outputSchema, newEntry.fingerprint.outputSchema, "schema-changed", "tool-metadata-drift", "low", "Output schema changed.", "Review changed output shape for user-visible behavior.");
    compareObject(changes, "tool", name, "annotations", oldEntry.fingerprint.annotations, newEntry.fingerprint.annotations, "annotations-changed", "tool-metadata-drift", annotationSeverity(newEntry), "Annotations changed.", "Treat annotations as hints and review actual tool behavior.");
    compareArray(changes, "tool", name, "capabilityHints", oldEntry.fingerprint.capabilityHints, newEntry.fingerprint.capabilityHints, "capability-changed", "capability-change", "medium", "Capability hints changed.", "Review whether the changed capability scope is expected.");
    compareSeverityField(changes, "tool", name, oldEntry.fingerprint.highestSeverity, newEntry.fingerprint.highestSeverity);
    compareFindingRules(changes, "tool", name, oldEntry.fingerprint.findingRules, newEntry.fingerprint.findingRules);
  }
}

function diffManifest(baseline: McpScopeSnapshot, current: McpScopeSnapshot, changes: DiffChange[]): void {
  const oldManifest = baseline.manifest;
  const newManifest = current.manifest;

  if (oldManifest === undefined && newManifest === undefined) {
    return;
  }

  if (oldManifest === undefined || newManifest === undefined) {
    changes.push(change("changed", "low", "approval-memory", "manifest", "tool-metadata-manifest", "Tool metadata manifest presence changed.", "manifest exists in only one side of the diff", "Confirm whether tool metadata input is expected.", oldManifest?.fingerprint, newManifest?.fingerprint));
    return;
  }

  comparePrimitive(changes, "manifest", "tool-metadata-manifest", "sourceType", oldManifest.fingerprint.sourceType ?? "", newManifest.fingerprint.sourceType ?? "", "changed", "approval-memory", "low", "Metadata source type changed.", "Confirm the metadata source shape is expected.");
  compareFindingRules(changes, "manifest", "tool-metadata-manifest", oldManifest.fingerprint.findingRules, newManifest.fingerprint.findingRules);
}

function comparePrimitive(
  changes: DiffChange[],
  kind: EntityKind,
  name: string,
  field: string,
  before: string | number | boolean,
  after: string | number | boolean,
  changeType: DiffChangeType,
  category: DiffCategory,
  severity: DiffSeverity,
  message: string,
  recommendation: string
): void {
  if (before === after) {
    return;
  }

  changes.push(change(changeType, severity, category, kind, name, message, `${field} changed`, recommendation, before, after));
}

function compareArray(
  changes: DiffChange[],
  kind: EntityKind,
  name: string,
  field: string,
  before: readonly string[],
  after: readonly string[],
  changeType: DiffChangeType,
  category: DiffCategory,
  severity: DiffSeverity,
  message: string,
  recommendation: string
): void {
  if (stableStringify(before) === stableStringify(after)) {
    return;
  }

  changes.push(change(changeType, severity, category, kind, name, message, `${field} changed`, recommendation, before, after));
}

function compareObject(
  changes: DiffChange[],
  kind: EntityKind,
  name: string,
  field: string,
  before: unknown,
  after: unknown,
  changeType: DiffChangeType,
  category: DiffCategory,
  severity: DiffSeverity,
  message: string,
  recommendation: string
): void {
  if (stableStringify(before) === stableStringify(after)) {
    return;
  }

  changes.push(change(changeType, severity, category, kind, name, message, `${field} changed`, recommendation, summarizeValue(before), summarizeValue(after)));
}

function compareSeverityField(changes: DiffChange[], kind: EntityKind, name: string, before: DiffSeverity, after: DiffSeverity): void {
  const diff = compareSeverity(after, before);

  if (diff > 0) {
    changes.push(change("severity-increased", after, "risk-change", kind, name, "Severity increased.", `severity changed from ${before} to ${after}`, "Review the new higher-severity risk signals before approval.", before, after));
  } else if (diff < 0) {
    changes.push(change("severity-decreased", "low", "risk-change", kind, name, "Severity decreased.", `severity changed from ${before} to ${after}`, "Confirm whether the resolved or lower-severity state is expected.", before, after));
  }
}

function compareFindingRules(
  changes: DiffChange[],
  kind: EntityKind,
  name: string,
  before: readonly SnapshotFindingSignal[],
  after: readonly SnapshotFindingSignal[]
): void {
  const beforeSet = new Set(before.map(findingKey));
  const afterSet = new Set(after.map(findingKey));
  const added = after.filter((finding) => !beforeSet.has(findingKey(finding)));
  const removed = before.filter((finding) => !afterSet.has(findingKey(finding)));

  if (added.length === 0 && removed.length === 0) {
    return;
  }

  const addedHighest = highestSeverity(added.map((finding) => finding.severity));
  changes.push(change(
    "risk-findings-changed",
    added.length > 0 ? addedHighest : "low",
    "risk-change",
    kind,
    name,
    "Risk finding signals changed.",
    `${added.length} new finding signal(s), ${removed.length} resolved finding signal(s)`,
    "Review changed rule IDs and categories before relying on the previous approval memory.",
    before,
    after
  ));
}

function change(
  changeType: DiffChangeType,
  severity: DiffSeverity,
  category: DiffCategory,
  kind: EntityKind,
  name: string,
  message: string,
  evidence: string,
  recommendation: string,
  before?: unknown,
  after?: unknown
): DiffChange {
  const base = {
    changeType,
    severity,
    category,
    entity: { kind, name },
    message,
    evidence,
    recommendation,
    before,
    after
  };

  return {
    id: digest(base).value.slice(0, 16),
    ...base
  };
}

function renderDiffMarkdownEn(diff: McpScopeDiffResult): string {
  return [
    "# MCP Scope Diff Report",
    "",
    "- Static diff only",
    "- MCP server execution: false",
    "- External API calls: false",
    "- Secret values redacted: true",
    "- Approval memory is not safety certification",
    "",
    "## Baseline",
    "",
    `- Snapshot path: ${diff.baseline.snapshotPath ?? "not provided"}`,
    `- Created: ${diff.baseline.createdAt}`,
    `- Label: ${diff.baseline.label ?? "none"}`,
    `- Project version: ${diff.baseline.projectVersion}`,
    "",
    "## Current",
    "",
    `- Config source: ${diff.current.sources.configPath ?? "not provided"}`,
    `- Tool metadata source: ${diff.current.sources.toolsPath ?? "not provided"}`,
    `- Project version: ${diff.current.projectVersion}`,
    "",
    "## Summary",
    "",
    ...summaryLines(diff),
    "",
    "## Change Table",
    "",
    renderChangeTable(diff),
    "",
    "## Detailed Changes",
    "",
    ...(diff.changes.length === 0 ? ["No static changes detected.", ""] : diff.changes.flatMap(renderChangeDetail)),
    "",
    ...renderDiffRedactionAndLimits("en"),
    "## Footer",
    "",
    "MCP Scope approval memory helps detect static changes. It does not prove a server is safe or compromised."
  ].join("\n");
}

function renderDiffMarkdownZh(diff: McpScopeDiffResult): string {
  return [
    "# MCP Scope Diff Report",
    "",
    "- 仅做静态 diff",
    "- MCP server execution: false",
    "- External API calls: false",
    "- Secret values redacted: true",
    "- Approval memory 不是安全认证",
    "",
    "## Baseline",
    "",
    `- Snapshot path: ${diff.baseline.snapshotPath ?? "未提供"}`,
    `- Created: ${diff.baseline.createdAt}`,
    `- Label: ${diff.baseline.label ?? "无"}`,
    `- Project version: ${diff.baseline.projectVersion}`,
    "",
    "## Current",
    "",
    `- Config source: ${diff.current.sources.configPath ?? "未提供"}`,
    `- Tool metadata source: ${diff.current.sources.toolsPath ?? "未提供"}`,
    `- Project version: ${diff.current.projectVersion}`,
    "",
    "## 摘要",
    "",
    ...summaryLines(diff),
    "",
    "## 变更表",
    "",
    renderChangeTable(diff),
    "",
    "## 变更详情",
    "",
    ...(diff.changes.length === 0 ? ["没有检测到静态变化。", ""] : diff.changes.flatMap(renderChangeDetailZh)),
    "",
    ...renderDiffRedactionAndLimits("zh-CN"),
    "## 页脚",
    "",
    "MCP Scope approval memory 用来发现静态变化。它不能证明 server 安全，也不能证明已被攻击。"
  ].join("\n");
}

function summaryLines(diff: McpScopeDiffResult): string[] {
  return [
    `- Change count: ${diff.summary.changeCount}`,
    `- Highest diff severity: ${diff.summary.highestDiffSeverity}`,
    `- Added servers: ${diff.summary.addedServers}`,
    `- Removed servers: ${diff.summary.removedServers}`,
    `- Changed servers: ${diff.summary.changedServers}`,
    `- Added tools: ${diff.summary.addedTools}`,
    `- Removed tools: ${diff.summary.removedTools}`,
    `- Changed tools: ${diff.summary.changedTools}`,
    `- Severity increases: ${diff.summary.severityIncreases}`,
    `- New findings: ${diff.summary.newFindings}`,
    `- Resolved findings: ${diff.summary.resolvedFindings}`
  ];
}

function renderChangeTable(diff: McpScopeDiffResult): string {
  if (diff.changes.length === 0) {
    return "No changes.";
  }

  return [
    "| Severity | Entity kind | Entity name | Change type | Category | Message |",
    "| --- | --- | --- | --- | --- | --- |",
    ...diff.changes.map((changeItem) => [
      tableCell(changeItem.severity),
      tableCell(changeItem.entity.kind),
      tableCell(changeItem.entity.name),
      tableCell(changeItem.changeType),
      tableCell(changeItem.category),
      tableCell(changeItem.message)
    ].join(" | "))
  ].join("\n");
}

function renderChangeDetail(changeItem: DiffChange): string[] {
  return [
    `### ${changeItem.severity.toUpperCase()} / ${changeItem.entity.kind}:${changeItem.entity.name} / ${changeItem.changeType}`,
    "",
    `- Category: ${changeItem.category}`,
    `- Message: ${changeItem.message}`,
    `- Evidence: ${changeItem.evidence}`,
    `- Recommendation: ${changeItem.recommendation}`,
    changeItem.before === undefined ? "" : `- Before: \`${inlineJson(changeItem.before)}\``,
    changeItem.after === undefined ? "" : `- After: \`${inlineJson(changeItem.after)}\``,
    ""
  ].filter((line) => line !== "");
}

function renderChangeDetailZh(changeItem: DiffChange): string[] {
  return [
    `### ${changeItem.severity.toUpperCase()} / ${changeItem.entity.kind}:${changeItem.entity.name} / ${changeItem.changeType}`,
    "",
    `- Category: ${changeItem.category}`,
    `- 说明: ${changeItem.message}`,
    `- 证据: ${changeItem.evidence}`,
    `- 建议: ${changeItem.recommendation}`,
    changeItem.before === undefined ? "" : `- Before: \`${inlineJson(changeItem.before)}\``,
    changeItem.after === undefined ? "" : `- After: \`${inlineJson(changeItem.after)}\``,
    ""
  ].filter((line) => line !== "");
}

function renderDiffRedactionAndLimits(lang: ReportLanguage): string[] {
  if (lang === "zh-CN") {
    return [
      "## 脱敏说明",
      "",
      "- Env values rendered: false",
      "- Header values rendered: false",
      "- Secret-like values rendered: false",
      "- snapshot 和 diff 不会存储或展示 env/header values。",
      "",
      "## 局限性",
      "",
      "- Static only: true",
      "- No runtime verification: true",
      "- No external registry check: true",
      "- Not proof of compromise: true",
      "- Approval memory is not safety certification: true",
      ""
    ];
  }

  return [
    "## Redaction",
    "",
    "- Env values rendered: false",
    "- Header values rendered: false",
    "- Secret-like values rendered: false",
    "- Snapshots and diffs do not store or render env/header values.",
    "",
    "## Limitations",
    "",
    "- Static only: true",
    "- No runtime verification: true",
    "- No external registry check: true",
    "- Not proof of compromise: true",
    "- Approval memory is not safety certification: true",
    ""
  ];
}

function changeCard(changeItem: DiffChange): string {
  const rawRows: [string, unknown][] = [
    ["category", changeItem.category],
    ["message", changeItem.message],
    ["evidence", changeItem.evidence],
    ["recommendation", changeItem.recommendation],
    ["before", changeItem.before === undefined ? "" : inlineJson(changeItem.before)],
    ["after", changeItem.after === undefined ? "" : inlineJson(changeItem.after)]
  ];
  const rows = rawRows.filter(([, value]) => value !== "");

  return `
    <article class="change ${escapeAttribute(changeItem.severity)}">
      <div class="row">
        <span class="pill">${escapeHtml(changeItem.severity)}</span>
        <span class="pill">${escapeHtml(changeItem.entity.kind)}</span>
        <span class="pill">${escapeHtml(changeItem.changeType)}</span>
      </div>
      <h3>${escapeHtml(changeItem.entity.name)}</h3>
      ${keyValues(rows)}
    </article>`;
}

function keyValues(rows: readonly (readonly [string, unknown])[]): string {
  return `<dl>${rows.map(([key, value]) => `<div><dt>${escapeHtml(key)}</dt><dd>${escapeHtml(value)}</dd></div>`).join("")}</dl>`;
}

function diffCss(): string {
  return `
    :root { --ink: #172033; --muted: #64748b; --line: #dbe3ef; --panel: #fff; --bg: #eef3f8; --high: #b42318; --medium: #b45309; --low: #4d7c0f; --info: #2563eb; }
    * { box-sizing: border-box; }
    body { margin: 0; color: var(--ink); background: var(--bg); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; line-height: 1.5; }
    .page { width: min(1080px, calc(100% - 32px)); margin: 0 auto; padding: 28px 0 38px; }
    header, section, .change { background: var(--panel); border: 1px solid var(--line); border-radius: 8px; padding: 22px; margin-top: 18px; }
    h1 { margin: 0; font-size: clamp(34px, 5vw, 56px); letter-spacing: 0; }
    h2 { margin: 0 0 14px; font-size: 22px; letter-spacing: 0; }
    h3 { margin: 12px 0; font-size: 18px; letter-spacing: 0; }
    header p { margin: 6px 0; color: var(--muted); }
    .cards { display: grid; grid-template-columns: repeat(3, minmax(140px, 1fr)); gap: 12px; padding: 0; background: transparent; border: 0; }
    .cards article { min-width: 0; padding: 16px; border: 1px solid var(--line); border-radius: 8px; background: var(--panel); }
    .cards span { display: block; color: var(--muted); font-size: 13px; }
    .cards strong { display: block; margin-top: 8px; font-size: 24px; overflow-wrap: anywhere; }
    .row { display: flex; flex-wrap: wrap; gap: 8px; }
    .pill { display: inline-flex; padding: 4px 9px; border: 1px solid var(--line); border-radius: 999px; background: #f6f8fb; font-size: 13px; font-weight: 750; }
    .change.high { border-left: 5px solid var(--high); }
    .change.medium { border-left: 5px solid var(--medium); }
    .change.low { border-left: 5px solid var(--low); }
    .change.info { border-left: 5px solid var(--info); }
    dl { display: grid; gap: 8px; margin: 0; }
    dl div { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--line); }
    dt { color: var(--muted); font-weight: 750; }
    dd { margin: 0; overflow-wrap: anywhere; }
    .muted, footer { color: var(--muted); }
    footer { margin-top: 24px; text-align: center; font-size: 14px; }
    @media (max-width: 760px) { .cards { grid-template-columns: 1fr; } dl div { grid-template-columns: 1fr; } }
  `;
}

function assertSnapshot(value: unknown): asserts value is McpScopeSnapshot {
  if (!isObject(value)) {
    throw new Error("MCP Scope snapshot must be a JSON object.");
  }

  if (value["snapshotVersion"] !== "0.1.0" || value["schemaVersion"] !== 1) {
    throw new Error("MCP Scope snapshot must use snapshotVersion 0.1.0 and schemaVersion 1.");
  }

  if (!Array.isArray(value["configServers"]) || !Array.isArray(value["tools"]) || !isObject(value["scan"])) {
    throw new Error("MCP Scope snapshot is missing scan, configServers, or tools fields.");
  }
}

function snapshotNotes(notes: readonly TransparencyNote[]): readonly SnapshotFindingSignal[] {
  return notes.map((note) => ({
    id: note.code,
    category: "config-transparency",
    severity: note.level
  })).sort(compareFindingSignal);
}

function snapshotToolFindings(findings: readonly { readonly ruleId: string; readonly category: string; readonly severity: DiffSeverity }[]): readonly SnapshotFindingSignal[] {
  return findings.map((finding) => ({
    id: finding.ruleId,
    category: finding.category,
    severity: finding.severity
  })).sort(compareFindingSignal);
}

function aggregateFindingSignals(snapshot: McpScopeSnapshot): readonly string[] {
  return sorted([
    ...snapshot.configServers.flatMap((server) => server.fingerprint.transparencyNotes.map((note) => `config-server:${server.name}:${findingKey(note)}`)),
    ...snapshot.tools.flatMap((tool) => tool.fingerprint.findingRules.map((finding) => `tool:${tool.name}:${findingKey(finding)}`)),
    ...(snapshot.manifest?.fingerprint.findingRules.map((finding) => `manifest:tool-metadata-manifest:${findingKey(finding)}`) ?? [])
  ]);
}

function findingKey(finding: SnapshotFindingSignal): string {
  return `${finding.id}:${finding.category}:${finding.severity}`;
}

function compareFindingSignal(a: SnapshotFindingSignal, b: SnapshotFindingSignal): number {
  return a.id.localeCompare(b.id) || a.category.localeCompare(b.category) || a.severity.localeCompare(b.severity);
}

function sanitizeForSnapshot(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeForSnapshot(item));
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map((key) => [key, sanitizeForSnapshotValue(key, value[key])])
    );
  }

  if (typeof value === "string") {
    return safeText(value);
  }

  return value;
}

function sanitizeForSnapshotValue(key: string, value: unknown): unknown {
  if (typeof value === "string" && shouldRedactString(key, value)) {
    return "[redacted]";
  }

  return sanitizeForSnapshot(value);
}

function safeText(value: string): string {
  return shouldRedactString("text", value) ? "[redacted]" : value;
}

function shouldRedactString(key: string, value: string): boolean {
  const keyLooksSecret = /(secret|token|password|authorization|credential|api[_-]?key)/i.test(key);
  const valueLooksSecret = /(REDACTED_EXAMPLE_TOKEN|example-api-key-do-not-use|secret-header-value|secret-query-token|Bearer\s+\S+|sk-[A-Za-z0-9]{8,}|api[_-]?key=|password=|token=|secret=)/i.test(value);

  return valueLooksSecret || (keyLooksSecret && value.length > 24 && /[A-Za-z0-9]/.test(value));
}

function summarizeServer(entry: SnapshotConfigServerEntry): Record<string, unknown> {
  return {
    transport: entry.fingerprint.transport,
    commandSummary: entry.fingerprint.commandSummary,
    argsPreview: entry.fingerprint.argsPreview,
    envKeys: entry.fingerprint.envKeys,
    headerKeys: entry.fingerprint.headerKeys,
    rawUrlRedacted: entry.fingerprint.rawUrlRedacted,
    capabilityHints: entry.fingerprint.capabilityHints,
    riskLevel: entry.fingerprint.riskLevel
  };
}

function summarizeTool(entry: SnapshotToolEntry): Record<string, unknown> {
  return {
    title: entry.fingerprint.title,
    description: entry.fingerprint.description,
    capabilityHints: entry.fingerprint.capabilityHints,
    findingCount: entry.fingerprint.findingCount,
    highestSeverity: entry.fingerprint.highestSeverity,
    findingRuleIds: entry.fingerprint.findingRules.map((finding) => finding.id)
  };
}

function summarizeValue(value: unknown): unknown {
  if (value === undefined || value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.length <= 8 ? value : [...value.slice(0, 8), `... ${value.length - 8} more`];
  }

  return stableValue(value);
}

function descriptionSeverity(tool: SnapshotToolEntry): DiffSeverity {
  return tool.fingerprint.findingRules.some((finding) => finding.id === "metadata_injection_phrase" && finding.severity === "high")
    ? "high"
    : "low";
}

function schemaSeverity(tool: SnapshotToolEntry): DiffSeverity {
  return actionOriented(tool) ? "medium" : "low";
}

function annotationSeverity(tool: SnapshotToolEntry): DiffSeverity {
  return tool.fingerprint.findingRules.some((finding) => finding.id === "permission_mismatch_readonly_vs_action")
    ? "medium"
    : "low";
}

function actionOriented(tool: SnapshotToolEntry): boolean {
  return /\b(write|delete|update|create|post|send|execute|run|upload|remove|modify)\b/i.test(`${tool.name} ${tool.fingerprint.description}`);
}

function commandSeverity(command: string): DiffSeverity {
  return /\b(bash|sh|zsh|curl|wget|powershell|cmd)\b/i.test(command) ? "high" : "medium";
}

function argsSeverity(args: readonly string[]): DiffSeverity {
  return args.some((arg) => /(\.ssh|id_rsa|\.env|curl|wget|bash|sh)/i.test(arg)) ? "high" : "medium";
}

function keySeverity(before: readonly string[], after: readonly string[]): DiffSeverity {
  const added = difference(after, before);
  return added.some((key) => /(secret|token|password|authorization|credential|api[_-]?key)/i.test(key)) ? "medium" : "low";
}

function severityForAddedRisk(severity: DiffSeverity): DiffSeverity {
  return severity === "high" || severity === "medium" ? severity : "low";
}

function highestSeverity(values: readonly DiffSeverity[]): DiffSeverity {
  if (values.length === 0) {
    return "info";
  }

  return values.reduce((highest, value) => compareSeverity(value, highest) > 0 ? value : highest, "info");
}

function compareSeverity(a: DiffSeverity | string, b: DiffSeverity | string): number {
  return severityRank(a) - severityRank(b);
}

function severityRank(value: DiffSeverity | string): number {
  return isSeverity(value) ? SEVERITY_RANK[value] : -1;
}

function isSeverity(value: string): value is DiffSeverity {
  return value === "info" || value === "low" || value === "medium" || value === "high";
}

function uniqueEntityCount(changes: readonly DiffChange[], kind: EntityKind, changeTypes: readonly DiffChangeType[]): number {
  return new Set(changes
    .filter((changeItem) => changeItem.entity.kind === kind && changeTypes.includes(changeItem.changeType))
    .map((changeItem) => changeItem.entity.name)).size;
}

function sortChanges(changes: readonly DiffChange[]): readonly DiffChange[] {
  return [...changes].sort((a, b) =>
    compareSeverity(b.severity, a.severity) ||
    a.entity.kind.localeCompare(b.entity.kind) ||
    a.entity.name.localeCompare(b.entity.name) ||
    a.changeType.localeCompare(b.changeType)
  );
}

function mapByName<T extends { readonly name: string }>(entries: readonly T[]): Map<string, T> {
  return new Map(entries.map((entry) => [entry.name, entry]));
}

function digest(value: unknown): SnapshotDigest {
  return {
    algorithm: "sha256",
    value: createHash("sha256").update(stableStringify(value)).digest("hex")
  };
}

function stableStringify(value: unknown): string {
  return JSON.stringify(stableValue(value));
}

function stableValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stableValue);
  }

  if (isObject(value)) {
    return Object.fromEntries(
      Object.keys(value)
        .filter((key) => value[key] !== undefined)
        .sort()
        .map((key) => [key, stableValue(value[key])])
    );
  }

  return value;
}

function limitations(): McpScopeSnapshot["limitations"] {
  return {
    staticOnly: true,
    noRuntimeVerification: true,
    noExternalRegistryCheck: true,
    notProofOfCompromise: true,
    approvalMemoryIsNotSafetyCertification: true,
    notes: LIMITATION_NOTES
  };
}

function uniqueSorted(values: readonly string[]): readonly string[] {
  return sorted([...new Set(values)]);
}

function sorted<T extends string>(values: readonly T[]): T[] {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function difference<T>(values: readonly T[], baseline: readonly T[]): T[] {
  const baselineSet = new Set(baseline);
  return values.filter((value) => !baselineSet.has(value));
}

function inlineJson(value: unknown): string {
  return stableStringify(value).replaceAll("`", "'");
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

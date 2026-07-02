import { createHash } from "node:crypto";
import { relative } from "node:path";

import { PROJECT_NAME, PROJECT_VERSION, type McpScopeAuditResult, type McpScopeScanResult } from "@mcp-scope/core";
import type { StableReportFinding, TransparencyReportModel } from "./index.js";

type SarifLevel = "error" | "warning" | "note";
type SarifInputResult = {
  readonly ruleId: string;
  readonly severity: "info" | "low" | "medium" | "high";
  readonly category: string;
  readonly message: string;
  readonly target: unknown;
  readonly sourceKind: string;
  readonly artifactUri: string;
};

export type SarifRenderOptions = {
  readonly workingDirectory?: string;
};

export function renderSarifReport(
  report: TransparencyReportModel,
  options: SarifRenderOptions = {}
): string {
  return `${JSON.stringify(buildSarifLog(reportFindings(report), options), null, 2)}\n`;
}

export function renderAuditSarif(
  audit: McpScopeAuditResult,
  options: SarifRenderOptions = {}
): string {
  return `${JSON.stringify(buildSarifLog(auditFindings(audit), options), null, 2)}\n`;
}

function buildSarifLog(results: readonly SarifInputResult[], options: SarifRenderOptions): unknown {
  const rules = uniqueRules(results);

  return {
    version: "2.1.0",
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    runs: [
      {
        tool: {
          driver: {
            name: PROJECT_NAME,
            semanticVersion: PROJECT_VERSION,
            informationUri: "https://github.com/darwinx687-afk/mcp-scope",
            rules
          }
        },
        results: results.map((result) => sarifResult(result, options))
      }
    ]
  };
}

function uniqueRules(results: readonly SarifInputResult[]): unknown[] {
  const byRule = new Map<string, SarifInputResult>();

  for (const result of results) {
    if (!byRule.has(result.ruleId)) {
      byRule.set(result.ruleId, result);
    }
  }

  return [...byRule.values()]
    .sort((a, b) => a.ruleId.localeCompare(b.ruleId))
    .map((result) => ({
      id: result.ruleId,
      name: result.ruleId,
      shortDescription: {
        text: safeText(humanizeRuleId(result.ruleId))
      },
      fullDescription: {
        text: safeText(`${result.category} static MCP Scope signal.`)
      },
      defaultConfiguration: {
        level: mapSarifLevel(result.severity)
      },
      properties: {
        category: result.category,
        staticOnly: true,
        secretValuesRedacted: true,
        notProofOfCompromise: true
      }
    }));
}

function sarifResult(result: SarifInputResult, options: SarifRenderOptions): unknown {
  const artifactUri = normalizeArtifactUri(result.artifactUri, options.workingDirectory);
  const target = safeText(JSON.stringify(result.target));

  return {
    ruleId: result.ruleId,
    level: mapSarifLevel(result.severity),
    message: {
      text: safeText(result.message)
    },
    locations: [
      {
        physicalLocation: {
          artifactLocation: {
            uri: artifactUri
          }
        }
      }
    ],
    partialFingerprints: {
      mcpScopeStableId: stableFingerprint([
        result.ruleId,
        result.severity,
        result.category,
        artifactUri,
        target,
        result.message
      ])
    },
    properties: {
      mcpScopeSeverity: result.severity,
      category: result.category,
      target: result.target,
      sourceKind: result.sourceKind,
      staticOnly: true,
      secretValuesRedacted: true,
      notProofOfCompromise: true
    }
  };
}

function reportFindings(report: TransparencyReportModel): SarifInputResult[] {
  return report.findings.map((finding) => ({
    ruleId: finding.ruleId,
    severity: finding.severity,
    category: finding.category,
    message: finding.message,
    target: finding.target,
    sourceKind: sourceKindForTarget(finding.target.type),
    artifactUri: finding.target.path ?? report.sources.configPath ?? report.sources.toolsPath ?? "mcp-scope-report"
  }));
}

function auditFindings(audit: McpScopeAuditResult): SarifInputResult[] {
  return audit.scannedConfigs.flatMap((scan) => scanFindings(scan));
}

function scanFindings(scan: McpScopeScanResult): SarifInputResult[] {
  return [
    ...scan.transparencyNotes.map((note, index) => ({
      ruleId: note.code,
      severity: note.level,
      category: "config-transparency",
      message: note.message,
      target: {
        type: "config",
        path: scan.sourceFile,
        index
      },
      sourceKind: "mcp-config",
      artifactUri: scan.sourceFile ?? "mcp-config"
    })),
    ...scan.servers.flatMap((server) =>
      server.transparencyNotes.map((note, index) => ({
        ruleId: note.code,
        severity: note.level,
        category: "config-transparency",
        message: note.message,
        target: {
          type: "config-server",
          name: server.name,
          path: scan.sourceFile,
          serverKeyPath: server.serverKeyPath,
          index
        },
        sourceKind: "mcp-config",
        artifactUri: scan.sourceFile ?? "mcp-config"
      }))
    )
  ];
}

function mapSarifLevel(severity: "info" | "low" | "medium" | "high"): SarifLevel {
  if (severity === "high") {
    return "error";
  }

  if (severity === "medium" || severity === "low") {
    return "warning";
  }

  return "note";
}

function sourceKindForTarget(type: StableReportFinding["target"]["type"]): string {
  if (type === "tool" || type === "tool-manifest") {
    return "tool-metadata";
  }

  return "mcp-config";
}

function normalizeArtifactUri(uri: string, workingDirectory = process.cwd()): string {
  const slashUri = uri.replaceAll("\\", "/");

  if (slashUri.startsWith("~/") || !slashUri.startsWith("/")) {
    return slashUri;
  }

  const relativeUri = relative(workingDirectory, uri).replaceAll("\\", "/");

  if (relativeUri !== "" && !relativeUri.startsWith("../") && relativeUri !== "..") {
    return relativeUri;
  }

  return slashUri;
}

function humanizeRuleId(ruleId: string): string {
  return ruleId
    .replaceAll("-", "_")
    .split("_")
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function stableFingerprint(parts: readonly string[]): string {
  return createHash("sha256").update(parts.join("\0")).digest("hex");
}

function safeText(value: string): string {
  return value
    .replaceAll("REDACTED_EXAMPLE_TOKEN", "[redacted]")
    .replaceAll("example-api-key-do-not-use", "[redacted]")
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/(token|api[_-]?key|secret)=([^&\s]+)/gi, "$1=[redacted]");
}

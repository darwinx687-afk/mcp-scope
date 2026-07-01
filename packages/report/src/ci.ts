import type { RiskLevel } from "@mcp-scope/core";
import type { TransparencyReportModel } from "./index.js";

export type ReportSeverity = Exclude<RiskLevel, "unknown">;
export type FailOnThreshold = "none" | ReportSeverity;

export type CiReportSummary = {
  readonly highestSeverity: ReportSeverity | "unknown";
  readonly findingCount: number;
  readonly serverCount: number;
  readonly toolCount: number;
  readonly scanMode: string;
  readonly externalApiCalls: boolean;
  readonly mcpServerExecution: boolean;
  readonly secretValuesRedacted: boolean;
};

const SEVERITY_RANK: Record<ReportSeverity, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};

export function isFailOnThreshold(value: string): value is FailOnThreshold {
  return value === "none" || isReportSeverity(value);
}

export function compareSeverity(a: unknown, b: unknown): number {
  return severityRank(a) - severityRank(b);
}

export function shouldFailOnSeverity(
  highestSeverity: unknown,
  threshold: FailOnThreshold,
  findingCount = 0
): boolean {
  if (threshold === "none" || findingCount <= 0) {
    return false;
  }

  if (threshold === "info") {
    return findingCount > 0;
  }

  if (!isReportSeverity(highestSeverity)) {
    return false;
  }

  return compareSeverity(highestSeverity, threshold) >= 0;
}

export function summarizeReportForCi(report: TransparencyReportModel): CiReportSummary {
  return {
    highestSeverity: isReportSeverity(report.summary.highestSeverity)
      ? report.summary.highestSeverity
      : "unknown",
    findingCount: nonNegativeInteger(report.summary.findingCount),
    serverCount: nonNegativeInteger(report.summary.serverCount),
    toolCount: nonNegativeInteger(report.summary.toolCount),
    scanMode: report.scan.mode,
    externalApiCalls: report.scan.externalApiCalls,
    mcpServerExecution: report.scan.mcpServerExecution,
    secretValuesRedacted: report.scan.secretValuesRedacted
  };
}

function severityRank(value: unknown): number {
  return isReportSeverity(value) ? SEVERITY_RANK[value] : -1;
}

function isReportSeverity(value: unknown): value is ReportSeverity {
  return value === "info" || value === "low" || value === "medium" || value === "high";
}

function nonNegativeInteger(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

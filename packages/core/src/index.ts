export const PROJECT_NAME = "MCP Scope" as const;
export const PROJECT_SLUG = "mcp-scope" as const;
export const PROJECT_VERSION = "0.0.0" as const;

export type PhaseStatus =
  | "foundation-in-progress"
  | "foundation-ready"
  | "scanner-not-implemented"
  | "config-fingerprint-ready"
  | "tool-metadata-rules-ready"
  | "transparency-reports-ready"
  | "html-viewer-ready"
  | "github-action-gate-ready";

export type RiskLevel = "info" | "low" | "medium" | "high" | "unknown";

export type McpCapabilityCategory =
  | "filesystem"
  | "shell"
  | "database"
  | "network"
  | "browser"
  | "github"
  | "email"
  | "credentials"
  | "unknown";

export type McpScopeTarget = {
  readonly source: string;
  readonly kind: "mcp-config" | "mcp-server-metadata" | "unknown";
  readonly readOnly: true;
};

export const FOUNDATION_STATUS = {
  project: PROJECT_SLUG,
  name: PROJECT_NAME,
  phase: 5,
  status: "github-action-gate-ready",
  scanner: "static-config-tool-metadata-ci-gate",
  externalApiCalls: false,
  serverExecution: false
} as const;

export * from "./scan.js";
export * from "./tool-metadata.js";

export const PROJECT_NAME = "MCP Scope" as const;
export const PROJECT_SLUG = "mcp-scope" as const;
export const PROJECT_VERSION = "0.0.0" as const;

export type PhaseStatus =
  | "foundation-in-progress"
  | "foundation-ready"
  | "scanner-not-implemented";

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
  phase: 0,
  status: "foundation-ready",
  scanner: "not-implemented-yet",
  externalApiCalls: false
} as const;

import { FOUNDATION_STATUS, PROJECT_NAME, PROJECT_SLUG } from "@mcp-scope/core";

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
    "Phase 0 does not scan MCP metadata, execute MCP servers, or call external APIs."
  ].join("\n");
}

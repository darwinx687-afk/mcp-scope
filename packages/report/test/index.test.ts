import { describe, expect, it } from "vitest";
import { createMcpConfigFingerprint, parseMcpConfig } from "@mcp-scope/core";

import {
  renderFoundationStatusReport,
  renderScanResultJson,
  renderScanResultMarkdown
} from "../src/index.js";

describe("renderFoundationStatusReport", () => {
  it("renders honest Phase 0 status", () => {
    const report = renderFoundationStatusReport();

    expect(report).toContain("MCP Scope Foundation Status");
    expect(report).toContain("scanner: static-config-fingerprint");
    expect(report).toContain("externalApiCalls: false");
    expect(report).toContain("does not execute MCP servers");
  });
});

describe("scan result renderers", () => {
  const result = createMcpConfigFingerprint(
    parseMcpConfig(
      {
        mcpServers: {
          remote: {
            type: "http",
            url: "https://example.com/mcp?token=secret-query-token",
            headers: {
              Authorization: "Bearer secret-header-value"
            }
          }
        }
      },
      "example.json"
    ),
    { generatedAt: "2026-07-01T00:00:00.000Z" }
  );

  it("renders markdown summary and redaction note", () => {
    const markdown = renderScanResultMarkdown(result);

    expect(markdown).toContain("# MCP Scope Report");
    expect(markdown).toContain("Server count: 1");
    expect(markdown).toContain("Env/header values redacted: true");
    expect(markdown).toContain("Findings are risk notes, not proof of compromise.");
  });

  it("renders JSON without secret values", () => {
    const json = renderScanResultJson(result);

    expect(json).toContain('"serverCount": 1');
    expect(json).toContain("Authorization");
    expect(json).not.toContain("secret-header-value");
    expect(json).not.toContain("secret-query-token");
  });
});

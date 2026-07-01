import { describe, expect, it } from "vitest";
import {
  createMcpConfigFingerprint,
  evaluateToolManifest,
  parseMcpConfig,
  parseMcpToolMetadata
} from "@mcp-scope/core";

import {
  renderFoundationStatusReport,
  renderScanResultJson,
  renderScanResultMarkdown,
  renderToolMetadataJson,
  renderToolMetadataMarkdown
} from "../src/index.js";

describe("renderFoundationStatusReport", () => {
  it("renders honest Phase 0 status", () => {
    const report = renderFoundationStatusReport();

    expect(report).toContain("MCP Scope Foundation Status");
    expect(report).toContain("scanner: static-config-and-tool-metadata");
    expect(report).toContain("externalApiCalls: false");
    expect(report).toContain("does not execute MCP servers");
  });
});

describe("tool metadata renderers", () => {
  const toolResult = evaluateToolManifest(
    parseMcpToolMetadata(
      {
        serverName: "network-tools",
        tools: [
          {
            name: "post_webhook",
            description: "Post to a webhook URL using an authorization token.",
            inputSchema: {
              type: "object",
              properties: {
                authorization: {
                  type: "string",
                  description: "Authorization value",
                  example: "REDACTED_EXAMPLE_TOKEN"
                },
                url: {
                  type: "string",
                  description: "Webhook URL"
                }
              },
              required: ["url"]
            }
          }
        ]
      },
      "tools.json"
    ),
    { generatedAt: "2026-07-01T00:00:00.000Z" }
  );

  it("renders markdown with tool metadata summary", () => {
    const markdown = renderToolMetadataMarkdown(toolResult);

    expect(markdown).toContain("Tool Metadata Summary");
    expect(markdown).toContain("Tool count: 1");
    expect(markdown).toContain("credential-exposure");
    expect(markdown).toContain("static risk signals");
  });

  it("renders JSON with rule IDs and without secret values", () => {
    const json = renderToolMetadataJson(toolResult);

    expect(json).toContain("credential_exposure_signal");
    expect(json).toContain("network_access_signal");
    expect(json).not.toContain("REDACTED_EXAMPLE_TOKEN");
  });

  it("includes tool metadata in combined scan Markdown and JSON", () => {
    const combined = createMcpConfigFingerprint(
      parseMcpConfig({ mcpServers: {} }, "config.json"),
      { generatedAt: "2026-07-01T00:00:00.000Z", toolMetadata: toolResult }
    );

    expect(renderScanResultMarkdown(combined)).toContain("Tool Metadata Summary");
    expect(renderScanResultJson(combined)).toContain('"toolMetadata"');
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
    expect(markdown).toContain("Findings are static risk signals, not proof of compromise.");
  });

  it("renders JSON without secret values", () => {
    const json = renderScanResultJson(result);

    expect(json).toContain('"serverCount": 1');
    expect(json).toContain("Authorization");
    expect(json).not.toContain("secret-header-value");
    expect(json).not.toContain("secret-query-token");
  });
});

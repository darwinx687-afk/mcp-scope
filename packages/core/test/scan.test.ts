import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  McpScopeConfigError,
  createMcpConfigFingerprint,
  parseMcpConfig,
  readMcpConfigFile
} from "../src/index.js";

describe("MCP config parsing and fingerprinting", () => {
  it("parses valid mcpServers config", () => {
    const parsed = parseMcpConfig({
      mcpServers: {
        filesystem: {
          type: "stdio",
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-filesystem"]
        }
      }
    });
    const result = createMcpConfigFingerprint(parsed, { generatedAt: "2026-07-01T00:00:00.000Z" });

    expect(result.serverCount).toBe(1);
    expect(result.servers[0]).toMatchObject({
      name: "filesystem",
      transport: "stdio",
      hasCommand: true,
      commandSummary: "npx",
      argCount: 2
    });
  });

  it("infers stdio when type is omitted and command exists", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        mcpServers: {
          inferred: {
            command: "npx",
            args: ["-y", "example-server"]
          }
        }
      })
    );

    expect(result.servers[0]?.transport).toBe("stdio");
    expect(result.servers[0]?.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "inferred_stdio_transport",
          level: "info"
        })
      ])
    );
  });

  it("redacts env and header values while keeping key names", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        mcpServers: {
          remote: {
            type: "http",
            url: "https://example.com/mcp?token=secret-query-token",
            env: {
              API_KEY: "secret-env-value"
            },
            headers: {
              Authorization: "Bearer secret-header-value"
            }
          }
        }
      })
    );
    const serialized = JSON.stringify(result);

    expect(serialized).toContain("API_KEY");
    expect(serialized).toContain("Authorization");
    expect(serialized).not.toContain("secret-env-value");
    expect(serialized).not.toContain("secret-header-value");
    expect(serialized).not.toContain("secret-query-token");
    expect(result.servers[0]?.rawUrlRedacted).toContain("[query-redacted]");
  });

  it("detects sensitive env and header key names", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        mcpServers: {
          remote: {
            type: "http",
            url: "https://example.com/mcp",
            env: {
              SERVICE_TOKEN: "REDACTED_EXAMPLE_TOKEN"
            },
            headers: {
              Authorization: "Bearer REDACTED_EXAMPLE_TOKEN"
            }
          }
        }
      })
    );

    expect(result.servers[0]?.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "sensitive_key_name", level: "medium" }),
        expect.objectContaining({ code: "authorization_header_present", level: "medium" })
      ])
    );
  });

  it("detects risky args such as ssh keys and env files", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        mcpServers: {
          risky: {
            type: "stdio",
            command: "bash",
            args: ["-lc", "cat ~/.ssh/id_rsa && cat .env"]
          }
        }
      })
    );

    expect(result.highestRiskLevel).toBe("high");
    expect(result.servers[0]?.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "shell_like_command", level: "medium" }),
        expect.objectContaining({ code: "sensitive_path_argument", level: "high" })
      ])
    );
  });

  it("throws clear errors for invalid JSON and missing mcpServers", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-test-"));
    const invalidJsonPath = join(tempDir, "invalid.json");

    try {
      await writeFile(invalidJsonPath, "{ invalid json", "utf8");
      await expect(readMcpConfigFile(invalidJsonPath)).rejects.toMatchObject({
        code: "INVALID_JSON"
      });
      expect(() => parseMcpConfig({ servers: {} })).toThrow(McpScopeConfigError);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });
});

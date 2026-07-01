import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  McpScopeConfigError,
  createMcpConfigFingerprint,
  parseMcpConfig,
  readMcpConfigFile,
  safePathDisplay
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
      argCount: 2,
      sourceShape: "top-level-mcpServers",
      clientProfile: "generic"
    });
  });

  it("parses Claude Code user projects[*].mcpServers and hides home-like project paths", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig(
        {
          projects: {
            "/Users/example/private-project": {
              mcpServers: {
                remote: {
                  type: "http",
                  url: "https://example.com/mcp",
                  headers: {
                    Authorization: "Bearer REDACTED_EXAMPLE_TOKEN"
                  }
                }
              }
            }
          }
        },
        "/Users/example/.claude.json"
      )
    );
    const serialized = JSON.stringify(result);

    expect(result.serverCount).toBe(1);
    expect(result.sourceShape).toBe("projects-mcpServers");
    expect(result.clientProfile).toBe("claude-code-user");
    expect(result.servers[0]).toMatchObject({
      sourceShape: "projects-mcpServers",
      clientProfile: "claude-code-user",
      projectPathDisplay: "~/.../private-project",
      serverKeyPath: "/projects/~1Users~1example~1private-project/mcpServers/remote"
    });
    expect(result.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "nested_project_mcp_servers", level: "info" })
      ])
    );
    expect(serialized).not.toContain("/Users/example/private-project");
    expect(serialized).not.toContain("Bearer REDACTED_EXAMPLE_TOKEN");
  });

  it("parses plugin-like top-level mcpServers", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig(
        {
          name: "example-plugin",
          mcpServers: {
            "plugin-api": {
              command: "${CLAUDE_PLUGIN_ROOT}/servers/api-server",
              args: ["--port", "8080"]
            }
          }
        },
        "plugin-like.plugin.json"
      )
    );

    expect(result.clientProfile).toBe("plugin-like");
    expect(result.servers[0]?.sourceShape).toBe("top-level-mcpServers");
    expect(result.servers[0]?.commandSummary).toBe("${CLAUDE_PLUGIN_ROOT}/servers/api-server");
  });

  it("parses generic mcp.servers and top-level servers wrapper shapes", () => {
    const wrapper = createMcpConfigFingerprint(
      parseMcpConfig({
        client: "cursor",
        mcp: {
          servers: {
            docs: {
              type: "sse",
              url: "https://example.com/sse"
            }
          }
        }
      })
    );
    const topLevel = createMcpConfigFingerprint(
      parseMcpConfig({
        servers: {
          local: {
            command: "node",
            args: ["server.js"]
          }
        }
      })
    );

    expect(wrapper.servers[0]).toMatchObject({
      sourceShape: "mcp.servers",
      clientProfile: "cursor-like",
      transport: "sse"
    });
    expect(topLevel.servers[0]).toMatchObject({
      sourceShape: "top-level-servers",
      clientProfile: "generic",
      transport: "stdio"
    });
  });

  it("normalizes streamable-http and warns on unknown transport", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        mcpServers: {
          streamable: {
            type: "streamable-http",
            url: "https://example.com/mcp"
          },
          odd: {
            type: "made-up",
            url: "https://example.com/odd"
          }
        }
      })
    );

    expect(result.servers.find((server) => server.name === "streamable")).toMatchObject({
      transport: "http",
      rawTransport: "streamable-http"
    });
    expect(result.servers.find((server) => server.name === "streamable")?.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "transport_alias_normalized", level: "info" })
      ])
    );
    expect(result.servers.find((server) => server.name === "odd")).toMatchObject({
      transport: "unknown",
      rawTransport: "made-up"
    });
  });

  it("summarizes headersHelper, oauth, permission hints, and unknown fields safely", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        mcpServers: {
          advanced: {
            type: "http",
            url: "https://example.com/mcp?token=secret-query-token",
            headersHelper: {
              command: "node",
              args: ["headers.js"]
            },
            oauth: {
              clientId: "example-client",
              clientSecret: "secret-oauth-value"
            },
            allowedTools: ["search_docs"],
            deniedTools: ["delete_docs"],
            roots: [{ uri: "file:///Users/example/private" }],
            timeout: 5000,
            alwaysLoad: true,
            disabled: false,
            customSecretValue: "do-not-render"
          }
        }
      })
    );
    const serialized = JSON.stringify(result);
    const server = result.servers[0];

    expect(server).toMatchObject({
      headersHelperPresent: true,
      oauthPresent: true,
      oauthKeys: ["clientId", "clientSecret"],
      allowedToolsCount: 1,
      deniedToolsCount: 1,
      rootsCount: 1,
      timeoutPresent: true,
      alwaysLoad: true,
      disabled: false,
      unknownFieldCount: 1,
      unknownFields: ["customSecretValue"]
    });
    expect(server?.permissionHints).toEqual(["allowedTools:1", "deniedTools:1"]);
    expect(server?.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "headers_helper_present", level: "medium" }),
        expect.objectContaining({ code: "oauth_metadata_present", level: "info" }),
        expect.objectContaining({ code: "allowed_tools_present", level: "info" }),
        expect.objectContaining({ code: "denied_tools_present", level: "info" }),
        expect.objectContaining({ code: "unknown_server_fields", level: "info" })
      ])
    );
    expect(serialized).not.toContain("secret-oauth-value");
    expect(serialized).not.toContain("do-not-render");
    expect(serialized).not.toContain("secret-query-token");
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
      expect(() => parseMcpConfig({ random: {} })).toThrow(McpScopeConfigError);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("warns on invalid nested shapes instead of crashing", () => {
    const result = createMcpConfigFingerprint(
      parseMcpConfig({
        projects: {
          "/Users/example/project": {
            mcpServers: []
          }
        }
      })
    );

    expect(result.serverCount).toBe(0);
    expect(result.transparencyNotes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "invalid_project_mcp_servers_shape", level: "medium" })
      ])
    );
  });

  it("formats private home-like paths safely", () => {
    expect(safePathDisplay("/Users/example/work/private-app")).toBe("~/.../private-app");
    expect(safePathDisplay("/home/example/work/private-app")).toBe("~/.../private-app");
    expect(safePathDisplay("examples/clients/demo.mcp.json")).toBe("examples/clients/demo.mcp.json");
  });
});

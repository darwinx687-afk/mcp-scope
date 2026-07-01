import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { discoverMcpConfigs } from "../src/index.js";

describe("MCP config discovery", () => {
  it("discovers likely MCP config files and does not render secret values", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-discovery-"));

    try {
      await writeFile(join(tempDir, ".mcp.json"), JSON.stringify({
        mcpServers: {
          local: {
            command: "node",
            args: ["server.js"],
            env: {
              API_TOKEN: "REDACTED_EXAMPLE_TOKEN"
            }
          }
        }
      }), "utf8");
      await writeFile(join(tempDir, "cursor.mcp.json"), JSON.stringify({
        client: "cursor",
        mcp: {
          servers: {
            docs: {
              type: "streamable-http",
              url: "https://example.com/mcp"
            }
          }
        }
      }), "utf8");
      await writeFile(join(tempDir, "claude_desktop_config.json"), JSON.stringify({
        mcpServers: {
          desktop: {
            command: "npx",
            args: ["-y", "desktop-server"]
          }
        }
      }), "utf8");
      await writeFile(join(tempDir, ".claude.json"), JSON.stringify({
        projects: {
          "/Users/example/private-project": {
            mcpServers: {
              remote: {
                type: "http",
                url: "https://example.com/mcp"
              }
            }
          }
        }
      }), "utf8");
      await writeFile(join(tempDir, "mcp.json"), JSON.stringify({ hello: true }), "utf8");
      await writeFile(join(tempDir, "broken.mcp.json"), "{ bad json", "utf8");
      await mkdir(join(tempDir, "node_modules"), { recursive: true });
      await writeFile(join(tempDir, "node_modules/ignored.mcp.json"), JSON.stringify({
        mcpServers: {
          ignored: { command: "node" }
        }
      }), "utf8");

      const result = await discoverMcpConfigs({
        root: tempDir,
        generatedAt: "2026-07-01T00:00:00.000Z"
      });
      const serialized = JSON.stringify(result);

      expect(result.summary.candidateCount).toBe(6);
      expect(result.summary.parsedCount).toBe(4);
      expect(result.summary.invalidJsonCount).toBe(1);
      expect(result.summary.unsupportedCount).toBe(1);
      expect(result.candidates.map((candidate) => candidate.pathDisplay)).not.toContain("node_modules/ignored.mcp.json");
      expect(result.candidates.find((candidate) => candidate.fileName === ".mcp.json")).toMatchObject({
        parseStatus: "parsed",
        detectedShape: "top-level-mcpServers",
        clientProfile: "claude-code-project",
        serverCount: 1
      });
      expect(result.candidates.find((candidate) => candidate.fileName === "cursor.mcp.json")).toMatchObject({
        parseStatus: "parsed",
        detectedShape: "mcp.servers",
        clientProfile: "cursor-like",
        riskPreview: "info"
      });
      expect(result.candidates.find((candidate) => candidate.fileName === ".claude.json")).toMatchObject({
        parseStatus: "parsed",
        detectedShape: "projects-mcpServers",
        clientProfile: "claude-code-user"
      });
      expect(serialized).not.toContain("REDACTED_EXAMPLE_TOKEN");
      expect(serialized).not.toContain("/Users/example/private-project");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("respects max depth and skips large files", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-discovery-"));

    try {
      await mkdir(join(tempDir, "one/two"), { recursive: true });
      await writeFile(join(tempDir, "one/visible.mcp.json"), JSON.stringify({
        mcpServers: {
          visible: { command: "node" }
        }
      }), "utf8");
      await writeFile(join(tempDir, "one/two/hidden.mcp.json"), JSON.stringify({
        mcpServers: {
          hidden: { command: "node" }
        }
      }), "utf8");
      await writeFile(join(tempDir, "large.mcp.json"), JSON.stringify({
        mcpServers: {
          large: {
            command: "node",
            args: ["x".repeat(200)]
          }
        }
      }), "utf8");

      const result = await discoverMcpConfigs({
        root: tempDir,
        maxDepth: 1,
        maxFileSizeBytes: 80
      });

      expect(result.candidates.map((candidate) => candidate.pathDisplay)).toContain("one/visible.mcp.json");
      expect(result.candidates.map((candidate) => candidate.pathDisplay)).not.toContain("one/two/hidden.mcp.json");
      expect(result.candidates.find((candidate) => candidate.fileName === "large.mcp.json")).toMatchObject({
        parseStatus: "skipped"
      });
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("does not follow symlinks when discovering configs", async () => {
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-discovery-"));
    const externalDir = await mkdtemp(join(tmpdir(), "mcp-scope-discovery-target-"));

    try {
      await writeFile(join(externalDir, "external.mcp.json"), JSON.stringify({
        mcpServers: {
          external: { command: "node" }
        }
      }), "utf8");
      await symlink(externalDir, join(tempDir, "linked"));

      const result = await discoverMcpConfigs({ root: tempDir });

      expect(result.candidates).toHaveLength(0);
    } finally {
      await rm(tempDir, { recursive: true, force: true });
      await rm(externalDir, { recursive: true, force: true });
    }
  });

  it("does not search the home root unless explicitly allowed", async () => {
    const result = await discoverMcpConfigs({
      root: process.env.HOME ?? "~",
      generatedAt: "2026-07-01T00:00:00.000Z"
    });

    expect(result.summary.candidateCount).toBe(0);
    expect(result.notes.join(" ")).toContain("--include-home");
  });
});

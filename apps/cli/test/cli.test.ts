import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";
import { handleCli } from "../src/cli.js";

async function runCli(args: string[]) {
  let stdout = "";
  let stderr = "";

  const exitCode = await handleCli(args, {
    stdout: {
      write(chunk: string) {
        stdout += chunk;
      }
    },
    stderr: {
      write(chunk: string) {
        stderr += chunk;
      }
    }
  });

  return { exitCode, stdout, stderr };
}

describe("mcp-scope CLI", () => {
  it("prints help", () => {
    return runCli(["--help"]).then((result) => {
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("mcp-scope status");
      expect(result.stdout).toContain("mcp-scope scan --config <path>");
      expect(result.stdout).toContain("does not execute MCP servers");
    });
  });

  it("prints version", async () => {
    const result = await runCli(["--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("0.0.0");
  });

  it("prints status JSON", async () => {
    const result = await runCli(["status"]);
    const parsed = JSON.parse(result.stdout) as Record<string, unknown>;

    expect(result.exitCode).toBe(0);
    expect(parsed).toMatchObject({
      project: "mcp-scope",
      name: "MCP Scope",
      phase: 1,
      status: "config-fingerprint-ready",
      scanner: "static-config-fingerprint",
      externalApiCalls: false,
      serverExecution: false
    });
  });

  it("runs scan with an example file", async () => {
    const examplePath = fileURLToPath(
      new URL("../../../examples/http-server-with-redacted-auth.json", import.meta.url)
    );
    const result = await runCli(["scan", "--config", examplePath, "--format", "json"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('"serverCount": 1');
    expect(result.stdout).toContain("Authorization");
    expect(result.stdout).toContain("[query-redacted]");
    expect(result.stdout).not.toContain("Bearer REDACTED_EXAMPLE_TOKEN");
    expect(result.stdout).not.toContain("api_key=REDACTED_EXAMPLE_TOKEN");
  });

  it("errors when scan is missing --config", async () => {
    const result = await runCli(["scan"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Missing required option: --config <path>");
  });

  it("errors on unsupported scan format", async () => {
    const result = await runCli(["scan", "--config", "example.json", "--format", "xml"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unsupported --format "xml"');
  });
});

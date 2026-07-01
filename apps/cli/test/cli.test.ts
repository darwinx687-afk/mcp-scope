import { describe, expect, it } from "vitest";
import { handleCli } from "../src/cli.js";

function runCli(args: string[]) {
  let stdout = "";
  let stderr = "";

  const exitCode = handleCli(args, {
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
    const result = runCli(["--help"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("mcp-scope status");
    expect(result.stdout).toContain("does not scan MCP metadata");
  });

  it("prints version", () => {
    const result = runCli(["--version"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.trim()).toBe("0.0.0");
  });

  it("prints status JSON", () => {
    const result = runCli(["status"]);
    const parsed = JSON.parse(result.stdout) as Record<string, unknown>;

    expect(result.exitCode).toBe(0);
    expect(parsed).toMatchObject({
      project: "mcp-scope",
      name: "MCP Scope",
      phase: 0,
      status: "foundation-ready",
      scanner: "not-implemented-yet",
      externalApiCalls: false
    });
  });
});

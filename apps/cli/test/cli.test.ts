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
      expect(result.stdout).toContain("mcp-scope inspect-tools --tools <path>");
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
      phase: 3,
      status: "transparency-reports-ready",
      scanner: "static-config-tool-metadata-reports",
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
    expect(result.stdout).toContain('"reportVersion": "0.3.0"');
    expect(result.stdout).toContain("Authorization");
    expect(result.stdout).toContain("[query-redacted]");
    expect(result.stdout).not.toContain("Bearer REDACTED_EXAMPLE_TOKEN");
    expect(result.stdout).not.toContain("api_key=REDACTED_EXAMPLE_TOKEN");
  });

  it("runs combined scan with config and tools", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-code-project.mcp.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/poisoned-description-tools.json", import.meta.url)
    );
    const result = await runCli(["scan", "--config", configPath, "--tools", toolsPath, "--format", "json"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('"tools"');
    expect(result.stdout).toContain("metadata_injection_phrase");
    expect(result.stdout).not.toContain("Bearer REDACTED_EXAMPLE_TOKEN");
  });

  it("runs combined scan with Chinese Markdown", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const result = await runCli(["scan", "--config", configPath, "--tools", toolsPath, "--lang", "zh-CN"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("## 执行摘要");
    expect(result.stdout).toContain("## MCP Scope 检查了什么");
  });

  it("runs inspect-tools with a local tool metadata file", async () => {
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/credential-network-tools.json", import.meta.url)
    );
    const result = await runCli(["inspect-tools", "--tools", toolsPath, "--format", "json"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("credential_exposure_signal");
    expect(result.stdout).not.toContain("example-api-key-do-not-use");
  });

  it("runs inspect-tools with Chinese Markdown", async () => {
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/poisoned-description-tools.json", import.meta.url)
    );
    const result = await runCli(["inspect-tools", "--tools", toolsPath, "--format", "markdown", "--lang", "zh-CN"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("## 执行摘要");
    expect(result.stdout).toContain("静态风险信号");
  });

  it("errors clearly when a tool metadata file is missing", async () => {
    const result = await runCli(["inspect-tools", "--tools", "examples/tools/not-found.json"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unable to read tool metadata file "examples/tools/not-found.json"');
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

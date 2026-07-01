import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
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
      expect(result.stdout).toContain("mcp-scope snapshot");
      expect(result.stdout).toContain("mcp-scope diff");
      expect(result.stdout).toContain("mcp-scope discover --root <path>");
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
      phase: 8,
      status: "launch-packaging-ready",
      scanner: "static-config-tool-metadata-ecosystem-discovery",
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

  it("scans Phase 7 client compatibility examples", async () => {
    const exampleNames = [
      "claude-code-project.mcp.json",
      "claude-code-user.claude.json",
      "claude-desktop-config.json",
      "cursor-like.mcp.json",
      "cline-like.mcp-settings.json",
      "continue-like.mcp.json",
      "gemini-cli-like.settings.json",
      "plugin-like.plugin.json",
      "generic-mcp-servers.json",
      "generic-mcp-servers-wrapper.json"
    ];

    for (const exampleName of exampleNames) {
      const configPath = fileURLToPath(new URL(`../../../examples/clients/${exampleName}`, import.meta.url));
      const result = await runCli(["scan", "--config", configPath, "--format", "json"]);

      expect(result.exitCode, exampleName).toBe(0);
      expect(result.stdout, exampleName).toContain('"serverCount"');
      expect(result.stdout, exampleName).toContain('"sourceShape"');
      expect(result.stdout, exampleName).toContain('"clientProfile"');
      expect(result.stdout, exampleName).not.toContain("REDACTED_EXAMPLE_TOKEN");
      expect(result.stdout, exampleName).not.toContain("example-api-key-do-not-use");
    }
  });

  it("discovers Phase 7 client examples as Markdown", async () => {
    const rootPath = fileURLToPath(new URL("../../../examples/clients", import.meta.url));
    const result = await runCli(["discover", "--root", rootPath]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("# MCP Scope Discovery Report");
    expect(result.stdout).toContain("Static discovery only");
    expect(result.stdout).toContain("claude-code-project.mcp.json");
    expect(result.stdout).toContain("mcp-scope scan --config <path>");
    expect(result.stdout).not.toContain("REDACTED_EXAMPLE_TOKEN");
  });

  it("discovers Phase 7 client examples as JSON", async () => {
    const rootPath = fileURLToPath(new URL("../../../examples/clients", import.meta.url));
    const result = await runCli(["discover", "--root", rootPath, "--format", "json"]);
    const parsed = JSON.parse(result.stdout) as { summary: { candidateCount: number; parsedCount: number } };

    expect(result.exitCode).toBe(0);
    expect(parsed.summary.candidateCount).toBeGreaterThanOrEqual(10);
    expect(parsed.summary.parsedCount).toBeGreaterThanOrEqual(10);
    expect(result.stdout).not.toContain("example-api-key-do-not-use");
  });

  it("discovers Phase 7 client examples with Chinese Markdown", async () => {
    const rootPath = fileURLToPath(new URL("../../../examples/clients", import.meta.url));
    const result = await runCli(["discover", "--root", rootPath, "--format", "markdown", "--lang", "zh-CN"]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("## 摘要");
    expect(result.stdout).toContain("## 下一步");
    expect(result.stdout).toContain("不代表官方集成");
  });

  it("writes discovery HTML to an output file", async () => {
    const rootPath = fileURLToPath(new URL("../../../examples/clients", import.meta.url));
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const outputPath = join(tempDir, "discovery.html");

    try {
      const result = await runCli(["discover", "--root", rootPath, "--format", "html", "--output", outputPath]);
      const html = await readFile(outputPath, "utf8");

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Wrote MCP Scope html discovery report");
      expect(html).toContain("<title>MCP Scope Discovery Report</title>");
      expect(html).toContain("claude-code-project.mcp.json");
      expect(html).not.toContain("<script");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("passes fail-on none even with high findings", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-code-project.mcp.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/poisoned-description-tools.json", import.meta.url)
    );
    const result = await runCli([
      "scan",
      "--config",
      configPath,
      "--tools",
      toolsPath,
      "--format",
      "json",
      "--fail-on",
      "none"
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('"highestSeverity": "high"');
    expect(result.stderr).toBe("");
  });

  it("fails fail-on high after generating output", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-code-project.mcp.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/poisoned-description-tools.json", import.meta.url)
    );
    const result = await runCli([
      "scan",
      "--config",
      configPath,
      "--tools",
      toolsPath,
      "--format",
      "json",
      "--fail-on",
      "high"
    ]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('"highestSeverity": "high"');
    expect(result.stderr).toContain("MCP Scope fail-on threshold reached");
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

  it("writes combined scan HTML to an output file", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const outputPath = join(tempDir, "combined.html");

    try {
      const result = await runCli([
        "scan",
        "--config",
        configPath,
        "--tools",
        toolsPath,
        "--format",
        "html",
        "--output",
        outputPath
      ]);
      const html = await readFile(outputPath, "utf8");

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Wrote MCP Scope html report");
      expect(html).toContain("<title>MCP Scope Report</title>");
      expect(html).toContain("Summary");
      expect(html).toContain("Tool Metadata");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes an approval snapshot for config plus tools", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const outputPath = join(tempDir, "filesystem.snapshot.json");

    try {
      const result = await runCli([
        "snapshot",
        "--config",
        configPath,
        "--tools",
        toolsPath,
        "--output",
        outputPath,
        "--label",
        "filesystem review"
      ]);
      const snapshot = await readFile(outputPath, "utf8");

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Wrote MCP Scope snapshot");
      expect(result.stdout).toContain("secret values redacted: true");
      expect(snapshot).toContain('"snapshotVersion": "0.1.0"');
      expect(snapshot).toContain('"label": "filesystem review"');
      expect(snapshot).toContain('"configServers"');
      expect(snapshot).toContain('"tools"');
      expect(snapshot).not.toContain("REDACTED_EXAMPLE_TOKEN");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes a tools-only approval snapshot", async () => {
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const outputPath = join(tempDir, "tools.snapshot.json");

    try {
      const result = await runCli(["snapshot", "--tools", toolsPath, "--output", outputPath]);
      const snapshot = await readFile(outputPath, "utf8");

      expect(result.exitCode).toBe(0);
      expect(snapshot).toContain('"mode": "tools-only"');
      expect(snapshot).toContain('"serverCount": 0');
      expect(snapshot).toContain('"toolCount": 2');
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("errors clearly when snapshot has no inputs", async () => {
    const result = await runCli(["snapshot", "--output", "snapshot.json"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Missing input: provide --config <path>, --tools <path>, or both.");
  });

  it("diffs an approval snapshot and reports no changes by default", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const snapshotPath = join(tempDir, "filesystem.snapshot.json");

    try {
      const snapshotResult = await runCli(["snapshot", "--config", configPath, "--tools", toolsPath, "--output", snapshotPath]);
      const diffResult = await runCli(["diff", "--baseline", snapshotPath, "--config", configPath, "--tools", toolsPath]);

      expect(snapshotResult.exitCode).toBe(0);
      expect(diffResult.exitCode).toBe(0);
      expect(diffResult.stdout).toContain("# MCP Scope Diff Report");
      expect(diffResult.stdout).toContain("Change count: 0");
      expect(diffResult.stdout).toContain("No static changes detected.");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders diff JSON and applies fail-on-change thresholds", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const changedToolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.added-dangerous-tool.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const snapshotPath = join(tempDir, "filesystem.snapshot.json");

    try {
      const snapshotResult = await runCli(["snapshot", "--config", configPath, "--tools", toolsPath, "--output", snapshotPath]);
      const diffResult = await runCli([
        "diff",
        "--baseline",
        snapshotPath,
        "--config",
        configPath,
        "--tools",
        changedToolsPath,
        "--format",
        "json",
        "--fail-on-change",
        "none"
      ]);
      const failResult = await runCli([
        "diff",
        "--baseline",
        snapshotPath,
        "--config",
        configPath,
        "--tools",
        changedToolsPath,
        "--fail-on-change",
        "high"
      ]);

      expect(snapshotResult.exitCode).toBe(0);
      expect(diffResult.exitCode).toBe(0);
      expect(diffResult.stdout).toContain('"addedTools": 1');
      expect(diffResult.stdout).toContain('"highestDiffSeverity": "high"');
      expect(diffResult.stdout).not.toContain("example-api-key-do-not-use");
      expect(failResult.exitCode).toBe(1);
      expect(failResult.stdout).toContain("# MCP Scope Diff Report");
      expect(failResult.stderr).toContain("MCP Scope fail-on-change threshold reached");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("writes Chinese Markdown and HTML diff reports", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.json", import.meta.url)
    );
    const changedToolsPath = fileURLToPath(
      new URL("../../../examples/tools/filesystem-tools.changed-description.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const snapshotPath = join(tempDir, "filesystem.snapshot.json");
    const markdownPath = join(tempDir, "diff.zh-CN.md");
    const htmlPath = join(tempDir, "diff.html");

    try {
      const snapshotResult = await runCli(["snapshot", "--config", configPath, "--tools", toolsPath, "--output", snapshotPath]);
      const markdownResult = await runCli([
        "diff",
        "--baseline",
        snapshotPath,
        "--config",
        configPath,
        "--tools",
        changedToolsPath,
        "--lang",
        "zh-CN",
        "--output",
        markdownPath
      ]);
      const htmlResult = await runCli([
        "diff",
        "--baseline",
        snapshotPath,
        "--config",
        configPath,
        "--tools",
        changedToolsPath,
        "--format",
        "html",
        "--output",
        htmlPath
      ]);
      const markdown = await readFile(markdownPath, "utf8");
      const html = await readFile(htmlPath, "utf8");

      expect(snapshotResult.exitCode).toBe(0);
      expect(markdownResult.exitCode).toBe(0);
      expect(htmlResult.exitCode).toBe(0);
      expect(markdown).toContain("## 摘要");
      expect(markdown).toContain("description-changed");
      expect(html).toContain("<title>MCP Scope Diff Report</title>");
      expect(html).not.toContain("<script");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("errors clearly for missing or invalid diff baselines", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const invalidSnapshotPath = join(tempDir, "invalid.snapshot.json");

    try {
      await writeFile(invalidSnapshotPath, "{bad json", "utf8");
      const missing = await runCli(["diff", "--baseline", join(tempDir, "missing.json"), "--config", configPath]);
      const invalid = await runCli(["diff", "--baseline", invalidSnapshotPath, "--config", configPath]);

      expect(missing.exitCode).toBe(1);
      expect(missing.stderr).toContain("Unable to read baseline snapshot");
      expect(invalid.exitCode).toBe(1);
      expect(invalid.stderr).toContain("Invalid MCP Scope snapshot JSON");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
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

  it("fails fail-on medium for medium tool findings", async () => {
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/credential-network-tools.json", import.meta.url)
    );
    const result = await runCli(["inspect-tools", "--tools", toolsPath, "--format", "json", "--fail-on", "medium"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('"highestSeverity": "medium"');
    expect(result.stderr).toContain("meets medium");
  });

  it("fails fail-on low when low or higher findings exist", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/risky-local-command.json", import.meta.url)
    );
    const result = await runCli(["scan", "--config", configPath, "--format", "json", "--fail-on", "low"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('"findingCount"');
    expect(result.stderr).toContain("meets low");
  });

  it("fails fail-on info when any finding exists", async () => {
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/schema-quality-tools.json", import.meta.url)
    );
    const result = await runCli(["inspect-tools", "--tools", toolsPath, "--format", "json", "--fail-on", "info"]);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain('"findingCount"');
    expect(result.stderr).toContain("meets info");
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

  it("writes inspect-tools HTML to an output file", async () => {
    const toolsPath = fileURLToPath(
      new URL("../../../examples/tools/poisoned-description-tools.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const outputPath = join(tempDir, "tools.html");

    try {
      const result = await runCli([
        "inspect-tools",
        "--tools",
        toolsPath,
        "--format",
        "html",
        "--output",
        outputPath
      ]);
      const html = await readFile(outputPath, "utf8");

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Wrote MCP Scope html tool metadata report");
      expect(html).toContain("Potential metadata-injection signal");
      expect(html).not.toContain("<script");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
  });

  it("renders an existing JSON report with view", async () => {
    const reportPath = fileURLToPath(
      new URL("../../../examples/reports/sample-combined-report.json", import.meta.url)
    );
    const tempDir = await mkdtemp(join(tmpdir(), "mcp-scope-cli-"));
    const outputPath = join(tempDir, "viewer.html");

    try {
      const result = await runCli(["view", "--report", reportPath, "--output", outputPath, "--lang", "zh-CN"]);
      const html = await readFile(outputPath, "utf8");

      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("Wrote MCP Scope HTML viewer");
      expect(html).toContain("本地 MCP 透明度报告");
      expect(html).toContain("MCP Scope 没有检查什么");
    } finally {
      await rm(tempDir, { recursive: true, force: true });
    }
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

  it("errors on unsupported fail-on threshold", async () => {
    const result = await runCli(["scan", "--config", "example.json", "--fail-on", "critical"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unsupported --fail-on "critical"');
  });

  it("errors clearly when HTML output is missing", async () => {
    const configPath = fileURLToPath(
      new URL("../../../examples/claude-desktop-filesystem.json", import.meta.url)
    );
    const result = await runCli(["scan", "--config", configPath, "--format", "html"]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("HTML format requires --output <path>");
  });

  it("errors clearly when view output is missing", async () => {
    const reportPath = fileURLToPath(
      new URL("../../../examples/reports/sample-combined-report.json", import.meta.url)
    );
    const result = await runCli(["view", "--report", reportPath]);

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("HTML viewer output requires --output <path>");
  });
});

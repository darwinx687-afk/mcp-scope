import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

import { describe, expect, it } from "vitest";

const runnerPath = fileURLToPath(new URL("../../../scripts/github-action-runner.mjs", import.meta.url));

async function runActionRunner(env: Record<string, string>, workspace?: string) {
  const tempDir = workspace ?? await mkdtemp(join(tmpdir(), "mcp-scope-action-"));
  const fakeCliPath = join(tempDir, "fake-cli.mjs");
  const outputPath = join(tempDir, "github-output.txt");
  const summaryPath = join(tempDir, "github-summary.md");

  await writeFile(fakeCliPath, fakeCliSource(), "utf8");

  const result = await spawnProcess(process.execPath, [runnerPath], {
    ...process.env,
    ...env,
    GITHUB_WORKSPACE: tempDir,
    GITHUB_ACTION_PATH: fileURLToPath(new URL("../../..", import.meta.url)),
    GITHUB_OUTPUT: outputPath,
    GITHUB_STEP_SUMMARY: summaryPath,
    MCP_SCOPE_CLI_PATH: fakeCliPath
  });

  const outputText = await readOptional(outputPath);
  const summaryText = await readOptional(summaryPath);

  return { ...result, tempDir, outputText, summaryText };
}

describe("GitHub action runner", () => {
  it("fails clearly when neither config nor tools is provided", async () => {
    const result = await runActionRunner({});

    try {
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("Provide at least one MCP Scope input");
    } finally {
      await rm(result.tempDir, { recursive: true, force: true });
    }
  });

  it("supports config plus tools and writes outputs and summary", async () => {
    const result = await runActionRunner({
      INPUT_CONFIG: "config.json",
      INPUT_TOOLS: "tools.json",
      INPUT_REPORT_FORMAT: "markdown",
      INPUT_REPORT_PATH: "reports/action-report.md",
      INPUT_FAIL_ON: "none",
      INPUT_LANG: "en"
    });

    try {
      expect(result.status).toBe(0);
      expect(result.outputText).toContain("report-path=reports/action-report.md");
      expect(result.outputText).toContain("json-report-path=reports/action-report.json");
      expect(result.outputText).toContain("highest-severity=high");
      expect(result.outputText).toContain("finding-count=2");
      expect(result.outputText).toContain("server-count=1");
      expect(result.outputText).toContain("tool-count=1");
      expect(result.outputText).toContain("passed=true");
      expect(result.summaryText).toContain("## MCP Scope");
      expect(result.summaryText).toContain("local static transparency check");
      expect(result.summaryText).not.toContain("REDACTED_EXAMPLE_TOKEN");
    } finally {
      await rm(result.tempDir, { recursive: true, force: true });
    }
  });

  it("supports tools-only mode", async () => {
    const result = await runActionRunner({
      INPUT_TOOLS: "tools.json",
      INPUT_REPORT_FORMAT: "json",
      INPUT_FAIL_ON: "none"
    });

    try {
      expect(result.status).toBe(0);
      expect(result.outputText).toContain("report-path=mcp-scope-report.json");
      expect(result.outputText).toContain("server-count=0");
      expect(result.outputText).toContain("tool-count=1");
    } finally {
      await rm(result.tempDir, { recursive: true, force: true });
    }
  });

  it("applies fail-on threshold after writing reports and outputs", async () => {
    const result = await runActionRunner({
      INPUT_CONFIG: "config.json",
      INPUT_TOOLS: "tools.json",
      INPUT_REPORT_FORMAT: "markdown",
      INPUT_REPORT_PATH: "reports/action-report.md",
      INPUT_FAIL_ON: "high"
    });

    try {
      expect(result.status).toBe(1);
      expect(result.stderr).toContain("fail-on threshold reached");
      expect(result.outputText).toContain("passed=false");
      expect(result.outputText).toContain("failed-threshold=true");
      expect(await readOptional(join(result.tempDir, "reports/action-report.md"))).toContain("MCP Scope Report");
    } finally {
      await rm(result.tempDir, { recursive: true, force: true });
    }
  });

  it("respects working-directory and zh-CN language", async () => {
    const workspace = await mkdtemp(join(tmpdir(), "mcp-scope-action-"));
    const result = await runActionRunner({
      INPUT_CONFIG: "config.json",
      INPUT_WORKING_DIRECTORY: "subdir",
      INPUT_REPORT_PATH: "nested/action-report.md",
      INPUT_LANG: "zh-CN"
    }, workspace);

    try {
      expect(result.status).toBe(0);
      expect(result.outputText).toContain("report-path=subdir/nested/action-report.md");
      expect(await readOptional(join(workspace, "subdir/nested/action-report.md"))).toContain("执行摘要");
    } finally {
      await rm(workspace, { recursive: true, force: true });
    }
  });

  it("generates an HTML viewer when requested", async () => {
    const result = await runActionRunner({
      INPUT_CONFIG: "config.json",
      INPUT_REPORT_FORMAT: "markdown",
      INPUT_REPORT_PATH: "reports/action-report.md",
      INPUT_INCLUDE_HTML_VIEWER: "true"
    });

    try {
      expect(result.status).toBe(0);
      expect(result.outputText).toContain("html-report-path=reports/action-report.html");
      expect(await readOptional(join(result.tempDir, "reports/action-report.html"))).toContain("<title>MCP Scope Report</title>");
    } finally {
      await rm(result.tempDir, { recursive: true, force: true });
    }
  });
});

function spawnProcess(command: string, args: readonly string[], env: NodeJS.ProcessEnv) {
  return new Promise<{ status: number | null; stdout: string; stderr: string }>((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

async function readOptional(path: string): Promise<string> {
  try {
    return await readFile(path, "utf8");
  } catch {
    return "";
  }
}

function fakeCliSource(): string {
  return `
    import { mkdir, writeFile } from "node:fs/promises";
    import path from "node:path";

    const args = process.argv.slice(2);
    const command = args[0];
    const format = option("--format") || "markdown";
    const output = option("--output");
    const lang = option("--lang") || "en";

    if (output === undefined) {
      console.error("missing output");
      process.exit(1);
    }

    await mkdir(path.dirname(output), { recursive: true });

    if (command === "view") {
      await writeFile(output, "<!doctype html><title>MCP Scope Report</title>", "utf8");
      process.exit(0);
    }

    const hasConfig = args.includes("--config");
    const hasTools = args.includes("--tools");
    const report = {
      reportVersion: "0.3.0",
      schemaVersion: 1,
      scan: {
        mode: hasConfig ? (hasTools ? "combined" : "config-only") : "tools-only",
        externalApiCalls: false,
        mcpServerExecution: false,
        dynamicAnalysis: false,
        secretValuesRedacted: true
      },
      summary: {
        highestSeverity: process.env.FAKE_HIGHEST_SEVERITY || "high",
        findingCount: Number(process.env.FAKE_FINDING_COUNT || "2"),
        serverCount: hasConfig ? 1 : 0,
        toolCount: hasTools || command === "inspect-tools" ? 1 : 0
      },
      findings: [
        {
          evidence: "REDACTED_EXAMPLE_TOKEN"
        }
      ]
    };

    if (format === "json") {
      await writeFile(output, JSON.stringify(report, null, 2), "utf8");
    } else if (format === "html") {
      await writeFile(output, "<!doctype html><title>MCP Scope Report</title>", "utf8");
    } else {
      await writeFile(output, lang === "zh-CN" ? "# MCP Scope Report\\n\\n## 执行摘要\\n" : "# MCP Scope Report\\n\\n## Executive Summary\\n", "utf8");
    }

    function option(name) {
      const index = args.indexOf(name);
      return index === -1 ? undefined : args[index + 1];
    }
  `;
}

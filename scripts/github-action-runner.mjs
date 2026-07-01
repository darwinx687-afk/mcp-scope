#!/usr/bin/env node
import { appendFile, mkdir, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const FORMATS = new Set(["markdown", "json", "html"]);
const LANGS = new Set(["en", "zh-CN"]);
const FAIL_ON = new Set(["none", "info", "low", "medium", "high"]);
const SEVERITY_RANK = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};

export async function runAction(env = process.env) {
  const options = parseOptions(env);
  const baseArgs = buildScanArgs(options);

  await mkdir(path.dirname(options.jsonReportPath), { recursive: true });
  await runCli(options, [...baseArgs, "--format", "json", "--output", options.jsonReportPath, "--fail-on", "none"]);

  if (options.reportPath !== options.jsonReportPath || options.reportFormat !== "json") {
    await mkdir(path.dirname(options.reportPath), { recursive: true });
    await runCli(options, [
      ...baseArgs,
      "--format",
      options.reportFormat,
      "--output",
      options.reportPath,
      "--fail-on",
      "none"
    ]);
  }

  if (options.htmlReportPath !== undefined && options.htmlReportPath !== options.reportPath) {
    await mkdir(path.dirname(options.htmlReportPath), { recursive: true });
    await runCli(options, [
      "view",
      "--report",
      options.jsonReportPath,
      "--output",
      options.htmlReportPath,
      "--lang",
      options.lang
    ]);
  }

  const report = JSON.parse(await readFile(options.jsonReportPath, "utf8"));
  const summary = summarizeReport(report);
  const failedThreshold = shouldFail(summary.highestSeverity, options.failOn, summary.findingCount);
  const passed = !failedThreshold;

  await writeOutputs(options, summary, passed, failedThreshold);

  if (options.summary && options.githubStepSummary !== undefined) {
    await appendFile(options.githubStepSummary, renderStepSummary(options, summary, passed, failedThreshold), "utf8");
  }

  if (failedThreshold) {
    console.error(
      `MCP Scope fail-on threshold reached: highest severity ${summary.highestSeverity} meets ${options.failOn} (${summary.findingCount} finding(s)).`
    );
    return 1;
  }

  return 0;
}

function parseOptions(env) {
  const workspace = path.resolve(env.GITHUB_WORKSPACE || process.cwd());
  const actionPath = path.resolve(env.GITHUB_ACTION_PATH || path.join(scriptDir(), ".."));
  const workingDirectory = resolveRelativeInput(env.INPUT_WORKING_DIRECTORY || ".", workspace, workspace, "working-directory");
  const configPath = optionalPath(env.INPUT_CONFIG, workingDirectory, workspace, "config");
  const toolsPath = optionalPath(env.INPUT_TOOLS, workingDirectory, workspace, "tools");
  const reportFormat = env.INPUT_REPORT_FORMAT || "markdown";
  const lang = env.INPUT_LANG || "en";
  const failOn = env.INPUT_FAIL_ON || "none";
  const includeHtmlViewer = parseBoolean(env.INPUT_INCLUDE_HTML_VIEWER, false, "include-html-viewer");
  const summary = parseBoolean(env.INPUT_SUMMARY, true, "summary");

  if (configPath === undefined && toolsPath === undefined) {
    throw new Error("Provide at least one MCP Scope input: config or tools.");
  }

  if (!FORMATS.has(reportFormat)) {
    throw new Error('Invalid report-format. Use "markdown", "json", or "html".');
  }

  if (!LANGS.has(lang)) {
    throw new Error('Invalid lang. Use "en" or "zh-CN".');
  }

  if (!FAIL_ON.has(failOn)) {
    throw new Error('Invalid fail-on. Use "none", "info", "low", "medium", or "high".');
  }

  const reportPath = resolveRelativeInput(
    env.INPUT_REPORT_PATH || defaultReportPath(reportFormat),
    workingDirectory,
    workspace,
    "report-path"
  );
  const jsonReportPath = reportFormat === "json" ? reportPath : replaceExtension(reportPath, ".json");
  const htmlReportPath =
    reportFormat === "html"
      ? reportPath
      : includeHtmlViewer
        ? replaceExtension(reportPath, ".html")
        : undefined;
  const cliPath = path.resolve(env.MCP_SCOPE_CLI_PATH || path.join(actionPath, "apps/cli/dist/index.js"));

  if (!existsSync(cliPath)) {
    throw new Error(`Built MCP Scope CLI was not found at ${cliPath}. Run pnpm build before the action runner.`);
  }

  return {
    workspace,
    actionPath,
    workingDirectory,
    configPath,
    toolsPath,
    reportFormat,
    reportPath,
    jsonReportPath,
    htmlReportPath,
    lang,
    failOn,
    summary,
    cliPath,
    githubOutput: env.GITHUB_OUTPUT,
    githubStepSummary: env.GITHUB_STEP_SUMMARY
  };
}

function buildScanArgs(options) {
  if (options.configPath !== undefined) {
    const args = ["scan", "--config", options.configPath, "--lang", options.lang];

    if (options.toolsPath !== undefined) {
      args.push("--tools", options.toolsPath);
    }

    return args;
  }

  return ["inspect-tools", "--tools", options.toolsPath, "--lang", options.lang];
}

async function runCli(options, args) {
  const result = await spawnProcess(process.execPath, [options.cliPath, ...args], {
    cwd: options.actionPath
  });

  if (result.status !== 0) {
    throw new Error(
      `MCP Scope CLI failed for "${args[0]}": ${result.stderr || result.stdout || `exit ${result.status}`}`
    );
  }
}

function spawnProcess(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: process.env,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });
    child.on("error", reject);
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

async function writeOutputs(options, summary, passed, failedThreshold) {
  if (options.githubOutput === undefined || options.githubOutput.trim() === "") {
    return;
  }

  const outputs = {
    "report-path": displayPath(options.reportPath, options.workspace),
    "json-report-path": displayPath(options.jsonReportPath, options.workspace),
    "html-report-path": options.htmlReportPath === undefined ? "" : displayPath(options.htmlReportPath, options.workspace),
    "highest-severity": summary.highestSeverity,
    "finding-count": String(summary.findingCount),
    "server-count": String(summary.serverCount),
    "tool-count": String(summary.toolCount),
    passed: String(passed),
    "failed-threshold": String(failedThreshold)
  };

  await appendFile(
    options.githubOutput,
    `${Object.entries(outputs).map(([key, value]) => `${key}=${value}`).join("\n")}\n`,
    "utf8"
  );
}

function renderStepSummary(options, summary, passed, failedThreshold) {
  const htmlLine =
    options.htmlReportPath === undefined
      ? ""
      : `| HTML report | \`${displayPath(options.htmlReportPath, options.workspace)}\` |\n`;

  return [
    "## MCP Scope",
    "",
    "| Field | Value |",
    "| --- | --- |",
    `| Passed | ${passed ? "true" : "false"} |`,
    `| Failed threshold | ${failedThreshold ? "true" : "false"} |`,
    `| Fail-on | \`${options.failOn}\` |`,
    `| Highest severity | \`${summary.highestSeverity}\` |`,
    `| Finding count | ${summary.findingCount} |`,
    `| Server count | ${summary.serverCount} |`,
    `| Tool count | ${summary.toolCount} |`,
    `| Report | \`${displayPath(options.reportPath, options.workspace)}\` |`,
    `| JSON report | \`${displayPath(options.jsonReportPath, options.workspace)}\` |`,
    htmlLine.trimEnd(),
    "",
    "MCP Scope ran as a local static transparency check. It did not execute MCP servers, send live `tools/list` requests, call external APIs, upload files, or render env/header values.",
    ""
  ].filter(Boolean).join("\n");
}

function summarizeReport(report) {
  const summary = isObject(report.summary) ? report.summary : {};
  const scan = isObject(report.scan) ? report.scan : {};

  return {
    highestSeverity: typeof summary.highestSeverity === "string" && summary.highestSeverity in SEVERITY_RANK
      ? summary.highestSeverity
      : "unknown",
    findingCount: nonNegativeInteger(summary.findingCount),
    serverCount: nonNegativeInteger(summary.serverCount),
    toolCount: nonNegativeInteger(summary.toolCount),
    scanMode: typeof scan.mode === "string" ? scan.mode : "unknown"
  };
}

function shouldFail(highestSeverity, threshold, findingCount) {
  if (threshold === "none" || findingCount <= 0) {
    return false;
  }

  if (threshold === "info") {
    return true;
  }

  return severityRank(highestSeverity) >= severityRank(threshold);
}

function severityRank(severity) {
  return severity in SEVERITY_RANK ? SEVERITY_RANK[severity] : -1;
}

function nonNegativeInteger(value) {
  return typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : 0;
}

function defaultReportPath(format) {
  if (format === "json") {
    return "mcp-scope-report.json";
  }

  if (format === "html") {
    return "mcp-scope-report.html";
  }

  return "mcp-scope-report.md";
}

function replaceExtension(filePath, extension) {
  const parsed = path.parse(filePath);
  return path.join(parsed.dir, `${parsed.name}${extension}`);
}

function optionalPath(input, base, workspace, label) {
  if (input === undefined || input.trim() === "") {
    return undefined;
  }

  return resolveRelativeInput(input, base, workspace, label);
}

function resolveRelativeInput(input, base, workspace, label) {
  const resolved = path.isAbsolute(input) ? path.normalize(input) : path.resolve(base, input);

  if (!path.isAbsolute(input) && !isInside(resolved, workspace)) {
    throw new Error(`${label} must stay inside GITHUB_WORKSPACE when provided as a relative path.`);
  }

  return resolved;
}

function isInside(child, parent) {
  const relative = path.relative(parent, child);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function displayPath(filePath, workspace) {
  return isInside(filePath, workspace) ? path.relative(workspace, filePath) || "." : filePath;
}

function parseBoolean(value, defaultValue, label) {
  if (value === undefined || value.trim() === "") {
    return defaultValue;
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  throw new Error(`${label} must be "true" or "false".`);
}

function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function scriptDir() {
  return path.dirname(fileURLToPath(import.meta.url));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runAction().then((status) => {
    process.exitCode = status;
  }).catch((error) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MCP Scope action failed: ${message}`);
    process.exitCode = 1;
  });
}

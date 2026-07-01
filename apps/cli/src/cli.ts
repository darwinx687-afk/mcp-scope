import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  FOUNDATION_STATUS,
  McpScopeConfigError,
  McpToolMetadataError,
  PROJECT_NAME,
  PROJECT_VERSION,
  createMcpConfigFingerprint,
  discoverMcpConfigs,
  evaluateToolManifest,
  readMcpToolMetadataFile,
  readMcpConfigFile
} from "@mcp-scope/core";
import {
  buildScanReportModel,
  buildToolMetadataReportModel,
  buildMcpScopeSnapshot,
  diffMcpScopeSnapshot,
  type FailOnThreshold,
  type ReportLanguage,
  type TransparencyReportModel,
  isFailOnThreshold,
  parseMcpScopeSnapshotJson,
  renderDiffHtml,
  renderDiffJson,
  renderDiffMarkdown,
  renderDiscoveryHtml,
  renderDiscoveryJson,
  renderDiscoveryMarkdown,
  renderHtmlFromJsonReport,
  renderHtmlViewer,
  renderTransparencyReportMarkdown,
  shouldFailOnDiffSeverity,
  shouldFailOnSeverity,
  summarizeReportForCi
} from "@mcp-scope/report";

export type CliWriter = {
  write(chunk: string): unknown;
};

export type CliIO = {
  stdout: CliWriter;
  stderr: CliWriter;
};

const HELP_TEXT = `MCP Scope

A local-first transparency and risk audit tool for MCP tool metadata, server configs, and AI agent tool permissions.

Usage:
  mcp-scope --help
  mcp-scope --version
  mcp-scope status
  mcp-scope scan --config <path> [--tools <path>] [--format markdown|json|html] [--lang en|zh-CN] [--output <path>] [--fail-on none|info|low|medium|high]
  mcp-scope inspect-tools --tools <path> [--format markdown|json|html] [--lang en|zh-CN] [--output <path>] [--fail-on none|info|low|medium|high]
  mcp-scope view --report <path> --output <path> [--lang en|zh-CN]
  mcp-scope snapshot [--config <path>] [--tools <path>] --output <path> [--label <text>]
  mcp-scope diff --baseline <snapshot-path> [--config <path>] [--tools <path>] [--format markdown|json|html] [--lang en|zh-CN] [--output <path>] [--fail-on-change none|info|low|medium|high]
  mcp-scope discover --root <path> [--format markdown|json|html] [--lang en|zh-CN] [--output <path>] [--max-depth <number>] [--include-home]

Phase 7 note:
  MCP Scope statically reads local JSON config and exported tool metadata files.
  Discovery lists likely local MCP config candidates and never scans them automatically.
  It does not execute MCP servers, call tools/list, start a web server, or call external APIs.
`;

type ScanFormat = "markdown" | "json" | "html";
type DiffFormat = ScanFormat;
type DiscoveryFormat = ScanFormat;

type ScanCommandOptions = {
  readonly configPath: string;
  readonly toolsPath?: string;
  readonly format: ScanFormat;
  readonly lang: ReportLanguage;
  readonly outputPath?: string;
  readonly failOn: FailOnThreshold;
};

type InspectToolsOptions = {
  readonly toolsPath: string;
  readonly format: ScanFormat;
  readonly lang: ReportLanguage;
  readonly outputPath?: string;
  readonly failOn: FailOnThreshold;
};

type ViewCommandOptions = {
  readonly reportPath: string;
  readonly outputPath: string;
  readonly lang: ReportLanguage;
};

type SnapshotCommandOptions = {
  readonly configPath?: string;
  readonly toolsPath?: string;
  readonly outputPath: string;
  readonly label?: string;
};

type DiffCommandOptions = {
  readonly baselinePath: string;
  readonly configPath?: string;
  readonly toolsPath?: string;
  readonly format: DiffFormat;
  readonly lang: ReportLanguage;
  readonly outputPath?: string;
  readonly failOnChange: FailOnThreshold;
};

type DiscoverCommandOptions = {
  readonly rootPath: string;
  readonly format: DiscoveryFormat;
  readonly lang: ReportLanguage;
  readonly outputPath?: string;
  readonly maxDepth: number;
  readonly includeHome: boolean;
};

export async function handleCli(args = process.argv.slice(2), io: CliIO = process): Promise<number> {
  const [command] = args;

  if (command === undefined || command === "--help" || command === "-h") {
    io.stdout.write(`${HELP_TEXT}\n`);
    return 0;
  }

  if (command === "--version" || command === "-v") {
    io.stdout.write(`${PROJECT_VERSION}\n`);
    return 0;
  }

  if (command === "status") {
    io.stdout.write(`${JSON.stringify(FOUNDATION_STATUS, null, 2)}\n`);
    return 0;
  }

  if (command === "scan") {
    return runScanCommand(args.slice(1), io);
  }

  if (command === "inspect-tools") {
    return runInspectToolsCommand(args.slice(1), io);
  }

  if (command === "view") {
    return runViewCommand(args.slice(1), io);
  }

  if (command === "snapshot") {
    return runSnapshotCommand(args.slice(1), io);
  }

  if (command === "diff") {
    return runDiffCommand(args.slice(1), io);
  }

  if (command === "discover") {
    return runDiscoverCommand(args.slice(1), io);
  }

  io.stderr.write(`Unknown MCP Scope command: ${command}\n`);
  io.stderr.write(`Run "mcp-scope --help" for usage.\n`);
  return 1;
}

export { PROJECT_NAME };

async function runScanCommand(args: readonly string[], io: CliIO): Promise<number> {
  const options = parseScanArgs(args);

  if (typeof options === "string") {
    io.stderr.write(`${options}\n`);
    return 1;
  }

  if (options.format === "html" && options.outputPath === undefined) {
    io.stderr.write("HTML format requires --output <path>.\n");
    return 1;
  }

  try {
    const toolMetadata =
      options.toolsPath === undefined
        ? undefined
        : evaluateToolManifest(await readMcpToolMetadataFile(options.toolsPath));
    const parsedConfig = await readMcpConfigFile(options.configPath);
    const result = createMcpConfigFingerprint(parsedConfig, { toolMetadata });
    const report = buildScanReportModel(result);
    const rendered =
      options.format === "json"
        ? `${JSON.stringify(report, null, 2)}\n`
        : options.format === "html"
          ? renderHtmlViewer(report, { lang: options.lang })
          : renderTransparencyReportMarkdown(report, { lang: options.lang });

    if (options.outputPath !== undefined) {
      await mkdir(dirname(options.outputPath), { recursive: true });
      await writeFile(options.outputPath, rendered, "utf8");
      io.stdout.write(`Wrote MCP Scope ${options.format} report to ${options.outputPath}\n`);
      return applyFailOn(report, options.failOn, io);
    }

    io.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
    return applyFailOn(report, options.failOn, io);
  } catch (error) {
    if (error instanceof McpScopeConfigError || error instanceof McpToolMetadataError) {
      io.stderr.write(`${error.message}\n`);
      return 1;
    }

    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`MCP Scope scan failed: ${message}\n`);
    return 1;
  }
}

async function runInspectToolsCommand(args: readonly string[], io: CliIO): Promise<number> {
  const options = parseInspectToolsArgs(args);

  if (typeof options === "string") {
    io.stderr.write(`${options}\n`);
    return 1;
  }

  if (options.format === "html" && options.outputPath === undefined) {
    io.stderr.write("HTML format requires --output <path>.\n");
    return 1;
  }

  try {
    const result = evaluateToolManifest(await readMcpToolMetadataFile(options.toolsPath));
    const report = buildToolMetadataReportModel(result);
    const rendered =
      options.format === "json"
        ? `${JSON.stringify(report, null, 2)}\n`
        : options.format === "html"
          ? renderHtmlViewer(report, { lang: options.lang })
          : renderTransparencyReportMarkdown(report, { lang: options.lang });

    if (options.outputPath !== undefined) {
      await mkdir(dirname(options.outputPath), { recursive: true });
      await writeFile(options.outputPath, rendered, "utf8");
      io.stdout.write(`Wrote MCP Scope ${options.format} tool metadata report to ${options.outputPath}\n`);
      return applyFailOn(report, options.failOn, io);
    }

    io.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
    return applyFailOn(report, options.failOn, io);
  } catch (error) {
    if (error instanceof McpToolMetadataError) {
      io.stderr.write(`${error.message}\n`);
      return 1;
    }

    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`MCP Scope tool metadata inspection failed: ${message}\n`);
    return 1;
  }
}

function applyFailOn(report: TransparencyReportModel, threshold: FailOnThreshold, io: CliIO): number {
  if (threshold === "none") {
    return 0;
  }

  const summary = summarizeReportForCi(report);
  const failed = shouldFailOnSeverity(summary.highestSeverity, threshold, summary.findingCount);

  if (!failed) {
    return 0;
  }

  io.stderr.write(
    `MCP Scope fail-on threshold reached: highest severity ${summary.highestSeverity} meets ${threshold} (${summary.findingCount} finding(s)).\n`
  );
  return 1;
}

async function runViewCommand(args: readonly string[], io: CliIO): Promise<number> {
  const options = parseViewArgs(args);

  if (typeof options === "string") {
    io.stderr.write(`${options}\n`);
    return 1;
  }

  let reportJson: string;

  try {
    reportJson = await readFile(options.reportPath, "utf8");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`Unable to read report file "${options.reportPath}": ${message}\n`);
    return 1;
  }

  try {
    const rendered = renderHtmlFromJsonReport(reportJson, { lang: options.lang });
    await mkdir(dirname(options.outputPath), { recursive: true });
    await writeFile(options.outputPath, rendered, "utf8");
    io.stdout.write(`Wrote MCP Scope HTML viewer to ${options.outputPath}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`MCP Scope view failed: ${message}\n`);
    return 1;
  }
}

async function runSnapshotCommand(args: readonly string[], io: CliIO): Promise<number> {
  const options = parseSnapshotArgs(args);

  if (typeof options === "string") {
    io.stderr.write(`${options}\n`);
    return 1;
  }

  try {
    const report = await buildReportFromSources(options);
    const snapshot = buildMcpScopeSnapshot(report, { label: options.label });
    const rendered = `${JSON.stringify(snapshot, null, 2)}\n`;

    await mkdir(dirname(options.outputPath), { recursive: true });
    await writeFile(options.outputPath, rendered, "utf8");
    io.stdout.write(`Wrote MCP Scope snapshot to ${options.outputPath}\n`);
    io.stdout.write(`- server count: ${snapshot.riskSummary.serverCount}\n`);
    io.stdout.write(`- tool count: ${snapshot.riskSummary.toolCount}\n`);
    io.stdout.write(`- highest severity: ${snapshot.riskSummary.highestSeverity}\n`);
    io.stdout.write(`- secret values redacted: ${String(snapshot.scan.secretValuesRedacted)}\n`);
    return 0;
  } catch (error) {
    if (error instanceof McpScopeConfigError || error instanceof McpToolMetadataError) {
      io.stderr.write(`${error.message}\n`);
      return 1;
    }

    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`MCP Scope snapshot failed: ${message}\n`);
    return 1;
  }
}

async function runDiffCommand(args: readonly string[], io: CliIO): Promise<number> {
  const options = parseDiffArgs(args);

  if (typeof options === "string") {
    io.stderr.write(`${options}\n`);
    return 1;
  }

  if (options.format === "html" && options.outputPath === undefined) {
    io.stderr.write("HTML format requires --output <path>.\n");
    return 1;
  }

  try {
    let snapshotText: string;

    try {
      snapshotText = await readFile(options.baselinePath, "utf8");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      io.stderr.write(`Unable to read baseline snapshot "${options.baselinePath}": ${message}\n`);
      return 1;
    }

    const baseline = parseMcpScopeSnapshotJson(snapshotText);
    const currentReport = await buildReportFromSources(options);
    const diff = diffMcpScopeSnapshot(baseline, currentReport, { snapshotPath: options.baselinePath });
    const rendered =
      options.format === "json"
        ? renderDiffJson(diff)
        : options.format === "html"
          ? renderDiffHtml(diff, { lang: options.lang })
          : renderDiffMarkdown(diff, { lang: options.lang });

    if (options.outputPath !== undefined) {
      await mkdir(dirname(options.outputPath), { recursive: true });
      await writeFile(options.outputPath, rendered, "utf8");
      io.stdout.write(`Wrote MCP Scope ${options.format} diff report to ${options.outputPath}\n`);
    } else {
      io.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
    }

    if (shouldFailOnDiffSeverity(diff, options.failOnChange)) {
      io.stderr.write(
        `MCP Scope fail-on-change threshold reached: highest diff severity ${diff.summary.highestDiffSeverity} meets ${options.failOnChange} (${diff.summary.changeCount} change(s)).\n`
      );
      return 1;
    }

    return 0;
  } catch (error) {
    if (error instanceof McpScopeConfigError || error instanceof McpToolMetadataError) {
      io.stderr.write(`${error.message}\n`);
      return 1;
    }

    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`MCP Scope diff failed: ${message}\n`);
    return 1;
  }
}

async function runDiscoverCommand(args: readonly string[], io: CliIO): Promise<number> {
  const options = parseDiscoverArgs(args);

  if (typeof options === "string") {
    io.stderr.write(`${options}\n`);
    return 1;
  }

  if (options.format === "html" && options.outputPath === undefined) {
    io.stderr.write("HTML format requires --output <path>.\n");
    return 1;
  }

  try {
    const result = await discoverMcpConfigs({
      root: options.rootPath,
      maxDepth: options.maxDepth,
      includeHome: options.includeHome
    });
    const rendered =
      options.format === "json"
        ? renderDiscoveryJson(result)
        : options.format === "html"
          ? renderDiscoveryHtml(result, { lang: options.lang })
          : renderDiscoveryMarkdown(result, { lang: options.lang });

    if (options.outputPath !== undefined) {
      await mkdir(dirname(options.outputPath), { recursive: true });
      await writeFile(options.outputPath, rendered, "utf8");
      io.stdout.write(`Wrote MCP Scope ${options.format} discovery report to ${options.outputPath}\n`);
      return 0;
    }

    io.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`MCP Scope discovery failed: ${message}\n`);
    return 1;
  }
}

async function buildReportFromSources(options: {
  readonly configPath?: string;
  readonly toolsPath?: string;
}): Promise<TransparencyReportModel> {
  if (options.configPath === undefined && options.toolsPath === undefined) {
    throw new Error("Provide at least one input: --config <path> or --tools <path>.");
  }

  const toolMetadata =
    options.toolsPath === undefined
      ? undefined
      : evaluateToolManifest(await readMcpToolMetadataFile(options.toolsPath));

  if (options.configPath !== undefined) {
    const parsedConfig = await readMcpConfigFile(options.configPath);
    return buildScanReportModel(createMcpConfigFingerprint(parsedConfig, { toolMetadata }));
  }

  if (toolMetadata === undefined) {
    throw new Error("Provide at least one input: --config <path> or --tools <path>.");
  }

  return buildToolMetadataReportModel(toolMetadata);
}

function parseScanArgs(args: readonly string[]): ScanCommandOptions | string {
  let configPath: string | undefined;
  let toolsPath: string | undefined;
  let format: ScanFormat = "markdown";
  let lang: ReportLanguage = "en";
  let outputPath: string | undefined;
  let failOn: FailOnThreshold = "none";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--config") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --config <path>';
      }

      configPath = value;
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const nextFormat = args[index + 1];

      if (nextFormat !== "json" && nextFormat !== "markdown" && nextFormat !== "html") {
        return `Unsupported --format "${nextFormat ?? ""}". Use "markdown", "json", or "html".`;
      }

      format = nextFormat;
      index += 1;
      continue;
    }

    if (arg === "--tools") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --tools <path>';
      }

      toolsPath = value;
      index += 1;
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];

      if (value !== "en" && value !== "zh-CN") {
        return `Unsupported --lang "${value ?? ""}". Use "en" or "zh-CN".`;
      }

      lang = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --output <path>';
      }

      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--fail-on") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --fail-on <none|info|low|medium|high>';
      }

      if (!isFailOnThreshold(value)) {
        return `Unsupported --fail-on "${value}". Use "none", "info", "low", "medium", or "high".`;
      }

      failOn = value;
      index += 1;
      continue;
    }

    return `Unknown scan option: ${arg ?? ""}`;
  }

  if (configPath === undefined || configPath.trim() === "") {
    return 'Missing required option: --config <path>';
  }

  if (outputPath !== undefined && outputPath.trim() === "") {
    return 'Invalid empty value for --output <path>';
  }

  return {
    configPath,
    toolsPath,
    format,
    lang,
    outputPath,
    failOn
  };
}

function parseInspectToolsArgs(args: readonly string[]): InspectToolsOptions | string {
  let toolsPath: string | undefined;
  let format: ScanFormat = "markdown";
  let lang: ReportLanguage = "en";
  let outputPath: string | undefined;
  let failOn: FailOnThreshold = "none";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--tools") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --tools <path>';
      }

      toolsPath = value;
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const nextFormat = args[index + 1];

      if (nextFormat !== "json" && nextFormat !== "markdown" && nextFormat !== "html") {
        return `Unsupported --format "${nextFormat ?? ""}". Use "markdown", "json", or "html".`;
      }

      format = nextFormat;
      index += 1;
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];

      if (value !== "en" && value !== "zh-CN") {
        return `Unsupported --lang "${value ?? ""}". Use "en" or "zh-CN".`;
      }

      lang = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --output <path>';
      }

      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--fail-on") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --fail-on <none|info|low|medium|high>';
      }

      if (!isFailOnThreshold(value)) {
        return `Unsupported --fail-on "${value}". Use "none", "info", "low", "medium", or "high".`;
      }

      failOn = value;
      index += 1;
      continue;
    }

    return `Unknown inspect-tools option: ${arg ?? ""}`;
  }

  if (toolsPath === undefined || toolsPath.trim() === "") {
    return 'Missing required option: --tools <path>';
  }

  if (outputPath !== undefined && outputPath.trim() === "") {
    return 'Invalid empty value for --output <path>';
  }

  return {
    toolsPath,
    format,
    lang,
    outputPath,
    failOn
  };
}

function parseViewArgs(args: readonly string[]): ViewCommandOptions | string {
  let reportPath: string | undefined;
  let outputPath: string | undefined;
  let lang: ReportLanguage = "en";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--report") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --report <path>';
      }

      reportPath = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --output <path>';
      }

      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];

      if (value !== "en" && value !== "zh-CN") {
        return `Unsupported --lang "${value ?? ""}". Use "en" or "zh-CN".`;
      }

      lang = value;
      index += 1;
      continue;
    }

    return `Unknown view option: ${arg ?? ""}`;
  }

  if (reportPath === undefined || reportPath.trim() === "") {
    return 'Missing required option: --report <path>';
  }

  if (outputPath === undefined || outputPath.trim() === "") {
    return 'HTML viewer output requires --output <path>';
  }

  return {
    reportPath,
    outputPath,
    lang
  };
}

function parseSnapshotArgs(args: readonly string[]): SnapshotCommandOptions | string {
  let configPath: string | undefined;
  let toolsPath: string | undefined;
  let outputPath: string | undefined;
  let label: string | undefined;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--config") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --config <path>';
      }

      configPath = value;
      index += 1;
      continue;
    }

    if (arg === "--tools") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --tools <path>';
      }

      toolsPath = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --output <path>';
      }

      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--label") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --label <text>';
      }

      label = value;
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const value = args[index + 1];

      if (value !== "json") {
        return `Unsupported --format "${value ?? ""}". Snapshot output is JSON.`;
      }

      index += 1;
      continue;
    }

    return `Unknown snapshot option: ${arg ?? ""}`;
  }

  if (configPath === undefined && toolsPath === undefined) {
    return 'Missing input: provide --config <path>, --tools <path>, or both.';
  }

  if (outputPath === undefined || outputPath.trim() === "") {
    return 'Missing required option: --output <path>';
  }

  return {
    configPath,
    toolsPath,
    outputPath,
    label
  };
}

function parseDiffArgs(args: readonly string[]): DiffCommandOptions | string {
  let baselinePath: string | undefined;
  let configPath: string | undefined;
  let toolsPath: string | undefined;
  let format: DiffFormat = "markdown";
  let lang: ReportLanguage = "en";
  let outputPath: string | undefined;
  let failOnChange: FailOnThreshold = "none";

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--baseline") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --baseline <snapshot-path>';
      }

      baselinePath = value;
      index += 1;
      continue;
    }

    if (arg === "--config") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --config <path>';
      }

      configPath = value;
      index += 1;
      continue;
    }

    if (arg === "--tools") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --tools <path>';
      }

      toolsPath = value;
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const value = args[index + 1];

      if (value !== "json" && value !== "markdown" && value !== "html") {
        return `Unsupported --format "${value ?? ""}". Use "markdown", "json", or "html".`;
      }

      format = value;
      index += 1;
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];

      if (value !== "en" && value !== "zh-CN") {
        return `Unsupported --lang "${value ?? ""}". Use "en" or "zh-CN".`;
      }

      lang = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --output <path>';
      }

      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--fail-on-change") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --fail-on-change <none|info|low|medium|high>';
      }

      if (!isFailOnThreshold(value)) {
        return `Unsupported --fail-on-change "${value}". Use "none", "info", "low", "medium", or "high".`;
      }

      failOnChange = value;
      index += 1;
      continue;
    }

    return `Unknown diff option: ${arg ?? ""}`;
  }

  if (baselinePath === undefined || baselinePath.trim() === "") {
    return 'Missing required option: --baseline <snapshot-path>';
  }

  if (configPath === undefined && toolsPath === undefined) {
    return 'Missing input: provide --config <path>, --tools <path>, or both.';
  }

  if (outputPath !== undefined && outputPath.trim() === "") {
    return 'Invalid empty value for --output <path>';
  }

  return {
    baselinePath,
    configPath,
    toolsPath,
    format,
    lang,
    outputPath,
    failOnChange
  };
}

function parseDiscoverArgs(args: readonly string[]): DiscoverCommandOptions | string {
  let rootPath: string | undefined;
  let format: DiscoveryFormat = "markdown";
  let lang: ReportLanguage = "en";
  let outputPath: string | undefined;
  let maxDepth = 4;
  let includeHome = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--root") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --root <path>';
      }

      rootPath = value;
      index += 1;
      continue;
    }

    if (arg === "--format") {
      const value = args[index + 1];

      if (value !== "json" && value !== "markdown" && value !== "html") {
        return `Unsupported --format "${value ?? ""}". Use "markdown", "json", or "html".`;
      }

      format = value;
      index += 1;
      continue;
    }

    if (arg === "--lang") {
      const value = args[index + 1];

      if (value !== "en" && value !== "zh-CN") {
        return `Unsupported --lang "${value ?? ""}". Use "en" or "zh-CN".`;
      }

      lang = value;
      index += 1;
      continue;
    }

    if (arg === "--output") {
      const value = args[index + 1];

      if (value === undefined || value.startsWith("--")) {
        return 'Missing value for --output <path>';
      }

      outputPath = value;
      index += 1;
      continue;
    }

    if (arg === "--max-depth") {
      const value = args[index + 1];
      const parsed = Number(value);

      if (value === undefined || value.startsWith("--") || !Number.isInteger(parsed) || parsed < 0) {
        return 'Invalid value for --max-depth <number>';
      }

      maxDepth = parsed;
      index += 1;
      continue;
    }

    if (arg === "--include-home") {
      includeHome = true;
      continue;
    }

    return `Unknown discover option: ${arg ?? ""}`;
  }

  if (rootPath === undefined || rootPath.trim() === "") {
    return 'Missing required option: --root <path>';
  }

  if (outputPath !== undefined && outputPath.trim() === "") {
    return 'Invalid empty value for --output <path>';
  }

  return {
    rootPath,
    format,
    lang,
    outputPath,
    maxDepth,
    includeHome
  };
}

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

import {
  FOUNDATION_STATUS,
  McpScopeConfigError,
  McpToolMetadataError,
  PROJECT_NAME,
  PROJECT_VERSION,
  createMcpConfigFingerprint,
  evaluateToolManifest,
  readMcpToolMetadataFile,
  readMcpConfigFile
} from "@mcp-scope/core";
import {
  buildScanReportModel,
  buildToolMetadataReportModel,
  type FailOnThreshold,
  type ReportLanguage,
  type TransparencyReportModel,
  isFailOnThreshold,
  renderHtmlFromJsonReport,
  renderHtmlViewer,
  renderTransparencyReportMarkdown,
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

Phase 5 note:
  MCP Scope statically reads local JSON config and exported tool metadata files.
  GitHub Action support wraps the local CLI and can fail on static severity thresholds.
  It does not execute MCP servers, call tools/list, start a web server, or call external APIs.
`;

type ScanFormat = "markdown" | "json" | "html";

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

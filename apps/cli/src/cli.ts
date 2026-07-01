import { mkdir, writeFile } from "node:fs/promises";
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
  type ReportLanguage,
  renderScanResultJson,
  renderScanResultMarkdown,
  renderToolMetadataJson,
  renderToolMetadataMarkdown
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
  mcp-scope scan --config <path> [--tools <path>] [--format markdown|json] [--lang en|zh-CN] [--output <path>]
  mcp-scope inspect-tools --tools <path> [--format markdown|json] [--lang en|zh-CN] [--output <path>]

Phase 3 note:
  MCP Scope statically reads local JSON config and exported tool metadata files.
  It does not execute MCP servers, call tools/list, or call external APIs.
`;

type ScanFormat = "markdown" | "json";

type ScanCommandOptions = {
  readonly configPath: string;
  readonly toolsPath?: string;
  readonly format: ScanFormat;
  readonly lang: ReportLanguage;
  readonly outputPath?: string;
};

type InspectToolsOptions = {
  readonly toolsPath: string;
  readonly format: ScanFormat;
  readonly lang: ReportLanguage;
  readonly outputPath?: string;
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

  try {
    const toolMetadata =
      options.toolsPath === undefined
        ? undefined
        : evaluateToolManifest(await readMcpToolMetadataFile(options.toolsPath));
    const parsedConfig = await readMcpConfigFile(options.configPath);
    const result = createMcpConfigFingerprint(parsedConfig, { toolMetadata });
    const rendered =
      options.format === "json" ? renderScanResultJson(result) : renderScanResultMarkdown(result, { lang: options.lang });

    if (options.outputPath !== undefined) {
      await mkdir(dirname(options.outputPath), { recursive: true });
      await writeFile(options.outputPath, rendered, "utf8");
      io.stdout.write(`Wrote MCP Scope ${options.format} report to ${options.outputPath}\n`);
      return 0;
    }

    io.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
    return 0;
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

  try {
    const result = evaluateToolManifest(await readMcpToolMetadataFile(options.toolsPath));
    const rendered =
      options.format === "json" ? renderToolMetadataJson(result) : renderToolMetadataMarkdown(result, { lang: options.lang });

    if (options.outputPath !== undefined) {
      await mkdir(dirname(options.outputPath), { recursive: true });
      await writeFile(options.outputPath, rendered, "utf8");
      io.stdout.write(`Wrote MCP Scope ${options.format} tool metadata report to ${options.outputPath}\n`);
      return 0;
    }

    io.stdout.write(rendered.endsWith("\n") ? rendered : `${rendered}\n`);
    return 0;
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

function parseScanArgs(args: readonly string[]): ScanCommandOptions | string {
  let configPath: string | undefined;
  let toolsPath: string | undefined;
  let format: ScanFormat = "markdown";
  let lang: ReportLanguage = "en";
  let outputPath: string | undefined;

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

      if (nextFormat !== "json" && nextFormat !== "markdown") {
        return `Unsupported --format "${nextFormat ?? ""}". Use "markdown" or "json".`;
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
    outputPath
  };
}

function parseInspectToolsArgs(args: readonly string[]): InspectToolsOptions | string {
  let toolsPath: string | undefined;
  let format: ScanFormat = "markdown";
  let lang: ReportLanguage = "en";
  let outputPath: string | undefined;

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

      if (nextFormat !== "json" && nextFormat !== "markdown") {
        return `Unsupported --format "${nextFormat ?? ""}". Use "markdown" or "json".`;
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
    outputPath
  };
}

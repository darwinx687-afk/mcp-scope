import { readFile } from "node:fs/promises";

import type { McpCapabilityCategory, RiskLevel } from "./index.js";

export type ConfigSourceKind = "mcpServers-json";

export type McpTransportType = "stdio" | "http" | "sse" | "ws" | "unknown";

export type TransparencyNote = {
  readonly level: Exclude<RiskLevel, "unknown">;
  readonly code: string;
  readonly message: string;
};

export type McpConfigFile = {
  readonly sourcePath?: string;
  readonly sourceKind: ConfigSourceKind;
  readonly topLevelKeys: readonly string[];
  readonly unknownTopLevelKeys: readonly string[];
  readonly mcpServers: Record<string, unknown>;
};

export type McpServerEntry = {
  readonly name: string;
  readonly transport: McpTransportType;
  readonly rawTransport?: string;
  readonly command?: string;
  readonly args: readonly string[];
  readonly envKeys: readonly string[];
  readonly headerKeys: readonly string[];
  readonly url?: string;
  readonly unknownFields: readonly string[];
  readonly unsupported: boolean;
  readonly transparencyNotes: readonly TransparencyNote[];
};

export type McpServerFingerprint = {
  readonly name: string;
  readonly transport: McpTransportType;
  readonly rawTransport?: string;
  readonly hasCommand: boolean;
  readonly commandSummary: string;
  readonly argCount: number;
  readonly argsPreview: readonly string[];
  readonly envKeyCount: number;
  readonly envKeys: readonly string[];
  readonly headerKeyCount: number;
  readonly headerKeys: readonly string[];
  readonly hasUrl: boolean;
  readonly urlHost?: string;
  readonly rawUrlRedacted?: string;
  readonly capabilityHints: readonly McpCapabilityCategory[];
  readonly transparencyNotes: readonly TransparencyNote[];
  readonly riskLevel: Exclude<RiskLevel, "unknown">;
};

export type McpScopeScanResult = {
  readonly schemaVersion: 1;
  readonly project: "mcp-scope";
  readonly name: "MCP Scope";
  readonly sourceFile?: string;
  readonly sourceKind: ConfigSourceKind;
  readonly generatedAt: string;
  readonly serverCount: number;
  readonly highestRiskLevel: Exclude<RiskLevel, "unknown">;
  readonly secretsRedacted: true;
  readonly externalApiCalls: false;
  readonly serverExecution: false;
  readonly transparencyNotes: readonly TransparencyNote[];
  readonly servers: readonly McpServerFingerprint[];
};

export type McpScopeScanOptions = {
  readonly generatedAt?: string;
};

export class McpScopeConfigError extends Error {
  constructor(
    message: string,
    readonly code: "FILE_READ_ERROR" | "INVALID_JSON" | "INVALID_CONFIG"
  ) {
    super(message);
    this.name = "McpScopeConfigError";
  }
}

const SUPPORTED_TRANSPORTS = new Set(["stdio", "http", "sse", "ws"]);
const SERVER_ENTRY_KEYS = new Set(["type", "command", "args", "env", "url", "headers"]);
const RISK_ORDER: Record<Exclude<RiskLevel, "unknown">, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};

export async function readMcpConfigFile(path: string): Promise<McpConfigFile> {
  let fileText: string;

  try {
    fileText = await readFile(path, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new McpScopeConfigError(`Unable to read config file "${path}": ${detail}`, "FILE_READ_ERROR");
  }

  let input: unknown;

  try {
    input = JSON.parse(fileText);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new McpScopeConfigError(`Invalid JSON in config file "${path}": ${detail}`, "INVALID_JSON");
  }

  return parseMcpConfig(input, path);
}

export function parseMcpConfig(input: unknown, sourcePath?: string): McpConfigFile {
  if (!isPlainObject(input)) {
    throw new McpScopeConfigError("MCP config must be a JSON object.", "INVALID_CONFIG");
  }

  const mcpServers = input["mcpServers"];

  if (!isPlainObject(mcpServers)) {
    throw new McpScopeConfigError('MCP config must contain an "mcpServers" object.', "INVALID_CONFIG");
  }

  const topLevelKeys = Object.keys(input);
  const unknownTopLevelKeys = topLevelKeys.filter((key) => key !== "mcpServers");

  return {
    sourcePath,
    sourceKind: "mcpServers-json",
    topLevelKeys,
    unknownTopLevelKeys,
    mcpServers
  };
}

export function createMcpConfigFingerprint(
  parsedConfig: McpConfigFile,
  options: McpScopeScanOptions = {}
): McpScopeScanResult {
  const globalNotes: TransparencyNote[] = [];

  if (parsedConfig.unknownTopLevelKeys.length > 0) {
    globalNotes.push({
      level: "info",
      code: "unknown_top_level_fields",
      message: `Unknown top-level fields were ignored: ${parsedConfig.unknownTopLevelKeys.join(", ")}.`
    });
  }

  const servers = Object.entries(parsedConfig.mcpServers).map(([name, entry]) =>
    fingerprintServer(name, entry)
  );
  const highestRiskLevel = highestRisk([
    ...globalNotes.map((note) => note.level),
    ...servers.map((server) => server.riskLevel)
  ]);

  return {
    schemaVersion: 1,
    project: "mcp-scope",
    name: "MCP Scope",
    sourceFile: parsedConfig.sourcePath,
    sourceKind: parsedConfig.sourceKind,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    serverCount: servers.length,
    highestRiskLevel,
    secretsRedacted: true,
    externalApiCalls: false,
    serverExecution: false,
    transparencyNotes: globalNotes,
    servers
  };
}

function fingerprintServer(name: string, entry: unknown): McpServerFingerprint {
  if (!isPlainObject(entry)) {
    const notes: TransparencyNote[] = [
      {
        level: "medium",
        code: "unsupported_server_entry",
        message: "Server entry is not a JSON object, so MCP Scope could not inspect it."
      }
    ];

    return {
      name,
      transport: "unknown",
      hasCommand: false,
      commandSummary: "none",
      argCount: 0,
      argsPreview: [],
      envKeyCount: 0,
      envKeys: [],
      headerKeyCount: 0,
      headerKeys: [],
      hasUrl: false,
      capabilityHints: ["unknown"],
      transparencyNotes: notes,
      riskLevel: "medium"
    };
  }

  const notes: TransparencyNote[] = [];
  const unknownFields = Object.keys(entry).filter((key) => !SERVER_ENTRY_KEYS.has(key));
  const command = stringValue(entry["command"]);
  const args = stringArrayValue(entry["args"]);
  const envKeys = objectKeys(entry["env"]);
  const headerKeys = objectKeys(entry["headers"]);
  const url = stringValue(entry["url"]);
  const transportInfo = normalizeTransport(entry["type"], command);

  if (unknownFields.length > 0) {
    notes.push({
      level: "info",
      code: "unknown_server_fields",
      message: `Unknown server fields were ignored: ${unknownFields.join(", ")}.`
    });
  }

  if (transportInfo.inferred) {
    notes.push({
      level: "info",
      code: "inferred_stdio_transport",
      message: "Transport type was omitted and command is present, so MCP Scope inferred stdio."
    });
  }

  if (transportInfo.unsupportedRawType !== undefined) {
    notes.push({
      level: "medium",
      code: "unknown_transport_type",
      message: `Unknown transport type "${transportInfo.unsupportedRawType}" was treated as unknown.`
    });
  }

  if (command !== undefined && transportInfo.transport === "stdio") {
    notes.push({
      level: "low",
      code: "local_stdio_command",
      message: "This stdio server starts a local process when used by an MCP client."
    });
  }

  if (command !== undefined && isShellLikeCommand(command)) {
    notes.push({
      level: commandRiskLevel(command),
      code: "shell_like_command",
      message: `Command "${summarizeText(command)}" looks shell-capable or network-fetch capable. Review it before approval.`
    });
  }

  for (const arg of args) {
    const argRisk = classifyArgRisk(arg);

    if (argRisk !== undefined) {
      notes.push(argRisk);
    }
  }

  for (const key of [...envKeys, ...headerKeys]) {
    if (looksSensitiveKey(key)) {
      notes.push({
        level: "medium",
        code: "sensitive_key_name",
        message: `Key "${key}" looks credential-related. Value is redacted.`
      });
    }
  }

  if (headerKeys.some((key) => key.toLowerCase() === "authorization")) {
    notes.push({
      level: "medium",
      code: "authorization_header_present",
      message: "Authorization header is configured. Value is redacted."
    });
  }

  const urlDetails = url === undefined ? undefined : parseUrlDetails(url);

  if (urlDetails !== undefined && urlDetails.scheme === "http") {
    notes.push({
      level: urlDetails.isLocal ? "low" : "medium",
      code: "plain_http_url",
      message: urlDetails.isLocal
        ? "URL uses plain HTTP for a local endpoint."
        : "URL uses plain HTTP for a non-local endpoint."
    });
  }

  if (envKeys.length > 0) {
    notes.push({
      level: "info",
      code: "env_values_redacted",
      message: "Environment variable values are redacted; only key names are shown."
    });
  }

  if (headerKeys.length > 0) {
    notes.push({
      level: "info",
      code: "header_values_redacted",
      message: "Header values are redacted; only key names are shown."
    });
  }

  const riskLevel = highestRisk(notes.map((note) => note.level));

  return {
    name,
    transport: transportInfo.transport,
    rawTransport: transportInfo.rawTransport,
    hasCommand: command !== undefined,
    commandSummary: command === undefined ? "none" : summarizeText(command),
    argCount: args.length,
    argsPreview: args.map((arg) => summarizeText(arg)),
    envKeyCount: envKeys.length,
    envKeys,
    headerKeyCount: headerKeys.length,
    headerKeys,
    hasUrl: url !== undefined,
    urlHost: urlDetails?.host,
    rawUrlRedacted: url === undefined ? undefined : redactUrl(url),
    capabilityHints: inferCapabilityHints(name, command, args, url, envKeys, headerKeys),
    transparencyNotes: notes,
    riskLevel
  };
}

function normalizeTransport(type: unknown, command?: string): {
  readonly transport: McpTransportType;
  readonly rawTransport?: string;
  readonly unsupportedRawType?: string;
  readonly inferred: boolean;
} {
  const rawTransport = stringValue(type);

  if (rawTransport === undefined) {
    return {
      transport: command === undefined ? "unknown" : "stdio",
      inferred: command !== undefined
    };
  }

  const normalized = rawTransport.toLowerCase();

  if (SUPPORTED_TRANSPORTS.has(normalized)) {
    return {
      transport: normalized as McpTransportType,
      rawTransport,
      inferred: false
    };
  }

  return {
    transport: "unknown",
    rawTransport,
    unsupportedRawType: rawTransport,
    inferred: false
  };
}

function inferCapabilityHints(
  name: string,
  command: string | undefined,
  args: readonly string[],
  url: string | undefined,
  envKeys: readonly string[],
  headerKeys: readonly string[]
): McpCapabilityCategory[] {
  const haystack = [name, command, url, ...args, ...envKeys, ...headerKeys]
    .filter((value): value is string => value !== undefined)
    .join(" ")
    .toLowerCase();
  const hints = new Set<McpCapabilityCategory>();

  if (/(file|filesystem|fs|path|directory|folder|read|write|\.env|\.ssh|\/etc|appdata)/.test(haystack)) {
    hints.add("filesystem");
  }

  if (/(shell|bash|zsh|powershell|cmd|terminal|exec|spawn|process|npx|node|python|curl|wget)/.test(haystack)) {
    hints.add("shell");
  }

  if (/(postgres|postgresql|mysql|sqlite|database|db|redis|mongo)/.test(haystack)) {
    hints.add("database");
  }

  if (/(browser|playwright|puppeteer|chrome|safari|firefox)/.test(haystack)) {
    hints.add("browser");
  }

  if (/(github|gh_|gitlab|git)/.test(haystack)) {
    hints.add("github");
  }

  if (url !== undefined || /(http|sse|ws|network|api|endpoint|url|host)/.test(haystack)) {
    hints.add("network");
  }

  if (/(token|key|secret|password|authorization|credential|auth)/.test(haystack)) {
    hints.add("credentials");
  }

  if (hints.size === 0) {
    hints.add("unknown");
  }

  return [...hints].sort();
}

function classifyArgRisk(arg: string): TransparencyNote | undefined {
  const normalized = arg.toLowerCase();

  if (/(^|[\s"'=:[\\/])\.ssh([\\/]|[\s"';&|]|$)|(^|[\s"'=:[\\/])id_rsa([\s"';&|]|$)|(^|[\s"'=:[\\/])\.env([\s"';&|]|$)|\/etc(\/|[\s"';&|]|$)|\/private(\/|[\s"';&|]|$)|appdata/.test(normalized)) {
    return {
      level: "high",
      code: "sensitive_path_argument",
      message: `Argument "${summarizeText(arg)}" references a sensitive-looking local path.`
    };
  }

  if (/^(~|\/|[a-z]:\\users(\\|$))/i.test(arg)) {
    return {
      level: "medium",
      code: "broad_path_argument",
      message: `Argument "${summarizeText(arg)}" references a broad local path.`
    };
  }

  return undefined;
}

function parseUrlDetails(rawUrl: string): { readonly scheme: string; readonly host: string; readonly isLocal: boolean } | undefined {
  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname;

    return {
      scheme: parsed.protocol.replace(":", "").toLowerCase(),
      host,
      isLocal: host === "localhost" || host === "127.0.0.1" || host === "::1"
    };
  } catch {
    return undefined;
  }
}

function redactUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    parsed.username = "";
    parsed.password = "";

    if (parsed.search !== "") {
      parsed.search = "?[query-redacted]";
    }

    return parsed.toString();
  } catch {
    const [withoutHash = ""] = rawUrl.split("#");
    const [withoutQuery = ""] = withoutHash.split("?");
    return rawUrl.includes("?") ? `${withoutQuery}?[query-redacted]` : withoutQuery;
  }
}

function isShellLikeCommand(command: string): boolean {
  return /(^|[\\/])(sh|bash|zsh|powershell|pwsh|cmd|curl|wget)(\.exe)?$/i.test(command) ||
    /^(sh|bash|zsh|powershell|pwsh|cmd|curl|wget)(\.exe)?$/i.test(command);
}

function commandRiskLevel(command: string): "medium" | "high" {
  return /^(curl|wget)(\.exe)?$/i.test(command) || /[\\/](curl|wget)(\.exe)?$/i.test(command)
    ? "high"
    : "medium";
}

function looksSensitiveKey(key: string): boolean {
  return /(token|key|secret|password|authorization)/i.test(key);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function stringArrayValue(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => (typeof item === "string" ? item : JSON.stringify(item))).filter(Boolean);
}

function objectKeys(value: unknown): string[] {
  return isPlainObject(value) ? Object.keys(value) : [];
}

function summarizeText(value: string, maxLength = 120): string {
  return value.length <= maxLength ? value : `${value.slice(0, maxLength - 3)}...`;
}

function highestRisk(levels: readonly Exclude<RiskLevel, "unknown">[]): Exclude<RiskLevel, "unknown"> {
  if (levels.length === 0) {
    return "info";
  }

  return levels.reduce((highest, level) => (RISK_ORDER[level] > RISK_ORDER[highest] ? level : highest), "info");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

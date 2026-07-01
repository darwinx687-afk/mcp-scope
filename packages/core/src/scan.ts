import { basename } from "node:path";
import { readFile } from "node:fs/promises";

import type { McpCapabilityCategory, RiskLevel } from "./index.js";
import type { ToolMetadataScanResult } from "./tool-metadata.js";

export type ConfigSourceKind = "mcpServers-json" | "mcp-compatible-json";

export type McpTransportType = "stdio" | "http" | "sse" | "ws" | "unknown";

export type McpClientProfile =
  | "generic"
  | "claude-code-project"
  | "claude-code-user"
  | "claude-desktop"
  | "cursor-like"
  | "cline-like"
  | "continue-like"
  | "gemini-cli-like"
  | "plugin-like"
  | "unknown";

export type McpConfigShape =
  | "top-level-mcpServers"
  | "projects-mcpServers"
  | "mcp.servers"
  | "top-level-servers"
  | "multiple"
  | "unsupported";

export type McpConfigSourceContext = {
  readonly sourceShape: McpConfigShape;
  readonly clientProfile: McpClientProfile;
  readonly sourceContextLabel: string;
  readonly projectPathDisplay?: string;
  readonly configPath?: string;
  readonly serverKeyPath: string;
};

export type TransparencyNote = {
  readonly level: Exclude<RiskLevel, "unknown">;
  readonly code: string;
  readonly message: string;
};

export type McpConfigServerDefinition = {
  readonly name: string;
  readonly entry: unknown;
  readonly sourceContext: McpConfigSourceContext;
};

export type McpConfigFile = {
  readonly sourcePath?: string;
  readonly sourceKind: ConfigSourceKind;
  readonly sourceShape: McpConfigShape;
  readonly clientProfile: McpClientProfile;
  readonly topLevelKeys: readonly string[];
  readonly unknownTopLevelKeys: readonly string[];
  readonly mcpServers: Record<string, unknown>;
  readonly serverEntries: readonly McpConfigServerDefinition[];
  readonly sourceContexts: readonly McpConfigSourceContext[];
  readonly transparencyNotes: readonly TransparencyNote[];
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
  readonly sourceShape: McpConfigShape;
  readonly clientProfile: McpClientProfile;
  readonly sourceContextLabel: string;
  readonly projectPathDisplay?: string;
  readonly configPath?: string;
  readonly serverKeyPath: string;
  readonly unknownFieldCount: number;
  readonly unknownFields: readonly string[];
  readonly timeoutPresent: boolean;
  readonly alwaysLoad?: boolean;
  readonly disabled?: boolean;
  readonly oauthPresent: boolean;
  readonly oauthKeys: readonly string[];
  readonly headersHelperPresent: boolean;
  readonly rootsCount: number;
  readonly allowedToolsCount: number;
  readonly deniedToolsCount: number;
  readonly permissionHints: readonly string[];
};

export type McpScopeScanResult = {
  readonly schemaVersion: 1;
  readonly project: "mcp-scope";
  readonly name: "MCP Scope";
  readonly sourceFile?: string;
  readonly sourceKind: ConfigSourceKind;
  readonly sourceShape: McpConfigShape;
  readonly clientProfile: McpClientProfile;
  readonly generatedAt: string;
  readonly serverCount: number;
  readonly highestRiskLevel: Exclude<RiskLevel, "unknown">;
  readonly secretsRedacted: true;
  readonly externalApiCalls: false;
  readonly serverExecution: false;
  readonly transparencyNotes: readonly TransparencyNote[];
  readonly sourceContexts: readonly McpConfigSourceContext[];
  readonly servers: readonly McpServerFingerprint[];
  readonly toolMetadata?: ToolMetadataScanResult;
};

export type McpScopeScanOptions = {
  readonly generatedAt?: string;
  readonly toolMetadata?: ToolMetadataScanResult;
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

const SERVER_ENTRY_KEYS = new Set([
  "type",
  "command",
  "args",
  "env",
  "url",
  "headers",
  "timeout",
  "alwaysLoad",
  "disabled",
  "oauth",
  "headersHelper",
  "roots",
  "allowedTools",
  "deniedTools"
]);
const KNOWN_TOP_LEVEL_KEYS = new Set([
  "mcpServers",
  "projects",
  "mcp",
  "servers",
  "client",
  "name",
  "version",
  "description"
]);
const SUPPORTED_TRANSPORTS = new Set(["stdio", "http", "sse", "ws"]);
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

  const topLevelKeys = Object.keys(input);
  const unknownTopLevelKeys = topLevelKeys.filter((key) => !KNOWN_TOP_LEVEL_KEYS.has(key));
  const notes: TransparencyNote[] = [];
  const provisionalProfile = detectClientProfile(input, sourcePath, "unsupported");
  const serverEntries: McpConfigServerDefinition[] = [];

  collectTopLevelMcpServers(input, sourcePath, provisionalProfile, serverEntries, notes);
  collectProjectMcpServers(input, sourcePath, provisionalProfile, serverEntries, notes);
  collectMcpServersWrapper(input, sourcePath, provisionalProfile, serverEntries, notes);
  collectTopLevelServers(input, sourcePath, provisionalProfile, serverEntries, notes);

  const recognizedEmptyShape = detectRecognizedShape(input);

  if (serverEntries.length === 0 && notes.length === 0 && recognizedEmptyShape === "unsupported") {
    throw new McpScopeConfigError(
      'MCP config must contain a supported server object: "mcpServers", "projects[*].mcpServers", "mcp.servers", or "servers".',
      "INVALID_CONFIG"
    );
  }

  const sourceShape = serverEntries.length === 0
    ? recognizedEmptyShape
    : detectSourceShape(serverEntries.map((entry) => entry.sourceContext.sourceShape));
  const clientProfile = detectClientProfile(input, sourcePath, sourceShape);
  const normalizedEntries = serverEntries.map((entry) => ({
    ...entry,
    sourceContext: {
      ...entry.sourceContext,
      clientProfile
    }
  }));
  const sourceContexts = uniqueContexts(normalizedEntries.map((entry) => entry.sourceContext));
  const sourceKind = sourceShape === "top-level-mcpServers" ? "mcpServers-json" : "mcp-compatible-json";

  return {
    sourcePath,
    sourceKind,
    sourceShape,
    clientProfile,
    topLevelKeys,
    unknownTopLevelKeys,
    mcpServers: aggregateMcpServers(normalizedEntries),
    serverEntries: normalizedEntries,
    sourceContexts,
    transparencyNotes: notes
  };
}

export function createMcpConfigFingerprint(
  parsedConfig: McpConfigFile,
  options: McpScopeScanOptions = {}
): McpScopeScanResult {
  const globalNotes: TransparencyNote[] = [...parsedConfig.transparencyNotes];

  if (parsedConfig.unknownTopLevelKeys.length > 0) {
    globalNotes.push({
      level: "info",
      code: "unknown_top_level_fields",
      message: `Unknown top-level fields were ignored: ${parsedConfig.unknownTopLevelKeys.join(", ")}.`
    });
  }

  if (parsedConfig.sourceShape === "projects-mcpServers" || parsedConfig.serverEntries.some((entry) => entry.sourceContext.sourceShape === "projects-mcpServers")) {
    globalNotes.push({
      level: "info",
      code: "nested_project_mcp_servers",
      message: "Nested project mcpServers entries were found and flattened for review."
    });
  }

  const servers = parsedConfig.serverEntries.map((definition) => fingerprintServer(definition));
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
    sourceShape: parsedConfig.sourceShape,
    clientProfile: parsedConfig.clientProfile,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    serverCount: servers.length,
    highestRiskLevel,
    secretsRedacted: true,
    externalApiCalls: false,
    serverExecution: false,
    transparencyNotes: globalNotes,
    sourceContexts: parsedConfig.sourceContexts,
    servers,
    toolMetadata: options.toolMetadata
  };
}

export function safePathDisplay(path: string): string {
  const normalized = path.replaceAll("\\", "/");
  const parts = normalized.split("/").filter(Boolean);
  const leaf = parts.at(-1) ?? normalized;

  if (/^~\//.test(normalized)) {
    return `~/.../${leaf}`;
  }

  if (/^\/Users\/[^/]+\//.test(normalized) || /^\/home\/[^/]+\//.test(normalized)) {
    return `~/.../${leaf}`;
  }

  if (/^[A-Za-z]:\/Users\/[^/]+\//.test(normalized)) {
    return `~/.../${leaf}`;
  }

  return summarizeText(path, 120);
}

function collectTopLevelMcpServers(
  input: Record<string, unknown>,
  sourcePath: string | undefined,
  clientProfile: McpClientProfile,
  serverEntries: McpConfigServerDefinition[],
  notes: TransparencyNote[]
): void {
  if (!("mcpServers" in input)) {
    return;
  }

  const mcpServers = input["mcpServers"];

  if (!isPlainObject(mcpServers)) {
    notes.push({
      level: "medium",
      code: "invalid_mcp_servers_shape",
      message: 'Top-level "mcpServers" exists but is not a JSON object.'
    });
    return;
  }

  addServerEntries(serverEntries, mcpServers, {
    sourceShape: "top-level-mcpServers",
    clientProfile,
    sourceContextLabel: "top-level mcpServers",
    configPath: sourcePath,
    serverKeyPath: "/mcpServers"
  });
}

function collectProjectMcpServers(
  input: Record<string, unknown>,
  sourcePath: string | undefined,
  clientProfile: McpClientProfile,
  serverEntries: McpConfigServerDefinition[],
  notes: TransparencyNote[]
): void {
  if (!("projects" in input)) {
    return;
  }

  const projects = input["projects"];

  if (!isPlainObject(projects)) {
    notes.push({
      level: "medium",
      code: "invalid_projects_shape",
      message: 'Top-level "projects" exists but is not a JSON object.'
    });
    return;
  }

  for (const [projectPath, projectValue] of Object.entries(projects)) {
    if (!isPlainObject(projectValue)) {
      notes.push({
        level: "medium",
        code: "invalid_project_scope_shape",
        message: `Project scope "${safePathDisplay(projectPath)}" is not a JSON object.`
      });
      continue;
    }

    if (!("mcpServers" in projectValue)) {
      continue;
    }

    const mcpServers = projectValue["mcpServers"];

    if (!isPlainObject(mcpServers)) {
      notes.push({
        level: "medium",
        code: "invalid_project_mcp_servers_shape",
        message: `Project scope "${safePathDisplay(projectPath)}" has an mcpServers value that is not a JSON object.`
      });
      continue;
    }

    const projectPathDisplay = safePathDisplay(projectPath);
    addServerEntries(serverEntries, mcpServers, {
      sourceShape: "projects-mcpServers",
      clientProfile,
      sourceContextLabel: `project ${projectPathDisplay}`,
      projectPathDisplay,
      configPath: sourcePath,
      serverKeyPath: `/projects/${jsonPointerToken(projectPath)}/mcpServers`
    });
  }
}

function collectMcpServersWrapper(
  input: Record<string, unknown>,
  sourcePath: string | undefined,
  clientProfile: McpClientProfile,
  serverEntries: McpConfigServerDefinition[],
  notes: TransparencyNote[]
): void {
  if (!("mcp" in input)) {
    return;
  }

  const mcp = input["mcp"];

  if (!isPlainObject(mcp) || !("servers" in mcp)) {
    return;
  }

  const servers = mcp["servers"];

  if (!isPlainObject(servers)) {
    notes.push({
      level: "medium",
      code: "invalid_mcp_servers_wrapper_shape",
      message: 'Nested "mcp.servers" exists but is not a JSON object.'
    });
    return;
  }

  addServerEntries(serverEntries, servers, {
    sourceShape: "mcp.servers",
    clientProfile,
    sourceContextLabel: "mcp.servers",
    configPath: sourcePath,
    serverKeyPath: "/mcp/servers"
  });
}

function collectTopLevelServers(
  input: Record<string, unknown>,
  sourcePath: string | undefined,
  clientProfile: McpClientProfile,
  serverEntries: McpConfigServerDefinition[],
  notes: TransparencyNote[]
): void {
  if (!("servers" in input)) {
    return;
  }

  const servers = input["servers"];

  if (!isPlainObject(servers)) {
    notes.push({
      level: "medium",
      code: "invalid_top_level_servers_shape",
      message: 'Top-level "servers" exists but is not a JSON object.'
    });
    return;
  }

  addServerEntries(serverEntries, servers, {
    sourceShape: "top-level-servers",
    clientProfile,
    sourceContextLabel: "top-level servers",
    configPath: sourcePath,
    serverKeyPath: "/servers"
  });
}

function addServerEntries(
  serverEntries: McpConfigServerDefinition[],
  servers: Record<string, unknown>,
  context: McpConfigSourceContext
): void {
  for (const [name, entry] of Object.entries(servers)) {
    serverEntries.push({
      name,
      entry,
      sourceContext: {
        ...context,
        serverKeyPath: `${context.serverKeyPath}/${jsonPointerToken(name)}`
      }
    });
  }
}

function fingerprintServer(definition: McpConfigServerDefinition): McpServerFingerprint {
  const { name, entry, sourceContext } = definition;

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
      riskLevel: "medium",
      ...sourceContext,
      unknownFieldCount: 0,
      unknownFields: [],
      timeoutPresent: false,
      oauthPresent: false,
      oauthKeys: [],
      headersHelperPresent: false,
      rootsCount: 0,
      allowedToolsCount: 0,
      deniedToolsCount: 0,
      permissionHints: []
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
  const timeoutPresent = entry["timeout"] !== undefined;
  const alwaysLoad = booleanValue(entry["alwaysLoad"]);
  const disabled = booleanValue(entry["disabled"]);
  const oauthKeys = objectKeys(entry["oauth"]);
  const oauthPresent = entry["oauth"] !== undefined;
  const headersHelperPresent = entry["headersHelper"] !== undefined;
  const rootsCount = countCollection(entry["roots"]);
  const allowedTools = stringArrayValue(entry["allowedTools"]);
  const deniedTools = stringArrayValue(entry["deniedTools"]);
  const permissionHints = [
    allowedTools.length === 0 ? undefined : `allowedTools:${allowedTools.length}`,
    deniedTools.length === 0 ? undefined : `deniedTools:${deniedTools.length}`
  ].filter((value): value is string => value !== undefined);

  if (unknownFields.length > 0) {
    notes.push({
      level: "info",
      code: "unknown_server_fields",
      message: `Unknown server fields were ignored by value and listed by key only: ${unknownFields.join(", ")}.`
    });
  }

  if (transportInfo.inferred) {
    notes.push({
      level: "info",
      code: "inferred_stdio_transport",
      message: "Transport type was omitted and command is present, so MCP Scope inferred stdio."
    });
  }

  if (transportInfo.aliasRawType !== undefined) {
    notes.push({
      level: "info",
      code: "transport_alias_normalized",
      message: `Transport type "${transportInfo.aliasRawType}" was displayed as http for static review.`
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

  if (timeoutPresent) {
    notes.push({
      level: "info",
      code: "timeout_configured",
      message: "Timeout metadata is configured. MCP Scope records presence only."
    });
  }

  if (alwaysLoad === true) {
    notes.push({
      level: "low",
      code: "always_load_enabled",
      message: "alwaysLoad is enabled. Review whether this server should load automatically."
    });
  }

  if (disabled === true) {
    notes.push({
      level: "info",
      code: "server_disabled",
      message: "disabled is true. MCP Scope reports the entry but does not assume it is active."
    });
  }

  if (oauthPresent) {
    notes.push({
      level: "info",
      code: "oauth_metadata_present",
      message: "OAuth metadata is present. Secret-like values are not rendered."
    });
  }

  if (headersHelperPresent) {
    notes.push({
      level: "medium",
      code: "headers_helper_present",
      message: "headersHelper is configured. MCP Scope did not execute it; review it as command-like behavior."
    });
  }

  if (rootsCount > 0) {
    notes.push({
      level: "low",
      code: "roots_metadata_present",
      message: `roots metadata is present with ${rootsCount} item(s). Values are not expanded or executed.`
    });
  }

  if (allowedTools.length > 0) {
    notes.push({
      level: "info",
      code: "allowed_tools_present",
      message: `allowedTools lists ${allowedTools.length} permission hint(s).`
    });
  }

  if (deniedTools.length > 0) {
    notes.push({
      level: "info",
      code: "denied_tools_present",
      message: `deniedTools lists ${deniedTools.length} permission hint(s).`
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
    capabilityHints: inferCapabilityHints(name, command, args, url, envKeys, headerKeys, {
      oauthKeys,
      headersHelperPresent,
      rootsCount,
      allowedTools,
      deniedTools
    }),
    transparencyNotes: notes,
    riskLevel,
    ...sourceContext,
    unknownFieldCount: unknownFields.length,
    unknownFields,
    timeoutPresent,
    alwaysLoad,
    disabled,
    oauthPresent,
    oauthKeys,
    headersHelperPresent,
    rootsCount,
    allowedToolsCount: allowedTools.length,
    deniedToolsCount: deniedTools.length,
    permissionHints
  };
}

function normalizeTransport(type: unknown, command?: string): {
  readonly transport: McpTransportType;
  readonly rawTransport?: string;
  readonly aliasRawType?: string;
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

  if (normalized === "streamable-http") {
    return {
      transport: "http",
      rawTransport,
      aliasRawType: rawTransport,
      inferred: false
    };
  }

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
  headerKeys: readonly string[],
  metadata: {
    readonly oauthKeys: readonly string[];
    readonly headersHelperPresent: boolean;
    readonly rootsCount: number;
    readonly allowedTools: readonly string[];
    readonly deniedTools: readonly string[];
  }
): McpCapabilityCategory[] {
  const haystack = [
    name,
    command,
    url,
    ...args,
    ...envKeys,
    ...headerKeys,
    ...metadata.oauthKeys,
    ...metadata.allowedTools,
    ...metadata.deniedTools,
    metadata.headersHelperPresent ? "headersHelper auth credentials" : undefined,
    metadata.rootsCount > 0 ? "roots filesystem" : undefined
  ]
    .filter((value): value is string => value !== undefined)
    .join(" ")
    .toLowerCase();
  const hints = new Set<McpCapabilityCategory>();

  if (/(file|filesystem|fs|path|directory|folder|read|write|\.env|\.ssh|\/etc|appdata|roots)/.test(haystack)) {
    hints.add("filesystem");
  }

  if (/(shell|bash|zsh|powershell|cmd|terminal|exec|spawn|process|npx|node|python|curl|wget|headershelper)/.test(haystack)) {
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

  if (url !== undefined || /(http|sse|ws|network|api|endpoint|url|host|webhook)/.test(haystack)) {
    hints.add("network");
  }

  if (/(token|key|secret|password|authorization|credential|auth|oauth)/.test(haystack)) {
    hints.add("credentials");
  }

  if (hints.size === 0) {
    hints.add("unknown");
  }

  return [...hints].sort();
}

function detectClientProfile(
  input: Record<string, unknown>,
  sourcePath: string | undefined,
  sourceShape: McpConfigShape
): McpClientProfile {
  const fileName = sourcePath === undefined ? "" : basename(sourcePath).toLowerCase();
  const client = stringValue(input["client"])?.toLowerCase();
  const name = stringValue(input["name"])?.toLowerCase();
  const probe = [fileName, client, name].filter(Boolean).join(" ");

  if (/claude.*desktop|claude_desktop/.test(probe)) {
    return "claude-desktop";
  }

  if (/\.claude\.json$|claude-code-user|claude-user/.test(probe) || sourceShape === "projects-mcpServers") {
    return "claude-code-user";
  }

  if (/cursor/.test(probe)) {
    return "cursor-like";
  }

  if (/cline/.test(probe)) {
    return "cline-like";
  }

  if (/continue/.test(probe)) {
    return "continue-like";
  }

  if (/gemini/.test(probe)) {
    return "gemini-cli-like";
  }

  if (/plugin/.test(probe)) {
    return "plugin-like";
  }

  if (/\.mcp\.json$|mcp\.json$/.test(fileName)) {
    return "claude-code-project";
  }

  if (sourceShape === "mcp.servers" || sourceShape === "top-level-servers") {
    return "generic";
  }

  if (sourceShape === "top-level-mcpServers") {
    return "generic";
  }

  return "unknown";
}

function detectSourceShape(shapes: readonly McpConfigShape[]): McpConfigShape {
  const unique = [...new Set(shapes)];

  if (unique.length === 0) {
    return "unsupported";
  }

  if (unique.length === 1) {
    return unique[0] ?? "unsupported";
  }

  return "multiple";
}

function detectRecognizedShape(input: Record<string, unknown>): McpConfigShape {
  if (isPlainObject(input["mcpServers"])) {
    return "top-level-mcpServers";
  }

  if (isPlainObject(input["projects"])) {
    for (const value of Object.values(input["projects"])) {
      if (isPlainObject(value) && isPlainObject(value["mcpServers"])) {
        return "projects-mcpServers";
      }
    }
  }

  if (isPlainObject(input["mcp"]) && isPlainObject(input["mcp"]["servers"])) {
    return "mcp.servers";
  }

  if (isPlainObject(input["servers"])) {
    return "top-level-servers";
  }

  return "unsupported";
}

function aggregateMcpServers(entries: readonly McpConfigServerDefinition[]): Record<string, unknown> {
  const aggregate: Record<string, unknown> = {};

  for (const entry of entries) {
    const key = aggregate[entry.name] === undefined
      ? entry.name
      : `${entry.sourceContext.serverKeyPath}:${entry.name}`;
    aggregate[key] = entry.entry;
  }

  return aggregate;
}

function uniqueContexts(contexts: readonly McpConfigSourceContext[]): readonly McpConfigSourceContext[] {
  const seen = new Set<string>();
  const unique: McpConfigSourceContext[] = [];

  for (const context of contexts) {
    const key = `${context.sourceShape}:${context.sourceContextLabel}:${context.serverKeyPath}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    unique.push(context);
  }

  return unique;
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
  return /(token|key|secret|password|authorization|clientsecret|api[_-]?key)/i.test(key);
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function booleanValue(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
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

function countCollection(value: unknown): number {
  if (Array.isArray(value)) {
    return value.length;
  }

  if (isPlainObject(value)) {
    return Object.keys(value).length;
  }

  return value === undefined ? 0 : 1;
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

function jsonPointerToken(value: string): string {
  return value.replaceAll("~", "~0").replaceAll("/", "~1");
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

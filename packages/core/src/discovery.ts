import { homedir } from "node:os";
import { relative, resolve, sep } from "node:path";
import { opendir, readFile, stat } from "node:fs/promises";

import type {
  McpClientProfile,
  McpConfigShape,
  RiskLevel
} from "./index.js";
import {
  McpScopeConfigError,
  createMcpConfigFingerprint,
  parseMcpConfig,
  safePathDisplay
} from "./scan.js";

export type McpConfigCandidateParseStatus = "parsed" | "unsupported" | "invalid-json" | "skipped";

export type McpConfigCandidate = {
  readonly path: string;
  readonly pathDisplay: string;
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly detectedShape: McpConfigShape;
  readonly clientProfile: McpClientProfile;
  readonly serverCount: number;
  readonly hasToolsPath: false;
  readonly parseStatus: McpConfigCandidateParseStatus;
  readonly riskPreview: Exclude<RiskLevel, "unknown">;
  readonly notes: readonly string[];
};

export type McpConfigDiscoveryOptions = {
  readonly root: string;
  readonly maxDepth?: number;
  readonly includeHome?: boolean;
  readonly maxFileSizeBytes?: number;
  readonly generatedAt?: string;
};

export type McpConfigDiscoveryResult = {
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly rootPathDisplay: string;
  readonly maxDepth: number;
  readonly includeHome: boolean;
  readonly maxFileSizeBytes: number;
  readonly externalApiCalls: false;
  readonly serverExecution: false;
  readonly toolsListRequestSent: false;
  readonly summary: {
    readonly candidateCount: number;
    readonly parsedCount: number;
    readonly skippedCount: number;
    readonly invalidJsonCount: number;
    readonly unsupportedCount: number;
  };
  readonly candidates: readonly McpConfigCandidate[];
  readonly notes: readonly string[];
};

const DEFAULT_MAX_DEPTH = 4;
const DEFAULT_MAX_FILE_SIZE_BYTES = 1024 * 1024;
const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  "dist",
  "build",
  "coverage",
  "reports",
  ".next",
  ".turbo",
  "vendor",
  "target",
  ".venv",
  "__pycache__"
]);

export async function discoverMcpConfigs(options: McpConfigDiscoveryOptions): Promise<McpConfigDiscoveryResult> {
  const root = resolve(options.root);
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const includeHome = options.includeHome ?? false;
  const maxFileSizeBytes = options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  const notes: string[] = [
    "Static discovery only. MCP Scope did not execute MCP servers or call external APIs.",
    "Discovery reports candidate files only; scan a selected path explicitly."
  ];

  if (!includeHome && root === homedir()) {
    return discoveryResult({
      generatedAt: options.generatedAt,
      rootPathDisplay: safePathDisplay(root),
      maxDepth,
      includeHome,
      maxFileSizeBytes,
      candidates: [],
      notes: [
        ...notes,
        "Home directory discovery is disabled by default. Re-run with --include-home to scan the home directory root."
      ]
    });
  }

  const candidates: McpConfigCandidate[] = [];
  await walk(root, root, 0, maxDepth, maxFileSizeBytes, candidates);

  return discoveryResult({
    generatedAt: options.generatedAt,
    rootPathDisplay: safePathDisplay(root),
    maxDepth,
    includeHome,
    maxFileSizeBytes,
    candidates,
    notes
  });
}

async function walk(
  root: string,
  dir: string,
  depth: number,
  maxDepth: number,
  maxFileSizeBytes: number,
  candidates: McpConfigCandidate[]
): Promise<void> {
  if (depth > maxDepth) {
    return;
  }

  let directory;

  try {
    directory = await opendir(dir);
  } catch {
    return;
  }

  for await (const entry of directory) {
    if (entry.isSymbolicLink()) {
      continue;
    }

    const fullPath = `${dir}${sep}${entry.name}`;

    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(entry.name) || depth >= maxDepth) {
        continue;
      }

      await walk(root, fullPath, depth + 1, maxDepth, maxFileSizeBytes, candidates);
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const pathDisplay = displayPath(root, fullPath);

    if (!isCandidateFile(entry.name, dir, root)) {
      continue;
    }

    let sizeBytes = 0;

    try {
      sizeBytes = (await stat(fullPath)).size;
    } catch {
      candidates.push(candidate({
        pathDisplay,
        fileName: entry.name,
        sizeBytes: 0,
        parseStatus: "skipped",
        notes: ["Unable to stat file."]
      }));
      continue;
    }

    if (sizeBytes > maxFileSizeBytes) {
      candidates.push(candidate({
        pathDisplay,
        fileName: entry.name,
        sizeBytes,
        parseStatus: "skipped",
        notes: [`File is larger than ${maxFileSizeBytes} bytes and was skipped.`]
      }));
      continue;
    }

    candidates.push(await inspectCandidate(fullPath, pathDisplay, entry.name, sizeBytes));
  }
}

async function inspectCandidate(
  fullPath: string,
  pathDisplay: string,
  fileName: string,
  sizeBytes: number
): Promise<McpConfigCandidate> {
  let text: string;

  try {
    text = await readFile(fullPath, "utf8");
  } catch {
    return candidate({
      pathDisplay,
      fileName,
      sizeBytes,
      parseStatus: "skipped",
      notes: ["Unable to read file."]
    });
  }

  let parsedJson: unknown;

  try {
    parsedJson = JSON.parse(text);
  } catch {
    return candidate({
      pathDisplay,
      fileName,
      sizeBytes,
      parseStatus: "invalid-json",
      notes: ["Candidate matched filename patterns but is not valid JSON."]
    });
  }

  try {
    const parsedConfig = parseMcpConfig(parsedJson, pathDisplay);
    const scan = createMcpConfigFingerprint(parsedConfig);

    return {
      path: pathDisplay,
      pathDisplay,
      fileName,
      sizeBytes,
      detectedShape: parsedConfig.sourceShape,
      clientProfile: parsedConfig.clientProfile,
      serverCount: scan.serverCount,
      hasToolsPath: false,
      parseStatus: "parsed",
      riskPreview: scan.highestRiskLevel,
      notes: scan.transparencyNotes.map((note) => `${note.level}:${note.code}`)
    };
  } catch (error) {
    if (error instanceof McpScopeConfigError && error.code === "INVALID_CONFIG") {
      return candidate({
        pathDisplay,
        fileName,
        sizeBytes,
        parseStatus: "unsupported",
        notes: ["JSON parsed, but no supported MCP config shape was found."]
      });
    }

    return candidate({
      pathDisplay,
      fileName,
      sizeBytes,
      parseStatus: "skipped",
      notes: ["Candidate could not be inspected safely."]
    });
  }
}

function discoveryResult(input: {
  readonly generatedAt?: string;
  readonly rootPathDisplay: string;
  readonly maxDepth: number;
  readonly includeHome: boolean;
  readonly maxFileSizeBytes: number;
  readonly candidates: readonly McpConfigCandidate[];
  readonly notes: readonly string[];
}): McpConfigDiscoveryResult {
  return {
    schemaVersion: 1,
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    rootPathDisplay: input.rootPathDisplay,
    maxDepth: input.maxDepth,
    includeHome: input.includeHome,
    maxFileSizeBytes: input.maxFileSizeBytes,
    externalApiCalls: false,
    serverExecution: false,
    toolsListRequestSent: false,
    summary: {
      candidateCount: input.candidates.length,
      parsedCount: input.candidates.filter((item) => item.parseStatus === "parsed").length,
      skippedCount: input.candidates.filter((item) => item.parseStatus === "skipped").length,
      invalidJsonCount: input.candidates.filter((item) => item.parseStatus === "invalid-json").length,
      unsupportedCount: input.candidates.filter((item) => item.parseStatus === "unsupported").length
    },
    candidates: [...input.candidates].sort((a, b) => a.pathDisplay.localeCompare(b.pathDisplay)),
    notes: input.notes
  };
}

function candidate(input: {
  readonly pathDisplay: string;
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly parseStatus: McpConfigCandidateParseStatus;
  readonly notes: readonly string[];
}): McpConfigCandidate {
  return {
    path: input.pathDisplay,
    pathDisplay: input.pathDisplay,
    fileName: input.fileName,
    sizeBytes: input.sizeBytes,
    detectedShape: "unsupported",
    clientProfile: "unknown",
    serverCount: 0,
    hasToolsPath: false,
    parseStatus: input.parseStatus,
    riskPreview: "info",
    notes: input.notes
  };
}

function isCandidateFile(fileName: string, dir: string, root: string): boolean {
  const lower = fileName.toLowerCase();
  const dirProbe = `${relative(root, dir).toLowerCase()} ${dir.toLowerCase()}`;

  if (lower === ".mcp.json" || lower === "mcp.json" || lower.endsWith(".mcp.json")) {
    return true;
  }

  if (lower.endsWith(".mcp-settings.json")) {
    return true;
  }

  if (lower === "claude_desktop_config.json" || lower === "claude-desktop-config.json" || lower === ".claude.json" || lower.endsWith(".claude.json")) {
    return true;
  }

  if (lower.includes("mcp") && lower.endsWith(".json")) {
    return true;
  }

  if (lower.endsWith(".plugin.json")) {
    return true;
  }

  if ((lower === "settings.json" || lower.endsWith(".settings.json")) && /(client|clients|cursor|cline|continue|gemini|claude|example|examples)/.test(dirProbe)) {
    return true;
  }

  return false;
}

function displayPath(root: string, fullPath: string): string {
  const relativePath = relative(process.cwd(), fullPath);

  if (!relativePath.startsWith("..") && !relativePath.startsWith("/")) {
    return relativePath;
  }

  const fromRoot = relative(root, fullPath);

  if (!fromRoot.startsWith("..") && !fromRoot.startsWith("/")) {
    return fromRoot;
  }

  return safePathDisplay(fullPath);
}

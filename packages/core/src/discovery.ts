import { homedir } from "node:os";
import { relative, resolve, sep } from "node:path";
import { opendir, readFile, stat } from "node:fs/promises";

import type {
  McpClientProfile,
  McpConfigShape,
  McpScopeScanResult,
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

export type McpConfigCandidateRecord = McpConfigCandidate & {
  readonly fullPath: string;
};

export type McpScopeAuditSkippedCandidate = {
  readonly pathDisplay: string;
  readonly parseStatus: McpConfigCandidateParseStatus;
  readonly reason: string;
};

export type McpScopeAuditResult = {
  readonly auditVersion: "0.1.0";
  readonly schemaVersion: 1;
  readonly generatedAt: string;
  readonly rootPathDisplay: string;
  readonly maxDepth: number;
  readonly includeHome: boolean;
  readonly maxFileSizeBytes: number;
  readonly staticOnly: true;
  readonly externalApiCalls: false;
  readonly mcpServerExecution: false;
  readonly toolsListRequestSent: false;
  readonly secretValuesRedacted: true;
  readonly discovery: McpConfigDiscoveryResult;
  readonly summary: {
    readonly candidateCount: number;
    readonly parsedConfigCount: number;
    readonly skippedCount: number;
    readonly serverCount: number;
    readonly findingCount: number;
    readonly highestSeverity: Exclude<RiskLevel, "unknown">;
  };
  readonly scannedConfigs: readonly McpScopeScanResult[];
  readonly skippedCandidates: readonly McpScopeAuditSkippedCandidate[];
  readonly nextSteps: readonly string[];
  readonly limitations: {
    readonly staticOnly: true;
    readonly noRuntimeVerification: true;
    readonly noToolMetadataInference: true;
    readonly notProofOfCompromise: true;
    readonly notes: readonly string[];
  };
};

const DEFAULT_MAX_DEPTH = 4;
const DEFAULT_MAX_FILE_SIZE_BYTES = 1024 * 1024;
const RISK_ORDER: Record<Exclude<RiskLevel, "unknown">, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};
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
  const collected = await collectDiscoveryRecords(options);

  return discoveryResult({
    generatedAt: collected.generatedAt,
    rootPathDisplay: collected.rootPathDisplay,
    maxDepth: collected.maxDepth,
    includeHome: collected.includeHome,
    maxFileSizeBytes: collected.maxFileSizeBytes,
    candidates: collected.candidates.map(publicCandidate),
    notes: collected.notes
  });
}

export async function auditMcpConfigs(options: McpConfigDiscoveryOptions): Promise<McpScopeAuditResult> {
  const collected = await collectDiscoveryRecords(options);
  const discovery = discoveryResult({
    generatedAt: collected.generatedAt,
    rootPathDisplay: collected.rootPathDisplay,
    maxDepth: collected.maxDepth,
    includeHome: collected.includeHome,
    maxFileSizeBytes: collected.maxFileSizeBytes,
    candidates: collected.candidates.map(publicCandidate),
    notes: collected.notes
  });
  const scannedConfigs: McpScopeScanResult[] = [];
  const skippedCandidates: McpScopeAuditSkippedCandidate[] = discovery.candidates
    .filter((candidate) => candidate.parseStatus !== "parsed")
    .map((candidate) => ({
      pathDisplay: candidate.pathDisplay,
      parseStatus: candidate.parseStatus,
      reason: candidate.notes.join("; ") || "Candidate was not parsed."
    }));

  for (const candidate of collected.candidates) {
    if (candidate.parseStatus !== "parsed") {
      continue;
    }

    try {
      const fileText = await readFile(candidate.fullPath, "utf8");
      const parsedJson = JSON.parse(fileText) as unknown;
      const parsedConfig = parseMcpConfig(parsedJson, candidate.pathDisplay);
      scannedConfigs.push(createMcpConfigFingerprint(parsedConfig, { generatedAt: collected.generatedAt }));
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error);
      skippedCandidates.push({
        pathDisplay: candidate.pathDisplay,
        parseStatus: "skipped",
        reason: `Parsed discovery candidate could not be scanned safely: ${detail}`
      });
    }
  }

  const findingCount = scannedConfigs.reduce((sum, scan) => sum + countTransparencyNotes(scan), 0);
  const highestSeverity = highestRisk(scannedConfigs.map((scan) => scan.highestRiskLevel));

  return {
    auditVersion: "0.1.0",
    schemaVersion: 1,
    generatedAt: collected.generatedAt,
    rootPathDisplay: collected.rootPathDisplay,
    maxDepth: collected.maxDepth,
    includeHome: collected.includeHome,
    maxFileSizeBytes: collected.maxFileSizeBytes,
    staticOnly: true,
    externalApiCalls: false,
    mcpServerExecution: false,
    toolsListRequestSent: false,
    secretValuesRedacted: true,
    discovery,
    summary: {
      candidateCount: discovery.summary.candidateCount,
      parsedConfigCount: scannedConfigs.length,
      skippedCount: skippedCandidates.length,
      serverCount: scannedConfigs.reduce((sum, scan) => sum + scan.serverCount, 0),
      findingCount,
      highestSeverity
    },
    scannedConfigs,
    skippedCandidates,
    nextSteps: [
      "Review parsed config summaries, then run mcp-scope scan --config <path> --tools <tools.json> when local exported tool metadata is available.",
      "Generate SARIF with mcp-scope audit --root <path> --format sarif --output reports/mcp-scope.sarif.",
      "Use GitHub Actions upload-sarif only when you explicitly want GitHub Code Scanning ingestion."
    ],
    limitations: {
      staticOnly: true,
      noRuntimeVerification: true,
      noToolMetadataInference: true,
      notProofOfCompromise: true,
      notes: [
        "Audit mode combines static discovery with static config scans only.",
        "MCP Scope did not execute MCP servers.",
        "MCP Scope did not call live tools/list.",
        "Audit mode does not infer tool metadata; provide exported tool metadata manually with scan --tools.",
        "Findings are static risk signals, not proof of compromise or proof of safety."
      ]
    }
  };
}

async function collectDiscoveryRecords(options: McpConfigDiscoveryOptions): Promise<{
  readonly generatedAt: string;
  readonly rootPathDisplay: string;
  readonly maxDepth: number;
  readonly includeHome: boolean;
  readonly maxFileSizeBytes: number;
  readonly candidates: readonly McpConfigCandidateRecord[];
  readonly notes: readonly string[];
}> {
  const root = resolve(options.root);
  const maxDepth = options.maxDepth ?? DEFAULT_MAX_DEPTH;
  const includeHome = options.includeHome ?? false;
  const maxFileSizeBytes = options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const notes: string[] = [
    "Static discovery only. MCP Scope did not execute MCP servers or call external APIs.",
    "Discovery reports candidate files only; scan a selected path explicitly."
  ];

  if (!includeHome && root === homedir()) {
    return {
      generatedAt,
      rootPathDisplay: safePathDisplay(root),
      maxDepth,
      includeHome,
      maxFileSizeBytes,
      candidates: [],
      notes: [
        ...notes,
        "Home directory discovery is disabled by default. Re-run with --include-home to scan the home directory root."
      ]
    };
  }

  const candidates: McpConfigCandidateRecord[] = [];
  await walk(root, root, 0, maxDepth, maxFileSizeBytes, candidates);

  return {
    generatedAt,
    rootPathDisplay: safePathDisplay(root),
    maxDepth,
    includeHome,
    maxFileSizeBytes,
    candidates,
    notes
  };
}

async function walk(
  root: string,
  dir: string,
  depth: number,
  maxDepth: number,
  maxFileSizeBytes: number,
  candidates: McpConfigCandidateRecord[]
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
        fullPath,
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
        fullPath,
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
): Promise<McpConfigCandidateRecord> {
  let text: string;

  try {
    text = await readFile(fullPath, "utf8");
  } catch {
    return candidate({
      fullPath,
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
      fullPath,
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
      fullPath,
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
        fullPath,
        pathDisplay,
        fileName,
        sizeBytes,
        parseStatus: "unsupported",
        notes: ["JSON parsed, but no supported MCP config shape was found."]
      });
    }

    return candidate({
      fullPath,
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
  readonly fullPath: string;
  readonly pathDisplay: string;
  readonly fileName: string;
  readonly sizeBytes: number;
  readonly parseStatus: McpConfigCandidateParseStatus;
  readonly notes: readonly string[];
}): McpConfigCandidateRecord {
  return {
    fullPath: input.fullPath,
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

function publicCandidate(candidate: McpConfigCandidateRecord): McpConfigCandidate {
  const { fullPath: _fullPath, ...safeCandidate } = candidate;
  return safeCandidate;
}

function countTransparencyNotes(scan: McpScopeScanResult): number {
  return scan.transparencyNotes.length + scan.servers.reduce((sum, server) => sum + server.transparencyNotes.length, 0);
}

function highestRisk(levels: readonly Exclude<RiskLevel, "unknown">[]): Exclude<RiskLevel, "unknown"> {
  if (levels.length === 0) {
    return "info";
  }

  return levels.reduce((highest, level) => (RISK_ORDER[level] > RISK_ORDER[highest] ? level : highest), "info");
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

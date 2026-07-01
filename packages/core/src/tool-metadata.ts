import { readFile } from "node:fs/promises";

import type { McpCapabilityCategory, RiskLevel } from "./index.js";

export type McpToolMetadataSource = "jsonrpc-tools-list" | "mcp-scope-tool-manifest";

export type ToolRiskCategory =
  | "metadata-injection"
  | "schema-quality"
  | "permission-transparency"
  | "data-exposure"
  | "credential-exposure"
  | "destructive-action"
  | "network-access"
  | "filesystem-access"
  | "cross-tool-risk"
  | "annotation-trust"
  | "unknown";

export type ToolRiskRuleId =
  | "metadata_injection_phrase"
  | "cross_tool_manipulation_phrase"
  | "destructive_action_unmarked"
  | "filesystem_access_signal"
  | "sensitive_filesystem_path"
  | "credential_exposure_signal"
  | "network_access_signal"
  | "missing_tool_description"
  | "missing_input_schema"
  | "non_object_input_schema"
  | "schema_property_missing_description"
  | "required_fields_absent_for_action"
  | "vague_tool_description"
  | "long_tool_description"
  | "annotation_trust_note"
  | "permission_mismatch_readonly_vs_action"
  | "multi_tool_suspicious_fragments";

export type NormalizedToolParameter = {
  readonly name: string;
  readonly type?: string;
  readonly description: string;
  readonly required: boolean;
};

export type McpToolDefinition = {
  readonly name: string;
  readonly title?: string;
  readonly description?: string;
  readonly inputSchema?: unknown;
  readonly outputSchema?: unknown;
  readonly annotations?: Record<string, unknown>;
  readonly unknownFields: readonly string[];
};

export type McpToolManifest = {
  readonly sourcePath?: string;
  readonly sourceType: McpToolMetadataSource;
  readonly serverName?: string;
  readonly tools: readonly McpToolDefinition[];
  readonly unknownTopLevelKeys: readonly string[];
};

export type NormalizedMcpTool = {
  readonly name: string;
  readonly title?: string;
  readonly description: string;
  readonly inputSchema?: unknown;
  readonly outputSchema?: unknown;
  readonly annotations?: Record<string, unknown>;
  readonly inputParameters: readonly NormalizedToolParameter[];
  readonly unknownFields: readonly string[];
  readonly normalizationFindings: readonly ToolRiskFinding[];
};

export type ToolRiskFinding = {
  readonly ruleId: ToolRiskRuleId;
  readonly category: ToolRiskCategory;
  readonly severity: Exclude<RiskLevel, "unknown">;
  readonly title: string;
  readonly message: string;
  readonly evidence: string;
  readonly recommendation: string;
  readonly target: {
    readonly type: "tool" | "manifest";
    readonly toolName?: string;
    readonly path?: string;
  };
};

export type ToolRiskRule = {
  readonly id: ToolRiskRuleId;
  readonly category: ToolRiskCategory;
  readonly evaluate: (tool: NormalizedMcpTool) => readonly ToolRiskFinding[];
};

export type ToolMetadataToolResult = NormalizedMcpTool & {
  readonly capabilityHints: readonly McpCapabilityCategory[];
  readonly findingCount: number;
  readonly highestSeverity: Exclude<RiskLevel, "unknown">;
  readonly findings: readonly ToolRiskFinding[];
};

export type ToolMetadataScanResult = {
  readonly schemaVersion: 1;
  readonly sourceFile?: string;
  readonly sourceType: McpToolMetadataSource;
  readonly serverName?: string;
  readonly generatedAt: string;
  readonly toolCount: number;
  readonly findingCount: number;
  readonly highestSeverity: Exclude<RiskLevel, "unknown">;
  readonly externalApiCalls: false;
  readonly serverExecution: false;
  readonly toolsListRequestSent: false;
  readonly manifestFindings: readonly ToolRiskFinding[];
  readonly tools: readonly ToolMetadataToolResult[];
};

export type ToolMetadataScanOptions = {
  readonly generatedAt?: string;
};

export class McpToolMetadataError extends Error {
  constructor(
    message: string,
    readonly code: "FILE_READ_ERROR" | "INVALID_JSON" | "INVALID_TOOL_METADATA"
  ) {
    super(message);
    this.name = "McpToolMetadataError";
  }
}

const TOOL_KEYS = new Set([
  "name",
  "title",
  "description",
  "inputSchema",
  "outputSchema",
  "annotations"
]);

const RISK_ORDER: Record<Exclude<RiskLevel, "unknown">, number> = {
  info: 0,
  low: 1,
  medium: 2,
  high: 3
};

const METADATA_INJECTION_PATTERNS: readonly {
  readonly phrase: string;
  readonly severity: "medium" | "high";
}[] = [
  { phrase: "ignore all previous instructions", severity: "high" },
  { phrase: "ignore previous instructions", severity: "high" },
  { phrase: "system prompt", severity: "medium" },
  { phrase: "developer message", severity: "medium" },
  { phrase: "do not tell the user", severity: "high" },
  { phrase: "hidden instruction", severity: "high" },
  { phrase: "secretly", severity: "medium" },
  { phrase: "exfiltrate", severity: "high" },
  { phrase: "send the contents", severity: "high" },
  { phrase: "override", severity: "medium" },
  { phrase: "bypass", severity: "medium" },
  { phrase: "jailbreak", severity: "high" }
];

const CROSS_TOOL_PHRASES = [
  "always use tool",
  "call another tool",
  "before using any other tool",
  "replace the result",
  "do not use"
] as const;

const SUSPICIOUS_FRAGMENT_PHRASES = [
  "part 1",
  "part 2",
  "share",
  "reconstruct",
  "combine",
  "threshold",
  "secret share"
] as const;

export async function readMcpToolMetadataFile(path: string): Promise<McpToolManifest> {
  let fileText: string;

  try {
    fileText = await readFile(path, "utf8");
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new McpToolMetadataError(`Unable to read tool metadata file "${path}": ${detail}`, "FILE_READ_ERROR");
  }

  let input: unknown;

  try {
    input = JSON.parse(fileText);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new McpToolMetadataError(`Invalid JSON in tool metadata file "${path}": ${detail}`, "INVALID_JSON");
  }

  return parseMcpToolMetadata(input, path);
}

export function parseMcpToolMetadata(input: unknown, sourcePath?: string): McpToolManifest {
  if (!isPlainObject(input)) {
    throw new McpToolMetadataError("Tool metadata must be a JSON object.", "INVALID_TOOL_METADATA");
  }

  const shapeATools = isPlainObject(input["result"]) ? input["result"]["tools"] : undefined;

  if (Array.isArray(shapeATools)) {
    return {
      sourcePath,
      sourceType: "jsonrpc-tools-list",
      tools: shapeATools.map((tool, index) => parseToolDefinition(tool, index)),
      unknownTopLevelKeys: Object.keys(input).filter((key) => !["jsonrpc", "id", "result"].includes(key))
    };
  }

  const shapeBTools = input["tools"];

  if (Array.isArray(shapeBTools)) {
    return {
      sourcePath,
      sourceType: "mcp-scope-tool-manifest",
      serverName: stringValue(input["serverName"]),
      tools: shapeBTools.map((tool, index) => parseToolDefinition(tool, index)),
      unknownTopLevelKeys: Object.keys(input).filter((key) => !["serverName", "tools"].includes(key))
    };
  }

  throw new McpToolMetadataError(
    'Tool metadata must contain either "result.tools" or "tools" as an array.',
    "INVALID_TOOL_METADATA"
  );
}

export function normalizeMcpTools(manifest: McpToolManifest): NormalizedMcpTool[] {
  return manifest.tools.map((tool) => normalizeTool(tool));
}

export function evaluateToolMetadata(tool: NormalizedMcpTool): ToolRiskFinding[] {
  return [
    ...tool.normalizationFindings,
    ...TOOL_RISK_RULES.flatMap((rule) => rule.evaluate(tool))
  ];
}

export function evaluateToolManifest(
  manifest: McpToolManifest,
  options: ToolMetadataScanOptions = {}
): ToolMetadataScanResult {
  const tools = normalizeMcpTools(manifest).map((tool) => {
    const findings = evaluateToolMetadata(tool);

    return {
      ...tool,
      capabilityHints: inferToolCapabilityHints(tool),
      findingCount: findings.length,
      highestSeverity: highestRisk(findings.map((finding) => finding.severity)),
      findings
    };
  });
  const manifestFindings = evaluateManifestLevelFindings(tools);
  const allFindings = [...manifestFindings, ...tools.flatMap((tool) => tool.findings)];

  return {
    schemaVersion: 1,
    sourceFile: manifest.sourcePath,
    sourceType: manifest.sourceType,
    serverName: manifest.serverName,
    generatedAt: options.generatedAt ?? new Date().toISOString(),
    toolCount: tools.length,
    findingCount: allFindings.length,
    highestSeverity: highestRisk(allFindings.map((finding) => finding.severity)),
    externalApiCalls: false,
    serverExecution: false,
    toolsListRequestSent: false,
    manifestFindings,
    tools
  };
}

const TOOL_RISK_RULES: readonly ToolRiskRule[] = [
  {
    id: "metadata_injection_phrase",
    category: "metadata-injection",
    evaluate(tool) {
      return METADATA_INJECTION_PATTERNS.flatMap(({ phrase, severity }) =>
        containsPhrase(tool.description, phrase)
          ? [
              finding({
                ruleId: "metadata_injection_phrase",
                category: "metadata-injection",
                severity,
                title: "Potential metadata-injection signal",
                message: "Tool description contains language that may try to steer the model outside normal tool use.",
                evidence: `description contains "${phrase}"`,
                recommendation: "Review the tool description and server source before approving this tool.",
                toolName: tool.name
              })
            ]
          : []
      );
    }
  },
  {
    id: "cross_tool_manipulation_phrase",
    category: "cross-tool-risk",
    evaluate(tool) {
      return CROSS_TOOL_PHRASES.flatMap((phrase) =>
        containsPhrase(tool.description, phrase)
          ? [
              finding({
                ruleId: "cross_tool_manipulation_phrase",
                category: "cross-tool-risk",
                severity: "medium",
                title: "Cross-tool manipulation signal",
                message: "Tool description appears to redirect or constrain use of other tools.",
                evidence: `description contains "${phrase}"`,
                recommendation: "Check whether this metadata is necessary, accurate, and visible to users.",
                toolName: tool.name
              })
            ]
          : []
      );
    }
  },
  {
    id: "destructive_action_unmarked",
    category: "destructive-action",
    evaluate(tool) {
      const text = toolText(tool);
      const destructive = /(delete|remove|overwrite|write|update|execute|run command|shell|terminal|drop table|truncate)/i.test(text);

      if (!destructive || hasDestructiveAnnotation(tool)) {
        return [];
      }

      return [
        finding({
          ruleId: "destructive_action_unmarked",
          category: "destructive-action",
          severity: /(drop table|truncate|delete|execute|shell|terminal|run command)/i.test(text) ? "high" : "medium",
          title: "Destructive action transparency warning",
          message: "Tool metadata suggests write, execution, or destructive behavior without clear destructive/open-world annotation.",
          evidence: evidenceFromText(text, /(delete|remove|overwrite|write|update|execute|run command|shell|terminal|drop table|truncate)/i),
          recommendation: "Require explicit review and clear user-facing permission language before use.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "filesystem_access_signal",
    category: "filesystem-access",
    evaluate(tool) {
      const text = searchableToolText(tool);

      if (!/(file|path|directory|folder|read_file|write_file|filesystem)/i.test(text)) {
        return [];
      }

      return [
        finding({
          ruleId: "filesystem_access_signal",
          category: "filesystem-access",
          severity: "medium",
          title: "Filesystem access signal",
          message: "Tool metadata references files, paths, directories, or filesystem operations.",
          evidence: evidenceFromText(text, /(read_file|write_file|filesystem|file|path|directory|folder)/i),
          recommendation: "Review allowed paths and confirm values are visible before approval.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "sensitive_filesystem_path",
    category: "filesystem-access",
    evaluate(tool) {
      const text = searchableToolText(tool);

      if (!/(\/etc|~\/\.ssh|\.ssh|\.env)/i.test(text)) {
        return [];
      }

      return [
        finding({
          ruleId: "sensitive_filesystem_path",
          category: "filesystem-access",
          severity: "high",
          title: "Sensitive filesystem path signal",
          message: "Tool metadata references sensitive-looking local paths.",
          evidence: evidenceFromText(text, /(\/etc|~\/\.ssh|\.ssh|\.env)/i),
          recommendation: "Avoid approving broad or sensitive path access without a clear need and review boundary.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "credential_exposure_signal",
    category: "credential-exposure",
    evaluate(tool) {
      const text = searchableToolText(tool);

      if (!/(token|apikey|api_key|secret|password|authorization|bearer|credential)/i.test(text)) {
        return [];
      }

      return [
        finding({
          ruleId: "credential_exposure_signal",
          category: "credential-exposure",
          severity: "medium",
          title: "Credential-related metadata signal",
          message: "Tool metadata references credential-like names or fields. Values are not included in evidence.",
          evidence: evidenceFromText(text, /(token|apikey|api_key|secret|password|authorization|bearer|credential)/i),
          recommendation: "Confirm the tool does not expose credential values and that users understand credential scope.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "network_access_signal",
    category: "network-access",
    evaluate(tool) {
      const text = searchableToolText(tool);

      if (!/(url|webhook|fetch|http|request|endpoint|post|upload)/i.test(text)) {
        return [];
      }

      return [
        finding({
          ruleId: "network_access_signal",
          category: "network-access",
          severity: /(webhook|post|upload)/i.test(text) ? "medium" : "low",
          title: "Network access signal",
          message: "Tool metadata references URLs, requests, endpoints, uploads, or webhooks.",
          evidence: evidenceFromText(text, /(url|webhook|fetch|http|request|endpoint|post|upload)/i),
          recommendation: "Review destination visibility and whether network access is expected.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "non_object_input_schema",
    category: "schema-quality",
    evaluate(tool) {
      if (tool.inputSchema === undefined || schemaType(tool.inputSchema) === "object") {
        return [];
      }

      return [
        finding({
          ruleId: "non_object_input_schema",
          category: "schema-quality",
          severity: "low",
          title: "Input schema is not an object schema",
          message: "MCP Scope expected an object-style input schema for transparent parameter review.",
          evidence: `inputSchema.type is "${schemaType(tool.inputSchema) ?? "unknown"}"`,
          recommendation: "Prefer explicit object schemas with described properties.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "schema_property_missing_description",
    category: "schema-quality",
    evaluate(tool) {
      return tool.inputParameters.flatMap((parameter) =>
        parameter.description === ""
          ? [
              finding({
                ruleId: "schema_property_missing_description",
                category: "schema-quality",
                severity: "low",
                title: "Parameter description missing",
                message: "A tool parameter is missing a description, reducing user transparency.",
                evidence: `parameter "${parameter.name}" has no description`,
                recommendation: "Add a concise parameter description.",
                toolName: tool.name
              })
            ]
          : []
      );
    }
  },
  {
    id: "required_fields_absent_for_action",
    category: "schema-quality",
    evaluate(tool) {
      if (!isActionOriented(tool) || requiredFieldCount(tool.inputSchema) > 0) {
        return [];
      }

      return [
        finding({
          ruleId: "required_fields_absent_for_action",
          category: "schema-quality",
          severity: "medium",
          title: "Action-oriented tool has no required fields",
          message: "The tool appears action-oriented but does not mark any input fields as required.",
          evidence: "inputSchema.required is empty or absent",
          recommendation: "Check whether required parameters should be explicit.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "vague_tool_description",
    category: "schema-quality",
    evaluate(tool) {
      if (tool.description.length >= 12) {
        return [];
      }

      return [
        finding({
          ruleId: "vague_tool_description",
          category: "schema-quality",
          severity: "low",
          title: "Tool description is vague",
          message: "The tool description is very short, which weakens user transparency.",
          evidence: `description length is ${tool.description.length}`,
          recommendation: "Add a clear description of what the tool reads, changes, or sends.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "long_tool_description",
    category: "schema-quality",
    evaluate(tool) {
      if (tool.description.length <= 1200) {
        return [];
      }

      return [
        finding({
          ruleId: "long_tool_description",
          category: "schema-quality",
          severity: "low",
          title: "Tool description is unusually long",
          message: "Very long descriptions can hide important instructions or warnings.",
          evidence: `description length is ${tool.description.length}`,
          recommendation: "Review long metadata manually and prefer concise descriptions.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "annotation_trust_note",
    category: "annotation-trust",
    evaluate(tool) {
      const keys = Object.keys(tool.annotations ?? {}).filter((key) =>
        /readOnlyHint|destructiveHint|openWorldHint|idempotentHint/i.test(key)
      );

      if (keys.length === 0) {
        return [];
      }

      return [
        finding({
          ruleId: "annotation_trust_note",
          category: "annotation-trust",
          severity: "info",
          title: "Tool annotations are untrusted metadata",
          message: "Annotations can help review, but they are metadata claims until server trust is established.",
          evidence: `annotations include ${keys.join(", ")}`,
          recommendation: "Treat annotations as review hints, not proof of behavior.",
          toolName: tool.name
        })
      ];
    }
  },
  {
    id: "permission_mismatch_readonly_vs_action",
    category: "permission-transparency",
    evaluate(tool) {
      if (!/(read-only|read only|only reads|read data only)/i.test(tool.description) || !isActionOriented(tool)) {
        return [];
      }

      return [
        finding({
          ruleId: "permission_mismatch_readonly_vs_action",
          category: "permission-transparency",
          severity: "medium",
          title: "Read-only wording conflicts with action signals",
          message: "Description suggests read-only behavior, while name or parameters suggest write, delete, update, or execution.",
          evidence: "description says read-only and metadata includes action terms",
          recommendation: "Review whether the description accurately reflects tool behavior.",
          toolName: tool.name
        })
      ];
    }
  }
];

function parseToolDefinition(input: unknown, index: number): McpToolDefinition {
  if (!isPlainObject(input)) {
    return {
      name: `unnamed-tool-${index + 1}`,
      unknownFields: []
    };
  }

  return {
    name: stringValue(input["name"]) ?? `unnamed-tool-${index + 1}`,
    title: stringValue(input["title"]),
    description: stringValue(input["description"]),
    inputSchema: sanitizeUnknown(input["inputSchema"]),
    outputSchema: sanitizeUnknown(input["outputSchema"]),
    annotations: isPlainObject(input["annotations"]) ? sanitizeRecord(input["annotations"]) : undefined,
    unknownFields: Object.keys(input).filter((key) => !TOOL_KEYS.has(key))
  };
}

function normalizeTool(tool: McpToolDefinition): NormalizedMcpTool {
  const normalizationFindings: ToolRiskFinding[] = [];
  const description = tool.description ?? "";

  if (tool.description === undefined) {
    normalizationFindings.push(
      finding({
        ruleId: "missing_tool_description",
        category: "schema-quality",
        severity: "low",
        title: "Tool description missing",
        message: "Tool metadata does not include a description.",
        evidence: "description is absent",
        recommendation: "Add a concise tool description before relying on this metadata.",
        toolName: tool.name
      })
    );
  }

  if (tool.inputSchema === undefined) {
    normalizationFindings.push(
      finding({
        ruleId: "missing_input_schema",
        category: "schema-quality",
        severity: "medium",
        title: "Input schema missing",
        message: "Tool metadata does not include inputSchema, so parameter visibility is limited.",
        evidence: "inputSchema is absent",
        recommendation: "Expose an inputSchema with named and described parameters.",
        toolName: tool.name
      })
    );
  }

  return {
    name: tool.name,
    title: tool.title,
    description,
    inputSchema: tool.inputSchema,
    outputSchema: tool.outputSchema,
    annotations: tool.annotations,
    inputParameters: extractInputParameters(tool.inputSchema),
    unknownFields: tool.unknownFields,
    normalizationFindings
  };
}

function evaluateManifestLevelFindings(tools: readonly NormalizedMcpTool[]): ToolRiskFinding[] {
  const suspiciousTools = tools.filter((tool) =>
    SUSPICIOUS_FRAGMENT_PHRASES.some((phrase) => containsPhrase(tool.description, phrase))
  );

  if (suspiciousTools.length < 2) {
    return [];
  }

  return [
    finding({
      ruleId: "multi_tool_suspicious_fragments",
      category: "metadata-injection",
      severity: "medium",
      title: "Multi-tool suspicious metadata fragments",
      message: "More than one tool description contains fragment-sharing or reconstruction language.",
      evidence: `tools: ${suspiciousTools.map((tool) => tool.name).slice(0, 5).join(", ")}`,
      recommendation: "Review tool descriptions together for hidden or distributed instruction patterns.",
      targetType: "manifest"
    })
  ];
}

function extractInputParameters(inputSchema: unknown): NormalizedToolParameter[] {
  if (!isPlainObject(inputSchema) || !isPlainObject(inputSchema["properties"])) {
    return [];
  }

  const required = Array.isArray(inputSchema["required"])
    ? new Set(inputSchema["required"].filter((item): item is string => typeof item === "string"))
    : new Set<string>();

  return Object.entries(inputSchema["properties"]).map(([name, definition]) => {
    const parameter = isPlainObject(definition) ? definition : {};

    return {
      name,
      type: stringValue(parameter["type"]),
      description: stringValue(parameter["description"]) ?? "",
      required: required.has(name)
    };
  });
}

function inferToolCapabilityHints(tool: NormalizedMcpTool): McpCapabilityCategory[] {
  const text = searchableToolText(tool);
  const hints = new Set<McpCapabilityCategory>();

  if (/(file|filesystem|path|directory|folder|\.env|\.ssh|\/etc)/i.test(text)) {
    hints.add("filesystem");
  }

  if (/(shell|terminal|execute|run command|process|bash|zsh|powershell|cmd)/i.test(text)) {
    hints.add("shell");
  }

  if (/(database|postgres|mysql|sqlite|redis|mongo|drop table|truncate)/i.test(text)) {
    hints.add("database");
  }

  if (/(browser|page|dom|playwright|puppeteer|chrome)/i.test(text)) {
    hints.add("browser");
  }

  if (/(github|gitlab|pull request|repo|repository)/i.test(text)) {
    hints.add("github");
  }

  if (/(url|webhook|fetch|http|request|endpoint|post|upload)/i.test(text)) {
    hints.add("network");
  }

  if (/(token|apikey|api_key|secret|password|authorization|bearer|credential)/i.test(text)) {
    hints.add("credentials");
  }

  if (hints.size === 0) {
    hints.add("unknown");
  }

  return [...hints].sort();
}

function finding(input: {
  readonly ruleId: ToolRiskRuleId;
  readonly category: ToolRiskCategory;
  readonly severity: Exclude<RiskLevel, "unknown">;
  readonly title: string;
  readonly message: string;
  readonly evidence: string;
  readonly recommendation: string;
  readonly toolName?: string;
  readonly targetType?: "tool" | "manifest";
}): ToolRiskFinding {
  return {
    ruleId: input.ruleId,
    category: input.category,
    severity: input.severity,
    title: input.title,
    message: input.message,
    evidence: sanitizeEvidence(input.evidence),
    recommendation: input.recommendation,
    target: {
      type: input.targetType ?? "tool",
      toolName: input.toolName
    }
  };
}

function searchableToolText(tool: NormalizedMcpTool): string {
  return [
    tool.name,
    tool.title,
    tool.description,
    ...tool.inputParameters.flatMap((parameter) => [
      parameter.name,
      parameter.type,
      parameter.description
    ])
  ]
    .filter((value): value is string => value !== undefined && value !== "")
    .join(" ");
}

function toolText(tool: NormalizedMcpTool): string {
  return [tool.name, tool.title, tool.description]
    .filter((value): value is string => value !== undefined && value !== "")
    .join(" ");
}

function containsPhrase(text: string, phrase: string): boolean {
  return text.toLowerCase().includes(phrase.toLowerCase());
}

function evidenceFromText(text: string, pattern: RegExp): string {
  const match = pattern.exec(text);

  if (match?.[0] === undefined) {
    return "matching metadata text";
  }

  return `metadata contains "${sanitizeEvidence(match[0])}"`;
}

function isActionOriented(tool: NormalizedMcpTool): boolean {
  return /(delete|remove|overwrite|write|update|execute|run command|shell|terminal|drop table|truncate)/i.test(
    searchableToolText(tool)
  );
}

function hasDestructiveAnnotation(tool: NormalizedMcpTool): boolean {
  return tool.annotations?.["destructiveHint"] === true || tool.annotations?.["openWorldHint"] === true;
}

function schemaType(schema: unknown): string | undefined {
  return isPlainObject(schema) ? stringValue(schema["type"]) : undefined;
}

function requiredFieldCount(schema: unknown): number {
  if (!isPlainObject(schema) || !Array.isArray(schema["required"])) {
    return 0;
  }

  return schema["required"].filter((item) => typeof item === "string").length;
}

function sanitizeUnknown(value: unknown, keyName = ""): unknown {
  if (typeof value === "string") {
    return shouldRedactString(keyName, value) ? "[redacted]" : value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeUnknown(item, keyName));
  }

  if (isPlainObject(value)) {
    return sanitizeRecord(value);
  }

  return value;
}

function sanitizeRecord(input: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(input).map(([key, value]) => [key, sanitizeUnknown(value, key)])
  );
}

function shouldRedactString(keyName: string, value: string): boolean {
  return /(token|apikey|api_key|secret|password|authorization|bearer|credential|example|default|const|enum)/i.test(keyName) &&
    /(token|key|secret|password|authorization|bearer|credential|do-not-use|redacted)/i.test(value);
}

function sanitizeEvidence(value: string, maxLength = 160): string {
  const redacted = value
    .replace(/Bearer\s+[A-Za-z0-9._~+/=-]+/gi, "Bearer [redacted]")
    .replace(/(api[_-]?key|token|secret|password|authorization|credential)=?[A-Za-z0-9._~+/=-]+/gi, "$1=[redacted]");

  return redacted.length <= maxLength ? redacted : `${redacted.slice(0, maxLength - 3)}...`;
}

function highestRisk(levels: readonly Exclude<RiskLevel, "unknown">[]): Exclude<RiskLevel, "unknown"> {
  if (levels.length === 0) {
    return "info";
  }

  return levels.reduce((highest, level) => (RISK_ORDER[level] > RISK_ORDER[highest] ? level : highest), "info");
}

function stringValue(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() !== "" ? value : undefined;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

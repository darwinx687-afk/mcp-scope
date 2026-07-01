import { describe, expect, it } from "vitest";
import {
  FOUNDATION_STATUS,
  PROJECT_NAME,
  PROJECT_SLUG,
  PROJECT_VERSION
} from "../src/index.js";

describe("core constants", () => {
  it("exports stable project identity", () => {
    expect(PROJECT_NAME).toBe("MCP Scope");
    expect(PROJECT_SLUG).toBe("mcp-scope");
    expect(PROJECT_VERSION).toBe("0.0.0");
  });

  it("marks Phase 2 scanner behavior as static-only", () => {
    expect(FOUNDATION_STATUS).toMatchObject({
      phase: 2,
      status: "tool-metadata-rules-ready",
      scanner: "static-config-and-tool-metadata",
      externalApiCalls: false,
      serverExecution: false
    });
  });
});

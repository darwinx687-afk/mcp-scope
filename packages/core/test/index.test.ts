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

  it("marks Phase 7 ecosystem discovery behavior as static-only", () => {
    expect(FOUNDATION_STATUS).toMatchObject({
      phase: 7,
      status: "ecosystem-discovery-ready",
      scanner: "static-config-tool-metadata-ecosystem-discovery",
      externalApiCalls: false,
      serverExecution: false
    });
  });
});

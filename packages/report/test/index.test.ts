import { describe, expect, it } from "vitest";
import { renderFoundationStatusReport } from "../src/index.js";

describe("renderFoundationStatusReport", () => {
  it("renders honest Phase 0 status", () => {
    const report = renderFoundationStatusReport();

    expect(report).toContain("MCP Scope Foundation Status");
    expect(report).toContain("scanner: not-implemented-yet");
    expect(report).toContain("externalApiCalls: false");
    expect(report).toContain("does not scan MCP metadata");
  });
});

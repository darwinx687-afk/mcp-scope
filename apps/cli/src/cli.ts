import { FOUNDATION_STATUS, PROJECT_NAME, PROJECT_VERSION } from "@mcp-scope/core";

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

Phase 0 note:
  MCP Scope does not scan MCP metadata or execute MCP servers yet.
`;

export function handleCli(args = process.argv.slice(2), io: CliIO = process): number {
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

  io.stderr.write(`Unknown MCP Scope command: ${command}\n`);
  io.stderr.write(`Run "mcp-scope --help" for usage.\n`);
  return 1;
}

export { PROJECT_NAME };

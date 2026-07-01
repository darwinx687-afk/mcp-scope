#!/usr/bin/env node
import { handleCli } from "./cli.js";

const exitCode = handleCli();

if (exitCode !== 0) {
  process.exitCode = exitCode;
}

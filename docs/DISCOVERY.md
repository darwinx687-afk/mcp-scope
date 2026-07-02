# MCP Scope Discovery

`mcp-scope discover` searches a local root directory for likely MCP config files. It lists candidates only. It does not execute MCP servers, connect to servers, scan tool metadata, create snapshots, or modify files.

## Basic Usage

```bash
node apps/cli/dist/index.js discover --root .
node apps/cli/dist/index.js discover --root . --format json
node apps/cli/dist/index.js discover --root . --format markdown --lang zh-CN
node apps/cli/dist/index.js discover --root . --format html --output reports/discovery.html
```

After discovery, choose a path and run:

```bash
node apps/cli/dist/index.js scan --config <path>
```

If you have exported tools/list metadata:

```bash
node apps/cli/dist/index.js scan --config <path> --tools <tools.json>
```

Markdown and HTML discovery reports also show a concrete next command for each parsed candidate, for example `mcp-scope scan --config examples/clients/claude-code-project.mcp.json`.

## Candidate Matching

Discovery looks for likely MCP config filenames:

- `.mcp.json`
- `mcp.json`
- `*.mcp.json`
- `*.mcp-settings.json`
- `claude_desktop_config.json`
- `claude-desktop-config.json`
- `.claude.json`
- `*.claude.json`
- `*.plugin.json`
- JSON filenames containing `mcp`
- `settings.json` or `*.settings.json` only in obvious client/example directories

Candidate files are parsed only as local JSON and only to identify supported config shapes.

## Ignored Directories

Discovery skips:

- `node_modules`
- `.git`
- `dist`
- `build`
- `coverage`
- `reports`
- `.next`
- `.turbo`
- `vendor`
- `target`
- `.venv`
- `__pycache__`

It does not follow symlinks.

## Options

- `--root <path>`: required root directory.
- `--format markdown|json|html`: default `markdown`.
- `--output <path>`: required for HTML.
- `--lang en|zh-CN`: default `en`.
- `--max-depth <number>`: default `4`.
- `--include-home`: allows using the home directory itself as the discovery root.

Files over 1 MB are skipped by default.

## Safe Path Display

Discovery uses safe path display for home-like paths and nested project paths. Public reports should not expose full private home directory paths by default.

## Limitations

Discovery is a static candidate finder:

- It does not prove a config is active.
- It does not prove a config is safe.
- It does not claim official integration with any client.
- It does not discover every possible private client setting.
- It does not upload or modify anything.

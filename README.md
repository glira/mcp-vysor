English | [Português](README.pt-BR.md)

# MCP Vysor

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/mcp-vysor.svg)](https://www.npmjs.com/package/mcp-vysor)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](package.json)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple)](https://modelcontextprotocol.io)

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server for **visual control of Android devices over ADB**. AI agents in **Cursor**, Claude Desktop, and other MCP clients can see the phone screen, tap coordinates, inspect UI elements, and run flows — like Vysor, wired into your IDE.

## Why use it?

- **A real screen:** screenshots come back as images the agent can look at
- **Precise taps:** by pixels, by percentage, or by a labeled element
- **A coordinate grid:** read x,y straight off the image
- **18 tools:** screenshots, gestures, UI dump, shell, apps, and keys
- **No extra stack:** it uses the `adb` you already have

## A typical flow

```
1. adb_screenshot_with_grid  →  the agent sees the screen with coordinates
2. adb_tap x=996 y=2073      →  taps the "Profile" tab
3. adb_find_elements         →  finds "Turn off push notifications"
4. adb_tap_element           →  flips the toggle
5. adb_screenshot            →  confirms what changed
```

## Requirements

- Node.js 18+
- [Android Platform Tools (ADB)](https://developer.android.com/tools/releases/platform-tools)
- An Android 8.0+ device with USB debugging on

## Install

npm package: **[mcp-vysor@1.0.0](https://www.npmjs.com/package/mcp-vysor)**

### Option A — npx (recommended)

Runs without a clone or a build:

```bash
npx -y mcp-vysor
```

### Option B — global install

```bash
npm install -g mcp-vysor
mcp-vysor
```

### Option C — clone and build (development)

```bash
git clone https://github.com/glira/mcp-vysor.git
cd mcp-vysor
npm install
npm run build
```

Full guide (Portuguese): [docs/INSTALLATION.md](docs/INSTALLATION.md)

## Cursor setup

Add this to `~/.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "vysor": {
      "command": "npx",
      "args": ["-y", "mcp-vysor"],
      "env": {
        "ADB_PATH": "adb"
      }
    }
  }
}
```

Global install:

```json
{
  "mcpServers": {
    "vysor": {
      "command": "mcp-vysor",
      "env": { "ADB_PATH": "adb" }
    }
  }
}
```

Local clone:

```json
{
  "mcpServers": {
    "vysor": {
      "command": "node",
      "args": ["/absolute/path/mcp-vysor/dist/index.js"],
      "env": { "ADB_PATH": "adb" }
    }
  }
}
```

Detailed guide (Portuguese): [docs/CURSOR.md](docs/CURSOR.md)

## Tools

| Category | Tools |
|----------|-------|
| **Screen** | `adb_list_devices`, `adb_get_screen_info`, `adb_screenshot`, `adb_screenshot_with_grid`, `adb_get_current_app` |
| **Coordinates** | `adb_tap`, `adb_tap_percent`, `adb_tap_from_image_coords`, `adb_swipe`, `adb_long_press`, `adb_get_coordinates` |
| **UI** | `adb_ui_dump`, `adb_find_elements`, `adb_tap_element` |
| **Input** | `adb_input_text`, `adb_keyevent`, `adb_shell`, `adb_start_app`, `adb_stop_app` |

Full parameter reference (Portuguese): [docs/TOOLS.md](docs/TOOLS.md)

## A skill for the agent

The server in this repository stays free on npm. This skill teaches the agent the loop: see the screen, tap, and confirm what changed. Install the MCP with `npx -y mcp-vysor`. The skill shows the agent how to use that server.

[MCP Vysor Starter](https://www.agensi.io/skills/mcp-vysor-starter)

## Environment variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ADB_PATH` | Path to the adb binary | `adb` |
| `ADB_DEVICE` | Default device serial | auto (when one device is online) |

## Documentation

The guides below are in Portuguese.

| Document | Contents |
|----------|----------|
| [Install](docs/INSTALLATION.md) | Requirements, ADB, build, checks |
| [Cursor](docs/CURSOR.md) | MCP setup in the IDE |
| [Tools](docs/TOOLS.md) | Every tool, with parameters |
| [Architecture](docs/ARCHITECTURE.md) | Design, modules, flows, limits |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Common problems and fixes |
| [Publishing](docs/PUBLISHING.md) | Official MCP registry and directories |
| [Contributing](CONTRIBUTING.md) | How to contribute |
| [Changelog](CHANGELOG.md) | Version history |

mcp-name: io.github.glira/mcp-vysor

## Development

```bash
npm run dev    # MCP server in development mode
npm run build  # compile TypeScript to dist/
```

## License

[MIT](LICENSE) — Copyright (c) 2026 Gemayel Lira

## Author

**Gemayel Lira** — [github.com/glira](https://github.com/glira)

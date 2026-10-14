# Setup — mcp-vysor

## Requirements

- Node.js 18 or newer
- Android Platform Tools (`adb`)
- Android 8+ with USB debugging accepted on the device

Check:

```bash
node -v
adb version
adb devices -l
```

The serial must show state `device`.

## Cursor

Copy `templates/mcp.cursor.json` into `~/.cursor/mcp.json` (merge with existing servers; do not wipe other entries). Reload MCP in Cursor Settings.

Optional environment:

| Variable | Meaning |
|----------|---------|
| `ADB_PATH` | Path to the `adb` binary. Default `adb`. |
| `ADB_DEVICE` | Serial when several devices are online. |

## Smoke test

Ask the agent: "List ADB devices and take a screenshot."

Expected tools: `adb_list_devices`, then `adb_screenshot` or `adb_screenshot_with_grid`.

## Links

- Repository: https://github.com/glira/mcp-vysor
- npm: https://www.npmjs.com/package/mcp-vysor

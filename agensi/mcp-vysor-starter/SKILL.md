---
name: mcp-vysor-starter
description: >-
  Drive a connected Android device with the mcp-vysor MCP server. Use when the
  user wants to see the phone screen, tap coordinates, swipe, or confirm a UI
  change. Requires ADB and a device with USB debugging. Install the server with
  npx before calling tools.
---

# MCP Vysor — starter

Use this skill only after the MCP server `vysor` is connected. The marketplace does not host the server. The buyer runs it locally.

## Install the server

Preferred Cursor config (`templates/mcp.cursor.json`):

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

Full setup: read `SETUP.md` in this pack. Upstream docs: https://github.com/glira/mcp-vysor and https://www.npmjs.com/package/mcp-vysor

## Preconditions

- Node.js 18+
- `adb` on PATH (`adb devices` shows `device`, not `unauthorized`)
- Screen unlocked
- If more than one device is online, set `ADB_DEVICE` or pass `device_id`

Stop and tell the user if no device is connected. Do not invent taps.

## Default loop

1. `adb_list_devices`
2. `adb_get_screen_info` (note width and height)
3. `adb_screenshot_with_grid` with `grid_step` 100
4. Choose an action:
   - Known label: `adb_find_elements` then `adb_tap_element`
   - Visual position on the grid: `adb_tap` with device pixels
   - Relative position: `adb_tap_percent`
5. `adb_screenshot` again and describe what changed

## Tool choice

| Goal | Tool |
|------|------|
| See the screen | `adb_screenshot` or `adb_screenshot_with_grid` |
| Tap a labeled control | `adb_tap_element` |
| Tap pixels | `adb_tap` |
| Drag | `adb_swipe` |
| Back / Home | `adb_keyevent` with `BACK` or `HOME` |
| Type into the focused field | `adb_input_text` |

Coordinates are device pixels from `adb_get_screen_info`, not pixels of a resized chat image. If you passed `max_width`, use `adb_tap_from_image_coords` with the returned scale.

## Do not

- Call `adb_shell` for destructive commands unless the user asked
- Assume a WebView exposes every button in `adb_ui_dump`; fall back to the grid
- Claim a tap succeeded without a follow-up screenshot or UI dump

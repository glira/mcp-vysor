---
name: mcp-vysor-pro
description: >-
  Advanced Android QA playbooks for the mcp-vysor MCP server. Use for login
  flows, toggles, tab navigation, WebView vs native UI, resized screenshots,
  and visual regression. Requires ADB, a debuggable device, and the local
  mcp-vysor server (npx).
---

# MCP Vysor Pro — Android QA playbooks

Suggested marketplace price: USD 19 to 29. The MCP server stays free on npm (`npx -y mcp-vysor`). This skill is the paid know-how.

Read `SETUP.md` if the server is not connected yet. Copy `templates/mcp.cursor.json`.

## Session start

1. `adb_list_devices`. Abort if none are `device`.
2. `adb_get_screen_info`. Record `width`, `height`, `rotation`.
3. `adb_get_current_app` for package and activity.
4. `adb_screenshot_with_grid` (`grid_step` 100) before the first tap.

## Playbook: labeled control

1. `adb_find_elements` with `text` or `content_desc` (partial match on).
2. If several hits, show the list and pick `index`, or the one whose bounds sit in the visible half of the screen (ignore `center` 0,0 — off-screen).
3. `adb_tap_element` with the same query and `index`.
4. Wait ~1s, then `adb_screenshot`.

Example prompts live in `examples/`.

## Playbook: visual tap (WebView or missing nodes)

Many hybrid apps expose a WebView with few clickable nodes. Then:

1. Use the grid screenshot, not the XML dump.
2. Read x,y from the grid labels. Those numbers are device pixels.
3. `adb_tap` with those x,y.
4. Confirm with another screenshot.

If the image was resized (`max_width`), do not tap image pixels. Call `adb_tap_from_image_coords` with `image_scale` from the tool text (scale = image width / device width).

## Playbook: percent when resolution changes

`adb_tap_percent` with `percent_x` and `percent_y` from 0 to 100. Use this when the same layout must work on another density and you only know the relative position (for example bottom-nav "Perfil" near x=92, y=88).

## Playbook: toggle or switch

1. Dump or screenshot and note the current label (for example "Desativar" vs "Ativar").
2. Tap the switch center from `adb_find_elements` (`content_desc` often holds the action).
3. Dump again. Success is a changed label or a confirmation string, not the tap return alone.

## Playbook: login

1. Screenshot.
2. Tap the email field (`adb_tap_element` or grid).
3. `adb_input_text`. Spaces become `%s`. Avoid accents if the ROM drops them; tell the user if the string is non-ASCII.
4. Tap password, type, then tap the submit control.
5. Screenshot. If a dialog blocks input, `adb_keyevent` `BACK` only when the user wants to dismiss it.

## Playbook: bottom navigation

1. `adb_ui_dump` and keep rows whose y is near the bottom (about 85–95% of height) and `clickable` is true.
2. Tap by label (`Início`, `Perfil`, etc.).
3. Confirm the header title changed via a new dump or screenshot.

## Playbook: scroll then act

If the target y is 0 or the text is absent:

1. `adb_swipe` from (width/2, height*0.75) to (width/2, height*0.35), `duration_ms` 300.
2. Dump or screenshot again.
3. Then tap.

## Playbook: visual regression

1. `adb_screenshot` with `save_path` the user names (before).
2. Perform the change.
3. Second screenshot (after).
4. Describe differences in plain language: toggle state, toast/banner text, which tab is active. Do not claim pixel-perfect equality.

## Anti-patterns

| Problem | What to do |
|---------|------------|
| Several devices | Set `ADB_DEVICE` or pass `device_id` on every call. |
| `unauthorized` | Ask the user to accept the USB debugging prompt. |
| Black or empty screenshot | Unlock the screen. Some apps set FLAG_SECURE and block `screencap`. |
| UI dump empty on WebView | Switch to grid + `adb_tap`. |
| Tap misses after resize | Convert with `image_scale` or avoid `max_width`. |
| Rotation | Re-read `adb_get_screen_info` after rotate. |
| `adb_input_text` garbled | Stick to ASCII or ask the user to type. |
| `adb_shell` | Only for read-only diagnostics the user asked for. |

## Tool map (short)

- Screen: `adb_screenshot`, `adb_screenshot_with_grid`, `adb_get_screen_info`, `adb_get_current_app`
- Pointer: `adb_tap`, `adb_tap_percent`, `adb_tap_from_image_coords`, `adb_swipe`, `adb_long_press`
- Semantics: `adb_ui_dump`, `adb_find_elements`, `adb_tap_element`, `adb_get_coordinates`
- Keys: `adb_keyevent` (`BACK`, `HOME`, `ENTER`, `RECENT`, `DEL`)
- Apps: `adb_start_app`, `adb_stop_app`

Upstream reference: https://github.com/glira/mcp-vysor/blob/main/docs/TOOLS.md

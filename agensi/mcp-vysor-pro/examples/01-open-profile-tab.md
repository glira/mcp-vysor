# Prompt: open the Profile tab

Ask the agent:

> On the connected Android device, open the bottom navigation item labeled Perfil (or Profile). Confirm with a screenshot.

Expected sequence:

1. `adb_screenshot_with_grid` or `adb_find_elements` with `text` Perfil
2. Ignore matches whose center is `0,0`
3. `adb_tap_element` text `Perfil` or `adb_tap` on the bottom-right tab
4. `adb_screenshot` and report the screen title

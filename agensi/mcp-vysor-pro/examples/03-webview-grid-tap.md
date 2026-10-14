# Prompt: tap when UI dump is useless

Ask the agent:

> The screen is a WebView. Do not trust uiautomator for the primary button. Use the coordinate grid and tap the gold button in the lower half, then screenshot.

Expected sequence:

1. `adb_screenshot_with_grid`
2. Read device pixel labels on the grid
3. `adb_tap` with those pixels
4. Confirm with `adb_screenshot`
5. Do not use image pixels if `max_width` was set; convert with `adb_tap_from_image_coords`

# Prompt: scroll until a label exists

Ask the agent:

> Scroll the page until you see the text Indicação, then screenshot. Do not tap it.

Expected sequence:

1. `adb_find_elements` text `Indicação`
2. If missing or center is `0,0`, `adb_swipe` upward on the content area
3. Repeat at most 4 times
4. Final `adb_screenshot` with the label visible

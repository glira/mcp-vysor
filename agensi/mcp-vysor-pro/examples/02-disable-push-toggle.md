# Prompt: disable a push notification toggle

Ask the agent:

> In the profile screen, find Notificações push and turn the switch off. Stop if it is already off. Show before and after.

Expected sequence:

1. Screenshot before
2. `adb_find_elements` with `content_desc` or `text` containing `push`
3. Tap the switch (often the clickable node, not the label)
4. Dump or screenshot after
5. Success text looks like notifications disabled, or the content-desc flipped from disable to enable

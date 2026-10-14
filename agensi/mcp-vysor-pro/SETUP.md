# Setup — mcp-vysor Pro

Same runtime as the free server. This pack does not replace npm.

```bash
npx -y mcp-vysor
```

Merge `templates/mcp.cursor.json` into `~/.cursor/mcp.json`, then reload MCP.

Requirements: Node.js 18+, `adb` on PATH, one Android device in state `device`, screen unlocked.

Multiple devices:

```json
"env": {
  "ADB_PATH": "adb",
  "ADB_DEVICE": "YOUR_SERIAL"
}
```

Links:

- https://github.com/glira/mcp-vysor
- https://www.npmjs.com/package/mcp-vysor

Suggested Agensi price for this skill: USD 19–29. Keep the npm package free.

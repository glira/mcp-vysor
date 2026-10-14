---
name: mcp-tomticket-starter
description: >-
  Operate a TomTicket helpdesk from an agent via the mcp-tomticket MCP server.
  Use to list open tickets, read a ticket, reply, comment internally, or finish
  a ticket. Requires a TomTicket API bearer token in TOMTICKET_TOKEN. Never
  invent ticket ids or log time the user did not provide.
---

# MCP TomTicket — starter

Phase-2 listing. The server is open source and not hosted by the marketplace.

- GitHub: https://github.com/glira/mcp-tomticket
- npm: https://www.npmjs.com/package/mcp-tomticket

## Install

Merge `templates/mcp.cursor.json`. The buyer pastes their own token from TomTicket: Administração, Configurações da Conta, API, Novo Token. The token needs permission to create and modify data for replies and finish. Never commit the token.

```json
{
  "mcpServers": {
    "tomticket": {
      "command": "npx",
      "args": ["-y", "mcp-tomticket"],
      "env": {
        "TOMTICKET_TOKEN": "paste-token-here"
      }
    }
  }
}
```

Account must be TomTicket Premium or Enterprise. The API allows about 3 requests per second; the client already spaces calls.

## Safe loop

1. `tomticket_list_open_tickets` (or `tomticket_list_tickets` with the user's filters).
2. `tomticket_get_ticket` before any write.
3. Writes only when the user asked:
   - `tomticket_reply_ticket` — public reply. Do not send `start_date` or `end_date` unless the user gave the work window in this turn.
   - `tomticket_comment_ticket` — internal note.
   - `tomticket_finish_ticket` — only with `time_work` minutes the user stated when closing. Assign an operator first if the API requires it (`tomticket_assign_operator`).
4. Read the ticket again and summarize status.

## Do not

- Estimate hours or invent a time window
- Finish or reply on production tickets during a "just look" request
- Put the bearer token in chat logs or git

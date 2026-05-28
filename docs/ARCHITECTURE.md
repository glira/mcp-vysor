# Arquitetura

## Visão geral

```
┌─────────────────┐     stdio/JSON-RPC      ┌──────────────────┐
│  Cursor / MCP   │ ◄──────────────────────► │   mcp-vysor      │
│  Client         │                          │   (Node.js)      │
└─────────────────┘                          └────────┬─────────┘
                                                       │ exec
                                                       ▼
                                              ┌──────────────────┐
                                              │   adb binary     │
                                              └────────┬─────────┘
                                                       │ USB/Wi-Fi
                                                       ▼
                                              ┌──────────────────┐
                                              │  Android Device  │
                                              └──────────────────┘
```

## Módulos

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/index.ts` | Servidor MCP, registro de ferramentas, handlers |
| `src/adb.ts` | Cliente ADB, parsing de UI dump, utilitários de coordenadas |
| `src/image.ts` | Grade de coordenadas e redimensionamento via Sharp |

## Transporte MCP

- **Protocolo:** Model Context Protocol (JSON-RPC 2.0)
- **Transporte:** stdio (processo filho spawnado pelo Cursor)
- **SDK:** `@modelcontextprotocol/sdk` v1.x

## Fluxo de screenshot

1. `adb shell screencap -p /sdcard/...` — captura no dispositivo
2. `adb pull` — transfere PNG para temp local
3. Opcional: Sharp adiciona grade ou redimensiona
4. Retorno MCP com `content: [{ type: "image", data: base64 }]`

## Fluxo de UI dump

1. `adb shell uiautomator dump /sdcard/...` — gera XML da hierarquia
2. `adb pull` — baixa XML
3. Parser regex extrai atributos `text`, `resource-id`, `bounds`, `clickable`
4. Calcula centro: `(left+right)/2`, `(top+bottom)/2`

## Seleção de dispositivo

```
device_id explícito → ADB_DEVICE env → auto (se 1 device) → erro (se N devices)
```

## Dependências

| Pacote | Uso |
|--------|-----|
| `@modelcontextprotocol/sdk` | Servidor MCP |
| `zod` | Validação de schemas das ferramentas |
| `sharp` | Processamento de imagem (grade, resize) |

## Segurança

- O servidor executa comandos ADB com as permissões do usuário host
- `adb_shell` permite comandos arbitrários — use apenas em dispositivos de teste
- Não exponha o servidor via HTTP; stdio é local ao processo do IDE
- Tokens e credenciais do dispositivo não são armazenados pelo MCP

## Limitações conhecidas

- WebViews expõem poucos nós no UI dump nativo
- `input text` do ADB tem restrições de charset
- Apps com FLAG_SECURE bloqueiam screenshot
- Latência de rede em ADB Wi-Fi pode afetar automação visual

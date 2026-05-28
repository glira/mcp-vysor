# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/lang/pt-BR/).

## [1.0.0] - 2026-05-28

### Adicionado

- Servidor MCP via stdio compatível com Cursor, Claude Desktop e outros clientes MCP
- 18 ferramentas ADB para automação visual de dispositivos Android
- Captura de tela com retorno de imagem para o agente de IA
- Screenshot com grade de coordenadas para mapeamento visual de taps
- Conversão de coordenadas (pixels, porcentagem, imagem redimensionada)
- Inspeção de UI via `uiautomator dump` com busca por texto, resource-id e content-desc
- Tap em elementos por critérios semânticos
- Gestos: tap, swipe, long press, input de texto e key events
- Suporte a múltiplos dispositivos com seleção por `device_id` ou `ADB_DEVICE`
- Documentação completa em `docs/`
- Workflow CI para build TypeScript
- Publicado no npm como [`mcp-vysor`](https://www.npmjs.com/package/mcp-vysor) — instalação via `npx -y mcp-vysor`

### Corrigido

- `adb_get_current_app` não funcionava em shells que não suportam pipe no comando ADB

[1.0.0]: https://github.com/glira/mcp-vysor/releases/tag/v1.0.0

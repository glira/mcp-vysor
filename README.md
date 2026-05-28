# MCP Vysor

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-green)](package.json)
[![MCP](https://img.shields.io/badge/MCP-Compatible-purple)](https://modelcontextprotocol.io)

Servidor [Model Context Protocol (MCP)](https://modelcontextprotocol.io) para **controle visual de dispositivos Android via ADB**. Permite que agentes de IA no **Cursor**, Claude Desktop e outros clientes MCP vejam a tela do celular, cliquem em coordenadas, inspecionem elementos da UI e automatizem fluxos — similar ao Vysor, mas integrado nativamente ao seu IDE.

## Por que usar?

- **Visualização real:** screenshots retornados como imagem para o agente analisar
- **Cliques precisos:** tap por pixels, porcentagem ou elemento semântico
- **Grade de coordenadas:** identifique posições x,y diretamente na imagem
- **18 ferramentas:** cobre screenshot, gestos, UI dump, shell, apps e teclas
- **Zero config extra:** usa o `adb` que você já tem instalado

## Demonstração de fluxo

```
1. adb_screenshot_with_grid  →  agente vê a tela com coordenadas
2. adb_tap x=996 y=2073      →  clica na aba "Perfil"
3. adb_find_elements         →  encontra "Desativar notificações push"
4. adb_tap_element           →  desativa o toggle
5. adb_screenshot            →  confirma visualmente
```

## Requisitos

- Node.js 18+
- [Android Platform Tools (ADB)](https://developer.android.com/tools/releases/platform-tools)
- Dispositivo Android 8.0+ com depuração USB ativada

## Instalação rápida

### Opção A — npx (recomendado)

```bash
npx -y mcp-vysor
```

### Opção B — clone e build

```bash
git clone https://github.com/glira/mcp-vysor.git
cd mcp-vysor
npm install
npm run build
```

Guia completo: [docs/INSTALLATION.md](docs/INSTALLATION.md)

## Configuração no Cursor

Adicione em `~/.cursor/mcp.json`:

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

Alternativa com clone local:

```json
{
  "mcpServers": {
    "vysor": {
      "command": "node",
      "args": ["/caminho/absoluto/mcp-vysor/dist/index.js"],
      "env": { "ADB_PATH": "adb" }
    }
  }
}
```

Guia detalhado: [docs/CURSOR.md](docs/CURSOR.md)

## Ferramentas disponíveis

| Categoria | Ferramentas |
|-----------|-------------|
| **Tela** | `adb_list_devices`, `adb_get_screen_info`, `adb_screenshot`, `adb_screenshot_with_grid`, `adb_get_current_app` |
| **Coordenadas** | `adb_tap`, `adb_tap_percent`, `adb_tap_from_image_coords`, `adb_swipe`, `adb_long_press`, `adb_get_coordinates` |
| **UI** | `adb_ui_dump`, `adb_find_elements`, `adb_tap_element` |
| **Entrada** | `adb_input_text`, `adb_keyevent`, `adb_shell`, `adb_start_app`, `adb_stop_app` |

Referência completa com parâmetros: [docs/TOOLS.md](docs/TOOLS.md)

## Variáveis de ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `ADB_PATH` | Caminho do executável adb | `adb` |
| `ADB_DEVICE` | Serial padrão do dispositivo | auto (se 1 device) |

## Documentação

| Documento | Conteúdo |
|-----------|----------|
| [Instalação](docs/INSTALLATION.md) | Pré-requisitos, ADB, build, verificação |
| [Cursor](docs/CURSOR.md) | Configuração MCP no IDE |
| [Ferramentas](docs/TOOLS.md) | Referência completa de cada tool |
| [Arquitetura](docs/ARCHITECTURE.md) | Design, módulos, fluxos, limitações |
| [Troubleshooting](docs/TROUBLESHOOTING.md) | Problemas comuns e soluções |
| [Publicação](docs/PUBLISHING.md) | Registro oficial MCP e diretórios |
| [Contribuindo](CONTRIBUTING.md) | Como contribuir |
| [Changelog](CHANGELOG.md) | Histórico de versões |

mcp-name: io.github.glira/mcp-vysor

## Desenvolvimento

```bash
npm run dev    # servidor MCP em modo desenvolvimento
npm run build  # compila TypeScript → dist/
```

## Licença

[MIT](LICENSE) — Copyright (c) 2026 Gemayel Lira

## Autor

**Gemayel Lira** — [github.com/glira](https://github.com/glira)

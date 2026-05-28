# Configuração no Cursor

Este guia configura o **mcp-vysor** como servidor MCP no [Cursor IDE](https://cursor.com).

## 1. Localizar o arquivo de configuração MCP

O Cursor lê servidores MCP de:

- **Global:** `~/.cursor/mcp.json`
- **Por projeto:** `.cursor/mcp.json` na raiz do workspace

Recomendamos configuração global se você usar o MCP em vários projetos Android.

## 2. Adicionar o servidor

### Recomendado — via npx

Edite `~/.cursor/mcp.json`:

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

Com dispositivo específico:

```json
{
  "mcpServers": {
    "vysor": {
      "command": "npx",
      "args": ["-y", "mcp-vysor"],
      "env": {
        "ADB_PATH": "adb",
        "ADB_DEVICE": "SEU_SERIAL_AQUI"
      }
    }
  }
}
```

### Alternativa — instalação global npm

```bash
npm install -g mcp-vysor
```

```json
{
  "mcpServers": {
    "vysor": {
      "command": "mcp-vysor",
      "env": {
        "ADB_PATH": "adb"
      }
    }
  }
}
```

Pacote: https://www.npmjs.com/package/mcp-vysor

### Alternativa — clone local

Edite `~/.cursor/mcp.json` e inclua o bloco `vysor`:

```json
{
  "mcpServers": {
    "vysor": {
      "command": "node",
      "args": ["/CAMINHO/ABSOLUTO/para/mcp-vysor/dist/index.js"],
      "env": {
        "ADB_PATH": "adb"
      }
    }
  }
}
```

Substitua `/CAMINHO/ABSOLUTO/para/mcp-vysor` pelo caminho real após o clone.

### Exemplo real (Linux, clone local)

```json
{
  "mcpServers": {
    "vysor": {
      "command": "node",
      "args": ["/home/usuario/projetos/mcp-vysor/dist/index.js"],
      "env": {
        "ADB_PATH": "adb",
        "ADB_DEVICE": "SEU_SERIAL_AQUI"
      }
    }
  }
}
```

### Múltiplos servidores MCP

Mescle com servidores existentes — não substitua o arquivo inteiro:

```json
{
  "mcpServers": {
    "playwright": { "...": "..." },
    "vysor": {
      "command": "node",
      "args": ["/home/usuario/projetos/mcp-vysor/dist/index.js"],
      "env": { "ADB_PATH": "adb" }
    }
  }
}
```

## 3. Recarregar o Cursor

1. Abra **Cursor Settings → MCP**
2. Clique em **Refresh** ou reinicie o Cursor
3. O servidor `vysor` deve aparecer com status **Connected** (ponto verde)

## 4. Validar ferramentas

No chat do Cursor (modo Agent), peça:

> Liste os dispositivos ADB conectados

O agente deve chamar `adb_list_devices`. Se retornar o serial do seu aparelho, está funcionando.

## 5. Configuração por projeto (opcional)

Copie o exemplo incluído no repositório:

```bash
cp .cursor/mcp.json.example .cursor/mcp.json
```

Edite os caminhos e o serial do dispositivo.

## Dicas de uso no Cursor

| Objetivo | Ferramenta recomendada |
|----------|------------------------|
| Ver a tela do celular | `adb_screenshot` ou `adb_screenshot_with_grid` |
| Clicar em botão visível | `adb_tap` com coordenadas da grade |
| Clicar por texto | `adb_find_elements` → `adb_tap_element` |
| Navegar | `adb_keyevent` com `BACK`, `HOME`, `RECENT` |
| Automatizar fluxo | Combine screenshot → análise → tap → screenshot |

## Solução de problemas

Se o servidor não aparecer, consulte [Troubleshooting](./TROUBLESHOOTING.md).

# Guia de publicação em diretórios MCP

Este documento lista onde e como publicar o **mcp-vysor** para aumentar visibilidade.

Repositório: **https://github.com/glira/mcp-vysor**

---

## 1. Registro oficial MCP (recomendado)

**URL:** https://registry.modelcontextprotocol.io

### Pré-requisitos

- Repositório no GitHub (já configurado)
- `server.json` na raiz do projeto (já incluído)
- Campo `mcpName` no `package.json` (já incluído)

### Passos

```bash
# Instalar CLI (Linux)
curl -fsSL https://raw.githubusercontent.com/modelcontextprotocol/registry/main/install.sh | sh

# Ou via Homebrew (macOS)
brew install mcp-publisher

# Na raiz do projeto
cd mcp-vysor

# Validar server.json
mcp-publisher validate

# Autenticar com GitHub (namespace io.github.glira/*)
mcp-publisher login github

# Publicar
mcp-publisher publish
```

### Publicar no npm (opcional, melhora verificação)

Para o registro validar ownership via npm:

```bash
npm login
npm publish --access public
```

Depois repita `mcp-publisher publish`.

---

## 2. GitHub Topics (faça agora — 2 minutos)

No repositório GitHub → **Settings** → ou na página principal → **About** → **Topics**:

```
mcp-server
mcp
model-context-protocol
adb
android
cursor
automation
mobile-testing
```

Isso ajuda PulseMCP, Glama e outros a indexar automaticamente.

---

## 3. Diretórios comunitários

| Diretório | URL de submissão | Método |
|-----------|------------------|--------|
| **Glama** | https://glama.ai/mcp/servers | Botão "Add Server" → URL do repo |
| **PulseMCP** | https://www.pulsemcp.com/use-cases/submit | Formulário web |
| **MCP.so** | https://github.com/chatmcp/mcpso/issues | Abrir issue com dados do servidor |
| **Smithery** | https://smithery.ai | `npx smithery mcp publish` |
| **MCP Marketplace** | https://mcp-marketplace.io | Fluxo para criadores |
| **MCPServers.org** | https://mcpservers.org/submit | Formulário web |
| **awesome-mcp-servers** | https://github.com/punkpeye/awesome-mcp-servers | Pull Request |

### Dados para copiar nas submissões

- **Nome:** MCP Vysor
- **Repo:** https://github.com/glira/mcp-vysor
- **Descrição:** MCP server for visual Android device control via ADB — screenshots, coordinate taps, UI inspection for Cursor and AI agents
- **Categoria:** Developer Tools / Mobile Testing
- **Transport:** stdio
- **Requisitos:** Node.js 18+, ADB, Android device
- **Ferramentas:** 18 tools (adb_screenshot, adb_tap, adb_ui_dump, etc.)

### Configuração Cursor (para listagens)

```json
{
  "mcpServers": {
    "vysor": {
      "command": "npx",
      "args": ["-y", "mcp-vysor"],
      "env": { "ADB_PATH": "adb" }
    }
  }
}
```

---

## 4. npm

**Pacote publicado:** https://www.npmjs.com/package/mcp-vysor  
**Versão atual:** 1.0.0

### Instalar / executar

```bash
# Sem instalar (recomendado)
npx -y mcp-vysor

# Global
npm install -g mcp-vysor
mcp-vysor
```

### Cursor

```json
{
  "mcpServers": {
    "vysor": {
      "command": "npx",
      "args": ["-y", "mcp-vysor"],
      "env": { "ADB_PATH": "adb" }
    }
  }
}
```

Publicar nova versão (mantenedor):

```bash
npm version patch
npm publish --access public --otp=CODIGO_2FA
git push && git push --tags
```

---

## 5. Checklist rápido

- [x] Código no GitHub
- [x] README e documentação
- [x] `server.json` para registro oficial
- [x] `mcpName` no package.json
- [x] Publicado no npm (`mcp-vysor`)
- [x] Topics no GitHub
- [ ] `mcp-publisher publish` (registro oficial)
- [ ] Submeter em Glama + PulseMCP
- [ ] (Opcional) PR no awesome-mcp-servers

---

## Links úteis

- [MCP Registry docs](https://modelcontextprotocol.info/tools/registry/)
- [MCP Publisher CLI](https://modelcontextprotocol.info/tools/registry/cli/)
- [Blog: MCP Registry launch](https://blog.modelcontextprotocol.io/posts/2025-09-08-mcp-registry-preview/)

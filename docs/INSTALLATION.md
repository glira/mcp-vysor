# Instalação

## Pré-requisitos

| Requisito | Versão mínima | Verificação |
|-----------|---------------|-------------|
| Node.js | 18.x | `node -v` |
| npm | 9.x | `npm -v` |
| ADB (Android Platform Tools) | 1.0.41+ | `adb version` |
| Dispositivo Android | 8.0+ | Depuração USB ativada |

### Instalar ADB

**Linux (Debian/Ubuntu):**
```bash
sudo apt install android-sdk-platform-tools
```

**macOS:**
```bash
brew install android-platform-tools
```

**Windows:**
Baixe [Android Platform Tools](https://developer.android.com/tools/releases/platform-tools) e adicione ao PATH.

### Conectar dispositivo

1. Ative **Opções do desenvolvedor** no Android
2. Ative **Depuração USB**
3. Conecte via USB ou Wi-Fi (`adb pair` / `adb connect`)
4. Aceite a autorização no dispositivo
5. Confirme: `adb devices` deve listar o serial com status `device`

## Instalar o mcp-vysor

**Pacote npm:** https://www.npmjs.com/package/mcp-vysor

### Opção A — npx (recomendado)

Sem clone nem build. Baixa e executa automaticamente:

```bash
npx -y mcp-vysor
```

Ideal para uso no Cursor e outros clientes MCP.

### Opção B — instalação global

```bash
npm install -g mcp-vysor
mcp-vysor
```

No `~/.cursor/mcp.json`, use `"command": "mcp-vysor"`.

### Opção C — clone e build (desenvolvimento)

```bash
git clone https://github.com/glira/mcp-vysor.git
cd mcp-vysor
npm install
npm run build
```

O script `prepare` executa o build automaticamente após `npm install`.

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Padrão |
|----------|-------------|-----------|--------|
| `ADB_PATH` | Não | Caminho do executável `adb` | `adb` |
| `ADB_DEVICE` | Não | Serial padrão quando há um único dispositivo implícito | auto-detecta se houver apenas 1 |

Exemplo com múltiplos dispositivos:

```bash
export ADB_DEVICE=RF8M1234567
npx -y mcp-vysor
```

## Verificação pós-instalação

```bash
# Dispositivo ADB conectado
adb devices -l

# Servidor MCP via npm (deve imprimir no stderr e aguardar stdio)
npx -y mcp-vysor
# Ctrl+C para encerrar
```

Para testar ADB a partir do clone local:

```bash
node --input-type=module -e "
  import { AdbClient } from './dist/adb.js';
  const adb = new AdbClient();
  console.log('Devices:', await adb.listDevices());
  console.log('Screen:', await adb.getScreenInfo());
"
```

Próximo passo: [Configuração no Cursor](./CURSOR.md)

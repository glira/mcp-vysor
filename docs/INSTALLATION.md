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

### Opção A — Clone e build local (recomendado para desenvolvimento)

```bash
git clone https://github.com/glira/mcp-vysor.git
cd mcp-vysor
npm install
npm run build
```

O script `prepare` executa o build automaticamente após `npm install`.

### Opção B — Instalação global via npm (quando publicado)

```bash
npm install -g mcp-vysor
```

## Variáveis de ambiente

| Variável | Obrigatória | Descrição | Padrão |
|----------|-------------|-----------|--------|
| `ADB_PATH` | Não | Caminho do executável `adb` | `adb` |
| `ADB_DEVICE` | Não | Serial padrão quando há um único dispositivo implícito | auto-detecta se houver apenas 1 |

Exemplo com múltiplos dispositivos:

```bash
export ADB_DEVICE=RF8M1234567
node dist/index.js
```

## Verificação pós-instalação

```bash
# Listar dispositivos
adb devices -l

# Testar cliente ADB do projeto
node --input-type=module -e "
  import { AdbClient } from './dist/adb.js';
  const adb = new AdbClient();
  console.log('Devices:', await adb.listDevices());
  console.log('Screen:', await adb.getScreenInfo());
"
```

Se ambos retornarem dados válidos, a instalação está correta.

Próximo passo: [Configuração no Cursor](./CURSOR.md)

# Troubleshooting

## Servidor MCP não aparece no Cursor

**Sintoma:** `vysor` não listado em Settings → MCP.

**Soluções:**

1. Confirme que editou `~/.cursor/mcp.json` (não apenas o `.example` do repo)
2. Prefira instalação via npm (recomendado):
   ```json
   "command": "npx",
   "args": ["-y", "mcp-vysor"]
   ```
3. Se usar clone local, use caminho **absoluto** para `dist/index.js` e rode `npm run build`
4. Teste manual: `npx -y mcp-vysor` (deve iniciar sem erro fatal)
5. Reinicie o Cursor completamente
6. Verifique logs em Settings → MCP → vysor → Show Output

## Erro: "Nenhum dispositivo Android conectado"

```bash
adb devices
```

- Status `unauthorized` → aceite a depuração USB no celular
- Lista vazia → cabo USB, driver (Windows) ou `adb kill-server && adb start-server`
- Wi-Fi → `adb connect IP:PORTA`

## Erro: "Multiplos dispositivos conectados"

Defina serial explícito:

```json
"env": { "ADB_DEVICE": "SEU_SERIAL" }
```

Ou passe `device_id` em cada chamada de ferramenta.

## Screenshot retorna imagem vazia ou erro

- Desbloqueie a tela do dispositivo
- Alguns apps bloqueiam `screencap` (DRM) — saia do app protegido
- Teste manual: `adb exec-out screencap -p > test.png`

## UI dump vazio ou incompleto

- `uiautomator dump` falha em alguns WebViews — use screenshot + coordenadas
- Aguarde animações terminarem antes do dump
- Apps Flutter/React Native podem expor poucos elementos nativos

## Tap não funciona / coordenadas erradas

| Causa | Solução |
|-------|---------|
| Imagem redimensionada | Use `adb_tap_from_image_coords` com `image_scale` correto |
| Rotação de tela | Chame `adb_get_screen_info` e verifique `rotation` |
| Notch/barra de status | Coordenadas são da tela física completa |
| Elemento fora da viewport | Faça scroll com `adb_swipe` antes do tap |

## `adb_input_text` digita caracteres errados

- Limitação conhecida do `input text` do ADB
- Use `adb_shell` com `am broadcast` ou clipboard para textos complexos
- Evite acentos e emojis em ROMs restritivas

## `adb_get_current_app` retorna "unknown"

- Normal em alguns launchers ou telas de bloqueio
- Use `adb_shell "dumpsys window | grep mCurrentFocus"` para diagnóstico

## Build falha no `npm install`

```bash
# Dependência nativa sharp — instale build tools se necessário
sudo apt install build-essential libvips-dev   # Linux
npm rebuild sharp
```

## Permissões Linux (udev)

Se `adb devices` não detecta USB:

```bash
# Regras udev Android (Debian/Ubuntu)
sudo apt install android-sdk-platform-tools-common
sudo usermod -aG plugdev $USER
# Reconecte o cabo após logout/login
```

## Logs do servidor

Execute manualmente para ver erros:

```bash
node dist/index.js
# Deve imprimir: mcp-vysor MCP server running on stdio
# Ctrl+C para encerrar
```

O servidor usa stdio — erros aparecem no stderr do processo spawnado pelo Cursor.

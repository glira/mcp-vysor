# Referência de Ferramentas MCP

Todas as ferramentas expostas pelo servidor `mcp-vysor`. Parâmetro comum em quase todas:

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `device_id` | `string?` | Serial ADB. Omita se houver apenas um dispositivo online. |

---

## Dispositivo e tela

### `adb_list_devices`

Lista dispositivos Android conectados via ADB.

**Parâmetros:** nenhum

**Retorno:** lista com serial, estado, model e product.

---

### `adb_get_screen_info`

Retorna dimensões e metadados da tela.

**Parâmetros:** `device_id?`

**Retorno (JSON):**
```json
{
  "width": 1080,
  "height": 2340,
  "density": 480,
  "rotation": 0
}
```

---

### `adb_screenshot`

Captura a tela e retorna **imagem PNG em base64** para visualização no Cursor.

**Parâmetros:**

| Nome | Tipo | Descrição |
|------|------|-----------|
| `device_id` | string? | Serial do dispositivo |
| `max_width` | number? | Redimensiona a imagem (útil para telas grandes) |
| `save_path` | string? | Salva PNG localmente além de retornar ao agente |

**Retorno:** conteúdo `image/png` + texto com resolução e fator de escala.

---

### `adb_screenshot_with_grid`

Igual ao screenshot, mas sobrepõe grade vermelha/amarela com coordenadas a cada N pixels.

**Parâmetros:**

| Nome | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `grid_step` | number | 100 | Espaçamento da grade em px |
| `max_width` | number? | — | Redimensionamento |
| `save_path` | string? | — | Caminho local |
| `device_id` | string? | — | Serial |

**Uso ideal:** identificar coordenadas x,y para `adb_tap`.

---

### `adb_get_current_app`

Retorna package e activity em foco.

**Parâmetros:** `device_id?`

**Retorno:**
```json
{
  "package": "com.example.app",
  "activity": "com.example.app.MainActivity"
}
```

---

## Interação por coordenadas

### `adb_tap`

Toque em coordenadas absolutas (pixels do dispositivo).

**Parâmetros:** `x` (number), `y` (number), `device_id?`

---

### `adb_tap_percent`

Toque usando porcentagem da tela (0–100).

**Parâmetros:** `percent_x`, `percent_y`, `device_id?`

**Exemplo:** centro da tela → `percent_x: 50, percent_y: 50`

---

### `adb_tap_from_image_coords`

Converte coordenadas de uma screenshot redimensionada para coordenadas reais e executa tap.

**Parâmetros:**

| Nome | Descrição |
|------|-----------|
| `x`, `y` | Coordenadas na imagem exibida |
| `image_scale` | Fator de escala (ex: 800/1080 = 0.741) |
| `device_id` | Serial opcional |

---

### `adb_swipe`

Gesto de arrastar.

**Parâmetros:** `x1`, `y1`, `x2`, `y2`, `duration_ms` (padrão 300), `device_id?`

---

### `adb_long_press`

Pressionar e segurar (swipe com mesma origem/destino).

**Parâmetros:** `x`, `y`, `duration_ms` (padrão 1000), `device_id?`

---

### `adb_get_coordinates`

Calculadora de coordenadas — não executa ação no dispositivo.

**Parâmetros (use um dos modos):**

- Modo percentual: `percent_x` + `percent_y`
- Modo bounds: `bounds` no formato `"[left,top][right,bottom]"`

---

## UI e elementos

### `adb_ui_dump`

Executa `uiautomator dump` e retorna elementos com bounds e centro.

**Parâmetros:**

| Nome | Padrão | Descrição |
|------|--------|-----------|
| `clickable_only` | false | Filtra só elementos clicáveis |
| `limit` | 50 | Máximo de elementos listados |
| `device_id` | — | Serial |

---

### `adb_find_elements`

Busca elementos por critérios semânticos.

**Parâmetros:**

| Nome | Descrição |
|------|-----------|
| `text` | Texto visível |
| `resource_id` | ID do recurso Android |
| `class_name` | Classe do componente |
| `content_desc` | Content description |
| `clickable_only` | Padrão true |
| `partial_match` | Padrão true (substring) |
| `device_id` | Serial |

**Retorno:** lista com bounds e `center=(x, y)` para cada match.

---

### `adb_tap_element`

Encontra elemento e clica no centro.

**Parâmetros:** `text?`, `resource_id?`, `content_desc?`, `index` (padrão 0), `device_id?`

Pelo menos um critério de busca é obrigatório.

---

## Entrada e navegação

### `adb_input_text`

Digita texto no campo focado. Espaços são convertidos para `%s`.

**Parâmetros:** `text`, `device_id?`

> **Limitação:** caracteres especiais e Unicode podem falhar dependendo do teclado/ROM.

---

### `adb_keyevent`

Envia evento de tecla Android.

**Parâmetros:** `key`, `device_id?`

**Valores aceitos para `key`:**

| Nome | Código |
|------|--------|
| `HOME` | 3 |
| `BACK` | 4 |
| `ENTER` | 66 |
| `DEL` | 67 |
| `MENU` | 82 |
| `RECENT` / `APP_SWITCH` | 187 |
| `VOLUME_UP` | 24 |
| `VOLUME_DOWN` | 25 |
| `POWER` | 26 |

Ou informe o código numérico diretamente.

---

### `adb_shell`

Executa comando shell arbitrário no dispositivo.

**Parâmetros:** `command`, `device_id?`

---

### `adb_start_app`

Inicia aplicativo.

**Parâmetros:** `package_name`, `activity?`, `device_id?`

Sem `activity`, usa `monkey` para abrir o launcher do app.

---

### `adb_stop_app`

Força parada de um aplicativo.

**Parâmetros:** `package_name`, `device_id?`

---

## Fluxos recomendados

### Automação visual (WebView / apps híbridos)

```
adb_screenshot_with_grid → identificar (x,y) → adb_tap
```

### Automação semântica (apps nativos)

```
adb_find_elements text="Entrar" → adb_tap_element text="Entrar"
```

### Screenshot redimensionada

```
adb_get_screen_info → adb_screenshot max_width=800 → adb_tap_from_image_coords
```

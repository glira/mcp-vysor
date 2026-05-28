#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  AdbClient,
  AdbError,
  KEY_CODES,
  findElements,
  parseUiDump,
  percentToCoordinates,
} from "./adb.js";
import { addCoordinateGrid, resizeScreenshot, scaleCoordinates } from "./image.js";

const adb = new AdbClient();

const deviceIdSchema = z
  .string()
  .optional()
  .describe("Serial do dispositivo ADB. Omita se houver apenas um conectado.");

function textResult(text: string) {
  return { content: [{ type: "text" as const, text }] };
}

function errorResult(message: string) {
  return { content: [{ type: "text" as const, text: `Erro: ${message}` }], isError: true };
}

async function imageResult(
  buffer: Buffer,
  caption: string,
  screen?: { width: number; height: number; scale?: number }
) {
  const meta = screen
    ? `\nResolucao do dispositivo: ${screen.width}x${screen.height}${
        screen.scale && screen.scale !== 1
          ? `\nImagem redimensionada (escala ${screen.scale.toFixed(3)}). Converta coordenadas da imagem para o dispositivo multiplicando por ${(1 / screen.scale).toFixed(3)}.`
          : ""
      }`
    : "";

  return {
    content: [
      {
        type: "image" as const,
        data: buffer.toString("base64"),
        mimeType: "image/png",
      },
      {
        type: "text" as const,
        text: caption + meta,
      },
    ],
  };
}

function formatElement(el: ReturnType<typeof parseUiDump>[number]): string {
  const parts = [
    `[${el.index}]`,
    el.text ? `text="${el.text}"` : null,
    el.resourceId ? `id="${el.resourceId}"` : null,
    el.contentDesc ? `desc="${el.contentDesc}"` : null,
    `class="${el.className.split(".").pop()}"`,
    `bounds=[${el.bounds.left},${el.bounds.top}][${el.bounds.right},${el.bounds.bottom}]`,
    `center=(${el.center.x}, ${el.center.y})`,
    el.clickable ? "clickable" : null,
  ].filter(Boolean);
  return parts.join(" | ");
}

const server = new McpServer({
  name: "mcp-vysor",
  version: "1.0.0",
});

server.tool(
  "adb_list_devices",
  "Lista dispositivos Android conectados via ADB",
  {},
  async () => {
    const devices = await adb.listDevices();
    if (devices.length === 0) {
      return textResult("Nenhum dispositivo conectado.");
    }
    const lines = devices.map(
      (d) =>
        `- ${d.serial} (${d.state})${d.model ? ` model=${d.model}` : ""}${d.product ? ` product=${d.product}` : ""}`
    );
    return textResult(`Dispositivos conectados:\n${lines.join("\n")}`);
  }
);

server.tool(
  "adb_get_screen_info",
  "Obtem largura, altura, densidade e rotacao da tela do dispositivo",
  { device_id: deviceIdSchema },
  async ({ device_id }) => {
    const info = await adb.getScreenInfo(device_id);
    return textResult(
      JSON.stringify(
        {
          width: info.width,
          height: info.height,
          density: info.density,
          rotation: info.rotation,
          hint: "Use estas dimensoes para converter coordenadas visuais em taps ADB.",
        },
        null,
        2
      )
    );
  }
);

server.tool(
  "adb_screenshot",
  "Captura a tela do dispositivo e retorna a imagem para visualizacao no Cursor. Inclui dimensoes para mapear coordenadas.",
  {
    device_id: deviceIdSchema,
    max_width: z
      .number()
      .int()
      .positive()
      .optional()
      .describe("Redimensiona a imagem para facilitar visualizacao. Coordenadas na imagem precisam ser convertidas."),
    save_path: z
      .string()
      .optional()
      .describe("Caminho local opcional para salvar o PNG"),
  },
  async ({ device_id, max_width, save_path }) => {
    const screen = await adb.getScreenInfo(device_id);
    const raw = await adb.screenshot(device_id);
    const { buffer, scale } = await resizeScreenshot(raw, max_width);

    if (save_path) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(save_path, buffer);
    }

    return imageResult(
      buffer,
      save_path
        ? `Screenshot salva em ${save_path}.`
        : "Screenshot capturada com sucesso.",
      { width: screen.width, height: screen.height, scale }
    );
  }
);

server.tool(
  "adb_screenshot_with_grid",
  "Captura a tela com grade de coordenadas sobreposta. Ideal para identificar posicoes x,y para cliques.",
  {
    device_id: deviceIdSchema,
    grid_step: z
      .number()
      .int()
      .positive()
      .default(100)
      .describe("Espacamento da grade em pixels (padrao: 100)"),
    max_width: z.number().int().positive().optional(),
    save_path: z.string().optional(),
  },
  async ({ device_id, grid_step, max_width, save_path }) => {
    const screen = await adb.getScreenInfo(device_id);
    const raw = await adb.screenshot(device_id);
    const withGrid = await addCoordinateGrid(raw, screen, grid_step);
    const { buffer, scale } = await resizeScreenshot(withGrid, max_width);

    if (save_path) {
      const { writeFile } = await import("node:fs/promises");
      await writeFile(save_path, buffer);
    }

    return imageResult(
      buffer,
      `Screenshot com grade (${grid_step}px). Leia as coordenadas diretamente na imagem.${save_path ? ` Salva em ${save_path}.` : ""}`,
      { width: screen.width, height: screen.height, scale }
    );
  }
);

server.tool(
  "adb_tap",
  "Clica/toca em coordenadas absolutas da tela do dispositivo (pixels)",
  {
    x: z.number().describe("Coordenada X em pixels"),
    y: z.number().describe("Coordenada Y em pixels"),
    device_id: deviceIdSchema,
  },
  async ({ x, y, device_id }) => {
    await adb.tap(x, y, device_id);
    return textResult(`Tap executado em (${Math.round(x)}, ${Math.round(y)}).`);
  }
);

server.tool(
  "adb_tap_percent",
  "Clica usando porcentagem da tela (0-100). Util quando voce sabe a posicao relativa na imagem.",
  {
    percent_x: z.number().min(0).max(100).describe("Posicao horizontal em %"),
    percent_y: z.number().min(0).max(100).describe("Posicao vertical em %"),
    device_id: deviceIdSchema,
  },
  async ({ percent_x, percent_y, device_id }) => {
    const screen = await adb.getScreenInfo(device_id);
    const coords = percentToCoordinates(percent_x, percent_y, screen);
    await adb.tap(coords.x, coords.y, device_id);
    return textResult(
      `Tap em ${percent_x}%, ${percent_y}% => (${coords.x}, ${coords.y}) [tela ${screen.width}x${screen.height}]`
    );
  }
);

server.tool(
  "adb_tap_from_image_coords",
  "Converte coordenadas de uma screenshot redimensionada para coordenadas reais do dispositivo e executa o tap",
  {
    x: z.number().describe("X na imagem exibida"),
    y: z.number().describe("Y na imagem exibida"),
    image_scale: z
      .number()
      .positive()
      .describe("Fator de escala da imagem (ex: se max_width=800 numa tela 1080px, scale=800/1080)"),
    device_id: deviceIdSchema,
  },
  async ({ x, y, image_scale, device_id }) => {
    const real = scaleCoordinates(x, y, image_scale);
    await adb.tap(real.x, real.y, device_id);
    return textResult(
      `Coordenadas convertidas: imagem(${x}, ${y}) => dispositivo(${real.x}, ${real.y}) com escala ${image_scale}`
    );
  }
);

server.tool(
  "adb_swipe",
  "Executa gesto de arrastar/deslizar na tela",
  {
    x1: z.number(),
    y1: z.number(),
    x2: z.number(),
    y2: z.number(),
    duration_ms: z.number().int().positive().default(300),
    device_id: deviceIdSchema,
  },
  async ({ x1, y1, x2, y2, duration_ms, device_id }) => {
    await adb.swipe(x1, y1, x2, y2, duration_ms, device_id);
    return textResult(
      `Swipe de (${x1}, ${y1}) para (${x2}, ${y2}) em ${duration_ms}ms.`
    );
  }
);

server.tool(
  "adb_long_press",
  "Pressiona e segura em coordenadas especificas",
  {
    x: z.number(),
    y: z.number(),
    duration_ms: z.number().int().positive().default(1000),
    device_id: deviceIdSchema,
  },
  async ({ x, y, duration_ms, device_id }) => {
    await adb.longPress(x, y, duration_ms, device_id);
    return textResult(`Long press em (${x}, ${y}) por ${duration_ms}ms.`);
  }
);

server.tool(
  "adb_input_text",
  "Digita texto no campo focado. Espacos sao convertidos automaticamente.",
  {
    text: z.string(),
    device_id: deviceIdSchema,
  },
  async ({ text, device_id }) => {
    await adb.inputText(text, device_id);
    return textResult(`Texto enviado: "${text}"`);
  }
);

server.tool(
  "adb_keyevent",
  "Envia tecla do Android. Use nome (BACK, HOME, ENTER) ou codigo numerico.",
  {
    key: z.string().describe("Nome (BACK, HOME, ENTER, RECENT) ou codigo numerico"),
    device_id: deviceIdSchema,
  },
  async ({ key, device_id }) => {
    const upper = key.toUpperCase();
    const code = KEY_CODES[upper] ?? Number(key);
    if (Number.isNaN(code)) {
      return errorResult(`Tecla invalida: ${key}. Use BACK, HOME, ENTER, RECENT ou codigo numerico.`);
    }
    await adb.keyEvent(code, device_id);
    return textResult(`Keyevent enviado: ${key} (${code})`);
  }
);

server.tool(
  "adb_ui_dump",
  "Obtem hierarquia de UI com bounds e coordenadas centrais de cada elemento",
  {
    device_id: deviceIdSchema,
    clickable_only: z.boolean().default(false),
    limit: z.number().int().positive().default(50),
  },
  async ({ device_id, clickable_only, limit }) => {
    const xml = await adb.uiDump(device_id);
    let elements = parseUiDump(xml);
    if (clickable_only) {
      elements = elements.filter((e) => e.clickable);
    }
    const shown = elements.slice(0, limit);
    const lines = shown.map(formatElement);
    return textResult(
      `${elements.length} elementos encontrados (mostrando ${shown.length}):\n\n${lines.join("\n")}`
    );
  }
);

server.tool(
  "adb_find_elements",
  "Busca elementos na UI por texto, resource-id, classe ou content-desc e retorna coordenadas",
  {
    text: z.string().optional(),
    resource_id: z.string().optional(),
    class_name: z.string().optional(),
    content_desc: z.string().optional(),
    clickable_only: z.boolean().default(true),
    partial_match: z.boolean().default(true),
    device_id: deviceIdSchema,
  },
  async ({ text, resource_id, class_name, content_desc, clickable_only, partial_match, device_id }) => {
    const xml = await adb.uiDump(device_id);
    const elements = parseUiDump(xml);
    const found = findElements(elements, {
      text,
      resourceId: resource_id,
      className: class_name,
      contentDesc: content_desc,
      clickableOnly: clickable_only,
      partial: partial_match,
    });

    if (found.length === 0) {
      return textResult("Nenhum elemento encontrado com os criterios informados.");
    }

    const lines = found.map(formatElement);
    return textResult(`${found.length} elemento(s) encontrado(s):\n\n${lines.join("\n")}`);
  }
);

server.tool(
  "adb_tap_element",
  "Encontra um elemento na UI e clica no centro dele",
  {
    text: z.string().optional(),
    resource_id: z.string().optional(),
    content_desc: z.string().optional(),
    index: z
      .number()
      .int()
      .min(0)
      .default(0)
      .describe("Indice do elemento se houver multiplos resultados"),
    device_id: deviceIdSchema,
  },
  async ({ text, resource_id, content_desc, index, device_id }) => {
    if (!text && !resource_id && !content_desc) {
      return errorResult("Informe pelo menos um criterio: text, resource_id ou content_desc.");
    }

    const xml = await adb.uiDump(device_id);
    const elements = parseUiDump(xml);
    const found = findElements(elements, {
      text,
      resourceId: resource_id,
      contentDesc: content_desc,
      clickableOnly: false,
    });

    if (found.length === 0) {
      return errorResult("Elemento nao encontrado.");
    }

    const target = found[index];
    if (!target) {
      return errorResult(`Indice ${index} invalido. Apenas ${found.length} elemento(s) encontrado(s).`);
    }

    await adb.tap(target.center.x, target.center.y, device_id);
    return textResult(
      `Tap no elemento [${index}]: ${formatElement(target)}\nCoordenadas: (${target.center.x}, ${target.center.y})`
    );
  }
);

server.tool(
  "adb_get_coordinates",
  "Calcula coordenadas absolutas a partir de porcentagem ou bounds de elemento",
  {
    percent_x: z.number().min(0).max(100).optional(),
    percent_y: z.number().min(0).max(100).optional(),
    bounds: z
      .string()
      .optional()
      .describe('Bounds no formato "[left,top][right,bottom]"'),
    device_id: deviceIdSchema,
  },
  async ({ percent_x, percent_y, bounds, device_id }) => {
    const screen = await adb.getScreenInfo(device_id);

    if (percent_x !== undefined && percent_y !== undefined) {
      const coords = percentToCoordinates(percent_x, percent_y, screen);
      return textResult(
        JSON.stringify(
          {
            method: "percent",
            input: { percent_x, percent_y },
            coordinates: coords,
            screen,
          },
          null,
          2
        )
      );
    }

    if (bounds) {
      const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
      if (!match) {
        return errorResult('Bounds invalido. Use formato "[left,top][right,bottom]"');
      }
      const left = Number(match[1]);
      const top = Number(match[2]);
      const right = Number(match[3]);
      const bottom = Number(match[4]);
      const center = {
        x: Math.round((left + right) / 2),
        y: Math.round((top + bottom) / 2),
      };
      return textResult(
        JSON.stringify(
          {
            method: "bounds",
            input: { bounds, left, top, right, bottom },
            center,
            screen,
          },
          null,
          2
        )
      );
    }

    return errorResult("Informe percent_x+percent_y ou bounds.");
  }
);

server.tool(
  "adb_get_current_app",
  "Retorna package e activity atuais na tela",
  { device_id: deviceIdSchema },
  async ({ device_id }) => {
    const app = await adb.getCurrentApp(device_id);
    return textResult(JSON.stringify(app, null, 2));
  }
);

server.tool(
  "adb_shell",
  "Executa comando shell no dispositivo Android",
  {
    command: z.string(),
    device_id: deviceIdSchema,
  },
  async ({ command, device_id }) => {
    const output = await adb.shell(command, device_id);
    return textResult(output || "(comando executado sem saida)");
  }
);

server.tool(
  "adb_start_app",
  "Inicia um aplicativo pelo package name",
  {
    package_name: z.string(),
    activity: z.string().optional(),
    device_id: deviceIdSchema,
  },
  async ({ package_name, activity, device_id }) => {
    await adb.startActivity(package_name, activity, device_id);
    return textResult(`App iniciado: ${package_name}${activity ? `/${activity}` : ""}`);
  }
);

server.tool(
  "adb_stop_app",
  "Forca parada de um aplicativo",
  {
    package_name: z.string(),
    device_id: deviceIdSchema,
  },
  async ({ package_name, device_id }) => {
    await adb.stopApp(package_name, device_id);
    return textResult(`App encerrado: ${package_name}`);
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("mcp-vysor MCP server running on stdio");
}

main().catch((error) => {
  if (error instanceof AdbError) {
    console.error(`ADB Error: ${error.message}`);
  } else {
    console.error("Fatal error:", error);
  }
  process.exit(1);
});

process.on("SIGINT", () => process.exit(0));

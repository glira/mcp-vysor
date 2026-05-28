import sharp from "sharp";
import type { ScreenInfo } from "./adb.js";

export async function addCoordinateGrid(
  imageBuffer: Buffer,
  screen: ScreenInfo,
  gridStep = 100
): Promise<Buffer> {
  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? screen.width;
  const height = metadata.height ?? screen.height;

  const svgLines: string[] = [];
  const fontSize = Math.max(10, Math.round(Math.min(width, height) / 80));

  for (let x = 0; x <= width; x += gridStep) {
    svgLines.push(
      `<line x1="${x}" y1="0" x2="${x}" y2="${height}" stroke="rgba(255,0,0,0.35)" stroke-width="1"/>`
    );
    if (x > 0 && x < width) {
      svgLines.push(
        `<text x="${x + 2}" y="${fontSize + 2}" fill="rgba(255,255,0,0.9)" font-size="${fontSize}" font-family="monospace">${x}</text>`
      );
    }
  }

  for (let y = 0; y <= height; y += gridStep) {
    svgLines.push(
      `<line x1="0" y1="${y}" x2="${width}" y2="${y}" stroke="rgba(255,0,0,0.35)" stroke-width="1"/>`
    );
    if (y > 0 && y < height) {
      svgLines.push(
        `<text x="2" y="${y + fontSize}" fill="rgba(255,255,0,0.9)" font-size="${fontSize}" font-family="monospace">${y}</text>`
      );
    }
  }

  svgLines.push(
    `<text x="4" y="${height - 8}" fill="rgba(0,255,255,0.95)" font-size="${fontSize + 2}" font-family="monospace">${width}x${height} | grid ${gridStep}px</text>`
  );

  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">${svgLines.join("")}</svg>`;

  return sharp(imageBuffer)
    .composite([{ input: Buffer.from(svg), top: 0, left: 0 }])
    .png()
    .toBuffer();
}

export async function resizeScreenshot(
  imageBuffer: Buffer,
  maxWidth?: number
): Promise<{ buffer: Buffer; scale: number }> {
  if (!maxWidth) return { buffer: imageBuffer, scale: 1 };

  const metadata = await sharp(imageBuffer).metadata();
  const width = metadata.width ?? 0;
  if (width <= maxWidth) return { buffer: imageBuffer, scale: 1 };

  const scale = maxWidth / width;
  const buffer = await sharp(imageBuffer)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png()
    .toBuffer();

  return { buffer, scale };
}

export function scaleCoordinates(
  x: number,
  y: number,
  scale: number
): { x: number; y: number } {
  if (scale === 1) return { x, y };
  return {
    x: Math.round(x / scale),
    y: Math.round(y / scale),
  };
}

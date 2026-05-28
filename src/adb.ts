import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

const execFileAsync = promisify(execFile);

export interface DeviceInfo {
  serial: string;
  state: string;
  product?: string;
  model?: string;
  device?: string;
  transport?: string;
}

export interface ScreenInfo {
  width: number;
  height: number;
  density: number;
  rotation: number;
}

export interface UiElement {
  index: number;
  text: string;
  resourceId: string;
  className: string;
  contentDesc: string;
  bounds: { left: number; top: number; right: number; bottom: number };
  center: { x: number; y: number };
  clickable: boolean;
  enabled: boolean;
  checkable: boolean;
  checked: boolean;
  focusable: boolean;
  focused: boolean;
}

export class AdbError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AdbError";
  }
}

export class AdbClient {
  private adbPath: string;
  private defaultDevice?: string;

  constructor(adbPath = process.env.ADB_PATH ?? "adb", defaultDevice?: string) {
    this.adbPath = adbPath;
    this.defaultDevice = defaultDevice ?? process.env.ADB_DEVICE;
  }

  setDefaultDevice(serial?: string): void {
    this.defaultDevice = serial;
  }

  getDefaultDevice(): string | undefined {
    return this.defaultDevice;
  }

  private deviceArgs(deviceId?: string): string[] {
    const serial = deviceId ?? this.defaultDevice;
    return serial ? ["-s", serial] : [];
  }

  async run(args: string[], deviceId?: string): Promise<string> {
    const fullArgs = [...this.deviceArgs(deviceId), ...args];
    try {
      const { stdout } = await execFileAsync(this.adbPath, fullArgs, {
        maxBuffer: 50 * 1024 * 1024,
        encoding: "utf8",
      });
      return stdout.trim();
    } catch (error: unknown) {
      const err = error as { stderr?: string; message?: string };
      throw new AdbError(
        err.stderr?.trim() || err.message || "ADB command failed"
      );
    }
  }

  async listDevices(): Promise<DeviceInfo[]> {
    const output = await this.run(["devices", "-l"]);
    const lines = output.split("\n").slice(1);
    const devices: DeviceInfo[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      const [serial, state, ...rest] = trimmed.split(/\s+/);
      if (!serial || !state || state === "offline") continue;

      const info: DeviceInfo = { serial, state };
      for (const part of rest) {
        const [key, value] = part.split(":");
        if (key === "product") info.product = value;
        if (key === "model") info.model = value;
        if (key === "device") info.device = value;
        if (key === "transport_id") info.transport = value;
      }
      devices.push(info);
    }

    return devices;
  }

  async resolveDevice(deviceId?: string): Promise<string | undefined> {
    if (deviceId) return deviceId;
    if (this.defaultDevice) return this.defaultDevice;

    const devices = await this.listDevices();
    const online = devices.filter((d) => d.state === "device");
    if (online.length === 1) return online[0].serial;
    if (online.length === 0) {
      throw new AdbError("Nenhum dispositivo Android conectado via ADB");
    }
    throw new AdbError(
      `Multiplos dispositivos conectados (${online.map((d) => d.serial).join(", ")}). Informe device_id.`
    );
  }

  async shell(command: string, deviceId?: string): Promise<string> {
    const serial = await this.resolveDevice(deviceId);
    return this.run(["shell", command], serial);
  }

  async getScreenInfo(deviceId?: string): Promise<ScreenInfo> {
    const serial = await this.resolveDevice(deviceId);
    const sizeOutput = await this.run(["shell", "wm", "size"], serial);
    const densityOutput = await this.run(["shell", "wm", "density"], serial);
    const rotationOutput = await this.run(["shell", "dumpsys", "display"], serial);

    const sizeMatch = sizeOutput.match(/Physical size:\s*(\d+)x(\d+)/);
    const overrideMatch = sizeOutput.match(/Override size:\s*(\d+)x(\d+)/);
    const densityMatch = densityOutput.match(/(?:Override|Physical) density:\s*(\d+)/);
    const rotationMatch = rotationOutput.match(/mRotation=(\d)/);

    const width = Number(overrideMatch?.[1] ?? sizeMatch?.[1] ?? 0);
    const height = Number(overrideMatch?.[2] ?? sizeMatch?.[2] ?? 0);

    return {
      width,
      height,
      density: Number(densityMatch?.[1] ?? 0),
      rotation: Number(rotationMatch?.[1] ?? 0),
    };
  }

  async screenshot(deviceId?: string): Promise<Buffer> {
    const serial = await this.resolveDevice(deviceId);
    const dir = await mkdtemp(join(tmpdir(), "mcp-vysor-"));
    const remotePath = "/sdcard/mcp_vysor_screen.png";
    const localPath = join(dir, "screen.png");

    try {
      await this.run(["shell", "screencap", "-p", remotePath], serial);
      await this.run(["pull", remotePath, localPath], serial);
      await this.run(["shell", "rm", remotePath], serial).catch(() => undefined);
      return await readFile(localPath);
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  async tap(x: number, y: number, deviceId?: string): Promise<void> {
    const serial = await this.resolveDevice(deviceId);
    await this.run(["shell", "input", "tap", String(Math.round(x)), String(Math.round(y))], serial);
  }

  async swipe(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    durationMs = 300,
    deviceId?: string
  ): Promise<void> {
    const serial = await this.resolveDevice(deviceId);
    await this.run(
      [
        "shell",
        "input",
        "swipe",
        String(Math.round(x1)),
        String(Math.round(y1)),
        String(Math.round(x2)),
        String(Math.round(y2)),
        String(Math.round(durationMs)),
      ],
      serial
    );
  }

  async longPress(x: number, y: number, durationMs = 1000, deviceId?: string): Promise<void> {
    await this.swipe(x, y, x, y, durationMs, deviceId);
  }

  async inputText(text: string, deviceId?: string): Promise<void> {
    const serial = await this.resolveDevice(deviceId);
    const escaped = text.replace(/ /g, "%s").replace(/(['"\\$`!])/g, "\\$1");
    await this.run(["shell", "input", "text", escaped], serial);
  }

  async keyEvent(keyCode: number | string, deviceId?: string): Promise<void> {
    const serial = await this.resolveDevice(deviceId);
    await this.run(["shell", "input", "keyevent", String(keyCode)], serial);
  }

  async getCurrentApp(deviceId?: string): Promise<{ package: string; activity: string }> {
    const output = await this.shell("dumpsys window", deviceId);

    for (const line of output.split("\n")) {
      if (!line.includes("mCurrentFocus")) continue;
      const match = line.match(/mCurrentFocus=Window\{[^ ]+ u\d+ ([^/]+)\/([^\s}]+)/);
      if (match) {
        return { package: match[1], activity: match[2] };
      }
    }

    for (const line of output.split("\n")) {
      if (!line.includes("mFocusedApp")) continue;
      const match = line.match(/mFocusedApp=ActivityRecord\{[^ ]+ u\d+ ([^/]+)\/([^\s}]+)/);
      if (match) {
        return { package: match[1], activity: match[2] };
      }
    }

    return { package: "unknown", activity: "unknown" };
  }

  async uiDump(deviceId?: string): Promise<string> {
    const serial = await this.resolveDevice(deviceId);
    const remotePath = "/sdcard/mcp_vysor_ui.xml";
    const dir = await mkdtemp(join(tmpdir(), "mcp-vysor-"));
    const localPath = join(dir, "ui.xml");

    try {
      await this.run(["shell", "uiautomator", "dump", remotePath], serial);
      await this.run(["pull", remotePath, localPath], serial);
      await this.run(["shell", "rm", remotePath], serial).catch(() => undefined);
      return await readFile(localPath, "utf8");
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => undefined);
    }
  }

  async install(apkPath: string, deviceId?: string): Promise<string> {
    const serial = await this.resolveDevice(deviceId);
    return this.run(["install", "-r", apkPath], serial);
  }

  async push(localPath: string, remotePath: string, deviceId?: string): Promise<string> {
    const serial = await this.resolveDevice(deviceId);
    return this.run(["push", localPath, remotePath], serial);
  }

  async pull(remotePath: string, localPath: string, deviceId?: string): Promise<string> {
    const serial = await this.resolveDevice(deviceId);
    return this.run(["pull", remotePath, localPath], serial);
  }

  async startActivity(
    packageName: string,
    activity?: string,
    deviceId?: string
  ): Promise<void> {
    const serial = await this.resolveDevice(deviceId);
    if (activity) {
      await this.run(["shell", "am", "start", "-n", `${packageName}/${activity}`], serial);
    } else {
      await this.run(["shell", "monkey", "-p", packageName, "-c", "android.intent.category.LAUNCHER", "1"], serial);
    }
  }

  async stopApp(packageName: string, deviceId?: string): Promise<void> {
    await this.shell(`am force-stop ${packageName}`, deviceId);
  }
}

export function parseBounds(bounds: string): UiElement["bounds"] | null {
  const match = bounds.match(/\[(\d+),(\d+)\]\[(\d+),(\d+)\]/);
  if (!match) return null;
  return {
    left: Number(match[1]),
    top: Number(match[2]),
    right: Number(match[3]),
    bottom: Number(match[4]),
  };
}

export function parseUiDump(xml: string): UiElement[] {
  const elements: UiElement[] = [];
  const nodeRegex = /<node\b([^>]*)\/?>/g;
  let match: RegExpExecArray | null;
  let index = 0;

  while ((match = nodeRegex.exec(xml)) !== null) {
    const attrs = match[1];
    const getAttr = (name: string): string => {
      const attrMatch = attrs.match(new RegExp(`${name}="([^"]*)"`));
      return attrMatch?.[1] ?? "";
    };

    const boundsStr = getAttr("bounds");
    const bounds = parseBounds(boundsStr);
    if (!bounds) continue;

    const center = {
      x: Math.round((bounds.left + bounds.right) / 2),
      y: Math.round((bounds.top + bounds.bottom) / 2),
    };

    elements.push({
      index: index++,
      text: getAttr("text"),
      resourceId: getAttr("resource-id"),
      className: getAttr("class"),
      contentDesc: getAttr("content-desc"),
      bounds,
      center,
      clickable: getAttr("clickable") === "true",
      enabled: getAttr("enabled") === "true",
      checkable: getAttr("checkable") === "true",
      checked: getAttr("checked") === "true",
      focusable: getAttr("focusable") === "true",
      focused: getAttr("focused") === "true",
    });
  }

  return elements;
}

export function findElements(
  elements: UiElement[],
  options: {
    text?: string;
    resourceId?: string;
    className?: string;
    contentDesc?: string;
    clickableOnly?: boolean;
    partial?: boolean;
  }
): UiElement[] {
  const { text, resourceId, className, contentDesc, clickableOnly, partial = true } = options;

  return elements.filter((el) => {
    if (clickableOnly && !el.clickable) return false;

    const matchField = (value: string, query?: string): boolean => {
      if (!query) return true;
      if (!value) return false;
      return partial
        ? value.toLowerCase().includes(query.toLowerCase())
        : value.toLowerCase() === query.toLowerCase();
    };

    return (
      matchField(el.text, text) &&
      matchField(el.resourceId, resourceId) &&
      matchField(el.className, className) &&
      matchField(el.contentDesc, contentDesc)
    );
  });
}

export const KEY_CODES: Record<string, number> = {
  HOME: 3,
  BACK: 4,
  CALL: 5,
  ENDCALL: 6,
  VOLUME_UP: 24,
  VOLUME_DOWN: 25,
  POWER: 26,
  CAMERA: 27,
  ENTER: 66,
  DEL: 67,
  MENU: 82,
  APP_SWITCH: 187,
  RECENT: 187,
};

export function percentToCoordinates(
  percentX: number,
  percentY: number,
  screen: ScreenInfo
): { x: number; y: number } {
  return {
    x: Math.round((percentX / 100) * screen.width),
    y: Math.round((percentY / 100) * screen.height),
  };
}

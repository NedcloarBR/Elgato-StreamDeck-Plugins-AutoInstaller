import fs from "node:fs";
import path from "node:path";
import type { Config, FullSettings } from "../types";
import { logger } from "../utils/logger";

export class ConfigService {
  private static configDir = path.join(process.cwd(), "config");

  private static loadCredentials(): { email: string; password: string } {
    const loginPath = path.join(this.configDir, "login.json");

    try {
      if (fs.existsSync(loginPath)) {
        const raw = fs.readFileSync(loginPath, "utf8");
        const parsed = JSON.parse(raw);
        return {
          email: parsed.email || process.env.EMAIL || "",
          password: parsed.password || process.env.PASSWORD || "",
        };
      }
    } catch (error) {
      console.warn("Could not read config/login.json:", error);
    }

    return {
      email: "",
      password: "",
    }
  }

  private static loadPluginURLs(): string[] {
    const pluginsPath = path.join(this.configDir, "plugins.json");

    try {
      if (fs.existsSync(pluginsPath)) {
        const raw = fs.readFileSync(pluginsPath, "utf8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (error) {
      console.warn("Could not read config/plugins.json:", error);
    }

    return []
  }

  private static loadSettings(): {
    headless?: boolean;
    timeout?: { navigation?: number; selector?: number; cookie?: number };
    viewport?: { width?: number; height?: number };
  } {
    const settingsPath = path.join(this.configDir, "settings.json");

    try {
      if (fs.existsSync(settingsPath)) {
        const raw = fs.readFileSync(settingsPath, "utf8");
        const parsed = JSON.parse(raw);
          const settings: {
            headless?: boolean;
            timeout?: { navigation?: number; selector?: number; cookie?: number };
            viewport?: { width?: number; height?: number };
          } = {};

          if (typeof parsed.headless === "boolean") settings.headless = parsed.headless;

          if (parsed.timeout && typeof parsed.timeout === "object") {
            settings.timeout = {};
            if (typeof parsed.timeout.navigation === "number") settings.timeout.navigation = parsed.timeout.navigation;
            if (typeof parsed.timeout.selector === "number") settings.timeout.selector = parsed.timeout.selector;
            if (typeof parsed.timeout.cookie === "number") settings.timeout.cookie = parsed.timeout.cookie;
          }

          if (parsed.viewport && typeof parsed.viewport === "object") {
            settings.viewport = {};
            if (typeof parsed.viewport.width === "number") settings.viewport.width = parsed.viewport.width;
            if (typeof parsed.viewport.height === "number") settings.viewport.height = parsed.viewport.height;
          }

          return settings;
      }
    } catch (error) {
      console.warn("Could not read config/settings.json:", error);
    }

    return {};
  }

  public static getConfig(): FullSettings {
    const credentials = this.loadCredentials();
    const settings = this.loadSettings();
    const pluginURLs = this.loadPluginURLs();

    const timeoutDefaults = {
      navigation: 30000,
      selector: 10000,
      cookie: 10000,
    };

    const viewportDefaults = { width: 1200, height: 800 };

    const cfg: Config = {
      email: credentials.email,
      password: credentials.password,
      headless: settings.headless ?? (process.env.HEADLESS !== "false"),
      timeout: {
        navigation: settings.timeout?.navigation ?? timeoutDefaults.navigation,
        selector: settings.timeout?.selector ?? timeoutDefaults.selector,
        cookie: settings.timeout?.cookie ?? timeoutDefaults.cookie,
      },
      viewport: {
        width: settings.viewport?.width ?? viewportDefaults.width,
        height: settings.viewport?.height ?? viewportDefaults.height,
      },
    };

    const errors = ConfigService.validateConfig(cfg, pluginURLs);
    if (errors.length > 0) {
      logger.error("Configuration errors found:");
      errors.forEach((e) => logger.error(`  - ${e}`));

      process.exit(1);
    }

    return { config: cfg, settings, pluginURLs };
  }
  private static validateConfig(config: Config, plugins: string[]): string[] {
    const errors: string[] = [];
    if (!config.email) {
      errors.push("Provide an email in config/login.json or set the EMAIL environment variable.");
    }
    if (!config.password) {
      errors.push("Provide a password in config/login.json or set the PASSWORD environment variable.");
    }
    if (!Array.isArray(plugins) || plugins.length === 0) {
      errors.push("Provide at least one plugin URL in config/plugins.json.");
    }
    return errors;
  }
}

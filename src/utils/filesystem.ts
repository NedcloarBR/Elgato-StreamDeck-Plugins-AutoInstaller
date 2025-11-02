import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { logger } from "./logger";

export class FileSystemHelper {
  static setupUserDataDir(): string {
    const userDataDir = path.join(
      os.tmpdir(),
      `playwright-streamdeck-${Date.now()}`
    );
    const preferencesDir = path.join(userDataDir, "Default");

    fs.mkdirSync(preferencesDir, { recursive: true });

    const preferencesDestPath = path.join(preferencesDir, "Preferences");

    try {
      const preferencesContent = JSON.stringify({
        "protocol_handler": {
          "allowed_origin_protocol_pairs": {
            "https://marketplace.elgato.com": {
              "streamdeck": true
            }
          }
        }
      }, null, 2);

      fs.writeFileSync(preferencesDestPath, preferencesContent, 'utf-8');
      logger.info(`UserData directory created at: ${userDataDir}`);
    } catch (error) {
      logger.error("Failed to create Preferences file:", error);
      throw error;
    }

    return userDataDir;
  }

  static isStreamDeckInstalled(): boolean {
    const platform = process.platform;
    logger.info("Checking for Stream Deck installation...");
    logger.debug(`Platform detected: ${platform}`);

    try {
      if (platform === "win32") {
        const paths = [
          "C:\\Program Files\\Elgato\\StreamDeck\\StreamDeck.exe",
          "C:\\Program Files (x86)\\Elgato\\StreamDeck\\StreamDeck.exe",
        ];

        for (const path of paths) {
          logger.debug(`Checking path: ${path}`);
          if (fs.existsSync(path)) {
            logger.success(`Stream Deck installation found at: "${path}"`);
            return true;
          }
        }

        logger.warn("Stream Deck not found in standard Program Files locations.");
        return false;
      }

      if (platform === "darwin") {
        const macPath = "/Applications/Stream Deck.app";
        logger.debug(`Checking path: ${macPath}`);
        if (fs.existsSync(macPath)) {
          logger.success(`Stream Deck installation found at: ${macPath}`);
          return true;
        }

        logger.warn("Stream Deck not found in /Applications.");
        return false;
      }

      logger.warn("No known Stream Deck install detection for this platform.");
      return false;
    } catch (error) {
      logger.warn("Failed to detect Stream Deck installation:", error);
      return false;
    }
  }

  static cleanupUserDataDir(userDataDir: string): void {
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true });
      logger.info("UserData directory cleaned up");
    } catch (error) {
      logger.warn("Failed to clean up userData directory:", error);
    }
  }
}

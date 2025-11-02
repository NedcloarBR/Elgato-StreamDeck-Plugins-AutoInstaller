import { config, pluginURLs } from "./config";
import { logger } from "./utils/logger";
import { FileSystemHelper } from "./utils/filesystem";
import { BrowserService } from "./services/BrowserService";
import { AuthService } from "./services/AuthService";
import { PluginScraperService } from "./services/PluginScraperService";
import path from "node:path";

// Set Playwright browsers path to local directory
const browsersPath = path.join(process.cwd(), ".playwright-browsers");
process.env.PLAYWRIGHT_BROWSERS_PATH = browsersPath;
logger.debug(`Playwright browsers path: ${browsersPath}`);

async function main() {
  let userDataDir = "";

  try {
    if (!FileSystemHelper.isStreamDeckInstalled()) {
      logger.error(
        "Stream Deck app not found. Please install the Elgato Stream Deck app before running this tool."
      );
      logger.info(
        "Download page: https://www.elgato.com/en/downloads (choose 'Stream Deck' for your OS)"
      );
      process.exit(1);
    }

    userDataDir = FileSystemHelper.setupUserDataDir();

    const browserService = new BrowserService();
    logger.info(`Headless mode: ${config.headless}`);
    await browserService.launch(userDataDir);
    const page = browserService.getPage();

    logger.info("Navigating to Elgato Marketplace...");
    await page.goto("https://marketplace.elgato.com/", {
      waitUntil: "domcontentloaded",
      timeout: config.timeout.navigation,
    });

    const authService = new AuthService(page);
    await authService.login();

    const scraperService = new PluginScraperService(page);
    const results = await scraperService.scrapeMultiple(pluginURLs);

    logger.section("Scraping Results");
    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    logger.success(`Successfully processed: ${successful} plugins`);
    if (failed > 0) {
      logger.error(`Failed to process: ${failed} plugins`);
      results
        .filter((r) => !r.success)
        .forEach((r) => {
          logger.error(`  - ${r.url}: ${r.error}`);
        });
    }

    await browserService.close();
  } catch (error) {
    logger.error("Fatal error:", error);
    process.exit(1);
  } finally {
    if (userDataDir) {
      FileSystemHelper.cleanupUserDataDir(userDataDir);
    }
  }
}

main().catch((error) => {
  logger.error("Unhandled error:", error);
  process.exit(1);
});

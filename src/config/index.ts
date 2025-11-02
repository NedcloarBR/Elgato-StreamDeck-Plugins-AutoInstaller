import type { Selectors } from "../types";
import { ConfigService } from "../services/ConfigService";

export const { config, pluginURLs } = ConfigService.getConfig();

export const selectors: Selectors = {
  cookiesButtonId: "onetrust-accept-btn-handler",
  loginButtonClassName:
    "text-body-m inline-grid grid-flow-col items-center justify-center gap-x-[var(--button-gap)] border-transparent hover:cursor-pointer focus-visible:outline-none hover:transition-colors hover:duration-100 focus-visible:ring-2 focus-visible:ring-focus-selected focus-visible:ring-offset-2 focus-visible:ring-offset-focus-inset bg-button-standard-surface-default text-button-standard-content-color hover:bg-button-standard-surface-hover active:bg-button-standard-surface-pressed rounded-[var(--button-rounding-default)] w-fit min-h-[var(--button-m-size)] px-[var(--button-m-padding-x)]",
  pluginNameClassName:
    "typography-heading-l text-content-primary text-left",
  installButtonClassName:
    "text-body-m inline-grid grid-flow-col items-center justify-center gap-x-[var(--button-gap)] border-transparent hover:cursor-pointer focus-visible:outline-none hover:transition-colors hover:duration-100 focus-visible:ring-2 focus-visible:ring-focus-selected focus-visible:ring-offset-2 focus-visible:ring-offset-focus-inset bg-button-accent-surface-default text-button-accent-content-color hover:bg-button-accent-surface-hover active:bg-button-accent-surface-pressed rounded-[var(--button-rounding-default)] w-full min-h-[var(--button-m-size)] px-[var(--button-m-padding-x)]",
};

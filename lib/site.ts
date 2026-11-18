export const SITE_NAME = "Album Bot";

export const SITE_TITLE =
  "Album Bot — make an album, with your taste in the loop";

export const SITE_DESCRIPTION =
  "An album used to take hundreds of hours and thousands of dollars. Album Bot walks you through a full, cohesive body of work for a small monthly cost. You listen and vote in a player on your own computer.";

export const SAMPLE_ALBUM_NAME = "Porch Light";

export const SAMPLE_ALBUM_URL =
  "https://porch-light-beta-sasha-bayans-projects.vercel.app";

export const SUNO_PRICING_URL = "https://suno.com/pricing";

export const X_PRICING_URL = "https://x.ai/pricing";

export const GROK_BOT_URL = "https://x.ai/bot";

export const PRICING_CHECKED_ON = "November 18, 2026";

export const DEFAULT_SITE_URL = "https://album-bot-site.vercel.app";

export const sunoFreeMonthly = 0;

export const sunoFreeCreditsPerDay = 50;

export const sunoProMonthly = 10;

export const sunoProYearlyMonthly = 8;

export const sunoPremierMonthly = 30;

export const sunoPremierYearlyMonthly = 24;

export const sunoPlatinumMonthly = 120;

export const sunoPlatinumYearlyMonthly = 100;

export const xPlusMonthly = 8;

export const xPremiumMonthly = 30;

export const xSuperMonthly = 100;

export const xUltraMonthly = 200;

export const createCredits = 10;

export const takesPerCreate = 2;

export const allInFreeMonthly = xPremiumMonthly + sunoFreeMonthly;

export const allInProMonthly = xPremiumMonthly + sunoProMonthly;

export const allInPremierMonthly = xPremiumMonthly + sunoPremierMonthly;

export const allInSuperPremierMonthly = xSuperMonthly + sunoPremierMonthly;

export const freeCreatesPerDay = sunoFreeCreditsPerDay / createCredits;

export const freeTakesPerDay = freeCreatesPerDay * takesPerCreate;

export const sunoProYearlyBilled = sunoProYearlyMonthly * 12;

export const sunoPremierYearlyBilled = sunoPremierYearlyMonthly * 12;

export const sunoPlatinumYearlyBilled = sunoPlatinumYearlyMonthly * 12;

export type CostRow = {
  id: string;
  name: string;
  monthly: number;
  detail: string;
};

export const costRows: CostRow[] = [
  {
    id: "free",
    name: "Free path",
    monthly: allInFreeMonthly,
    detail: `X Premium $${xPremiumMonthly} and Suno Free $${sunoFreeMonthly}.`,
  },
  {
    id: "pro",
    name: "Paid, Pro",
    monthly: allInProMonthly,
    detail: `X Premium $${xPremiumMonthly} and Suno Pro $${sunoProMonthly}.`,
  },
  {
    id: "premier",
    name: "Paid, Premier",
    monthly: allInPremierMonthly,
    detail: `X Premium $${xPremiumMonthly} and Suno Premier $${sunoPremierMonthly}.`,
  },
  {
    id: "super-premier",
    name: "More room",
    monthly: allInSuperPremierMonthly,
    detail: `X Super $${xSuperMonthly} and Suno Premier $${sunoPremierMonthly}.`,
  },
];

export function dollars(amount: number): string {
  const digits = String(amount);
  let grouped = "";
  let count = 0;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    if (count > 0 && count % 3 === 0) {
      grouped = `,${grouped}`;
    }
    grouped = `${digits.charAt(index)}${grouped}`;
    count += 1;
  }
  return `$${grouped}`;
}

function normalizedSiteUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return undefined;
    }
    const path = url.pathname.replace(/\/+$/, "");
    return `${url.origin}${path}`;
  } catch {
    return undefined;
  }
}

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  if (typeof configured !== "string") {
    return DEFAULT_SITE_URL;
  }
  const trimmed = configured.trim();
  if (trimmed.length === 0) {
    return DEFAULT_SITE_URL;
  }
  const normalized = normalizedSiteUrl(trimmed);
  if (!normalized) {
    return DEFAULT_SITE_URL;
  }
  return normalized;
}

export function absoluteUrl(path: string): string {
  return new URL(path, siteUrl()).href;
}

import { chromium, defineConfig } from '@playwright/test';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';

/**
 * Koncový test beží nad produkčným buildom (vite preview), naslepo, v Chromiu.
 * Spustenie: npm run test:e2e (najprv sa spraví build).
 *
 * Na tomto stroji nie je Chrome; ak Playwright nemá stiahnutú vlastnú verziu Chromia,
 * použije sa najnovší už stiahnutý build z priečinka ms-playwright (napr. z playwright-cli).
 * Vlastnú cestu možno vnútiť premennou CHROMIUM_EXE.
 */
function najdiChromium(): string | undefined {
  if (process.env.CHROMIUM_EXE) return process.env.CHROMIUM_EXE;
  const koren = process.env.PLAYWRIGHT_BROWSERS_PATH || path.join(process.env.LOCALAPPDATA ?? '', 'ms-playwright');
  if (!existsSync(koren)) return undefined;
  const kandidati = readdirSync(koren)
    .map((n) => {
      const m = /^(chromium_headless_shell|chromium)-(\d+)$/.exec(n);
      return m ? { nazov: n, druh: m[1] ?? '', cislo: Number(m[2]) } : null;
    })
    .filter((k): k is { nazov: string; druh: string; cislo: number } => k !== null)
    .sort((a, b) => b.cislo - a.cislo || (a.druh === 'chromium_headless_shell' ? -1 : 1));
  for (const k of kandidati) {
    const exe =
      k.druh === 'chromium_headless_shell'
        ? path.join(koren, k.nazov, 'chrome-headless-shell-win64', 'chrome-headless-shell.exe')
        : path.join(koren, k.nazov, 'chrome-win64', 'chrome.exe');
    if (existsSync(exe)) return exe;
  }
  return undefined;
}

function predvoleneChromiumExistuje(): boolean {
  try {
    // Ak Playwright vie spustiť svoju predvolenú verziu, nič nevnucujeme.
    return existsSync(chromium.executablePath());
  } catch {
    return false;
  }
}

const executablePath = predvoleneChromiumExistuje() ? undefined : najdiChromium();

export default defineConfig({
  testDir: 'e2e',
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4177',
    browserName: 'chromium',
    headless: true,
    locale: 'sk-SK',
    viewport: { width: 1280, height: 900 },
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  webServer: {
    command: 'npx vite preview --port 4177 --strictPort --host 127.0.0.1',
    url: 'http://127.0.0.1:4177',
    reuseExistingServer: true,
    timeout: 60_000,
  },
});

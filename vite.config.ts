/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const koren = path.dirname(fileURLToPath(import.meta.url));

// Ktorý tréning sa zabalí do buildu. Predvolene verejné demo (src/data/demo).
// Klientsky tréning: TRENING_DIR=treningy_klientov/<firma> (pozri docs/NASADENIE.md).
const jeKlient = Boolean(process.env.TRENING_DIR);
const treningDir = process.env.TRENING_DIR
  ? path.resolve(process.cwd(), process.env.TRENING_DIR)
  : path.resolve(koren, 'src/data/demo');

const vystupDir = process.env.VYSTUP_DIR ? path.resolve(process.cwd(), process.env.VYSTUP_DIR) : 'dist';

// Z public/ ide do klientskeho buildu len ikona. CNAME, robots.txt, sitemap.xml, og.png, img/,
// 404.html a ukazka/ patria verejnému webu a klientovi by len prezradili, odkiaľ tréning je.
const IKONY_PRE_KLIENTA = ['favicon.svg', 'favicon.ico', 'apple-touch-icon.png'];

// Blok v index.html s popisom, canonical, náhľadom odkazu a JSON-LD verejného webu.
const BLOK_VEREJNY = /[ \t]*<!-- verejny web: zaciatok[\s\S]*?<!-- verejny web: koniec -->\r?\n?/;
const ZNACKY_BLOKU = /[ \t]*<!-- verejny web: (zaciatok|koniec)[^>]*-->\r?\n?/g;

function escHtml(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Názov klientskeho tréningu pre <title> (rovnaký export ako pri validácii scenárov). */
async function nazovTreningu(): Promise<string> {
  try {
    const { tsImport } = await import('tsx/esm/api');
    const modul = await tsImport(pathToFileURL(path.join(treningDir, 'index.ts')).href, import.meta.url);
    const trening = modul.trening ?? modul.default;
    if (typeof trening?.nazov === 'string' && trening.nazov.trim()) return trening.nazov.trim();
  } catch (chyba) {
    console.warn(`Názov tréningu sa nepodarilo načítať (${String(chyba)}), titulok bude všeobecný.`);
  }
  return 'Tréning';
}

/**
 * Verejný build: index.html ostáva, ako je (bez pomocných značiek bloku).
 * Klientsky build: bez bloku verejného webu, s titulkom tréningu a noindex,
 * z public/ len ikony.
 */
function hlavickaPodlaBuildu(): Plugin {
  return {
    name: 'chyby-hlavicka-podla-buildu',
    transformIndexHtml: {
      order: 'pre',
      async handler(html) {
        if (!jeKlient) return html.replace(ZNACKY_BLOKU, '');
        const titulok = `<title>${escHtml(await nazovTreningu())}</title>\n    <meta name="robots" content="noindex, nofollow" />`;
        // Funkcia ako náhrada: znak $ v názve tréningu sa neberie ako vzor.
        return html.replace(BLOK_VEREJNY, '').replace(/<title>[\s\S]*?<\/title>/, () => titulok);
      },
    },
    generateBundle() {
      if (!jeKlient) return;
      for (const subor of IKONY_PRE_KLIENTA) {
        const cesta = path.join(koren, 'public', subor);
        if (existsSync(cesta)) this.emitFile({ type: 'asset', fileName: subor, source: readFileSync(cesta) });
      }
    },
  };
}

/** Písma pre text nad zlomom (latinka a slovenská diakritika): bez nich hero pri pomalom pripojení poskočí. */
const PISMA_NA_PREDNACITANIE = [
  /ibm-plex-sans-latin-wght-normal-[\w-]+\.woff2$/,
  /ibm-plex-sans-latin-ext-wght-normal-[\w-]+\.woff2$/,
  /ibm-plex-mono-latin-500-normal-[\w-]+\.woff2$/,
  /ibm-plex-mono-latin-ext-500-normal-[\w-]+\.woff2$/,
];

/** Pri builde doplní do hlavičky preload hlavných písiem (názvy súborov majú hash, preto až z bundla). */
function prednacitajPisma(): Plugin {
  return {
    name: 'chyby-prednacitaj-pisma',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const subory = Object.keys(ctx.bundle ?? {}).filter((f) => PISMA_NA_PREDNACITANIE.some((vzor) => vzor.test(f)));
        return subory.map((f) => ({
          tag: 'link',
          attrs: { rel: 'preload', href: `./${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

export default defineConfig({
  plugins: [react(), hlavickaPodlaBuildu(), prednacitajPisma()],
  // Režim známy pri preklade (deklarácia v src/vite-env.d.ts). V klientskom builde sú vetvy
  // predajného webu mŕtvy kód a Rollup ich vypustí; platí aj pre vitest.
  define: {
    __KLIENT__: JSON.stringify(jeKlient),
  },
  // Relatívne cesty: build funguje aj z podpriečinka na statickom hostingu.
  base: './',
  resolve: {
    alias: {
      '@trening': treningDir,
    },
  },
  build: {
    outDir: vystupDir,
    emptyOutDir: true,
    // Klientsky build kopíruje z public/ len ikony (plugin vyššie).
    copyPublicDir: !jeKlient,
    // Klientsky build: moduly predajného webu, konfigurácie a ukážky nemajú pri importe vedľajšie
    // účinky. Keď sa ich exporty nepoužijú (vetvy s __KLIENT__), vypadnú celé, aj s výpočtami
    // na najvyššej úrovni (napr. hľadanie balíčka v zozname cien).
    ...(jeKlient
      ? {
          rolldownOptions: {
            treeshake: {
              moduleSideEffects: [{ test: /[\\/]src[\\/](web|config|demo)[\\/][^\\/]+\.tsx?$/, sideEffects: false }],
            },
          },
        }
      : {}),
  },
  server: {
    port: 5177,
    strictPort: false,
  },
  preview: {
    port: 4177,
  },
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
  },
});

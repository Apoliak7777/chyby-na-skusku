/// <reference types="vite/client" />

/**
 * Režim buildu známy už pri preklade (vite.config.ts → define). true = klientsky tréning
 * (TRENING_DIR je nastavený). Vetvy podmienené touto konštantou Rollup z klientskeho buildu
 * vypustí, takže sa doň nedostane predajný web, cenník ani kontakt poskytovateľa.
 */
declare const __KLIENT__: boolean;

import type { Trening } from '../types';
import { slubenyTermin } from './scenar1_slubeny_termin';
import { kusyAleboBalenia } from './scenar2_kusy_alebo_balenia';
import { zmenaAdresy } from './scenar3_zmena_adresy';

/**
 * Verejné demo: vymyslená firma DEMO DISTRIBÚCIA, tri situácie pre príjem objednávok.
 * Do buildu sa dostáva cez alias @trening (vite.config.ts). Klientsky tréning má
 * rovnaký tvar v samostatnom priečinku mimo repozitára (docs/NASADENIE.md).
 */
export const trening: Trening = {
  id: 'demo-distribucia',
  verzia: '1.1',
  nazov: 'Príjem objednávok: ukážkový tréning',
  pozicia: 'Pracovník príjmu objednávok vo veľkoobchode',
  rezim: 'demo',
  znacka: {
    nazovFirmy: 'DEMO DISTRIBÚCIA',
    jeModelova: true,
  },
  upozornenie: 'Výsledky ukážky sú len v otvorenej stránke a po jej obnovení zmiznú. Nič sa neukladá ani neposiela.',
  scenare: [slubenyTermin, kusyAleboBalenia, zmenaAdresy],
};

export default trening;

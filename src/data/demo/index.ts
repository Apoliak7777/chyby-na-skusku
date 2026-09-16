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
  verzia: '1.0',
  nazov: 'Príjem objednávok – ukážkový tréning',
  pozicia: 'Pracovník príjmu objednávok vo veľkoobchode',
  rezim: 'demo',
  znacka: {
    nazovFirmy: 'DEMO DISTRIBÚCIA',
    jeModelova: true,
    oznacenie: 'vymyslená firma pre ukážku – všetky mená, produkty a sumy sú modelové',
  },
  upozornenie:
    'Postup sa drží len v tejto karte prehliadača. Po obnovení stránky začnete odznova. Nič sa neposiela na server a nikto vás nežiada o meno.',
  scenare: [slubenyTermin, kusyAleboBalenia, zmenaAdresy],
};

export default trening;

import { useSyncExternalStore } from 'react';

/**
 * Malý hash router. Bez závislostí, funguje z ľubovoľného podpriečinka statického hostingu.
 *
 *   #/            → predajný web (rovnako prázdny hash)
 *   #cennik       → predajný web + posun na prvok s id „cennik“
 *   #/demo        → prehľad situácií
 *   #/demo/<id>   → prehrávač scenára (voliteľne ?prva=<id možnosti>)
 *   #/demo/prehlad → prehľad tréningu na tlač
 */

export interface Trasa {
  /** Napr. '/', '/demo', '/demo/slubeny-termin'. */
  cesta: string;
  params: URLSearchParams;
  /** Kotva na predajnom webe (id sekcie), inak null. */
  kotva: string | null;
}

export function parsujHash(hash: string): Trasa {
  const bezMriezky = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!bezMriezky.startsWith('/')) {
    return { cesta: '/', params: new URLSearchParams(), kotva: bezMriezky ? decodeURIComponent(bezMriezky) : null };
  }
  const [cestaCast, dotaz = ''] = bezMriezky.split('?', 2) as [string, string?];
  const cesta = cestaCast.length > 1 ? cestaCast.replace(/\/+$/, '') : cestaCast;
  return { cesta, params: new URLSearchParams(dotaz), kotva: null };
}

function precitajHash(): string {
  return typeof window === 'undefined' ? '' : window.location.hash;
}

function prihlas(callback: () => void): () => void {
  window.addEventListener('hashchange', callback);
  return () => window.removeEventListener('hashchange', callback);
}

export function useTrasa(): Trasa {
  const hash = useSyncExternalStore(prihlas, precitajHash, () => '');
  return parsujHash(hash);
}

export function chodNa(cesta: string): void {
  window.location.hash = cesta.startsWith('#') ? cesta : `#${cesta}`;
}

export const CESTY = {
  web: '#/',
  demo: '#/demo',
  prehlad: '#/demo/prehlad',
  scenar: (id: string, prva?: string) => `#/demo/${id}${prva ? `?prva=${encodeURIComponent(prva)}` : ''}`,
} as const;

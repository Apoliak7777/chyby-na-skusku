import { expect, test, type Page } from '@playwright/test';

/**
 * Koncový test ukážky (prehrávač) nad produkčným buildom: vstup z náhľadu s už zvolenou chybou
 * (aj keď situácia už má iný pokus), spätná väzba, oprava, súhrn s blokom pre majiteľa a typickou
 * chybou, návrat ku kroku, číselný vstup, „Čo uvidí vedúci“ aj v tlači, mobil 360 a 390 px,
 * pohyb (súhrn hotový do 1,5 s, bez posunu rozloženia) a reduced motion (nič skryté).
 * Predajnú stránku testuje e2e/web.spec.ts. Testy prejdú s reducedMotion 'reduce' aj bez neho.
 * Zbiera chyby konzoly a stránky; na konci nesmie byť žiadna.
 */

function sledujChyby(page: Page): string[] {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') chyby.push(`console: ${m.text()}`);
  });
  return chyby;
}

/** Pravidlá obsahu: nič „odoslané“, nič zadarmo, bez dekoratívnych pomlčiek a opakovaných upozornení. */
async function overPravidlaTextu(page: Page) {
  const text = await page.locator('main').innerText();
  const maly = text.toLowerCase();
  expect(maly).not.toContain('odoslan');
  expect(maly).not.toContain('zadarmo');
  expect(maly).not.toContain('bezplatn');
  expect(maly).not.toContain('modelový zákazník');
  expect(maly).not.toContain('certifikácia');
  expect(maly).not.toContain('ilustračn');
  expect(text).not.toMatch(/ [–—] /);
}

test('chybná voľba z náhľadu, oprava, súhrn s blokom pre majiteľa a návrat ku kroku', async ({ page }) => {
  const chyby = sledujChyby(page);

  await page.goto('/#/demo/slubeny-termin?prva=s1-start-potvrdit');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sľúbený termín');
  await expect(page.getByText('Spätná väzba na vaše rozhodnutie')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Sklad volá' })).toBeVisible();
  await expect(page.getByText('Rozhodnutie č. 2')).toBeVisible();
  await expect(page.locator('.doterajsie')).toContainText('Potvrdiť piatok. Na sklade je 12 kusov.');
  await overPravidlaTextu(page);

  // Oprava po spätnej väzbe a pokračovanie správnou cestou.
  await page.getByRole('button', { name: /Zavolať zákazníkovi a povedať mu skutočný stav/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Návrh zákazníkovi po telefonáte' })).toBeVisible();
  await page.getByRole('button', { name: /Poslať zákazníkovi porovnanie/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Písomné potvrdenie zákazníka' })).toBeVisible();
  await page.getByRole('button', { name: /Rezervovať 8 kusov L-240B a poslať/ }).click();

  // Súhrn: verdikt dostane fokus, hneď pod ním blok pre majiteľa.
  const verdikt = page.getByRole('heading', { level: 2, name: 'Zvládnuté po oprave' });
  await expect(verdikt).toBeVisible();
  await expect(verdikt).toBeFocused();
  await expect(page.getByText('Náklad tohto postupu')).toHaveCount(0);

  const blok = page.locator('.majitel');
  await expect(blok.getByRole('heading', { name: 'Toto bola vymyslená firma. Ktorá chyba sa opakuje u vás?' })).toBeVisible();
  await expect(blok).toContainText('Tri situácie za 690 €');
  await expect(blok.getByRole('link', { name: 'Napísať jednou vetou' })).toHaveAttribute('href', /^mailto:info@chybynaskusku\.online\?subject=/);
  await expect(blok.getByRole('link', { name: 'Čo je v cene' })).toHaveAttribute('href', '#cennik');
  await expect(blok.getByRole('link', { name: 'Poslať odkaz vedúcemu' })).toHaveAttribute('href', /^mailto:\?subject=/);
  await expect(blok.getByText('Otvorí sa váš e-mail. Zo stránky sa nič neodosiela.')).toBeVisible();

  // Typická chyba sa ukáže aj po pokuse, ktorý ju neurobil.
  const typicka = page.locator('.typicka');
  await expect(typicka.getByRole('heading', { name: 'Typická chyba nováčika v tejto situácii a čo spôsobí' })).toBeVisible();
  await expect(page.locator('main')).not.toContainText('Najčastejšia');
  await expect(typicka).toContainText('Potvrdiť piatok. Na sklade je 12 kusov.');
  await expect(typicka).toContainText('120 € navyše (modelová suma)');

  // Podrobnosti pre vedúceho sú zbalené; po rozbalení tabuľka bodov a rozhodnutia s návratom.
  const podrobnosti = page.locator('details.podrobnosti');
  await expect(page.locator('.body-tabulka')).toBeHidden();
  await podrobnosti.getByText('Podrobnosti pre vedúceho').click();
  await expect(page.locator('.body-tabulka').getByText('opravené po spätnej väzbe').first()).toBeVisible();
  await expect(page.locator('.body-tabulka')).toContainText('Zdroj: Pravidlá firmy, bod 1.');
  await overPravidlaTextu(page);

  // Návrat k prvému rozhodnutiu odstráni celú vetvu.
  await page.getByRole('button', { name: 'Vrátiť sa k rozhodnutiu č. 1' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Otázka zákazníka' })).toBeVisible();
  await expect(page.getByText('Rozhodnutie č. 1')).toBeVisible();

  // Pri prvom rozhodnutí panel neprezrádza voľnú zásobu (desktop: panel je vedľa).
  await expect(page.getByRole('tab', { name: /Skladový prehľad/ })).toHaveAttribute('aria-selected', 'false');
  await expect(page.locator('.prehravac__bok [role="tabpanel"]:visible')).not.toContainText('Voľné');

  // Správna cesta bez chyby: typická chyba sa ukáže aj tak.
  await page.getByRole('button', { name: 'Odpovedať až po kontrole rezervácií.' }).click();
  await page.getByRole('button', { name: '3 kusy.', exact: true }).click();
  await page.getByRole('button', { name: /Poslať zákazníkovi porovnanie/ }).click();
  await page.getByRole('button', { name: /Rezervovať 8 kusov L-240B a poslať/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeFocused();
  await expect(page.locator('.typicka')).toBeVisible();
  await page.getByText('Podrobnosti pre vedúceho').click();
  await expect(page.locator('.body-tabulka').getByText('správne na prvý pokus')).toHaveCount(4);
  await expect(page.getByRole('link', { name: /Ďalšia situácia: Kusy alebo balenia/ })).toBeVisible();

  expect(chyby).toEqual([]);
});

test('druhá situácia: číselný vstup, chyba s nákladom, nový pokus a hodnota mimo rozsahu', async ({ page }) => {
  const chyby = sledujChyby(page);

  await page.goto('/#/demo/kusy-alebo-balenia');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kusy alebo balenia');
  await page.getByRole('button', { name: /Pozrieť produktovú kartu K-6/ }).click();
  await page.getByLabel('Množstvo (bal)').fill('18');
  await expect(page.getByText('Prepočet: 18 bal = 108 ks · 1 512 €')).toBeVisible();
  await page.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await expect(page.getByText('Zadané množstvo: 18 bal')).toBeVisible();
  // Rekapitulácia ukazuje 108 ks a 1 512 €; možnosti samy nič neprezrádzajú.
  await expect(page.locator('.uzol .zaznam')).toContainText('108 ks');
  for (const text of await page.locator('.moznost').allInnerTexts()) expect(text).not.toMatch(/€|108|nesedí/);
  await page.getByRole('button', { name: 'Potvrdiť objednávku.', exact: true }).click();

  await expect(page.getByRole('heading', { level: 2, name: 'Chyba s následkom' })).toBeFocused();
  await expect(page.locator('.verdikt')).toContainText('Náklad tohto postupu: 45 € (modelová suma)');
  await expect(page.locator('.typicka')).toContainText('dobropis a nová faktúra');
  await expect(page.locator('.typicka')).toContainText('Váš pokus skončil rovnako.');
  await expect(page.locator('.majitel')).toBeVisible();
  await overPravidlaTextu(page);

  await page.getByRole('button', { name: 'Skúsiť situáciu znova' }).click();
  await expect(page.getByText('Rozhodnutie č. 1')).toBeVisible();
  await expect(page.locator('.predchadzajuci')).toContainText(
    'Predchádzajúci pokus: Chyba s následkom. Body: správne na prvý pokus 1, opravené 0, nevyriešené 2. Náklad 45 € (modelová suma).',
  );
  await expect(page.getByText('Zadané množstvo: 18 bal')).toHaveCount(0);

  await page.getByRole('button', { name: /Pozrieť produktovú kartu K-6/ }).click();
  await page.getByLabel('Množstvo (bal)').fill('0');
  await page.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await expect(page.getByRole('alert')).toContainText('od 1 do 99');
  await page.getByLabel('Množstvo (bal)').fill('3');
  await expect(page.getByText('Prepočet: 3 bal = 18 ks · 252 €')).toBeVisible();
  await page.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await page.getByRole('button', { name: 'Potvrdiť objednávku.', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeVisible();

  expect(chyby).toEqual([]);
});

test('posledná situácia a „Čo uvidí vedúci“: blok pre majiteľa ako hlavná akcia, automatický záver', async ({ page }) => {
  const chyby = sledujChyby(page);

  // Situácia 1 s chybou s následkom.
  await page.goto('/#/demo/slubeny-termin?prva=s1-start-potvrdit');
  await page.getByRole('button', { name: /Objednať chýbajúce kusy expresne/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Chyba s následkom' })).toBeVisible();

  // Situácia 3 bez chyby: na konci je blok pre majiteľa hlavnou akciou.
  await page.goto('/#/demo/zmena-adresy');
  await page.getByRole('button', { name: /Overiť objednávku D-1042 a kontaktnú osobu/ }).click();
  await page.getByRole('button', { name: /Zavolať na sklad a zastaviť expedíciu/ }).click();
  await page.getByRole('button', { name: 'Zmeniť dodaciu adresu a požiadať sklad o výmenu štítku.', exact: true }).click();
  await page.getByRole('button', { name: /Odpovedať pani Kováčovej/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeFocused();
  await expect(page.locator('.majitel')).toHaveClass(/majitel--hlavny/);
  await expect(page.locator('.majitel').getByRole('link', { name: 'Napísať jednou vetou' })).toHaveClass(/tlacidlo--velke/);
  await expect(page.getByRole('link', { name: 'Prehľad celého tréningu' })).toHaveClass(/tlacidlo--druhotne/);

  await page.goto('/#/demo/prehlad');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Čo uvidí vedúci');
  const zaver = page.locator('.zaver-prehladu');
  await expect(zaver).toContainText('2 z 3');
  await expect(zaver.getByRole('heading', { name: 'Prebrať s pracovníkom' })).toBeVisible();
  const bod = zaver.locator('.zaver-prehladu__body li').filter({ hasText: 'Overil voľnú zásobu pred prísľubom termínu' });
  await expect(bod.locator('.zaver-prehladu__situacia')).toHaveText('Situácia 1: Sľúbený termín');
  await expect(zaver).not.toContainText(') (');
  await expect(
    page.getByText('Nový človek si na konci súhrn vytlačí alebo uloží ako PDF a pošle vám ho. Tréning sám nič neukladá ani neposiela.'),
  ).toBeVisible();
  await expect(page.locator('.prehlad > .tlmeny .bez-zlomu')).toHaveCSS('white-space', 'nowrap');
  await expect(page.locator('.majitel').getByRole('link', { name: 'Napísať jednou vetou' })).toBeVisible();
  await page.getByLabel('Meno pracovníka (len na výtlačok, nikam sa neposiela)').fill('Jana Testová');
  await expect(page.locator('.prehlad__pracovnik')).toHaveText('Pracovník: Jana Testová');
  await expect(page.getByText('Zatiaľ nedokončené.')).toHaveCount(1);
  await expect(page.getByText('Výsledok: Chyba s následkom')).toBeVisible();
  await overPravidlaTextu(page);

  expect(chyby).toEqual([]);
});

test('prehľad situácií: názov, odhad času, štítok pri prvej situácii, bez žltého upozornenia', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.goto('/#/demo');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Príjem objednávok: ukážkový tréning');
  await expect(page.getByText('Prvá situácia trvá asi 3 minúty, ďalšie dve sú nepovinné.', { exact: false })).toBeVisible();
  await expect(page.getByText('U vás by to boli vaše produkty a vaše pravidlá.')).toBeVisible();
  await expect(page.locator('.karta').first().getByText('Začnite tu')).toBeVisible();
  await expect(page.getByText('Začnite tu')).toHaveCount(1);
  await expect(page.locator('.upozornenie')).toHaveCount(0);
  await expect(
    page.locator('main').getByText('Výsledky ukážky sú len v otvorenej stránke a po jej obnovení zmiznú. Nič sa neukladá ani neposiela.'),
  ).toHaveCount(1);
  await expect(page.locator('.karta__stav').first()).toHaveText('Stav: Nezačaté');
  await expect(page.locator('main').getByRole('link', { name: 'Čo uvidí vedúci' })).toHaveAttribute('href', '#/demo/prehlad');
  await overPravidlaTextu(page);
  expect(chyby).toEqual([]);
});

test('mobil 360 px: bez vodorovného pretekania, podklady za prepínačom, tabuľky ako karty', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.setViewportSize({ width: 360, height: 740 });

  const overSirku = async (kde: string) => {
    const s = await page.evaluate(() => ({ dokument: document.documentElement.scrollWidth, okno: window.innerWidth }));
    expect(s.dokument, `pretekanie: ${kde}`).toBeLessThanOrEqual(s.okno);
  };

  for (const cesta of ['/#/demo', '/#/demo/zmena-adresy', '/#/demo/kusy-alebo-balenia', '/#/demo/prehlad']) {
    await page.goto(cesta);
    await page.waitForLoadState('networkidle');
    await overSirku(cesta);
  }

  // Podklady sú za prepínačom; skladová tabuľka sa zmestí bez orezania.
  await page.goto('/#/demo/slubeny-termin');
  await expect(page.getByRole('tab', { name: /E-mail zákazníka/ })).toBeHidden();
  await page.getByRole('button', { name: 'Podklady (4)' }).click();
  await expect(page.getByRole('tab', { name: /E-mail zákazníka/ })).toBeVisible();
  await page.getByRole('tab', { name: /Skladový prehľad/ }).click();
  const panel = page.locator('.prehravac__bok [role="tabpanel"]:visible');
  await expect(panel).toContainText('Voľné');
  const tabulka = await panel.locator('.tabulka-obal').evaluate((o) => ({ obsah: o.scrollWidth, sirka: o.clientWidth }));
  expect(tabulka.obsah).toBeLessThanOrEqual(tabulka.sirka);
  await overSirku('podklady otvorené');
  await page.getByRole('button', { name: 'Skryť podklady' }).click();

  // Súhrn s rozbalenými podrobnosťami: kontrolné body ako karty, nič nepreteká.
  await page.getByRole('button', { name: 'Potvrdiť piatok. Na sklade je 12 kusov.' }).click();
  await page.getByRole('button', { name: /Objednať chýbajúce kusy expresne/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Chyba s následkom' })).toBeFocused();
  const verdikt = await page.locator('.verdikt').boundingBox();
  expect(verdikt && verdikt.y >= 0 && verdikt.y < 740).toBe(true);
  await page.getByText('Podrobnosti pre vedúceho').click();
  await expect(page.locator('.body-tabulka tbody tr').first()).toHaveCSS('display', 'block');
  await overSirku('súhrn s podrobnosťami');

  expect(chyby).toEqual([]);
});

test('mobil 390 px: e-mail zákazníka a prvá voľba hneď na prvej obrazovke', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/demo/slubeny-termin');
  const email = await page.locator('.email').first().boundingBox();
  const prva = await page.locator('.moznost').first().boundingBox();
  expect(email && email.y < 844).toBe(true);
  expect(prva && prva.y + prva.height <= 844).toBe(true);
});

test('klávesnica: rozhodnutie sa dá zvoliť Tabom a Enterom, fokus ide na nový uzol', async ({ page }) => {
  await page.goto('/#/demo/zmena-adresy');
  await expect(page.getByRole('heading', { level: 2, name: 'Žiadosť o zmenu adresy' })).toBeVisible();
  const prva = page.getByRole('button', { name: /Overiť objednávku D-1042 a kontaktnú osobu/ });
  await prva.focus();
  await expect(prva).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Objednávka overená' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Objednávka overená' })).toBeFocused();
  await page.keyboard.press('Tab');
  const aktivny = await page.evaluate(() => document.activeElement?.tagName);
  expect(aktivny).toBe('BUTTON');
});

test('voľba z adresy: iný alebo dokončený pokus ustúpi čistému pokusu, Späť voľbu znova nepoužije', async ({ page }) => {
  const chyby = sledujChyby(page);
  const nadpisKroku = (nazov: string) => page.getByRole('heading', { level: 2, name: nazov });

  // A z náhľadu, potom B z náhľadu: rozpracovaný pokus s A nesmie ukázať spätnú väzbu po správnej odpovedi.
  await page.goto('/#/demo/slubeny-termin?prva=s1-start-potvrdit');
  await expect(nadpisKroku('Sklad volá')).toBeVisible();
  await page.goto('/#/demo/slubeny-termin?prva=s1-start-overit');
  await expect(nadpisKroku('Skladový prehľad')).toBeVisible();
  await expect(page.getByText('Spätná väzba na vaše rozhodnutie')).toHaveCount(0);
  await expect(page.locator('.doterajsie .cesta__polozka')).toHaveCount(1);
  await expect(page.locator('.doterajsie')).toContainText('Odpovedať až po kontrole rezervácií.');

  // Dokončený pokus s A: voľba B ukáže druhé rozhodnutie, nie starý súhrn.
  await page.goto('/#/demo/slubeny-termin?prva=s1-start-potvrdit');
  await expect(nadpisKroku('Sklad volá')).toBeVisible();
  await page.getByRole('button', { name: /Objednať chýbajúce kusy expresne/ }).click();
  await expect(nadpisKroku('Chyba s následkom')).toBeVisible();
  await page.goto('/#/demo/slubeny-termin?prva=s1-start-overit');
  await expect(nadpisKroku('Skladový prehľad')).toBeVisible();

  // Späť v prehliadači: adresa má znova ?prva=, ale voľba sa druhýkrát nepoužije.
  await page.goBack();
  await expect(page).toHaveURL(/prva=s1-start-potvrdit/);
  await expect(nadpisKroku('Skladový prehľad')).toBeVisible();

  expect(chyby).toEqual([]);
});

test('prehrávač: šírka ako hlavička, neutrálny hover, podklady bez prázdnej karty, hlavička e-mailu v mriežke', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 900 });
  await page.goto('/#/demo/slubeny-termin');

  const prehravac = await page.locator('.prehravac').boundingBox();
  const obal = await page.locator('.hlavicka .obal').boundingBox();
  expect(Math.round(prehravac?.x ?? 0)).toBe(Math.round(obal?.x ?? -1));
  expect(Math.round(prehravac?.width ?? 0)).toBe(Math.round(obal?.width ?? -1));

  // Zmenu kroku ohlási presun fokusu, sekcia kroku nie je živý región.
  await expect(page.locator('.uzol')).not.toHaveAttribute('aria-live');

  // Prechod myšou nefarbí možnosť na zeleno (zelená = správne).
  const moznost = page.locator('.moznost').first();
  await moznost.hover();
  await expect(moznost).toHaveCSS('border-color', 'rgb(19, 32, 47)');
  await expect(moznost.locator('.moznost__pismeno')).not.toHaveCSS('background-color', 'rgb(11, 107, 87)');

  // E-mail je vložený v kroku: panel ukáže len poznámku bez karty, záložky sú v dvoch stĺpcoch.
  const panel = page.locator('.prehravac__bok [role="tabpanel"]:visible');
  await expect(panel).toHaveClass(/podklady__panel--vlozeny/);
  await expect(panel).toHaveCSS('border-top-width', '0px');
  const stlpce = await page.locator('.prehravac__bok .podklady__zalozky').evaluate((e) => getComputedStyle(e).gridTemplateColumns.split(' ').length);
  expect(stlpce).toBe(2);

  // Hlavička e-mailu: popis | hodnota, kódy a „s. r. o.“ sa nelámu.
  const hlavickaMailu = page.locator('.uzol .email__hlavicka');
  await expect(hlavickaMailu).toHaveCSS('display', 'grid');
  const xHodnot = await hlavickaMailu
    .locator('.email__riadok > :nth-child(2)')
    .evaluateAll((hodnoty) => hodnoty.map((h) => Math.round(h.getBoundingClientRect().left)));
  expect(xHodnot.length).toBeGreaterThan(2);
  expect(new Set(xHodnot).size).toBe(1);
  await expect(hlavickaMailu).toContainText('Dielne Vrábel s. r. o.');
});

test('mobil 390 px: po rozhodnutí nie je nadpis situácie ani nadpis kroku pod lepkavou hlavičkou', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/#/demo/slubeny-termin');
  const hlavicka = await page.locator('.hlavicka').evaluate((e) => e.getBoundingClientRect().height);

  const over = async (nadpis: string) => {
    const krok = page.getByRole('heading', { level: 2, name: nadpis });
    await expect(krok).toBeFocused();
    // Posun môže byť plynulý: čaká sa, kým sa ustáli.
    await expect.poll(async () => (await page.locator('.prehravac__nadpis').boundingBox())?.y ?? -1).toBeGreaterThanOrEqual(hlavicka);
    const h2 = await krok.boundingBox();
    expect(h2 && h2.y >= hlavicka && h2.y + h2.height <= 844).toBe(true);
  };

  await page.getByRole('button', { name: 'Odpovedať až po kontrole rezervácií.' }).click();
  await over('Skladový prehľad');
  await page.getByRole('button', { name: '3 kusy.', exact: true }).click();
  await over('Návrh zákazníkovi');
  await page.getByRole('button', { name: /Poslať zákazníkovi porovnanie/ }).click();
  await over('Písomné potvrdenie zákazníka');
});

test('„Čo uvidí vedúci“: výzva až po dokončenej situácii, stĺpec Výsledok pod sebou, tlač na A4 bez prázdnej strany', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.goto('/#/demo/prehlad');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Čo uvidí vedúci');
  await expect(page.locator('.majitel')).toHaveCount(0);

  // Situácia 1 s opravou po spätnej väzbe, situácia 2 s chybou a nákladom.
  await page.goto('/#/demo/slubeny-termin?prva=s1-start-potvrdit');
  for (const m of [/Zavolať zákazníkovi a povedať/, /Poslať zákazníkovi porovnanie/, /Rezervovať 8 kusov L-240B a poslať/]) {
    await page.getByRole('button', { name: m }).click();
  }
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté po oprave' })).toBeVisible();
  await page.goto('/#/demo/kusy-alebo-balenia');
  await page.getByRole('button', { name: /Zadať do objednávky množstvo 18/ }).click();
  await page.getByRole('button', { name: 'Potvrdiť objednávku.', exact: true }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Chyba s následkom' })).toBeVisible();

  await page.goto('/#/demo/prehlad');
  await expect(page.locator('.majitel')).toHaveCount(1);
  const xVysledku = await page
    .locator('.body-tabulka thead .body-tabulka__vysledok')
    .evaluateAll((bunky) => bunky.map((b) => Math.round(b.getBoundingClientRect().left)));
  expect(xVysledku).toHaveLength(2);
  expect(new Set(xVysledku).size).toBe(1);

  // Tlač na A4: celý prehľad s rozbalenými rozhodnutiami najviac na 2 strany.
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ preferCSSPageSize: true });
  const strany = pdf.toString('latin1').match(/\/Type\s*\/Page\b(?!s)/g)?.length ?? 0;
  expect(strany).toBeGreaterThan(0);
  expect(strany).toBeLessThanOrEqual(2);

  expect(chyby).toEqual([]);
});

/** Prejde situáciu 1 bez chyby až po súhrn. */
async function dokonciBezChyby(page: Page) {
  await page.getByRole('button', { name: 'Odpovedať až po kontrole rezervácií.' }).click();
  await page.getByRole('button', { name: '3 kusy.', exact: true }).click();
  await page.getByRole('button', { name: /Poslať zákazníkovi porovnanie/ }).click();
  await page.getByRole('button', { name: /Rezervovať 8 kusov L-240B a poslať/ }).click();
}

/** Vykreslené prvky v obsahu, ktoré nie sú úplne viditeľné (opacity pod 1), ako „trieda: opacity“.
 *  Prvky v zatvorenom paneli (display: none) sa nerátajú, svoju animáciu spustia až pri otvorení. */
async function nepriehladne(page: Page): Promise<string[]> {
  return page.locator('main').evaluate((m) =>
    [m, ...m.querySelectorAll('*')]
      .filter((e) => e.getClientRects().length > 0 && Number(getComputedStyle(e).opacity) < 1)
      .map((e) => `${e.tagName.toLowerCase()}.${String(e.className)}: ${getComputedStyle(e).opacity}`),
  );
}

test.describe('pohyb zapnutý', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('súhrn: verdikt a blok pre majiteľa viditeľné do 1,5 s, potom nič skryté, ukážka bez posunu rozloženia', async ({ page }) => {
    const chyby = sledujChyby(page);
    // Posun rozloženia bez nedávneho vstupu používateľa (rovnako ako ho počíta CLS).
    await page.addInitScript(() => {
      const okno = window as unknown as { posunRozlozenia: number };
      okno.posunRozlozenia = 0;
      new PerformanceObserver((zoznam) => {
        for (const z of zoznam.getEntries() as unknown as { value: number; hadRecentInput: boolean }[]) {
          if (!z.hadRecentInput) okno.posunRozlozenia += z.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.setViewportSize({ width: 1366, height: 900 });
    await page.goto('/#/demo/slubeny-termin');
    // Prvé vykreslenie situácie je bez pohybu, nový krok s pohybom.
    await expect(page.locator('.uzol')).not.toHaveClass(/uzol--pohyb/);

    await dokonciBezChyby(page);
    const koniec = Date.now();
    await expect(page.locator('.suhrn')).toHaveClass(/suhrn--pohyb/);
    expect(await page.evaluate(() => document.getAnimations().length)).toBeGreaterThan(0);
    await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeFocused();

    const opacita = (selektor: string) => page.locator(selektor).evaluate((e) => getComputedStyle(e).opacity);
    await expect.poll(() => opacita('.verdikt'), { timeout: 1500, intervals: [50] }).toBe('1');
    await expect.poll(() => opacita('.majitel'), { timeout: 1500, intervals: [50] }).toBe('1');
    expect(Date.now() - koniec).toBeLessThan(1500);

    // Po dobehnutí (aj reťaz následkov, keď je v okne) nič neostane priesvitné.
    await page.locator('.typicka').scrollIntoViewIfNeeded();
    await expect.poll(() => nepriehladne(page), { timeout: 4000 }).toEqual([]);
    await expect(page.locator('.verdikt__znak')).toHaveCSS('transform', 'none');

    const posun = () => page.evaluate(() => (window as unknown as { posunRozlozenia: number }).posunRozlozenia);
    expect(await posun()).toBeLessThan(0.05);

    // Vstup z náhľadu na mobile (nové načítanie): krok so spätnou väzbou je na mieste hneď,
    // úvodný krok so zadaním sa nemihne a obsah neposkočí.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/#/demo/slubeny-termin?prva=s1-start-potvrdit');
    await page.reload();
    await expect(page.getByRole('heading', { level: 2, name: 'Sklad volá' })).toBeVisible();
    await expect.poll(() => nepriehladne(page), { timeout: 4000 }).toEqual([]);
    expect(await posun()).toBeLessThan(0.05);
    expect(chyby).toEqual([]);
  });
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('súhrn je hneď celý viditeľný, nič sa nehýbe ani nečaká na odhalenie', async ({ page }) => {
    await page.goto('/#/demo/slubeny-termin');
    await dokonciBezChyby(page);
    await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeFocused();
    expect(await nepriehladne(page)).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
    await expect(page.locator('.retaz')).not.toHaveClass(/odhalit/);
  });
});

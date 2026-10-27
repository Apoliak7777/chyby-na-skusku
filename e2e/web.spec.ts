import { expect, test, type Page } from '@playwright/test';

/**
 * Koncový test predajnej stránky nad produkčným buildom: hero a živá ukážka, tri chyby,
 * čo dostanete, cena, otázky, kontakt bez backendu, podmienky, ochrana údajov, pás z mailu,
 * skip link, mobil a pohyb. Ukážku (prehrávač) testuje e2e/demo.spec.ts.
 * Testy bežia s reducedMotion: 'reduce' (playwright.config.ts), pohyb overuje skupina „pohyb“ na konci.
 */

function sledujChyby(page: Page): string[] {
  const chyby: string[] = [];
  page.on('pageerror', (e) => chyby.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') chyby.push(`console: ${m.text()}`);
  });
  return chyby;
}

/** Viditeľný text s nezlomiteľnými medzerami prevedenými na obyčajné (sadzba ich vkladá zámerne). */
async function textBez(page: Page, selektor = 'body'): Promise<string> {
  return (await page.locator(selektor).innerText()).replace(/\u00a0/g, ' ');
}

const VYSLEDOK_PRE_VEDUCEHO = 'Nový človek si na konci súhrn vytlačí alebo uloží ako PDF a pošle vám ho. Tréning sám nič neukladá ani neposiela.';

test('predajná stránka: sľub, ukážka v hero, chyby, cena a pravidlá obsahu', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Nový človek na objednávkach sa pomýli v tréningu, nie u vášho zákazníka.',
  );
  await expect(page).toHaveTitle('Zaškolenie nového človeka na príjme objednávok | Chyby na skúšku');

  const text = await textBez(page);
  const maly = text.toLowerCase();
  expect(maly).not.toContain('zadarmo');
  expect(maly).not.toContain('bezplatn');
  expect(maly).not.toContain('referencie');
  expect(maly).not.toContain('odoslan');
  expect(maly).not.toContain('úvodná cena');
  expect(maly).not.toContain('najčastejšia chyba');
  expect(maly).not.toContain('platený pilot');
  expect(text).not.toMatch(/ [–—] /);
  expect(text).toContain('690 €');
  expect(text).toContain('1 900 €');
  expect(text).toContain('490 €');
  expect(text).toContain('Termín potvrdený bez kontroly rezervácií');
  expect(text).toContain('Adresa zmenená len v systéme, štítok ostal starý');
  // Riadok „Platba:“ pod krokmi nie je, platba je na karte ceny a v otázkach.
  await expect(page.locator('#ako')).not.toContainText('Platba:');
  // Bez vyplneného mena sa sekcia o poskytovateľovi nezobrazí.
  await expect(page.getByRole('heading', { name: 'Kto to robí' })).toHaveCount(0);
  // Pás pre návštevu z mailu sa bez ?z neukáže.
  await expect(page.getByText('Ak ste dostali môj e-mail')).toHaveCount(0);
  // Hlavička je plne nepriehľadná.
  expect(await page.locator('header.hlavicka').evaluate((h) => getComputedStyle(h).backgroundColor)).toBe('rgb(245, 244, 239)');

  // Pred voľbou vidno len stav skladu, rezervácie až po voľbe. Živý región je v DOM stále.
  const nahlad = page.getByRole('region', { name: 'Živá ukážka situácie Sľúbený termín' });
  await expect(nahlad.getByRole('status')).toHaveCount(1);
  await expect(nahlad.getByRole('columnheader', { name: 'Rezervované' })).toHaveCount(0);
  // Pod myšou je možnosť neutrálna, nie zelená („správne“).
  const moznostA = nahlad.getByRole('button', { name: /Potvrdiť piatok/ });
  await moznostA.hover();
  expect(await moznostA.evaluate((b) => getComputedStyle(b).backgroundColor)).not.toBe('rgb(227, 241, 236)');

  // Po voľbe sa ľavý stĺpec hero neposunie, aj keď ukážka narastie (poloha v dokumente, nie v okne).
  const h1 = page.getByRole('heading', { level: 1 });
  const polohaNadpisu = () => h1.evaluate((e) => e.getBoundingClientRect().top + window.scrollY);
  const predVolbou = await polohaNadpisu();
  await moznostA.click();
  await expect(nahlad.getByText('O 10:30 volá sklad:')).toBeVisible();
  await expect(nahlad).toContainText('Zákazník už má vaše potvrdenie na 8 kusov v piatok.');
  await expect(nahlad.getByText('Presne toto sa stane novému človeku.')).toBeFocused();
  await expect(nahlad.getByRole('status')).toHaveText('V tabuľke pribudli stĺpce Rezervované a Voľné.');
  expect(Math.abs((await polohaNadpisu()) - predVolbou)).toBeLessThan(1);
  await expect(nahlad.getByRole('columnheader', { name: 'Rezervované' })).toBeVisible();

  await nahlad.getByRole('button', { name: 'Vybrať inak' }).click();
  await expect(nahlad.getByRole('button', { name: /Potvrdiť piatok/ })).toBeFocused();
  await nahlad.getByRole('button', { name: /po kontrole rezervácií/ }).click();
  await expect(nahlad.getByText('Správne. Voľné sú len 3 kusy.')).toBeFocused();
  await expect(nahlad).toContainText('Keby nový človek potvrdil hneď, o 10:30 by volal sklad');
  await expect(nahlad.getByRole('link', { name: 'Pokračovať v situácii' })).toHaveAttribute(
    'href',
    '#/demo/slubeny-termin?prva=s1-start-overit',
  );
  await nahlad.getByRole('button', { name: 'Vybrať inak' }).click();
  await nahlad.getByRole('button', { name: /Potvrdiť piatok/ }).click();
  // Adresa sa overí hneď pri navigácii (prehrávač môže ?prva po použití z adresy odstrániť).
  await Promise.all([
    page.waitForURL(/#\/demo\/slubeny-termin\?prva=s1-start-potvrdit/),
    nahlad.getByRole('link', { name: 'Pokračovať a napraviť to' }).click(),
  ]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sľúbený termín');

  // Späť na web a teraz voľba B: do ukážky ide s prvou voľbou B (správanie prehrávača testuje demo.spec.ts).
  await page.getByRole('navigation', { name: 'Hlavná navigácia' }).getByRole('link', { name: 'Späť na web' }).click();
  const nahladZnova = page.getByRole('region', { name: 'Živá ukážka situácie Sľúbený termín' });
  await nahladZnova.getByRole('button', { name: /po kontrole rezervácií/ }).click();
  await Promise.all([
    page.waitForURL(/#\/demo\/slubeny-termin\?prva=s1-start-overit/),
    nahladZnova.getByRole('link', { name: 'Pokračovať v situácii' }).click(),
  ]);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sľúbený termín');

  // Tri chyby vedú do svojich situácií.
  await page.goto('/#ukazka');
  const odkazy = page.locator('#ukazka').getByRole('link', { name: 'Vyskúšať túto situáciu' });
  await expect(odkazy).toHaveCount(3);
  await expect(odkazy.nth(1)).toHaveAttribute('href', '#/demo/kusy-alebo-balenia');
  await expect(odkazy.nth(2)).toHaveAttribute('href', '#/demo/zmena-adresy');

  // Čo dostanete: tri snímky s viditeľným „Zväčšiť“, popis výsledku pre vedúceho, bez zoznamu z karty ceny.
  const vystupy = page.locator('#co-dostanete');
  await vystupy.scrollIntoViewIfNeeded();
  const obrazky = vystupy.locator('img');
  await expect(obrazky).toHaveCount(3);
  for (let i = 0; i < 3; i++) {
    await obrazky.nth(i).scrollIntoViewIfNeeded();
    await expect.poll(() => obrazky.nth(i).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
    const box = await obrazky.nth(i).boundingBox();
    expect(box?.width ?? 0, 'snímka je dosť veľká na čítanie').toBeGreaterThan(400);
  }
  await expect(vystupy.getByText('Zväčšiť', { exact: true })).toHaveCount(3);
  await expect(vystupy).toContainText(VYSLEDOK_PRE_VEDUCEHO);
  await expect(vystupy.locator('.zoznam-fajky')).toHaveCount(0);

  // Otázky: ako sa vedúci dozvie výsledok.
  const otazky = page.locator('#otazky');
  await expect(otazky.getByText('Ako sa dozviem, ako to nový človek zvládol?')).toBeVisible();
  await expect(otazky).toContainText(VYSLEDOK_PRE_VEDUCEHO);

  // Cena: štítok Pilot, nadpis karty a jednotné lehoty.
  const cena = page.locator('#cennik');
  await expect(cena.locator('.cena__stitok')).toHaveText('Pilot');
  await expect(cena.getByRole('heading', { name: 'Tri situácie z vašej firmy' })).toBeVisible();
  await expect(cena).toContainText('Jednorazová cena, bez predplatného.');
  await expect(page.locator('#ako')).toContainText(
    'Do 5 pracovných dní od rozhovoru a podkladov vám pošlem všetky tri situácie ako text na schválenie.',
  );
  await expect(page.locator('#ako')).toContainText(
    'Hotový tréning do 10 pracovných dní od úplných podkladov. Čas, keď čakám na vaše schválenie, sa do lehoty nepočíta.',
  );
  await expect(page.locator('#ako')).toContainText('do 10 pracovných dní od odovzdania');

  expect(chyby).toEqual([]);
});

test('kontakt: jedna veta cez e-mail, skopírovanie adresy a krátky formulár bez predstieraného odoslania', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.goto('/#dopyt');
  const kontakt = page.locator('#dopyt');
  await expect(kontakt).toContainText('Napríklad: „Potvrdí termín bez kontroly rezervácií.“');
  const jednaVeta = await kontakt.getByRole('link', { name: 'Napísať e-mail' }).getAttribute('href');
  expect(jednaVeta).toMatch(/^mailto:info@chybynaskusku\.online\?subject=/);
  expect(jednaVeta).toContain('%0D%0A');
  const teloJednejVety = new URL(jednaVeta ?? '').searchParams.get('body') ?? '';
  expect(teloJednejVety).toContain('nový človek sa u nás najčastejšie pomýli takto:');
  expect(teloJednejVety).toContain('Telefón (ak je jednoduchšie zavolať):');

  const veducemu = await kontakt.getByRole('link', { name: 'Poslať odkaz vedúcemu' }).getAttribute('href');
  expect(veducemu).toMatch(/^mailto:\?subject=/);
  expect(new URL(veducemu ?? '').searchParams.get('body')).toMatch(/^Dobrý deň,\r\n/);

  await kontakt.getByRole('button', { name: 'Skopírovať adresu' }).click();
  await expect(kontakt.getByRole('status').first()).toContainText('info@chybynaskusku.online');

  await kontakt.getByText('Radšej vyplním krátky formulár').click();
  // Reťazec, nie regulárny výraz: popis má po sadzbe nezlomiteľné medzery a reťazec ich porovná ako medzery.
  const pole = kontakt.getByLabel('Kde sa u vás nový človek najčastejšie pomýli');
  await expect(pole).toHaveAttribute('maxlength', '500');
  await expect(pole).toHaveAttribute('placeholder', 'napr. potvrdí termín bez kontroly rezervácií');
  await kontakt.getByRole('button', { name: 'Pripraviť e-mail' }).click();
  await expect(kontakt.getByText('Napíšte aspoň pár slov o tom, kde sa nový človek mýli.')).toBeVisible();
  await pole.fill('Potvrdí termín bez kontroly rezervácií.');
  await kontakt.getByLabel(/Firma/).fill('Veľkoobchod Test s. r. o.');
  const balicek = kontakt.getByLabel('Čo vás zaujíma');
  const moznosti = (await balicek.locator('option').allInnerTexts()).map((t) => t.replace(/\u00a0/g, ' '));
  expect(moznosti).toContain('Kompletný tréning: 1 900 €');
  expect(moznosti).toContain('Pilot: 690 €');
  await balicek.selectOption('kompletny');
  await kontakt.getByRole('button', { name: 'Pripraviť e-mail' }).click();
  await expect(kontakt.getByRole('heading', { name: 'E-mail je pripravený. Odošlite ho zo svojej schránky.' })).toBeVisible();
  // Živý región pre kopírovanie je v DOM už pred prvým kopírovaním.
  await expect(kontakt.locator('.dopyt__vysledok [role="status"]')).toHaveCount(1);
  const textDopytu = kontakt.getByLabel('Text dopytu');
  await expect(textDopytu).toHaveValue(/takto:\nPotvrdí termín bez kontroly rezervácií\./);
  await expect(textDopytu).toHaveValue(/Zaujíma nás: Kompletný tréning \(1 900 €\)/);
  const odkaz = kontakt.getByRole('link', { name: 'Otvoriť e-mail s dopytom' });
  await expect(odkaz).toHaveAttribute('href', /^mailto:info@chybynaskusku\.online\?subject=Dopyt%3A%20Chyby%20na%20sk/);
  await expect(odkaz).toHaveAttribute('href', /%0D%0A/);
  expect((await page.locator('body').innerText()).toLowerCase()).not.toContain('odoslan');
  expect(chyby).toEqual([]);
});

test('podmienky, ochrana údajov, pás z mailu a skip link v ukážke', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.goto('/#/podmienky');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Podmienky pilotu');
  const podmienky = page.locator('main');
  await expect(podmienky).toContainText('Celý pilot stojí 690 €.');
  await expect(podmienky).toContainText('každá na 2 až 5 minút a s 2 až 4 rozhodnutiami');
  await expect(podmienky).toContainText('Hotový tréning do 10 pracovných dní od úplných podkladov.');
  await expect(podmienky).toContainText('do 10 pracovných dní od odovzdania');
  await expect(podmienky).toContainText(VYSLEDOK_PRE_VEDUCEHO);
  await expect(podmienky).toContainText('alebo napíšte na info@chybynaskusku.online');
  expect(await textBez(page, 'main')).not.toMatch(/ [–—] /);

  await page.goto('/#/ochrana-udajov');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ochrana osobných údajov');
  const ochrana = page.locator('main');
  await expect(page.getByText('Nepoužíva cookies ani žiadne sledovanie návštevnosti.')).toBeVisible();
  await expect(ochrana).toContainText('Výsledky ukážky sú len v otvorenej stránke a po jej obnovení zmiznú. Nič sa neukladá ani neposiela.');
  await expect(ochrana).toContainText('GitHub Pages');
  await expect(ochrana).toContainText('Hostinger');
  await expect(ochrana).toContainText('Meno pracovníka je len nepovinné pole na výtlačok');
  const textOchrany = await textBez(page, 'main');
  expect(textOchrany).not.toMatch(/ [–—] /);
  // Hlas poskytovateľa je v prvej osobe jednotného čísla.
  expect(textOchrany).not.toMatch(/\b(nám|spracúvame|používame|nepredávame|nepoužívame|uchovávame|vymažeme)\b/i);

  await page.goto('/?z=u#/');
  await expect(page.getByText('Ak ste dostali môj e-mail, stačí naň odpovedať, aj jednou vetou.')).toBeVisible();

  // Skip link nesmie odviesť z ukážky na predajnú stránku.
  await page.goto('/#/demo');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Preskočiť na obsah' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/demo$/);
  await expect(page.locator('main')).toBeFocused();
  expect(chyby).toEqual([]);
});

test('krátka stránka: pätička siaha po spodok okna, pod ňou nie je pás', async ({ page }) => {
  await page.setViewportSize({ width: 1366, height: 768 });
  await page.goto('/#/neexistuje');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Táto stránka neexistuje');
  const paticka = await page.locator('footer').boundingBox();
  expect(paticka).toBeTruthy();
  if (paticka) expect(paticka.y + paticka.height).toBeGreaterThanOrEqual(768 - 1);
});

for (const sirka of [360, 390, 414]) {
  test(`mobil ${sirka} px: bez vodorovného pretekania, ukážka v hero celá, pilot pred ďalšími možnosťami`, async ({ page }) => {
    const chyby = sledujChyby(page);
    await page.setViewportSize({ width: sirka, height: 800 });
    for (const cesta of ['/', '/#/podmienky', '/#/ochrana-udajov']) {
      await page.goto(cesta);
      await page.waitForLoadState('networkidle');
      const dokument = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(dokument, `pretekanie na ${cesta}`).toBeLessThanOrEqual(sirka);
    }
    await page.goto('/');
    const nahlad = page.getByRole('region', { name: 'Živá ukážka situácie Sľúbený termín' });
    await nahlad.getByRole('button', { name: /Potvrdiť piatok/ }).click();
    const karta = await nahlad.boundingBox();
    const tlacidlo = await nahlad.getByRole('link', { name: 'Pokračovať a napraviť to' }).boundingBox();
    expect(karta && tlacidlo).toBeTruthy();
    if (karta && tlacidlo) expect(tlacidlo.x + tlacidlo.width).toBeLessThanOrEqual(karta.x + karta.width + 0.5);
    const tabulka = await nahlad.locator('table').evaluate((t) => ({ sirka: t.scrollWidth, okno: t.parentElement?.clientWidth ?? 0 }));
    expect(tabulka.sirka).toBeLessThanOrEqual(tabulka.okno);

    // V jednom stĺpci ide karta pilotu hneď pod nadpis, až potom 1 900 € a 490 €.
    const kartaPilotu = await page.locator('.cena__karta').boundingBox();
    const ostatne = await page.locator('.cena__ostatne').boundingBox();
    expect((kartaPilotu?.y ?? 1) < (ostatne?.y ?? 0)).toBe(true);
    expect(chyby).toEqual([]);
  });
}

/** Prvky, ktoré sa pri pohybe vysúvajú: hero pri načítaní a sekcie pri prvom príchode do okna. */
const POHYBLIVE = '[data-odhal], .hero__vstup, .hero__ukazka-stlpec';
const TRIEDA_POHYB = /(^|\s)pohyb(\s|$)/;

/** Súčet posunov rozloženia (layout shift) okrem tých, ktoré hneď nasledujú po kliknutí návštevníka. */
async function sledujPosunRozlozenia(page: Page): Promise<() => Promise<number>> {
  await page.addInitScript(() => {
    const okno = window as unknown as { posunRozlozenia: number };
    okno.posunRozlozenia = 0;
    new PerformanceObserver((zoznam) => {
      for (const z of zoznam.getEntries() as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!z.hadRecentInput) okno.posunRozlozenia += z.value;
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  return () => page.evaluate(() => (window as unknown as { posunRozlozenia: number }).posunRozlozenia);
}

/** Nepriehľadnosť, transformácia a bežiace animácie pohyblivých prvkov. */
async function stavPohyblivych(page: Page) {
  return page.$$eval(POHYBLIVE, (prvky) =>
    prvky.map((p) => ({
      prvok: `${p.tagName.toLowerCase()}.${p.className}`,
      opacity: getComputedStyle(p).opacity,
      transform: getComputedStyle(p).transform,
      bezi: p.getAnimations().filter((a) => a.playState === 'running').length,
    })),
  );
}

test.describe('pohyb', () => {
  test.use({ reducedMotion: 'no-preference' });

  for (const okno of [
    { width: 1366, height: 768 },
    { width: 390, height: 800 },
  ]) {
    test(`${okno.width} px: po scrollovaní je všetko odhalené, nič nepreteká a rozloženie neposkočí`, async ({ page }) => {
      const chyby = sledujChyby(page);
      await page.setViewportSize(okno);
      const posun = await sledujPosunRozlozenia(page);
      await page.goto('/');
      await expect(page.locator('html')).toHaveClass(TRIEDA_POHYB);

      // Nadpis H1 je viditeľný hneď, bez animácie (najväčší text v okne nesmie čakať).
      const h1 = page.getByRole('heading', { level: 1 });
      expect(await h1.evaluate((e) => [getComputedStyle(e).opacity, e.getAnimations().length])).toEqual(['1', 0]);
      // Nižšie na stránke čakajú prvky na odhalenie; počas vstupu hero nič nepreteká vodorovne.
      const neodhalene = page.locator('[data-odhal]:not(.je-odhalene)');
      expect(await neodhalene.count()).toBeGreaterThan(5);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(okno.width);

      // Živá ukážka s pohybom: fokus ide na reakciu a späť na prvú možnosť, čiara cez „12 ks“ len pri chybe.
      const nahlad = page.getByRole('region', { name: 'Živá ukážka situácie Sľúbený termín' });
      await nahlad.getByRole('button', { name: /Potvrdiť piatok/ }).click();
      await expect(nahlad.getByText('Presne toto sa stane novému človeku.')).toBeFocused();
      await expect(nahlad.locator('.nahlad__hodnota--preskrtnuta')).toHaveText('12 ks');
      await expect(nahlad.getByRole('columnheader', { name: 'Voľné' })).toBeVisible();
      await nahlad.getByRole('button', { name: 'Vybrať inak' }).click();
      await expect(nahlad.getByRole('button', { name: /Potvrdiť piatok/ })).toBeFocused();
      await expect(nahlad.locator('.nahlad__hodnota--preskrtnuta')).toHaveCount(0);
      await nahlad.getByRole('button', { name: /po kontrole rezervácií/ }).click();
      await expect(nahlad.getByText('Správne. Voľné sú len 3 kusy.')).toBeFocused();
      await expect(nahlad.locator('.nahlad__hodnota--preskrtnuta')).toHaveCount(0);

      // Po kúskoch dole ako návštevník; myš mimo obsahu, aby žiadny doklad neostal pod ňou zdvihnutý.
      await page.mouse.move(0, 0);
      const krok = Math.round(okno.height * 0.6);
      for (let y = krok; ; y += krok) {
        const naKonci = await page.evaluate((top) => {
          window.scrollTo({ top, behavior: 'instant' });
          return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1;
        }, y);
        await page.waitForTimeout(80);
        if (naKonci) break;
      }
      await expect(neodhalene).toHaveCount(0);
      await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));

      const stav = await stavPohyblivych(page);
      expect(stav.length).toBeGreaterThan(8);
      expect(stav.filter((s) => s.opacity !== '1' || s.transform !== 'none' || s.bezi > 0)).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(okno.width);
      expect(await posun()).toBeLessThan(0.05);
      // Po posunutí má hlavička tieň.
      await expect(page.locator('header.hlavicka')).toHaveClass(/hlavicka--posunuta/);
      expect(chyby).toEqual([]);
    });
  }

  test('skok na kotvu odhalí aj všetko nad ňou', async ({ page }) => {
    const chyby = sledujChyby(page);
    await page.goto('/#cennik');
    await expect(page.locator('#cennik .cena__karta')).toHaveClass(/je-odhalene/);
    await expect(page.locator('#ukazka [data-odhal]:not(.je-odhalene)')).toHaveCount(0);
    await expect(page.locator('#co-dostanete [data-odhal]:not(.je-odhalene)')).toHaveCount(0);
    expect(chyby).toEqual([]);
  });
});

test.describe('obmedzený pohyb', () => {
  // Výslovne, aby test neplatil len vďaka predvoľbe v playwright.config.ts.
  test.use({ reducedMotion: 'reduce' });

  test('obmedzený pohyb: nič nie je skryté ani posunuté hneď po načítaní', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('html')).not.toHaveClass(TRIEDA_POHYB);
    const stav = await stavPohyblivych(page);
    expect(stav.length).toBeGreaterThan(8);
    expect(stav.filter((s) => s.opacity !== '1' || s.transform !== 'none' || s.bezi > 0)).toEqual([]);
    // Linka prvého kroku je celá, nie zrolovaná na nulu.
    expect(await page.locator('.krok').first().evaluate((k) => getComputedStyle(k, '::before').transform)).toBe('none');
  });
});


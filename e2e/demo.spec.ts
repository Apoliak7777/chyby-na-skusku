import { expect, test, type Page } from '@playwright/test';

/**
 * Koncový test nad produkčným buildom: web → demo → scenár s chybnou vetvou →
 * oprava → súhrn → návrat ku kroku → nový pokus → prehľad → dopyt → mobil.
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

test('predajný web, demo s chybnou vetvou, súhrn, návrat, prehľad a dopyt', async ({ page }) => {
  const chyby = sledujChyby(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Nech si nováčik prvú chybu vyskúša nanečisto.');
  await expect(page.getByText('Bez registrácie. Modelové situácie vymyslenej firmy.')).toBeVisible();

  // Na webe nesmú byť vymyslené referencie ani sľuby zadarmo.
  const text = await page.locator('body').innerText();
  expect(text.toLowerCase()).not.toContain('zadarmo');
  expect(text.toLowerCase()).not.toContain('referencie');
  expect(text).toContain('690 €');
  expect(text).toContain('1 900 €');
  expect(text).toContain('490 €');

  // Náhľad na webe: chybná voľba ukáže následok a pustí do dema s už zvoleným krokom.
  await page.getByRole('button', { name: /Potvrdiť piatok hneď/ }).click();
  await expect(page.getByText('O 10:30 volá sklad:')).toBeVisible();
  await page.getByRole('link', { name: 'Pokračovať v ukážke a napraviť to' }).click();
  await expect(page).toHaveURL(/#\/demo\/slubeny-termin\?prva=s1-start-potvrdit/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sľúbený termín');
  await expect(page.getByText('Spätná väzba na vaše rozhodnutie')).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Sklad volá' })).toBeVisible();
  await expect(page.getByText('Rozhodnutie č. 2')).toBeVisible();

  // Oprava po spätnej väzbe a pokračovanie správnou cestou.
  await page.getByRole('button', { name: /Zavolať zákazníkovi, priznať chybu/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Návrh zákazníkovi po telefonáte' })).toBeVisible();
  await page.getByRole('button', { name: /Ponúknuť 8 kusov L-240B s porovnaním/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Písomné potvrdenie zákazníka' })).toBeVisible();
  await page.getByRole('button', { name: /Vytvoriť rezerváciu 8 kusov L-240B/ }).click();

  // Súhrn: zvládnuté po oprave, bez modelového nákladu, tlač k dispozícii.
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté po oprave' })).toBeVisible();
  await expect(page.getByText('opravené po spätnej väzbe').first()).toBeVisible();
  await expect(page.getByText('Modelový následok tejto vetvy')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Vytlačiť alebo uložiť ako PDF' })).toBeVisible();

  // Návrat k prvému rozhodnutiu odstráni celú vetvu; správna cesta končí bez opravy.
  await page.getByRole('button', { name: 'Vrátiť sa k rozhodnutiu č. 1' }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Otázka zákazníka' })).toBeVisible();
  await expect(page.getByText('Rozhodnutie č. 1')).toBeVisible();
  await page.getByRole('button', { name: /Najprv otvoriť skladový prehľad/ }).click();
  await page.getByRole('button', { name: /3 kusy – toľko je voľných/ }).click();
  await page.getByRole('button', { name: /Ponúknuť 8 kusov L-240B s porovnaním/ }).click();
  await page.getByRole('button', { name: /Vytvoriť rezerváciu 8 kusov L-240B/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeVisible();
  await expect(page.locator('.body-tabulka').getByText('správne na prvý pokus')).toHaveCount(4);

  // Druhá situácia: číselný vstup, chybná expedícia s nákladom 45 €, potom nový pokus s čistým stavom.
  await page.getByRole('link', { name: /Ďalšia situácia: Kusy alebo balenia/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Kusy alebo balenia');
  await page.getByRole('button', { name: /Otvoriť produktovú kartu K-6/ }).click();
  const pole = page.getByLabel('Množstvo (bal)');
  await pole.fill('18');
  await expect(page.getByText('Prepočet: 18 bal = 108 ks · 1 512 €')).toBeVisible();
  await page.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await expect(page.getByText('Zadané množstvo: 18 bal')).toBeVisible();
  await page.getByRole('button', { name: /Potvrdiť – množstvo 18 sedí/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Chyba s následkom' })).toBeVisible();
  await expect(page.getByText('Modelový následok tejto vetvy: 45 €.')).toBeVisible();
  await page.getByRole('button', { name: 'Skúsiť scenár znova' }).click();
  await expect(page.getByText('Rozhodnutie č. 1')).toBeVisible();
  await expect(page.getByText('Predchádzajúci pokus', { exact: false }).first()).toBeVisible();
  await expect(page.getByText('Zadané množstvo: 18 bal')).toHaveCount(0);

  // Hodnota mimo rozsahu sa odmietne bez pádu.
  await page.getByRole('button', { name: /Otvoriť produktovú kartu K-6/ }).click();
  await page.getByLabel('Množstvo (bal)').fill('0');
  await page.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await expect(page.getByRole('alert')).toContainText('od 1 do 99');
  await page.getByLabel('Množstvo (bal)').fill('3');
  await expect(page.getByText('Prepočet: 3 bal = 18 ks · 252 €')).toBeVisible();
  await page.getByRole('button', { name: 'Pokračovať na rekapituláciu' }).click();
  await page.getByRole('button', { name: /Potvrdiť objednávku: 3 balenia/ }).click();
  await expect(page.getByRole('heading', { level: 2, name: 'Zvládnuté' })).toBeVisible();

  // Prehľad tréningu ukazuje výsledky bez mena pracovníka.
  await page.goto('/#/demo/prehlad');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Prehľad tréningu');
  await expect(page.getByRole('heading', { level: 2, name: 'Sľúbený termín' })).toBeVisible();
  await expect(page.getByText('Výsledok: Zvládnuté').first()).toBeVisible();
  await expect(page.getByText('Zatiaľ nedokončené.')).toHaveCount(1);

  // Dopyt: pripraví text, nikdy nehlási odoslanie.
  await page.goto('/#dopyt');
  await page.getByLabel('Firma *').fill('Veľkoobchod Test s. r. o.');
  await page.getByLabel('Kontaktný e-mail *').fill('objednavky@test-firma.sk');
  await page.getByLabel('Pracovná pozícia na zaškolenie *').fill('Pracovník príjmu objednávok');
  await page.getByLabel('Jedna situácia, ktorú chcete precvičiť *').fill('Nováčik potvrdí termín bez toho, aby pozrel rezervácie.');
  await page.getByRole('button', { name: 'Pripraviť dopyt' }).click();
  await expect(page.getByRole('heading', { name: 'Dopyt je pripravený. Odošlite ho zo svojho e-mailu.' })).toBeVisible();
  await expect(page.getByLabel('Text dopytu')).toHaveValue(/Firma: Veľkoobchod Test s\. r\. o\./);
  const textPoDopyte = await page.locator('body').innerText();
  expect(textPoDopyte).not.toContain('Dopyt bol odoslaný');
  const mailto = page.getByRole('link', { name: 'Otvoriť e-mail s dopytom' });
  await expect(mailto).toBeVisible();
  await expect(mailto).toHaveAttribute('href', /^mailto:info@chybynaskusku\.online\?subject=/);

  // Ochrana osobných údajov je dostupná z pätičky.
  await page.goto('/#/ochrana-udajov');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Ochrana osobných údajov');
  await expect(page.getByText('Nepoužíva cookies ani žiadne sledovanie návštevnosti.')).toBeVisible();
  await page.goto('/#dopyt');

  // Prázdny formulár nahlási chyby pri poliach.
  await page.reload();
  await page.getByRole('button', { name: 'Pripraviť dopyt' }).click();
  await expect(page.getByText('Uveďte názov firmy.')).toBeVisible();

  expect(chyby).toEqual([]);
});

test('mobil 360 px: bez vodorovného pretekania a podklady za prepínačom', async ({ page }) => {
  const chyby = sledujChyby(page);
  await page.setViewportSize({ width: 360, height: 740 });

  for (const cesta of ['/', '/#/demo', '/#/demo/zmena-adresy']) {
    await page.goto(cesta);
    await page.waitForLoadState('networkidle');
    const sirky = await page.evaluate(() => ({
      dokument: document.documentElement.scrollWidth,
      okno: window.innerWidth,
    }));
    expect(sirky.dokument, `pretekanie na ${cesta}`).toBeLessThanOrEqual(sirky.okno);
  }

  await expect(page.getByRole('tab', { name: /E-mail zákazníka/ })).toBeHidden();
  await page.getByRole('button', { name: /Zobraziť podklady/ }).click();
  await expect(page.getByRole('tab', { name: /E-mail zákazníka/ })).toBeVisible();
  await page.getByRole('tab', { name: /Pravidlá firmy/ }).click();
  await expect(page.getByRole('tabpanel')).toContainText('Postup DEMO DISTRIBÚCIE pri zmene objednávky po vychystaní');
  const sirkaPoOtvoreni = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(sirkaPoOtvoreni).toBeLessThanOrEqual(360);

  expect(chyby).toEqual([]);
});

test('klávesnica: rozhodnutie sa dá zvoliť Tabom a Enterom, fokus ide na nový uzol', async ({ page }) => {
  await page.goto('/#/demo/zmena-adresy');
  await expect(page.getByRole('heading', { level: 2, name: 'Žiadosť o zmenu adresy' })).toBeVisible();
  const prva = page.getByRole('button', { name: /Overiť v objednávke D-1042/ });
  await prva.focus();
  await expect(prva).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { level: 2, name: 'Objednávka overená' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Objednávka overená' })).toBeFocused();
  await page.keyboard.press('Tab');
  const aktivny = await page.evaluate(() => document.activeElement?.tagName);
  expect(aktivny).toBe('BUTTON');
});

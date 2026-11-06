import { readFile } from 'node:fs/promises';
import { Locator, Page, expect, test } from '@playwright/test';

const example = (page: Page, title: string) =>
  page
    .locator('docs-example-frame')
    .filter({ has: page.locator('h2, h3', { hasText: new RegExp(`^\\s*${title}\\s*$`) }) });

async function save(page: Page, trigger: Locator): Promise<{ name: string; bytes: Buffer }> {
  const [download] = await Promise.all([page.waitForEvent('download'), trigger.click()]);
  return {
    name: download.suggestedFilename(),
    bytes: await readFile((await download.path()) ?? ''),
  };
}

test.describe('export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/export');
    await page.locator('main h1').first().waitFor();
  });

  test('saves CSV with a BOM and Excel and Word as zip packages', async ({ page }) => {
    const frame = example(page, 'Formats');
    const csv = await save(page, frame.getByRole('button', { name: 'Export to CSV' }));
    expect(csv.name).toBe('invoices.csv');
    const text = csv.bytes.toString('utf8');
    expect(text.charCodeAt(0)).toBe(0xfeff);
    expect(text.slice(1).split('\r\n')[2]).toBe('INV-1002,Сонячна пекарня,860,2026-10-09,false');
    for (const [name, file] of [
      ['Export to Excel', 'invoices.xlsx'],
      ['Export to Word', 'invoices.docx'],
    ]) {
      const result = await save(page, frame.getByRole('button', { name }));
      expect(result.name).toBe(file);
      expect(result.bytes.subarray(0, 2).toString()).toBe('PK');
      expect(result.bytes.readUInt32LE(result.bytes.length - 22)).toBe(0x06054b50);
    }
  });

  test('saves a PDF with the embedded font after loading it on demand', async ({ page }) => {
    const pdf = await save(
      page,
      example(page, 'Formats').getByRole('button', { name: 'Export to PDF' }),
    );
    expect(pdf.name).toBe('invoices.pdf');
    const text = pdf.bytes.toString('latin1');
    expect(text.startsWith('%PDF-1.7')).toBe(true);
    expect(text).toContain('/BaseFont /TXREGU+Onest-Regular');
    expect(text).toContain('/FontFile2');
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
  });

  test('copies the table and shows that it was copied', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const button = example(page, 'Formats').getByRole('button', { name: 'Copy table' });
    await button.click();
    await expect(
      example(page, 'Formats').getByRole('button', { name: 'Table copied' }),
    ).toBeVisible();
    expect((await page.evaluate(() => navigator.clipboard.readText())).split('\n')[0]).toBe(
      'Invoice\tCustomer\tTotal, EUR\tIssued\tPaid',
    );
  });

  test('opens the menu of formats and saves the chosen one', async ({ page }) => {
    const frame = example(page, 'Menu');
    await frame.getByRole('button', { name: 'Export formats' }).first().click();
    await expect(page.getByRole('menuitem')).toHaveText([
      'Excel (.xlsx)',
      'CSV',
      'Word (.docx)',
      'PDF',
      'JSON',
      'HTML',
      'Markdown',
      'Copy table',
      'Print',
    ]);
    const json = await save(page, page.getByRole('menuitem', { name: 'JSON' }));
    expect(json.name).toBe('orders.json');
    expect(JSON.parse(json.bytes.toString('utf8'))[0]).toEqual({
      id: 5001,
      status: 'Paid',
      total: 120,
    });
    await expect(page.locator('body > tx-toast')).toContainText('Saved orders.json');
  });

  test('spins while rows load and can be cancelled', async ({ page }) => {
    const frame = example(page, 'Server');
    const main = frame.getByRole('button', { name: 'Export', exact: true });
    await frame.getByRole('checkbox', { name: 'Cancel the next export' }).click();
    await main.click();
    await expect(main).toBeDisabled();
    await expect(page.locator('body > tx-toast')).toContainText('Cancelled — nothing was exported');
    await expect(main).toBeEnabled();
    await frame.getByRole('checkbox', { name: 'Cancel the next export' }).click();
    const xlsx = await save(page, main);
    expect(xlsx.name).toBe('orders.xlsx');
  });
});

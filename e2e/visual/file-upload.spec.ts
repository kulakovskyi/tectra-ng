import { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const example = (page: Page, id: string) => page.locator(`file-upload-${id}-example`);
const file = (name: string, mimeType: string, kilobytes = 1) => ({ name, mimeType, buffer: Buffer.alloc(kilobytes * 1024, 65) });

test.describe('file upload', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/file-upload');
    await page.locator('main h1').first().waitFor();
  });

  test('the zone opens the file dialog by click and keyboard', async ({ page }) => {
    const zone = example(page, 'basic').getByRole('button', { name: /^Drop a file here or browse/ });
    const byClick = page.waitForEvent('filechooser');
    await zone.click();
    expect((await byClick).isMultiple()).toBe(false);
    await zone.focus();
    const byKey = page.waitForEvent('filechooser');
    await page.keyboard.press('Enter');
    await byKey;
  });

  test('a single file replaces the zone and can be replaced and removed', async ({ page }) => {
    const root = example(page, 'basic');
    await root.locator('input[type=file]').setInputFiles([file('customers.csv', 'text/csv', 3)]);
    await expect(root.getByText('Selected: customers.csv')).toBeVisible();
    const card = root.getByRole('group', { name: 'customers.csv' });
    await expect(card).toBeVisible();
    const chooser = page.waitForEvent('filechooser');
    await card.getByRole('button', { name: 'Replace' }).click();
    await (await chooser).setFiles([file('orders.csv', 'text/csv')]);
    await expect(root.getByText('Selected: orders.csv')).toBeVisible();
    let dialogs = 0;
    page.on('filechooser', () => dialogs++);
    await root.getByRole('button', { name: 'Remove orders.csv' }).click();
    await expect(root.getByRole('button', { name: /^Drop a file here or browse/ })).toBeVisible();
    await expect(root.getByText('Selected: nothing yet')).toBeVisible();
    await page.waitForTimeout(300);
    expect(dialogs).toBe(0);
  });

  test('dropped files highlight the zone and join the list', async ({ page }) => {
    const root = example(page, 'multiple');
    const zone = root.locator('.tx-file-upload__zone');
    const transfer = await page.evaluateHandle(() => {
      const data = new DataTransfer();
      data.items.add(new File(['a'], 'plan.pdf', { type: 'application/pdf' }));
      data.items.add(new File(['b'], 'cover.png', { type: 'image/png' }));
      return data;
    });
    await zone.dispatchEvent('dragenter', { dataTransfer: transfer });
    await expect(root.locator('tx-file-upload')).toHaveClass(/tx-file-upload--dragging/);
    await expect(zone).toContainText('Release to add');
    await zone.dispatchEvent('drop', { dataTransfer: transfer });
    await expect(root.locator('tx-file-upload')).not.toHaveClass(/tx-file-upload--dragging/);
    await expect(root.getByRole('listitem')).toHaveCount(2);
    await root.getByRole('button', { name: 'Remove plan.pdf' }).click();
    await expect(root.getByRole('listitem')).toHaveCount(1);
  });

  test('rejected files show why they were not added', async ({ page }) => {
    const root = example(page, 'validation');
    await root.locator('input[type=file]').setInputFiles([file('script.js', 'text/javascript'), file('scan.pdf', 'application/pdf', 2048), file('ok.png', 'image/png')]);
    await expect(root.getByText('script.js is not a supported file type (PNG, JPEG, PDF)')).toBeVisible();
    await expect(root.getByText('scan.pdf is larger than 1 MB')).toBeVisible();
    await expect(root.getByRole('listitem')).toHaveCount(1);
    await root.getByRole('button', { name: 'Close' }).first().click();
    await expect(root.getByText('script.js is not a supported file type (PNG, JPEG, PDF)')).toBeHidden();
  });

  test('upload shows progress and ends uploaded or failed with a retry', async ({ page }) => {
    const root = example(page, 'upload');
    await root.locator('input[type=file]').setInputFiles([file('notes.txt', 'text/plain'), file('contract.pdf', 'application/pdf')]);
    await expect(root.getByText('Files: 2')).toBeVisible();
    await root.getByRole('button', { name: 'Upload', exact: true }).click();
    await expect(root.getByRole('progressbar').first()).toBeVisible();
    await expect(root.getByRole('listitem').filter({ hasText: 'notes.txt' })).toContainText('Uploaded');
    await expect(root.getByRole('listitem').filter({ hasText: 'contract.pdf' })).toContainText('The server refused this file');
    await expect(root.getByRole('button', { name: 'Retry contract.pdf' })).toBeVisible();
    await expect(root.getByRole('progressbar')).toHaveCount(0);
  });

  test('a form field describes the zone with its error', async ({ page }) => {
    const root = example(page, 'form');
    await root.getByRole('button', { name: 'Send' }).click();
    const zone = root.locator('.tx-file-upload__zone');
    await expect(zone).toHaveAccessibleName(/^Contract Drop a file here or browse/);
    await expect(root.getByText('Attach the signed contract')).toBeVisible();
    const described = (await zone.getAttribute('aria-describedby')) ?? '';
    const ids = described.split(' ');
    const texts = await Promise.all(ids.map((id) => page.locator(`#${id}`).textContent()));
    expect(texts.join(' ')).toContain('Attach the signed contract');
    await root.locator('input[type=file]').setInputFiles([file('signed.pdf', 'application/pdf')]);
    await expect(root.getByText('signed.pdf').last()).toBeVisible();
  });
});

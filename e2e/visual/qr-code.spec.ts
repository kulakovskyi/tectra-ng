import { expect, test } from './fixtures';

declare class BarcodeDetector {
  constructor(options: { formats: string[] });
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}

test.describe('qr code', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/components/qr-code');
    await page.locator('main h1').first().waitFor();
  });

  test('every code on the page scans back to its text', async ({ page }) => {
    const supported = await page.evaluate(() => 'BarcodeDetector' in window);
    test.skip(!supported, 'this browser has no BarcodeDetector');
    const decoded = await page.evaluate(async () => {
      const detector = new BarcodeDetector({ formats: ['qr_code'] });
      const result: string[] = [];
      for (const svg of Array.from(document.querySelectorAll<SVGSVGElement>('tx-qr-code svg'))) {
        const clone = svg.cloneNode(true) as SVGSVGElement;
        const painted = Array.from(svg.querySelectorAll('rect, path'));
        clone.querySelectorAll('rect, path').forEach((element, index) => element.setAttribute('fill', getComputedStyle(painted[index]).fill));
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', '600');
        clone.setAttribute('height', '600');
        const image = new Image();
        image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(clone))}`;
        await image.decode();
        const canvas = document.createElement('canvas');
        canvas.width = 600;
        canvas.height = 600;
        canvas.getContext('2d')?.drawImage(image, 0, 0);
        const [code] = await detector.detect(canvas);
        result.push(code?.rawValue ?? '');
      }
      return result;
    });
    expect(decoded.length).toBeGreaterThan(10);
    expect(decoded.filter((text) => !text)).toEqual([]);
    expect(decoded).toContain('WIFI:T:WPA;S:Office;P:correct horse battery;;');
  });

  test('downloads a 1024 px PNG', async ({ page }) => {
    const root = page.locator('qr-code-download-example');
    const [download] = await Promise.all([page.waitForEvent('download'), root.getByRole('button', { name: 'Download PNG' }).click()]);
    expect(download.suggestedFilename()).toBe('office-wifi.png');
  });

  test('the code follows the text as you type', async ({ page }) => {
    const root = page.locator('qr-code-basic-example');
    const path = root.locator('.tx-qr-code__dots');
    const before = await path.getAttribute('d');
    await root.getByRole('textbox', { name: 'Text' }).fill('https://example.com/other');
    await expect.poll(() => path.getAttribute('d')).not.toBe(before);
  });
});

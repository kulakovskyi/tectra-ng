import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxQrCode } from './qr-code.component';
import { TxQrDotStyle, TxQrEyeFrameStyle, TxQrGradient } from './qr-code.types';
import { encodeQr } from '@tectra-ng/qr';

@Component({
  imports: [TxQrCode],
  template: `
    <tx-qr-code
      [data]="data()"
      [size]="160"
      [margin]="2"
      [dotStyle]="dotStyle()"
      [eyeFrameStyle]="eyeFrameStyle()"
      [color]="color()"
      [eyeColor]="eyeColor()"
      [gradient]="gradient()"
      [logo]="logo()"
      [dt]="{ root: { borderRadius: '4px' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly qr = viewChild.required(TxQrCode);
  readonly data = signal('https://example.com');
  readonly dotStyle = signal<TxQrDotStyle>('square');
  readonly eyeFrameStyle = signal<TxQrEyeFrameStyle>('square');
  readonly color = signal<string | undefined>(undefined);
  readonly eyeColor = signal<string | undefined>(undefined);
  readonly gradient = signal<TxQrGradient | undefined>(undefined);
  readonly logo = signal<string | undefined>(undefined);
}

describe('TxQrCode', () => {
  it('draws the code as an SVG image with a quiet zone', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-qr-code') as HTMLElement;
    const svg = root.querySelector('svg') as SVGSVGElement;
    const size = encodeQr('https://example.com').size;
    expect(root.style.getPropertyValue('--tx-qr-code-border-radius')).toBe('4px');
    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('QR code');
    expect(svg.getAttribute('width')).toBe('160');
    expect(svg.getAttribute('viewBox')).toBe(`-2 -2 ${size + 4} ${size + 4}`);
    expect(svg.getAttribute('shape-rendering')).toBe('crispEdges');
    expect(svg.querySelector('.tx-qr-code__dots')?.getAttribute('d')).toMatch(/^M/);
    expect(svg.querySelector('.tx-qr-code__eye-frames')?.getAttribute('fill-rule')).toBe('evenodd');
    expect(fixture.componentInstance.qr().matrix()?.errorCorrection).toBe('M');
  });

  it('applies colours, a gradient and a logo that raises the error correction', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.color.set('#1d4ed8');
    fixture.componentInstance.eyeColor.set('#dc2626');
    await fixture.whenStable();
    const svg = () => fixture.nativeElement.querySelector('svg') as SVGSVGElement;
    expect((svg().querySelector('.tx-qr-code__dots') as SVGElement).style.fill).toMatch(/rgb\(29, 78, 216\)|#1d4ed8/);
    expect((svg().querySelector('.tx-qr-code__eye-balls') as SVGElement).style.fill).toMatch(/rgb\(220, 38, 38\)|#dc2626/);

    fixture.componentInstance.gradient.set({ type: 'linear', colors: ['#000000', '#1d4ed8'], rotation: 45 });
    fixture.componentInstance.logo.set('/logo.svg');
    await fixture.whenStable();
    const gradient = svg().querySelector('linearGradient') as SVGElement;
    expect(gradient.getAttribute('id')).toBeTruthy();
    expect((svg().querySelector('.tx-qr-code__dots') as SVGElement).style.fill).toContain(gradient.getAttribute('id') as string);
    expect(svg().querySelector('image')?.getAttribute('href')).toBe('/logo.svg');
    expect(fixture.componentInstance.qr().matrix()?.errorCorrection).toBe('H');
  });

  it('shows the error text when the data does not fit', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.data.set('x'.repeat(4000));
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-qr-code') as HTMLElement;
    expect(root.querySelector('svg')).toBeNull();
    expect(root.querySelector('[role="alert"]')?.textContent?.trim()).toBe('Unable to render QR code');
  });

  it('exports a standalone SVG with resolved colours', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.color.set('#1d4ed8');
    await fixture.whenStable();
    const text = fixture.componentInstance.qr().toSvgString();
    expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(text).not.toContain('_ng');
    expect(text).not.toContain('class=');
    expect(text).not.toContain('<!--');
    expect(text).toMatch(/fill="(rgb\(29, 78, 216\)|#1d4ed8)"/);
  });

  it('renders nothing for empty data and exports an empty string without a drawing', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.data.set('');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-qr-code') as HTMLElement;
    const qr = fixture.componentInstance.qr();
    expect(root.querySelector('svg')).toBeNull();
    expect(root.querySelector('[role="alert"]')).toBeNull();
    expect(qr.hasError()).toBe(false);
    expect(qr.matrix()).toBeNull();
    expect(qr.toSvgString()).toBe('');
  });

  it('points the exported fills at the gradient', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.gradient.set({ type: 'radial', colors: ['#000000', '#1d4ed8'] });
    await fixture.whenStable();
    const id = fixture.nativeElement.querySelector('radialGradient')?.getAttribute('id') as string;
    const text = fixture.componentInstance.qr().toSvgString();
    expect(text).toContain(`fill="url(#${id})"`);
    expect(text).toContain('<radialGradient');
  });

  describe('image export', () => {
    let clicks: HTMLAnchorElement[];

    beforeEach(() => {
      clicks = [];
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
        clicks.push(this);
      });
      Object.defineProperty(HTMLImageElement.prototype, 'decode', { configurable: true, value: () => Promise.resolve() });
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
      vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockImplementation(function (this: HTMLCanvasElement) {
        return `data:image/png;size=${this.width}`;
      });
    });

    afterEach(() => {
      vi.restoreAllMocks();
      Reflect.deleteProperty(HTMLImageElement.prototype, 'decode');
    });

    it('makes PNG and SVG data URLs', async () => {
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      const qr = fixture.componentInstance.qr();
      expect(await qr.toDataUrl()).toBe('data:image/png;size=1024');
      expect(await qr.toDataUrl('png', 256)).toBe('data:image/png;size=256');
      const svg = await qr.toDataUrl('svg');
      expect(svg.startsWith('data:image/svg+xml;charset=utf-8,')).toBe(true);
      expect(decodeURIComponent(svg)).toContain('xmlns="http://www.w3.org/2000/svg"');
    });

    it('downloads the image under a file name', async () => {
      const fixture = TestBed.createComponent(Host);
      await fixture.whenStable();
      const qr = fixture.componentInstance.qr();
      await qr.download();
      await qr.download('svg', 'ticket', 512);
      expect(clicks.map((link) => link.download)).toEqual(['qr-code.png', 'ticket.svg']);
      expect(clicks[0].href).toBe('data:image/png;size=1024');
      expect(clicks[1].href.startsWith('data:image/svg+xml')).toBe(true);
    });
  });
});

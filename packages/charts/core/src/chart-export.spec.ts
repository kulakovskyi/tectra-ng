import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxChartFrame } from './chart-frame.component';
import { chartCsv, chartFileName, chartPngBlob, chartSvgSize, chartSvgString, downloadChartFile } from './chart-export';
import { chartBoxHeight, initialChartSize } from './chart-size';

@Component({
  imports: [TxChartFrame],
  template: `
    <tx-chart-frame
      [height]="300"
      [toolbar]="toolbar()"
      [showLegend]="legend()"
      [legendItems]="[{ key: 'a', label: 'Visits', color: 'red' }]"
      exportName="Visits by day"
      [table]="{ columns: [{ key: 'v', label: 'Visits' }], rows: [{ label: 'Mon', cells: ['1,200'] }] }"
    >
      <svg:rect class="own" x="0" y="0" width="10" height="10" />
    </tx-chart-frame>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly toolbar = signal(true);
  readonly legend = signal(false);
}

describe('chart export', () => {
  it('builds CSV with a header row, quoting and a BOM', () => {
    const csv = chartCsv({ columns: [{ key: 'v', label: 'Visits' }, { key: 's', label: 'Share' }], rows: [{ label: 'Mon, Tue', cells: ['1,200', '5%'] }] }, 'Day');
    expect(csv).toBe('\uFEFFDay,Visits,Share\r\n"Mon, Tue","1,200",5%');
  });

  it('makes a safe file name', () => {
    expect(chartFileName('Visits by day / 2026', 'png')).toBe('visits-by-day-2026.png');
    expect(chartFileName('Відвідування', 'csv')).toBe('відвідування.csv');
    expect(chartFileName('  ', 'svg')).toBe('chart.svg');
  });

  it('serializes the SVG with inline styles, a background and the legend', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 200 100');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('class', 'bar');
    rect.style.fill = 'rgb(255, 0, 0)';
    svg.appendChild(rect);
    document.body.appendChild(svg);
    const markup = chartSvgString(svg, { background: '#fff', legend: [{ key: 'a', label: 'Visits', color: 'red' }, { key: 'b', label: 'Hidden', color: 'blue', hidden: true }] });
    svg.remove();
    expect(chartSvgSize(markup)).toEqual({ width: 200, height: 128 });
    expect(markup).toContain('fill:rgb(255, 0, 0)');
    expect(markup).not.toContain('class="bar"');
    expect(markup).toContain('>Visits<');
    expect(markup).not.toContain('Hidden');
    expect(markup).toContain('translate(0 28)');
  });

  it('reserves a toolbar row unless the legend row holds the button', () => {
    expect(chartBoxHeight(300, null, true)).toBe(269);
    expect(chartBoxHeight(300, 'top', true)).toBe(269);
    expect(chartBoxHeight(300, 'bottom', true)).toBe(238);
    expect(chartBoxHeight(300, 'bottom', false)).toBe(269);
    expect(initialChartSize(300, 'left', 640, true).height).toBe(269);
  });
});

describe('TxChartFrame toolbar', () => {
  it('shows the menu button and reserves its row', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const frame = fixture.nativeElement.querySelector('tx-chart-frame') as HTMLElement;
    expect(frame.getAttribute('data-toolbar')).toBe('own');
    const button = frame.querySelector('.tx-chart-frame__menu-button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Chart menu');
    fixture.componentInstance.legend.set(true);
    await fixture.whenStable();
    expect(frame.getAttribute('data-toolbar')).toBe('legend');
    fixture.componentInstance.toolbar.set(false);
    await fixture.whenStable();
    expect(frame.hasAttribute('data-toolbar')).toBe(false);
    expect(frame.querySelector('.tx-chart-frame__menu-button')).toBeNull();
  });

  it('downloads the data as CSV', async () => {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const created: Blob[] = [];
    const url = URL as unknown as { createObjectURL?: (blob: Blob) => string; revokeObjectURL?: (url: string) => void };
    const original = { create: url.createObjectURL, revoke: url.revokeObjectURL };
    url.createObjectURL = (blob: Blob) => {
      created.push(blob);
      return 'blob:chart';
    };
    url.revokeObjectURL = () => undefined;
    const clicks: string[] = [];
    const click = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
      clicks.push(this.download);
    };
    const frame = fixture.debugElement.query((element) => element.nativeElement.localName === 'tx-chart-frame').componentInstance as TxChartFrame;
    frame.download('csv');
    HTMLAnchorElement.prototype.click = click;
    url.createObjectURL = original.create;
    url.revokeObjectURL = original.revoke;
    expect(clicks).toEqual(['visits-by-day.csv']);
    const text = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.readAsText(created[0]);
    });
    expect(text).toContain('Mon,"1,200"');
  });
});

describe('chart export without a browser window', () => {
  const svgIn = (doc: Document, viewBox: string | null) => {
    const svg = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
    if (viewBox) svg.setAttribute('viewBox', viewBox);
    svg.appendChild(doc.createElementNS('http://www.w3.org/2000/svg', 'foreignObject'));
    svg.appendChild(doc.createElementNS('http://www.w3.org/2000/svg', 'circle'));
    return svg;
  };

  it('serializes markup without inline styles in a detached document', () => {
    const detached = document.implementation.createHTMLDocument();
    const markup = chartSvgString(svgIn(detached, null), { fontFamily: 'Onest', textColor: '#111', legend: [{ key: 'a', label: 'A', color: 'red' }] });
    expect(markup).toContain('font-family="Onest"');
    expect(markup).toContain('fill="#111"');
    expect(markup).toContain('<foreignObject');
    expect(chartSvgSize(markup)).toEqual({ width: 0, height: 28 });
    expect(chartSvgSize('<svg></svg>')).toEqual({ width: 0, height: 0 });
  });

  it('drops foreign objects and keeps fill and stroke when serializing in the page', () => {
    const svg = svgIn(document, '0 0 10 10');
    document.body.appendChild(svg);
    const markup = chartSvgString(svg);
    svg.remove();
    expect(markup).not.toContain('foreignObject');
    expect(markup).toContain('fill:');
    expect(markup).toContain('font-family="sans-serif"');
    expect(chartCsv({ columns: [], rows: [{ label: 'Mon', cells: [] }] })).toBe('\uFEFF\r\nMon');
  });

  it('does not download without a window', () => {
    const detached = document.implementation.createHTMLDocument();
    downloadChartFile(detached, new Blob(['x']), 'chart.csv');
    expect(detached.querySelector('a')).toBeNull();
  });

  describe('PNG', () => {
    const view = window as unknown as Record<string, unknown>;
    let image: unknown;
    let fail = false;

    beforeEach(() => {
      image = view['Image'];
      fail = false;
      view['Image'] = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => (fail ? this.onerror?.() : this.onload?.()));
        }
      };
    });

    afterEach(() => {
      view['Image'] = image;
      vi.restoreAllMocks();
    });

    const markup = '<svg viewBox="0 0 100 50"></svg>';

    it('draws the SVG on a canvas at twice the size', async () => {
      const drawn: number[][] = [];
      const canvases: HTMLCanvasElement[] = [];
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(function (this: HTMLCanvasElement) {
        canvases.push(this);
        return { scale: (x: number, y: number) => drawn.push([x, y]), drawImage: () => drawn.push([0]) } as unknown as CanvasRenderingContext2D;
      } as unknown as HTMLCanvasElement['getContext']);
      const png = new Blob(['png'], { type: 'image/png' });
      vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback: BlobCallback) => callback(png));
      await expect(chartPngBlob(document, markup)).resolves.toBe(png);
      expect(canvases[0].width).toBe(200);
      expect(canvases[0].height).toBe(100);
      expect(drawn).toEqual([[2, 2], [0]]);
    });

    it('rejects without a blob, a canvas, a loaded image or a window', async () => {
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ scale: () => undefined, drawImage: () => undefined } as unknown as ImageBitmapRenderingContext);
      vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback: BlobCallback) => callback(null));
      await expect(chartPngBlob(document, markup, 1)).rejects.toThrow('no blob');
      vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null);
      await expect(chartPngBlob(document, '<svg></svg>')).rejects.toThrow('no canvas');
      fail = true;
      await expect(chartPngBlob(document, markup)).rejects.toThrow('image');
      await expect(chartPngBlob(document.implementation.createHTMLDocument(), markup)).rejects.toThrow('no window');
    });
  });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxChartFrame } from './chart-frame.component';
import { chartCsv, chartFileName, chartSvgSize, chartSvgString } from './chart-export';
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

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartFrame } from './chart-frame.component';
import { TxChartLegend } from './chart-legend.component';
import { TxChartLegendItem, TxChartPointerEvent, TxChartTable, TxChartTooltipData } from './chart.types';

@Component({
  imports: [TxChartFrame],
  template: `
    <tx-chart-frame
      [height]="300"
      [(size)]="size"
      [legendItems]="items()"
      [empty]="empty()"
      [loading]="loading()"
      [summary]="'Line chart, 2 series'"
      [table]="table"
      [tooltip]="tooltip()"
      [parts]="{ plot: { class: 'own-plot' }, legend: { class: 'own-legend' } }"
      (legendToggled)="toggled.push($event)"
      (pointer)="pointers.push($event)"
      (navigate)="keys.push($event.key)"
    >
      <svg:rect class="own-shape" width="10" height="10" />
    </tx-chart-frame>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FrameHost {
  readonly size = signal({ width: 640, height: 269 });
  readonly items = signal<TxChartLegendItem[]>([
    { key: 'a', label: 'Visits', color: 'red' },
    { key: 'b', label: 'Sign-ups', color: 'blue', hidden: true },
  ]);
  readonly empty = signal(false);
  readonly loading = signal(false);
  readonly tooltip = signal<TxChartTooltipData | null>(null);
  readonly table: TxChartTable = { columns: [{ key: '0', label: 'Visits' }], rows: [{ label: 'Mon', cells: ['12'] }] };
  readonly toggled: string[] = [];
  readonly pointers: TxChartPointerEvent[] = [];
  readonly keys: string[] = [];
}

@Component({
  imports: [TxChartLegend],
  template: `<tx-chart-legend [items]="items" [toggle]="false" position="right" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class StaticLegendHost {
  readonly items: TxChartLegendItem[] = [{ key: 'a', label: 'Search', color: 'red', value: '42', percent: '42%' }];
}

describe('TxChartFrame', () => {
  let fixture: ComponentFixture<FrameHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(FrameHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('renders the plot as an image with a summary, a hint and a hidden table', () => {
    const plot = el('.tx-chart-frame__plot');
    expect(plot.getAttribute('role')).toBe('img');
    expect(plot.getAttribute('aria-label')).toBe('Line chart, 2 series');
    expect(plot.getAttribute('tabindex')).toBe('0');
    expect(document.getElementById(plot.getAttribute('aria-describedby') ?? '')?.textContent).toContain('Arrow keys');
    expect(plot.classList).toContain('own-plot');
    expect(el('svg').getAttribute('viewBox')).toBe('0 0 640 269');
    expect(el('svg .own-shape')).not.toBeNull();
    expect(el('table caption').textContent?.trim()).toBe('Line chart, 2 series');
    expect(all('tbody td').map((cell) => cell.textContent)).toEqual(['12']);
    expect(el('tx-chart-frame').style.height).toBe('300px');
  });

  it('shows a legend that toggles and moves with the arrow keys', () => {
    const buttons = all('.tx-chart-legend__item');
    expect(el('tx-chart-legend').classList).toContain('own-legend');
    expect(buttons.map((button) => button.getAttribute('aria-pressed'))).toEqual(['true', 'false']);
    buttons[1].click();
    expect(fixture.componentInstance.toggled).toEqual(['b']);
    buttons[0].focus();
    buttons[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(document.activeElement).toBe(buttons[1]);
    expect(buttons[1].tabIndex).toBe(0);
    buttons[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('forwards pointer and arrow keys', () => {
    const plot = el('.tx-chart-frame__plot');
    plot.dispatchEvent(new MouseEvent('pointermove', { clientX: 120, clientY: 40, bubbles: true }));
    plot.dispatchEvent(new MouseEvent('pointerleave'));
    expect(fixture.componentInstance.pointers.map((event) => [event.type, event.x, event.y])).toEqual([
      ['move', 120, 40],
      ['leave', 0, 0],
    ]);
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    plot.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    expect(fixture.componentInstance.keys).toEqual(['ArrowLeft']);
  });

  it('shows "No data" and a skeleton instead of the plot', async () => {
    fixture.componentInstance.empty.set(true);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty').textContent).toContain('No data');
    expect(el('svg.tx-chart-frame__svg')).toBeNull();
    expect(el('tx-chart-legend')).toBeNull();
    expect(el('table')).toBeNull();
    fixture.componentInstance.empty.set(false);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(el('tx-skeleton')).not.toBeNull();
    expect(el('.tx-chart-frame__plot').getAttribute('role')).toBeNull();
  });

  it('opens the tooltip on the overlay and keeps it until it is cleared', async () => {
    fixture.componentInstance.tooltip.set({ title: 'Mon', rows: [{ label: 'Visits', value: '12', color: 'red', raw: 12, seriesIndex: 0 }], index: 0, x: 40, y: 20 });
    await fixture.whenStable();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Mon');
    expect(panel.textContent).toContain('Visits');
    expect(panel.getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/);
    expect(panel.querySelector('.tx-chart-frame__tooltip-arrow')).not.toBeNull();
    expect(el('.tx-chart-frame__anchor').style.transform).toBe('translate(40px, 20px)');
    fixture.componentInstance.tooltip.set({ title: 'Tue', rows: [{ label: 'Visits', value: '15', color: 'red', raw: 15, seriesIndex: 0 }], index: 1, x: 80, y: 20, placement: 'right', total: '15' });
    await fixture.whenStable();
    const moved = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(moved.textContent).toContain('Tue');
    expect(moved.getAttribute('data-side')).toMatch(/^(top|bottom|left|right)$/);
    expect(moved.querySelector('.tx-chart-frame__tooltip-total')?.textContent).toContain('Total');
    fixture.componentInstance.tooltip.set(null);
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(document.querySelector('.tx-chart-frame__tooltip')).toBeNull();
  });
});

describe('TxChartLegend', () => {
  it('lists values and shares without toggles', async () => {
    const fixture = TestBed.createComponent(StaticLegendHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const legend = fixture.nativeElement.querySelector('tx-chart-legend') as HTMLElement;
    expect(legend.getAttribute('role')).toBe('list');
    expect(legend.classList).toContain('tx-chart-legend--values');
    expect(legend.querySelector('button')).toBeNull();
    expect(legend.querySelector('[role="listitem"]')?.textContent).toContain('42%');
  });
});

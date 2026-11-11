import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxWaterfallChart } from './waterfall-chart.component';
import { TxWaterfallBarEvent, TxWaterfallItem } from './waterfall-chart.types';
import { waterfallExtent, waterfallSteps } from './waterfall-layout';

@Component({
  imports: [TxWaterfallChart],
  template: `<tx-waterfall-chart id="main" [items]="items()" [connectors]="connectors()" [pt]="{ bar: { class: 'own-bar' } }" (barClick)="clicks.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxWaterfallItem[]>([
    { label: 'Start', value: 100 },
    { label: 'Sales', value: 40 },
    { label: 'Refunds', value: -25 },
    { label: 'Fees', value: -10 },
    { label: 'End', total: true },
  ]);
  readonly connectors = signal(true);
  readonly clicks: TxWaterfallBarEvent[] = [];
}

describe('waterfall layout', () => {
  it('keeps a running total and closes it with total bars', () => {
    const steps = waterfallSteps([{ label: 'A', value: 10 }, { label: 'B', value: -4 }, { label: 'Sum', total: true }, { label: 'C', value: null }]);
    expect(steps.map((step) => [step.kind, step.from, step.to])).toEqual([
      ['up', 0, 10],
      ['down', 10, 6],
      ['total', 0, 6],
      ['up', 6, 6],
    ]);
    expect(waterfallExtent(waterfallSteps([{ label: 'A', value: -5 }, { label: 'B', value: 12 }]))).toEqual([-5, 7]);
  });
});

describe('TxWaterfallChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#main .tx-chart-frame__plot');

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws floating bars by kind with signed labels and connectors', () => {
    const bars = all('#main .tx-waterfall-chart__bar');
    expect(bars.map((bar) => bar.getAttribute('data-kind'))).toEqual(['up', 'up', 'down', 'down', 'total']);
    expect(bars[0].classList).toContain('own-bar');
    expect(all('#main .tx-waterfall-chart__label').map((label) => label.textContent?.trim())).toEqual(['+100', '+40', '−25', '−10', '105']);
    expect(all('#main .tx-waterfall-chart__connector')).toHaveLength(4);
    expect(Number(bars[2].getAttribute('y'))).toBeCloseTo(Number(bars[1].getAttribute('y')), 0);
    expect(all('#main .tx-chart-legend__item').map((item) => item.textContent?.trim())).toEqual(['Increase', 'Decrease', 'Total']);
    expect(el('#main .tx-chart-legend__item').tagName).toBe('SPAN');
    expect(plot().getAttribute('aria-label')).toBe('Waterfall chart, 1 series, 5 values, total 105');
  });

  it('drops the connectors', async () => {
    fixture.componentInstance.connectors.set(false);
    await fixture.whenStable();
    expect(all('#main .tx-waterfall-chart__connector')).toHaveLength(0);
  });

  it('reads the steps with the keyboard: the change and the running total', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-waterfall-chart__bar--active').getAttribute('data-index')).toBe('2');
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Refunds');
    expect(panel.textContent).toContain('−25');
    expect(panel.textContent).toContain('115');
  });

  it('reports the clicked step', () => {
    const bar = all('#main .tx-waterfall-chart__bar')[4];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(bar.getAttribute('x')) + 2, clientY: Number(bar.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ index: 4, label: 'End', change: 105, total: 105, kind: 'total' });
  });
});

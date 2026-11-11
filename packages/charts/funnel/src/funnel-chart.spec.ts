import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxFunnelChart } from './funnel-chart.component';
import { TxFunnelItem, TxFunnelStageEvent } from './funnel-chart.types';
import { funnelBoxes, funnelConnectorPath, funnelIndexAt, funnelRate } from './funnel-layout';

@Component({
  imports: [TxFunnelChart],
  template: `
    <tx-funnel-chart id="main" [items]="items()" [colorful]="colorful()" [pt]="{ stage: { class: 'own-stage' } }" (stageClick)="clicks.push($event)" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxFunnelItem[]>([
    { label: 'Visits', value: 1000 },
    { label: 'Sign-ups', value: 400 },
    { label: 'Trials', value: 120 },
    { label: 'Paid', value: 30 },
  ]);
  readonly colorful = signal(false);
  readonly clicks: TxFunnelStageEvent[] = [];
}

describe('funnel layout', () => {
  it('centres bars sized by the biggest value with gaps between rows', () => {
    const boxes = funnelBoxes({ values: [100, 50], left: 0, width: 200, top: 0, height: 120, gapRatio: 0.4, minWidth: 4 });
    expect(boxes).toEqual([
      { index: 0, value: 100, x: 0, y: 0, width: 200, height: 50 },
      { index: 1, value: 50, x: 50, y: 70, width: 100, height: 50 },
    ]);
    expect(funnelConnectorPath(boxes[0], boxes[1])).toBe('M0,50L200,50L150,70L50,70Z');
    expect(funnelRate(25, 200)).toBe(12.5);
    expect(funnelRate(5, 0)).toBe(0);
    expect(funnelIndexAt(boxes, 10)).toBe(0);
    expect(funnelIndexAt(boxes, 64)).toBe(1);
    expect(funnelIndexAt(boxes, 130)).toBe(-1);
  });
});

describe('TxFunnelChart', () => {
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

  it('draws one stage per step with labels, values and conversions', () => {
    const stages = all('#main .tx-funnel-chart__stage');
    expect(stages).toHaveLength(4);
    expect(stages[0].classList).toContain('own-stage');
    expect(Number(stages[1].getAttribute('width'))).toBeCloseTo(Number(stages[0].getAttribute('width')) * 0.4, 0);
    expect(all('#main .tx-funnel-chart__label').map((label) => label.textContent?.trim())).toEqual(['Visits', 'Sign-ups', 'Trials', 'Paid']);
    expect(all('#main .tx-funnel-chart__value').map((value) => value.textContent?.trim())).toEqual(['1,000', '400', '120', '30']);
    expect(all('#main .tx-funnel-chart__conversion').map((value) => value.textContent?.trim())).toEqual(['40%', '30%', '25%']);
    expect(all('#main .tx-funnel-chart__connector')).toHaveLength(3);
    expect(new Set(stages.map((stage) => stage.style.fill)).size).toBe(1);
    expect(plot().getAttribute('aria-label')).toBe('Funnel chart, 1 series, 4 values, conversion 3%');
  });

  it('gives every stage its own colour', async () => {
    fixture.componentInstance.colorful.set(true);
    await fixture.whenStable();
    expect(new Set(all('#main .tx-funnel-chart__stage').map((stage) => stage.style.fill)).size).toBe(4);
  });

  it('walks the stages with the keyboard and shows the conversion', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-funnel-chart__stage--active').getAttribute('data-index')).toBe('1');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Sign-ups');
    expect(panel.textContent).toContain('Of first');
    expect(panel.textContent).toContain('40%');
  });

  it('reports the clicked stage', () => {
    const stage = all('#main .tx-funnel-chart__stage')[2];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(stage.getAttribute('x')) + 1, clientY: Number(stage.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ index: 2, label: 'Trials', value: 120, ofFirst: 12, conversion: 30 });
  });
});

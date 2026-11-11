import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxBulletChart } from './bullet-chart.component';
import { TxBulletEvent, TxBulletItem } from './bullet-chart.types';
import { bulletMax, bulletSegments } from './bullet-layout';

@Component({
  imports: [TxBulletChart],
  template: `<tx-bullet-chart id="main" [items]="items()" [ranges]="[50, 80]" [max]="100" [pt]="{ bar: { class: 'own-bar' } }" (barClick)="clicks.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxBulletItem[]>([
    { label: 'Revenue', value: 72, target: 85 },
    { label: 'Profit', value: 40, target: 30, ranges: [20, 35, 60] },
    { label: 'Orders', value: null },
  ]);
  readonly clicks: TxBulletEvent[] = [];
}

describe('bullet layout', () => {
  it('splits the scale into qualitative ranges, the last one the lightest', () => {
    expect(bulletSegments([50, 80], 0, 100, 3)).toEqual([
      { level: 1, from: 0, to: 50 },
      { level: 2, from: 50, to: 80 },
      { level: 3, from: 80, to: 100 },
    ]);
    expect(bulletSegments([60, 30], 0, 100, 3).map((segment) => [segment.level, segment.to])).toEqual([
      [1, 30],
      [2, 60],
      [3, 100],
    ]);
    expect(bulletSegments([], 0, 10, 3)).toEqual([{ level: 3, from: 0, to: 10 }]);
    expect(bulletMax([3, null, 12, undefined])).toBe(12);
  });
});

describe('TxBulletChart', () => {
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

  it('draws a row per item with ranges, a value bar and a target', () => {
    expect(all('#main .tx-bullet-chart__row')).toHaveLength(3);
    expect(all('#main .tx-chart-axes__axis[data-position="left"] .tx-chart-axes__label').map((label) => label.textContent?.trim())).toEqual(['Revenue', 'Profit', 'Orders']);
    expect(all('#main .tx-bullet-chart__row[data-index="0"] .tx-bullet-chart__range').map((range) => range.getAttribute('data-level'))).toEqual(['1', '2', '3']);
    expect(all('#main .tx-bullet-chart__row[data-index="1"] .tx-bullet-chart__range')).toHaveLength(4);
    expect(all('#main .tx-bullet-chart__bar')).toHaveLength(2);
    expect(el('#main .tx-bullet-chart__bar').classList).toContain('own-bar');
    expect(all('#main .tx-bullet-chart__target')).toHaveLength(2);
    const bar = el('#main .tx-bullet-chart__bar');
    const target = el('#main .tx-bullet-chart__target');
    expect(Number(target.getAttribute('x1'))).toBeGreaterThan(Number(bar.getAttribute('x')) + Number(bar.getAttribute('width')));
    expect(el('#main .tx-chart-frame').style.height).toBe('162px');
    expect(plot().getAttribute('aria-label')).toBe('Bullet chart, 1 series, 3 values');
  });

  it('walks the rows with the keyboard and shows the value and the target', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-bullet-chart__row--active').getAttribute('data-index')).toBe('1');
    expect(el('#main .tx-chart-hover-band--on')).not.toBeNull();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Profit');
    expect(panel.textContent).toContain('Target');
    expect(panel.textContent).toContain('30');
  });

  it('reports the clicked row', () => {
    const bar = all('#main .tx-bullet-chart__bar')[1];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(bar.getAttribute('x')) + 2, clientY: Number(bar.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toEqual({ index: 1, label: 'Profit', value: 40, target: 30 });
  });
});

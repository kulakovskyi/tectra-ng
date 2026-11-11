import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSunburstChart } from './sunburst-chart.component';
import { TxSunburstEvent, TxSunburstItem } from './sunburst-chart.types';

@Component({
  imports: [TxSunburstChart],
  template: `
    <tx-sunburst-chart id="main" [data]="data" [pt]="{ segment: { class: 'own-segment' } }" (segmentClick)="clicks.push($event)" (focusChange)="focus.push($event)" />
    <tx-sunburst-chart id="empty" [data]="[]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly data: TxSunburstItem[] = [
    { label: 'Europe', children: [{ label: 'France', value: 30 }, { label: 'Spain', value: 10, children: [{ label: 'Madrid', value: 6 }, { label: 'Seville', value: 4 }] }] },
    { label: 'Asia', value: 60, children: [{ label: 'Japan', value: 20 }] },
  ];
  readonly clicks: TxSunburstEvent[] = [];
  readonly focus: string[][] = [];
}

describe('TxSunburstChart', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#main .tx-chart-frame__plot');
  const key = (name: string) => plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws nested rings with the total in the centre', () => {
    expect(all('#main .tx-sunburst-chart__segment').map((segment) => segment.getAttribute('data-key'))).toEqual(['0', '0.0', '0.1', '0.1.0', '0.1.1', '1', '1.0']);
    expect(el('#main .tx-sunburst-chart__segment').classList).toContain('own-segment');
    expect(el('#main [data-key="0.0"]').style.fill).toContain('color-mix');
    expect(el('#main .tx-sunburst-chart__center').textContent).toContain('100');
    expect(el('#main .tx-sunburst-chart__center').textContent).toContain('Total');
    expect(plot().getAttribute('aria-label')).toBe('Sunburst chart, Total 100: Europe 40%, Asia 60%');
  });

  it('walks rings with the keyboard and shows shares in the tooltip', async () => {
    key('ArrowRight');
    key('ArrowDown');
    key('ArrowRight');
    await fixture.whenStable();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Europe');
    expect(panel.textContent).toContain('Spain');
    expect(panel.textContent).toContain('25%');
    expect(panel.textContent).toContain('10%');
    expect(all('#main .tx-sunburst-chart__segment--lit').map((segment) => segment.getAttribute('data-key'))).toEqual(['0', '0.1']);
  });

  it('drills into a branch with Enter and back with Escape', async () => {
    key('ArrowRight');
    key('Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ path: ['Europe'], value: 40 });
    expect(fixture.componentInstance.focus[0]).toEqual(['Europe']);
    expect(all('#main .tx-sunburst-chart__segment').map((segment) => segment.getAttribute('data-key'))).toEqual(['0.0', '0.1', '0.1.0', '0.1.1']);
    expect(el('#main .tx-sunburst-chart__center').textContent).toContain('Europe');
    expect(el('#main .tx-sunburst-chart__back')).not.toBeNull();
    key('Escape');
    await fixture.whenStable();
    expect(fixture.componentInstance.focus[1]).toEqual([]);
    expect(all('#main .tx-sunburst-chart__segment')).toHaveLength(7);
  });

  it('shows "No data" without values', () => {
    expect(el('#empty .tx-chart-frame__empty')).not.toBeNull();
  });
});

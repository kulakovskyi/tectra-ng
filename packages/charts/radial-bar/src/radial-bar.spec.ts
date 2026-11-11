import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { strokeArc } from '@tectra-ng/charts/core';
import { TxRadialBar } from './radial-bar.component';
import { TxRadialBarEvent, TxRadialBarItem } from './radial-bar.types';
import { radialRings, radialShare } from './radial-bar-layout';

@Component({
  imports: [TxRadialBar],
  template: `
    <tx-radial-bar id="main" [items]="items()" totalLabel="Average" [pt]="{ bar: { class: 'own-bar' } }" (barClick)="clicks.push($event)" />
    <tx-radial-bar id="single" [items]="[{ label: 'Storage', value: 640, max: 1000 }]" [startAngle]="-135" [endAngle]="135" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxRadialBarItem[]>([
    { label: 'Design', value: 80 },
    { label: 'Build', value: 45 },
    { label: 'Test', value: 20 },
  ]);
  readonly clicks: TxRadialBarEvent[] = [];
}

describe('radial bar layout', () => {
  it('splits the space between the hole and the edge into rings', () => {
    expect(radialRings(2, 100, 40, 0.5)).toEqual([
      { radius: 92.5, width: 15 },
      { radius: 62.5, width: 15 },
    ]);
    expect(radialShare(150, 100)).toBe(1);
    expect(radialShare(null, 100)).toBe(0);
    expect(radialShare(25, 0)).toBe(0);
    expect(strokeArc(0, 0, 10, 0, Math.PI / 2)).toBe('M0,-10A10,10 0 0 1 10,0');
  });
});

describe('TxRadialBar', () => {
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

  it('draws a ring with a track per item and the average in the centre', () => {
    expect(all('#main .tx-radial-bar__track')).toHaveLength(3);
    expect(all('#main .tx-radial-bar__bar')).toHaveLength(3);
    expect(el('#main .tx-radial-bar__bar').classList).toContain('own-bar');
    expect(el('#main .tx-radial-bar__center').textContent).toContain('Average');
    expect(el('#main .tx-radial-bar__center').textContent).toContain('48.3%');
    expect(plot().getAttribute('aria-label')).toContain('Design 80%');
  });

  it('shows a single item in the centre as a share of its max', () => {
    expect(el('#single .tx-radial-bar__center').textContent).toContain('64%');
    expect(el('#single .tx-radial-bar__center').textContent).toContain('Storage');
    expect(all('#single .tx-chart-legend__item')).toHaveLength(0);
  });

  it('walks the rings with the keyboard and shows the value in the tooltip', async () => {
    key('ArrowDown');
    key('ArrowDown');
    await fixture.whenStable();
    expect(el('#main .tx-radial-bar__ring--hovered').getAttribute('data-index')).toBe('1');
    expect(el('#main .tx-radial-bar__center').textContent).toContain('Build');
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('45');
    key('Escape');
    await fixture.whenStable();
    expect(el('#main .tx-radial-bar__ring--hovered')).toBeNull();
  });

  it('reports a click on a ring', () => {
    const svg = el('#main svg');
    const [, , width, height] = (svg.getAttribute('viewBox') ?? '0 0 0 0').split(' ').map(Number);
    plot().dispatchEvent(new MouseEvent('click', { clientX: width / 2, clientY: height / 2 - Math.min(width, height) / 2 + 12, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ index: 0, label: 'Design', value: 80, share: 0.8 });
  });

  it('hides an item from the legend', async () => {
    all('#main .tx-chart-legend__item')[2].click();
    await fixture.whenStable();
    expect(all('#main .tx-radial-bar__track')).toHaveLength(2);
  });
});

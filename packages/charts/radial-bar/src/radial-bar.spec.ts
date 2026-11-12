import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxChartLegendVariant, strokeArc } from '@tectra-ng/charts/core';
import { TxRadialBar } from './radial-bar.component';
import { TxRadialBarEvent, TxRadialBarItem, TxRadialBarToggle } from './radial-bar.types';
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
    expect(radialRings(0, 100, 40, 0.5)).toEqual([]);
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

@Component({
  imports: [TxRadialBar],
  template: `
    <tx-radial-bar
      id="opts"
      [items]="items()"
      [startAngle]="start()"
      [endAngle]="end()"
      [centerValue]="centerValue()"
      [legendVariant]="variant()"
      [legendValues]="values()"
      [ariaLabel]="ariaLabel()"
      [dt]="dt()"
      (barClick)="clicks.push($event)"
      (barToggle)="toggles.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly items = signal<TxRadialBarItem[] | null>([
    { label: 'Design', value: 80 },
    { label: 'Build', value: null },
    { label: 'Test', value: 20, max: 40 },
  ]);
  readonly start = signal(0);
  readonly end = signal(360);
  readonly centerValue = signal<'percent' | 'value'>('percent');
  readonly variant = signal<TxChartLegendVariant>('dot');
  readonly values = signal(false);
  readonly ariaLabel = signal('');
  readonly dt = signal<Record<string, Record<string, string>> | undefined>(undefined);
  readonly clicks: TxRadialBarEvent[] = [];
  readonly toggles: TxRadialBarToggle[] = [];
}

describe('TxRadialBar options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const plot = () => el('#opts .tx-chart-frame__plot');
  const tooltip = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement | null;
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, x: number, y: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
    await fixture.whenStable();
  };
  const ringStart = (index: number) => {
    const track = el(`#opts .tx-radial-bar__ring[data-index="${index}"] .tx-radial-bar__track`);
    const [x, y] = (track.getAttribute('d') ?? '').slice(1).split('A')[0].split(',').map(Number);
    return { x, y };
  };
  const hovered = () => el('#opts .tx-radial-bar__ring--hovered')?.getAttribute('data-index') ?? null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('draws an empty ring for a missing value and writes a dash for it', () => {
    expect(all('#opts .tx-radial-bar__track')).toHaveLength(3);
    expect(all('#opts .tx-radial-bar__bar')).toHaveLength(2);
    expect(el('#opts .tx-radial-bar__center')).toBeNull();
    expect(all('#opts tbody tr')[1].textContent).toContain('—');
    expect(plot().getAttribute('aria-label')).toContain('Test 50%');
  });

  it('lists values and shares in the legend and as stat cards', async () => {
    host.values.set(true);
    await fixture.whenStable();
    expect(all('#opts .tx-chart-legend__value').map((item) => item.textContent)).toEqual(['80', '—', '20']);
    expect(all('#opts .tx-chart-legend__percent').map((item) => item.textContent)).toEqual(['80%', '0%', '50%']);
    host.variant.set('stat');
    await fixture.whenStable();
    expect(all('#opts .tx-chart-legend__caption').map((item) => item.textContent)).toEqual(['80%', '0%', '50%']);
    await key('ArrowRight');
    expect(hovered()).toBe('0');
    expect(tooltip()).toBeNull();
  });

  it('walks the rings, jumps to the ends and ignores other keys', async () => {
    host.centerValue.set('value');
    await key('ArrowLeft');
    expect(hovered()).toBe('2');
    expect(el('#opts .tx-radial-bar__center').textContent).toContain('20');
    await key('Home');
    expect(hovered()).toBe('0');
    expect(tooltip()?.textContent).toContain('80');
    await key('End');
    expect(hovered()).toBe('2');
    await key('ArrowUp');
    expect(hovered()).toBe('1');
    expect(tooltip()?.textContent).toContain('—');
    await key('a');
    expect(hovered()).toBe('1');
    host.items.set([{ label: 'Quarter', value: 25 }]);
    await key('Home');
    expect(tooltip()?.textContent).toContain('25%');
  });

  it('forgets a hovered ring that is no longer drawn', async () => {
    await key('End');
    expect(tooltip()).not.toBeNull();
    host.items.set([
      { label: 'Design', value: 80 },
      { label: 'Build', value: 30 },
    ]);
    await fixture.whenStable();
    expect(tooltip()).toBeNull();
    expect(el('#opts .tx-radial-bar__center')).toBeNull();
  });

  it('ignores the keyboard when every ring is hidden', async () => {
    all('#opts .tx-chart-legend__item').forEach((item) => item.click());
    await fixture.whenStable();
    expect(host.toggles.map((toggle) => toggle.label)).toEqual(['Design', 'Build', 'Test']);
    await key('ArrowRight');
    expect(hovered()).toBeNull();
  });

  it('highlights a ring from the legend without a tooltip', async () => {
    const items = all('#opts .tx-chart-legend__item');
    items[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(hovered()).toBe('0');
    expect(tooltip()).toBeNull();
    items[0].dispatchEvent(new Event('pointerleave'));
    await fixture.whenStable();
    expect(hovered()).toBeNull();
    items[0].click();
    await fixture.whenStable();
    items[0].dispatchEvent(new Event('pointerenter'));
    await fixture.whenStable();
    expect(hovered()).toBeNull();
  });

  it('hits rings under the pointer and misses the gap of a partial arc', async () => {
    const point = ringStart(0);
    await pointer('pointermove', point.x, point.y);
    expect(hovered()).toBe('0');
    await pointer('click', 0, 0);
    expect(host.clicks).toEqual([]);
    expect(hovered()).toBeNull();
    await pointer('click', point.x, point.y);
    expect(host.clicks[0]).toMatchObject({ index: 0, label: 'Design', value: 80 });
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(hovered()).toBeNull();
    host.start.set(-90);
    host.end.set(90);
    await fixture.whenStable();
    const edge = ringStart(0);
    const center = { x: edge.x + Number(el('#opts .tx-radial-bar__track').getAttribute('d')?.split('A')[1].split(',')[0]), y: edge.y };
    await pointer('pointermove', center.x, center.y + (center.x - edge.x));
    expect(hovered()).toBeNull();
  });

  it('prefixes the summary and reads the ring thickness from its token', async () => {
    host.ariaLabel.set('Progress');
    const before = Number.parseFloat(el('#opts .tx-radial-bar__track').style.strokeWidth);
    host.dt.set({ radialBar: { thickness: '0.3' } });
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toMatch(/^Progress\. /);
    expect(Number.parseFloat(el('#opts .tx-radial-bar__track').style.strokeWidth)).toBeLessThan(before);
  });

  it('shows "No data" without items', async () => {
    host.items.set(null);
    await fixture.whenStable();
    expect(el('#opts .tx-chart-frame__empty').textContent).toContain('No data');
  });
});

describe('TxRadialBar recompiled by TestBed', () => {
  it('still draws its rings when a test overrides the component', async () => {
    TestBed.overrideComponent(TxRadialBar, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-radial-bar__track')).toHaveLength(3);
  });
});

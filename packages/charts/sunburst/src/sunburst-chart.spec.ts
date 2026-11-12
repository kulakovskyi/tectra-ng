import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
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

@Component({
  imports: [TxSunburstChart],
  template: `
    <tx-sunburst-chart
      [data]="data()"
      [levels]="levels()"
      [drill]="drill()"
      [showTooltip]="showTooltip()"
      [ariaLabel]="label()"
      [unstyled]="unstyled()"
      (segmentClick)="clicks.push($event)"
      (focusChange)="focus.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PointerHost {
  readonly data = signal<TxSunburstItem | TxSunburstItem[] | null>([
    { label: 'Europe', children: [{ label: 'France', value: 30 }, { label: 'Spain', value: 10, children: [{ label: 'Madrid', value: 6 }, { label: 'Seville', value: 4 }] }] },
    { label: 'Asia', value: 60, children: [{ label: 'Japan', value: 20 }] },
  ]);
  readonly levels = signal(3);
  readonly drill = signal(true);
  readonly showTooltip = signal(true);
  readonly label = signal('');
  readonly unstyled = signal<boolean | undefined>(undefined);
  readonly clicks: TxSunburstEvent[] = [];
  readonly focus: string[][] = [];
}

describe('TxSunburstChart pointer and keyboard', () => {
  let fixture: ComponentFixture<PointerHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const host = () => fixture.componentInstance;
  const chart = () => fixture.debugElement.query(By.directive(TxSunburstChart)).componentInstance as TxSunburstChart;
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const activeKey = () => chart().activeArc()?.key ?? null;
  const pointAt = (arcKey: string) => {
    const arc = chart().arcs().find((item) => item.key === arcKey) as { start: number; end: number; inner: number; outer: number };
    const { cx, cy } = chart().fit();
    const middle = (arc.start + arc.end) / 2;
    const radius = (arc.inner + arc.outer) / 2;
    return { clientX: cx + radius * Math.sin(middle), clientY: cy - radius * Math.cos(middle) };
  };
  const pointer = async (type: string, point: { clientX: number; clientY: number }) => {
    plot().dispatchEvent(new MouseEvent(type, { ...point, bubbles: true }));
    await fixture.whenStable();
  };
  const centre = () => ({ clientX: chart().fit().cx, clientY: chart().fit().cy });

  beforeEach(async () => {
    fixture = TestBed.createComponent(PointerHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('lights the hovered arc, drills on click and climbs back from the centre', async () => {
    await pointer('pointermove', pointAt('1'));
    expect(activeKey()).toBe('1');
    expect(chart().tooltip()?.rows.map((row) => row.label)).toEqual(['Asia', 'Of total']);
    expect(chart().tooltip()?.placement).toBe('left');
    expect(all('.tx-sunburst-chart__segment--lit').map((segment) => segment.getAttribute('data-key'))).toEqual(['1']);
    await pointer('pointermove', centre());
    expect(activeKey()).toBeNull();
    expect(el('.tx-sunburst-chart__center--hover')).toBeNull();
    await pointer('click', pointAt('0'));
    expect(host().clicks.at(-1)).toMatchObject({ path: ['Europe'], value: 40 });
    expect(host().focus).toEqual([['Europe']]);
    await pointer('pointermove', centre());
    expect(el('.tx-sunburst-chart__center--hover')).not.toBeNull();
    await pointer('pointermove', pointAt('0.0'));
    expect(chart().tooltip()?.rows.map((row) => row.label)).toEqual(['France', 'Of parent', 'Of total']);
    await pointer('click', pointAt('0.0'));
    expect(host().clicks.at(-1)).toMatchObject({ path: ['Europe', 'France'], value: 30 });
    expect(host().focus).toHaveLength(1);
    await pointer('click', { clientX: 1, clientY: 1 });
    expect(host().clicks).toHaveLength(2);
    await pointer('click', centre());
    expect(host().focus.at(-1)).toEqual([]);
    expect(el('.tx-sunburst-chart__back')).toBeNull();
    await pointer('pointermove', pointAt('1'));
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(activeKey()).toBeNull();
  });

  it('places the tooltip on the side the arc points to', async () => {
    host().data.set([
      { label: 'North', value: 1 },
      { label: 'East', value: 4 },
      { label: 'South', value: 1 },
      { label: 'West', value: 4 },
    ]);
    await fixture.whenStable();
    const sides: string[] = [];
    for (const arc of ['0', '1', '2', '3']) {
      await pointer('pointermove', pointAt(arc));
      sides.push(chart().tooltip()?.placement ?? '');
    }
    expect(sides).toEqual(['top', 'right', 'bottom', 'left']);
    host().showTooltip.set(false);
    await fixture.whenStable();
    expect(chart().tooltip()).toBeNull();
  });

  it('walks siblings, children, parents and ends with the keyboard', async () => {
    await key('Enter');
    await key('Escape');
    expect(host().focus).toEqual([]);
    await key('ArrowLeft');
    expect(activeKey()).toBe('0');
    await key('ArrowLeft');
    expect(activeKey()).toBe('1');
    await key('ArrowDown');
    expect(activeKey()).toBe('1.0');
    await key('ArrowDown');
    expect(activeKey()).toBe('1.0');
    await key('ArrowUp');
    expect(activeKey()).toBe('1');
    await key('ArrowUp');
    expect(activeKey()).toBe('1');
    await key('Home');
    expect(activeKey()).toBe('0');
    await key('End');
    expect(activeKey()).toBe('1');
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'a' }));
    expect(activeKey()).toBe('1');
    await key('Escape');
    expect(activeKey()).toBeNull();
    await key('ArrowRight');
    await key('ArrowDown');
    await key(' ');
    expect(host().clicks.at(-1)).toMatchObject({ path: ['Europe', 'France'] });
    expect(host().focus).toEqual([]);
  });

  it('only reports clicks without drill and forgets an arc that is no longer drawn', async () => {
    host().drill.set(false);
    await fixture.whenStable();
    expect(all('.tx-sunburst-chart__segment--drill')).toHaveLength(0);
    await key('ArrowRight');
    await key('Enter');
    expect(host().clicks).toHaveLength(1);
    expect(host().focus).toEqual([]);
    await key('Backspace');
    await key('Backspace');
    expect(host().focus).toEqual([]);
    host().drill.set(true);
    await key('ArrowDown');
    expect(activeKey()).toBe('0');
    await key('ArrowDown');
    expect(activeKey()).toBe('0.0');
    host().levels.set(1);
    await fixture.whenStable();
    expect(activeKey()).toBeNull();
  });

  it('accepts one root, labels the summary and drops corners when unstyled', async () => {
    host().data.set({ label: 'World', children: [{ label: 'Europe', value: 40 }, { label: 'Asia', value: 60 }] });
    host().label.set('Sales');
    host().unstyled.set(true);
    await fixture.whenStable();
    expect(plot().getAttribute('aria-label')).toBe('Sales. Sunburst chart, Total 100: World 100%');
    expect(chart().geometry().corner).toBe(0);
    expect(el('.tx-sunburst-chart').hasAttribute('data-styled')).toBe(false);
  });

  it('ignores the keyboard without data', async () => {
    host().data.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(activeKey()).toBeNull();
  });
});

describe('TxSunburstChart recompiled by TestBed', () => {
  it('still renders its segments when a test overrides the component', async () => {
    TestBed.overrideComponent(TxSunburstChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-sunburst-chart__segment').length).toBeGreaterThan(0);
  });
});

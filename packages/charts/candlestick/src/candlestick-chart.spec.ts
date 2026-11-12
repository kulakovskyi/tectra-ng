import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxCandlestickChart } from './candlestick-chart.component';
import { TxCandle, TxCandleEvent, TxCandlestickVariant } from './candlestick-chart.types';
import { candleExtent, candleLabels, candleTimes } from './candlestick-layout';

@Component({
  imports: [TxCandlestickChart],
  template: `<tx-candlestick-chart id="main" [data]="data()" [variant]="variant()" [pt]="{ body: { class: 'own-body' } }" (candleClick)="clicks.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly data = signal<TxCandle[]>([
    { x: '2026-03-02', open: 100, high: 112, low: 97, close: 110, volume: 1200 },
    { x: '2026-03-03', open: 110, high: 114, low: 101, close: 104, volume: 1800 },
    { x: '2026-03-04', open: 104, high: 108, low: 99, close: 107, volume: 900 },
  ]);
  readonly variant = signal<TxCandlestickVariant>('candle');
  readonly clicks: TxCandleEvent[] = [];
}

describe('candlestick layout', () => {
  it('reads dates, labels plain categories and leaves room for the volume', () => {
    expect(candleTimes([{ x: 'Mon', open: 1, high: 2, low: 0, close: 1 }])).toBeNull();
    expect(candleTimes([{ x: new Date(2026, 0, 2), open: 1, high: 2, low: 0, close: 1 }])).toEqual([new Date(2026, 0, 2).getTime()]);
    expect(candleLabels([{ x: 'Mon', open: 1, high: 2, low: 0, close: 1 }], 'en-US').axis).toEqual(['Mon']);
    expect(candleLabels([{ x: '2026-03-02', open: 1, high: 2, low: 0, close: 1 }, { x: '2026-03-09', open: 1, high: 2, low: 0, close: 1 }], 'en-US').axis).toEqual(['Mar 2', 'Mar 9']);
    expect(candleExtent([{ x: 1, open: 10, high: 20, low: 10, close: 15 }], 0)).toEqual([10, 20]);
    expect(candleExtent([{ x: 1, open: 10, high: 20, low: 10, close: 15 }], 0.5)).toEqual([0, 20]);
  });

  it('handles no candles, a single day and flat prices', () => {
    expect(candleTimes([])).toBeNull();
    expect(candleExtent([], 0.2)).toEqual([0, 1]);
    expect(candleLabels([{ x: '2026-03-02', open: 1, high: 2, low: 0, close: 1 }], 'en-US').full).toHaveLength(1);
    expect(candleLabels([{ x: new Date(0), open: 1, high: 2, low: 0, close: 1 }], 'en-US').axis).toHaveLength(1);
    expect(candleExtent([{ x: 1, open: 10, high: 10, low: 10, close: 10 }], 0.5)).toEqual([9, 10]);
    expect(candleExtent([{ x: 1, open: 0, high: 0, low: 0, close: 0 }], 0.5)).toEqual([-1, 0]);
  });
});

describe('TxCandlestickChart', () => {
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

  it('draws a candle with a wick per day, up and down, and the volume under them', () => {
    const candles = all('#main .tx-candlestick-chart__candle');
    expect(candles.map((candle) => candle.getAttribute('data-dir'))).toEqual(['up', 'down', 'up']);
    expect(all('#main .tx-candlestick-chart__wick')).toHaveLength(3);
    expect(el('#main .tx-candlestick-chart__body').classList).toContain('own-body');
    const volumes = all('#main .tx-candlestick-chart__volume');
    expect(volumes).toHaveLength(3);
    expect(Number(volumes[1].getAttribute('height'))).toBeGreaterThan(Number(volumes[0].getAttribute('height')));
    const lowest = Math.max(...all('#main .tx-candlestick-chart__wick').map((wick) => Number(wick.getAttribute('y2'))));
    expect(lowest).toBeLessThanOrEqual(Math.min(...volumes.map((volume) => Number(volume.getAttribute('y')))) + 1);
    expect(el('#main .tx-chart-axes__axis[data-position="right"]')).not.toBeNull();
    expect(plot().getAttribute('aria-label')).toBe('Candlestick chart, 1 series, 3 values, from 97 to 114');
  });

  it('draws OHLC bars with open and close ticks', async () => {
    fixture.componentInstance.variant.set('ohlc');
    await fixture.whenStable();
    expect(all('#main .tx-candlestick-chart__body')).toHaveLength(0);
    expect(all('#main .tx-candlestick-chart__tick')).toHaveLength(6);
  });

  it('reads a day with the keyboard: open, high, low, close and volume', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main .tx-candlestick-chart__candle--active').getAttribute('data-index')).toBe('2');
    expect(all('#main .tx-candlestick-chart__crosshair')).toHaveLength(1);
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('Mar 4, 2026');
    expect(panel.textContent).toContain('Close');
    expect(panel.textContent).toContain('107');
    expect(panel.textContent).toContain('900');
  });

  it('reports the clicked candle', () => {
    const wick = all('#main .tx-candlestick-chart__wick')[1];
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(wick.getAttribute('x1')), clientY: Number(wick.getAttribute('y1')) + 2, bubbles: true }));
    expect(fixture.componentInstance.clicks[0]).toMatchObject({ index: 1, label: 'Mar 3, 2026', candle: { close: 104 } });
  });
});

@Component({
  imports: [TxCandlestickChart],
  template: `
    <tx-candlestick-chart
      id="opts"
      [data]="data()"
      [showVolume]="volume()"
      [yAxisTitle]="title()"
      [ariaLabel]="ariaLabel()"
      [dt]="dt()"
      (candleClick)="clicks.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly data = signal<TxCandle[] | null>([
    { x: 'Mon', open: 100, high: 112, low: 97, close: 110, volume: 1200 },
    { x: 'Tue', open: 110, high: 114, low: 101, close: 104 },
    { x: 'Wed', open: Number.NaN, high: 108, low: 99, close: 107 },
  ]);
  readonly volume = signal(true);
  readonly title = signal('');
  readonly ariaLabel = signal('');
  readonly dt = signal<Record<string, Record<string, string>> | undefined>(undefined);
  readonly clicks: TxCandleEvent[] = [];
}

describe('TxCandlestickChart options', () => {
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
  const active = () => el('#opts .tx-candlestick-chart__candle--active')?.getAttribute('data-index') ?? null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('skips broken candles and draws volume only where it is known', () => {
    expect(all('#opts .tx-candlestick-chart__candle')).toHaveLength(2);
    expect(all('#opts .tx-candlestick-chart__volume')).toHaveLength(1);
    expect(all('#opts thead th').map((cell) => cell.textContent?.trim())).toContain('Volume');
    expect(all('#opts tbody tr')[1].textContent).toContain('—');
  });

  it('reads a falling day without volume and leaves on Escape', async () => {
    await key('ArrowRight');
    await key('ArrowRight');
    expect(active()).toBe('1');
    expect(tooltip()?.textContent).toContain('104');
    expect(tooltip()?.textContent).not.toContain('Volume');
    expect(el('#opts .tx-candlestick-chart__candle--active').getAttribute('data-dir')).toBe('down');
    await key('Escape');
    expect(active()).toBeNull();
  });

  it('drops the volume columns when the volume is off and titles the axis', async () => {
    host.volume.set(false);
    host.title.set('Price');
    host.ariaLabel.set('Stock');
    await fixture.whenStable();
    expect(all('#opts .tx-candlestick-chart__volume')).toHaveLength(0);
    expect(all('#opts thead th').map((cell) => cell.textContent?.trim())).not.toContain('Volume');
    expect(el('#opts .tx-chart-axes').textContent).toContain('Price');
    expect(plot().getAttribute('aria-label')).toBe('Stock. Candlestick chart, 1 series, 2 values, from 97 to 114');
    await key('Home');
    expect(tooltip()?.textContent).not.toContain('Volume');
  });

  it('draws no volume bars when every volume is zero', async () => {
    host.data.set([{ x: 'Mon', open: 1, high: 2, low: 0, close: 1, volume: 0 }]);
    await fixture.whenStable();
    expect(all('#opts .tx-candlestick-chart__volume')).toHaveLength(0);
  });

  it('forgets an active day that is gone', async () => {
    await key('End');
    expect(active()).toBe('1');
    host.data.set([{ x: 'Mon', open: 1, high: 2, low: 0, close: 1 }]);
    await fixture.whenStable();
    expect(tooltip()).toBeNull();
    expect(all('#opts .tx-candlestick-chart__crosshair')).toHaveLength(0);
  });

  it('follows the pointer inside the plot only', async () => {
    const wick = all('#opts .tx-candlestick-chart__wick')[0];
    const x = Number(wick.getAttribute('x1'));
    const y = Number(wick.getAttribute('y1')) + 2;
    await pointer('pointermove', x, y);
    expect(active()).toBe('0');
    await pointer('click', -100, -100);
    expect(active()).toBeNull();
    expect(host.clicks).toEqual([]);
    await pointer('pointermove', x, y);
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(active()).toBeNull();
  });

  it('reads the body width from its token', async () => {
    const before = Number(el('#opts .tx-candlestick-chart__body').getAttribute('width'));
    host.dt.set({ candlestick: { bodyWidth: '0.2' } });
    await fixture.whenStable();
    expect(Number(el('#opts .tx-candlestick-chart__body').getAttribute('width'))).toBeLessThan(before);
  });

  it('shows "No data" without candles and ignores the keyboard', async () => {
    host.data.set(null);
    await fixture.whenStable();
    expect(el('#opts .tx-chart-frame__empty').textContent).toContain('No data');
    await key('ArrowRight');
    expect(active()).toBeNull();
  });
});

describe('TxCandlestickChart recompiled by TestBed', () => {
  it('still draws its candles when a test overrides the component', async () => {
    TestBed.overrideComponent(TxCandlestickChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-candlestick-chart__candle')).toHaveLength(3);
  });
});

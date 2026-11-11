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

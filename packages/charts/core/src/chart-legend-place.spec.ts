import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxChartLegendPosition } from './chart.types';
import { TX_CHART_NARROW_WIDTH, chartLegendPlace, injectHostWidth, injectLegendPlace } from './chart-legend-place';

@Component({
  selector: 'tx-legend-place-host',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlaceHost {
  readonly position = signal<TxChartLegendPosition>('right');
  readonly width = injectHostWidth();
  readonly place = injectLegendPlace(() => this.position());
}

describe('chart legend place', () => {
  afterEach(() => vi.restoreAllMocks());

  it('moves a side legend under a narrow chart only', () => {
    expect(chartLegendPlace('right', null)).toBe('right');
    expect(chartLegendPlace('left', TX_CHART_NARROW_WIDTH - 1)).toBe('bottom');
    expect(chartLegendPlace('right', TX_CHART_NARROW_WIDTH)).toBe('right');
    expect(chartLegendPlace('top', 100)).toBe('top');
    expect(chartLegendPlace('right', 500, 600)).toBe('bottom');
  });

  it('keeps the asked position until the host is measured', async () => {
    const fixture = TestBed.createComponent(PlaceHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.width()).toBeNull();
    expect(fixture.componentInstance.place()).toBe('right');
  });

  it('measures the host and follows its width with a resize observer', async () => {
    const callbacks: (() => void)[] = [];
    const disconnect = vi.fn();
    const view = window as unknown as Record<string, unknown>;
    view['ResizeObserver'] = class {
      constructor(callback: () => void) {
        callbacks.push(callback);
      }
      observe = vi.fn();
      disconnect = disconnect;
    };
    let width = 300;
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width }) as DOMRect);
    try {
      const fixture = TestBed.createComponent(PlaceHost);
      fixture.autoDetectChanges();
      await fixture.whenStable();
      const host = fixture.componentInstance;
      expect(host.width()).toBe(300);
      expect(host.place()).toBe('bottom');
      callbacks.forEach((callback) => callback());
      expect(host.width()).toBe(300);
      width = 640;
      callbacks.forEach((callback) => callback());
      expect(host.place()).toBe('right');
      host.position.set('top');
      expect(host.place()).toBe('top');
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete view['ResizeObserver'];
    }
  });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxChartFrame } from './chart-frame.component';
import { TxChartLegend } from './chart-legend.component';
import { TxChartTooltipTemplate } from './chart-templates.directive';
import {
  TxChartHeight,
  TxChartLegendItem,
  TxChartPanEvent,
  TxChartPointerEvent,
  TxChartTable,
  TxChartTooltipData,
  TxChartZoomEvent,
} from './chart.types';

@Component({
  imports: [TxChartFrame, TxChartTooltipTemplate],
  template: `
    <tx-chart-frame
      [height]="height()"
      [plotHeight]="plotHeight()"
      [legendItems]="items()"
      [legendPosition]="legendPosition()"
      [showLegend]="showLegend()"
      [interactive]="interactive()"
      [zoomable]="zoomable()"
      [zoomedIn]="zoomedIn()"
      [actionKeys]="actionKeys()"
      [toolbar]="true"
      [empty]="empty()"
      [styled]="styled()"
      [table]="table()"
      [tooltip]="tooltip()"
      [tooltipTemplate]="custom() ? tip : null"
      [exportName]="exportName()"
      summary="Visits"
      (pointer)="pointers.push($event)"
      (navigate)="keys.push($event.key)"
      (zoomed)="zooms.push($event)"
      (panned)="pans.push($event)"
      (zoomReset)="resets = resets + 1"
      (legendHovered)="hovers.push($event)"
      (tooltipClosed)="closed = closed + 1"
    >
      <svg:rect class="own-shape" width="10" height="10" style="fill: red" />
    </tx-chart-frame>
    <ng-template txChartTooltip #tip let-data>
      <span class="own-tip">{{ data.title }}</span>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly height = signal<TxChartHeight>(300);
  readonly plotHeight = signal<number | null>(null);
  readonly items = signal<TxChartLegendItem[]>([
    { key: 'a', label: 'Visits', color: 'var(--own-color)' },
    { key: 'b', label: 'Sign-ups', color: 'blue' },
  ]);
  readonly legendPosition = signal<'top' | 'bottom' | 'left' | 'right'>('top');
  readonly showLegend = signal(true);
  readonly interactive = signal(true);
  readonly zoomable = signal(true);
  readonly zoomedIn = signal(false);
  readonly actionKeys = signal(false);
  readonly empty = signal(false);
  readonly styled = signal(true);
  readonly table = signal<TxChartTable | null>(null);
  readonly tooltip = signal<TxChartTooltipData | null>(null);
  readonly custom = signal(false);
  readonly exportName = signal('');
  readonly pointers: TxChartPointerEvent[] = [];
  readonly keys: string[] = [];
  readonly zooms: TxChartZoomEvent[] = [];
  readonly pans: TxChartPanEvent[] = [];
  readonly hovers: (string | null)[] = [];
  resets = 0;
  closed = 0;
}

const ROW = { label: 'Visits', value: '12', color: 'red', raw: 12, seriesIndex: 0 };

describe('TxChartFrame zoom, touch and export', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const plot = () => el('.tx-chart-frame__plot');
  const frame = () =>
    fixture.debugElement.query(By.directive(TxChartFrame)).componentInstance as TxChartFrame;
  const touch = (type: string, pointerId: number, clientX: number, clientY = 0) =>
    plot().dispatchEvent(
      Object.assign(new MouseEvent(type, { clientX, clientY, bubbles: true }), {
        pointerType: 'touch',
        pointerId,
      }),
    );

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document
      .querySelectorAll('.cdk-overlay-container')
      .forEach((container) => (container.innerHTML = ''));
  });

  it('ignores pointers and keys when not interactive', async () => {
    host.interactive.set(false);
    await fixture.whenStable();
    plot().dispatchEvent(
      new MouseEvent('pointermove', { clientX: 10, clientY: 10, bubbles: true }),
    );
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    plot().dispatchEvent(new WheelEvent('wheel', { deltaY: 10, ctrlKey: true, bubbles: true }));
    expect(host.pointers).toEqual([]);
    expect(host.keys).toEqual([]);
    expect(host.zooms).toEqual([]);
    expect(plot().getAttribute('tabindex')).toBeNull();
  });

  it('forwards zoom and action keys only when enabled', async () => {
    const press = (key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      plot().dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(press('+')).toBe(true);
    expect(press('Enter')).toBe(false);
    host.actionKeys.set(true);
    host.zoomable.set(false);
    await fixture.whenStable();
    expect(press('Enter')).toBe(true);
    expect(press('0')).toBe(false);
    expect(host.keys).toEqual(['+', 'Enter']);
    expect(fixture.nativeElement.querySelector('.cdk-visually-hidden')?.textContent).not.toContain(
      '. ',
    );
  });

  it('zooms with Ctrl and the wheel, pans sideways when zoomed and resets on double click', async () => {
    const wheel = (init: WheelEventInit) => {
      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init });
      plot().dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(wheel({ deltaY: -100, ctrlKey: true, clientX: 50 })).toBe(true);
    expect(wheel({ deltaY: 100, metaKey: true, clientX: 60 })).toBe(true);
    expect(host.zooms.map((zoom) => zoom.x)).toEqual([50, 60]);
    expect(host.zooms[0].factor).toBeLessThan(1);
    expect(wheel({ deltaX: 40, deltaY: 1 })).toBe(false);
    plot().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(host.resets).toBe(0);
    host.zoomedIn.set(true);
    await fixture.whenStable();
    expect(wheel({ deltaX: 1, deltaY: 40 })).toBe(false);
    expect(wheel({ deltaX: 40, deltaY: 1 })).toBe(true);
    expect(host.pans).toEqual([{ dx: -40 }]);
    plot().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(host.resets).toBe(1);
    el('.tx-chart-frame__reset').click();
    expect(host.resets).toBe(2);
    host.zoomable.set(false);
    await fixture.whenStable();
    expect(wheel({ deltaY: -100, ctrlKey: true })).toBe(false);
    plot().dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
    expect(host.resets).toBe(2);
  });

  it('pinches and pans with two fingers on a zoomable plot', () => {
    touch('pointerdown', 1, 100);
    expect(host.pointers.map((event) => event.type)).toEqual(['down']);
    touch('pointermove', 7, 100);
    touch('pointerdown', 2, 200);
    expect(host.pointers.at(-1)?.type).toBe('leave');
    touch('pointermove', 2, 300);
    expect(host.zooms).toHaveLength(1);
    expect(host.zooms[0].factor).toBeCloseTo(0.5);
    expect(host.pans).toEqual([{ dx: 50 }]);
    touch('pointermove', 2, 300);
    expect(host.zooms).toHaveLength(1);
    expect(host.pans).toHaveLength(1);
    const before = host.pointers.length;
    touch('pointerup', 2, 300);
    expect(host.pointers).toHaveLength(before);
    touch('pointerleave', 1, 100);
    expect(host.pointers.at(-1)?.type).toBe('leave');
    expect(host.pointers).toHaveLength(before + 1);
  });

  it('measures the plot and follows its size with a resize observer', async () => {
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
    const width = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(500);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(200);
    try {
      const sized = TestBed.createComponent(Host);
      sized.autoDetectChanges();
      await sized.whenStable();
      const instance = sized.debugElement.query(By.directive(TxChartFrame))
        .componentInstance as TxChartFrame;
      expect(instance.size()).toEqual({ width: 500, height: 200 });
      expect(instance.measured()).toBe(true);
      callbacks.forEach((callback) => callback());
      expect(instance.size()).toEqual({ width: 500, height: 200 });
      width.mockReturnValue(520);
      callbacks.forEach((callback) => callback());
      expect(instance.size()).toEqual({ width: 520, height: 200 });
      sized.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete view['ResizeObserver'];
    }
  });

  it('fills a CSS height, fixes the plot height and hides the legend on demand', async () => {
    host.height.set('100%');
    host.plotHeight.set(180);
    host.legendPosition.set('right');
    await fixture.whenStable();
    const root = el('tx-chart-frame');
    expect(root.classList).toContain('tx-chart-frame--fill');
    expect(root.style.height).toBe('100%');
    expect(root.getAttribute('data-legend')).toBe('right');
    expect(root.getAttribute('data-toolbar')).toBe('own');
    expect(plot().style.height).toBe('180px');
    expect(plot().classList).toContain('tx-chart-frame__plot--fixed');
    host.showLegend.set(false);
    host.styled.set(false);
    await fixture.whenStable();
    expect(root.hasAttribute('data-legend')).toBe(false);
    expect(root.hasAttribute('data-styled')).toBe(false);
  });

  it('places the tooltip beside a point and reopens it when the side changes', async () => {
    host.tooltip.set({
      title: '',
      rows: [
        { ...ROW, active: true, share: '40%' },
        { ...ROW, label: 'Sign-ups' },
      ],
      index: 0,
      x: 100,
      y: 50,
      placement: 'left',
      note: 'Partial data',
    });
    await fixture.whenStable();
    const panel = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(el('.tx-chart-frame__anchor').style.transform).toBe('translate(100px, 34px)');
    expect(el('.tx-chart-frame__anchor').style.height).toBe('32px');
    expect(panel().querySelector('.tx-chart-frame__tooltip-title')).toBeNull();
    expect(panel().querySelector('.tx-chart-frame__tooltip-row--active')).not.toBeNull();
    expect(panel().querySelector('.tx-chart-frame__tooltip-share')?.textContent).toBe('40%');
    expect(panel().querySelector('.tx-chart-frame__tooltip-note')?.textContent).toBe(
      'Partial data',
    );
    const first = frame().activeRef();
    host.tooltip.set({ title: 'Mon', rows: [ROW], index: 0, x: 100, y: 50, placement: 'bottom' });
    await fixture.whenStable();
    expect(frame().activeRef()).not.toBe(first);
    expect(frame().activeRef()).not.toBeNull();
  });

  it('draws the tooltip from a template without the arrow when unstyled', async () => {
    host.custom.set(true);
    host.styled.set(false);
    host.tooltip.set({ title: 'Tue', rows: [ROW], index: 1, x: 40, y: 20 });
    await fixture.whenStable();
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.querySelector('.own-tip')?.textContent).toBe('Tue');
    expect(panel.querySelector('.tx-chart-frame__tooltip-arrow')).toBeNull();
    expect(panel.hasAttribute('data-styled')).toBe(false);
  });

  it('reports a tooltip closed by the overlay and not one closed by the frame', async () => {
    host.tooltip.set({ title: 'Mon', rows: [ROW], index: 0, x: 40, y: 20 });
    await fixture.whenStable();
    frame().activeRef()?.close('escape');
    expect(host.closed).toBe(1);
    expect(frame().activeRef()).toBeNull();
    host.tooltip.set({ title: 'Tue', rows: [ROW], index: 1, x: 40, y: 20 });
    await fixture.whenStable();
    host.tooltip.set(null);
    await fixture.whenStable();
    expect(host.closed).toBe(1);
  });

  it('skips the tooltip while the chart is empty', async () => {
    host.empty.set(true);
    await fixture.whenStable();
    host.tooltip.set({ title: 'Mon', rows: [ROW], index: 0, x: 40, y: 20 });
    await fixture.whenStable();
    expect(frame().activeRef()).toBeNull();
    frame().download('svg');
    frame().download('csv');
  });

  it('reports legend hover from buttons and static items', async () => {
    const items = fixture.nativeElement.querySelectorAll(
      '.tx-chart-legend__item',
    ) as NodeListOf<HTMLElement>;
    items[0].dispatchEvent(new MouseEvent('pointerenter'));
    items[0].dispatchEvent(new MouseEvent('pointerleave'));
    items[1].dispatchEvent(new FocusEvent('focus'));
    items[1].dispatchEvent(new FocusEvent('blur'));
    expect(host.hovers).toEqual(['a', null, 'b', null]);
  });

  describe('export', () => {
    let blobs: Blob[];
    let names: string[];

    beforeEach(() => {
      blobs = [];
      names = [];
      const url = URL as unknown as {
        createObjectURL: (blob: Blob) => string;
        revokeObjectURL: (url: string) => void;
      };
      url.createObjectURL = (blob: Blob) => {
        blobs.push(blob);
        return 'blob:chart';
      };
      url.revokeObjectURL = () => undefined;
      vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
        this: HTMLAnchorElement,
      ) {
        names.push(this.download);
      });
    });

    const read = (blob: Blob) =>
      new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsText(blob);
      });

    it('downloads the SVG with the resolved legend colours', async () => {
      el('tx-chart-frame').style.setProperty('--own-color', 'rgb(1, 2, 3)');
      frame().onExport('svg');
      frame().onExport('pdf');
      expect(names).toEqual(['chart-data.svg']);
      const markup = await read(blobs[0]);
      expect(markup).toContain('>Visits<');
      expect(markup).toContain('fill="blue"');
      expect(markup).toContain('fill="#ffffff"');
    });

    it('leaves the legend out when it is hidden and keeps a background token', async () => {
      host.showLegend.set(false);
      host.exportName.set('Weekly');
      await fixture.whenStable();
      el('tx-chart-frame').style.setProperty('--tx-surface-card', '#eeeeee');
      frame().download('svg');
      expect(names).toEqual(['weekly.svg']);
      const markup = await read(blobs[0]);
      expect(markup).not.toContain('>Visits<');
      expect(markup).toContain('fill="#eeeeee"');
    });

    it('skips CSV without a table and swallows a failed PNG', async () => {
      frame().onExport('csv');
      expect(names).toEqual([]);
      const view = window as unknown as Record<string, unknown>;
      const image = view['Image'];
      view['Image'] = class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(_value: string) {
          queueMicrotask(() => this.onerror?.());
        }
      };
      try {
        frame().onExport('png');
        await new Promise((resolve) => setTimeout(resolve));
      } finally {
        view['Image'] = image;
      }
      expect(names).toEqual([]);
    });
  });
});

describe('TxChartLegend keyboard', () => {
  @Component({
    imports: [TxChartLegend],
    template: `<tx-chart-legend [items]="items" [position]="position()" [variant]="variant()" />`,
    changeDetection: ChangeDetectionStrategy.OnPush,
  })
  class LegendHost {
    readonly position = signal<'top' | 'left'>('left');
    readonly variant = signal<'dot' | 'stat'>('dot');
    readonly items: TxChartLegendItem[] = [
      { key: 'a', label: 'A', color: 'red', value: '1', caption: 'Mon' },
      { key: 'b', label: 'B', color: 'blue' },
      { key: 'c', label: 'C', color: 'green', percent: '5%' },
    ];
  }

  it('walks a vertical legend with up and down and ignores other keys', async () => {
    const fixture = TestBed.createComponent(LegendHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const buttons = [
      ...fixture.nativeElement.querySelectorAll('.tx-chart-legend__item'),
    ] as HTMLElement[];
    const press = (target: HTMLElement, key: string) => {
      const event = new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true });
      target.dispatchEvent(event);
      return event.defaultPrevented;
    };
    expect(press(buttons[0], 'ArrowUp')).toBe(true);
    expect(document.activeElement).toBe(buttons[2]);
    press(buttons[2], 'ArrowDown');
    expect(document.activeElement).toBe(buttons[0]);
    press(buttons[0], 'End');
    expect(document.activeElement).toBe(buttons[2]);
    press(buttons[2], 'ArrowLeft');
    expect(document.activeElement).toBe(buttons[1]);
    expect(press(buttons[1], 'x')).toBe(false);
    expect(buttons[0].querySelector('.tx-chart-legend__value')?.textContent).toBe('1');
    expect(buttons[2].querySelector('.tx-chart-legend__percent')?.textContent).toBe('5%');
    fixture.componentInstance.variant.set('stat');
    fixture.componentInstance.position.set('top');
    await fixture.whenStable();
    const stats = [...fixture.nativeElement.querySelectorAll('.tx-chart-legend__stat')].map(
      (stat) => (stat as HTMLElement).textContent,
    );
    expect(stats).toEqual(['1', '—', '—']);
    expect(fixture.nativeElement.querySelector('.tx-chart-legend__caption')?.textContent).toBe(
      'Mon',
    );
    const current = [
      ...fixture.nativeElement.querySelectorAll('.tx-chart-legend__item'),
    ] as HTMLElement[];
    press(current[0], 'ArrowRight');
    expect(document.activeElement).toBe(current[1]);
  });
});

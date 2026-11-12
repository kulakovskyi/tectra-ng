import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { TxChartTooltipFormatter, TxChartTooltipTemplate } from '@tectra-ng/charts/core';
import { TxTreemap } from './treemap.component';
import { TxTreemapTileTemplate } from './treemap-tile.directive';
import { insetRect, squarify, treemapValue } from './treemap-layout';
import { TxTreemapItem, TxTreemapTileEvent } from './treemap.types';

@Component({
  imports: [TxTreemap, TxTreemapTileTemplate],
  template: `
    <tx-treemap
      id="main"
      [items]="items()"
      [height]="300"
      ariaLabel="Spend"
      [dt]="{ treemap: { radius: '2px' } }"
      [pt]="{ tile: { class: 'own-tile' } }"
      (tileClick)="clicks.push($event)"
    />
    <tx-treemap id="nested" [items]="nested" [height]="300" />
    <tx-treemap id="empty" [items]="[{ label: 'A', value: 0 }]" />
    <tx-treemap id="custom" [items]="items()" [height]="300">
      <ng-template txTreemapTile let-tile let-share="share">
        <b class="own-text">{{ tile.label }} — {{ share }}</b>
      </ng-template>
    </tx-treemap>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly items = signal<TxTreemapItem[]>([
    { label: 'Hosting', value: 600 },
    { label: 'Ads', value: 300 },
    { label: 'Tools', value: 100 },
    { label: 'Free', value: 0 },
  ]);
  readonly nested: TxTreemapItem[] = [
    { label: 'Europe', children: [{ label: 'Germany', value: 40 }, { label: 'France', value: 20 }] },
    { label: 'Asia', value: 30, color: '#123456' },
  ];
  readonly clicks: TxTreemapTileEvent[] = [];
}

const area = (rect: { width: number; height: number }) => rect.width * rect.height;

describe('treemap layout', () => {
  it('fills the rectangle with areas proportional to the values', () => {
    const nodes = squarify(
      [6, 6, 4, 3, 2, 2, 1].map((value) => ({ value, item: value })),
      { x: 0, y: 0, width: 600, height: 400 },
    );
    expect(nodes).toHaveLength(7);
    expect(nodes.reduce((sum, node) => sum + area(node), 0)).toBeCloseTo(240000, 3);
    for (const node of nodes) {
      expect(area(node)).toBeCloseTo((node.value / 24) * 240000, 3);
      expect(node.x).toBeGreaterThanOrEqual(-1e-9);
      expect(node.x + node.width).toBeLessThanOrEqual(600 + 1e-9);
      expect(node.y + node.height).toBeLessThanOrEqual(400 + 1e-9);
    }
    const ratios = nodes.map((node) => Math.max(node.width / node.height, node.height / node.width));
    expect(Math.max(...ratios)).toBeLessThan(3);
  });

  it('keeps the input index, drops empty values and handles an empty box', () => {
    const nodes = squarify([{ value: 1, item: 'a' }, { value: 0, item: 'b' }, { value: 3, item: 'c' }], { x: 0, y: 0, width: 100, height: 100 });
    expect(nodes.map((node) => node.index)).toEqual([2, 0]);
    expect(squarify([{ value: 1, item: 'a' }], { x: 0, y: 0, width: 0, height: 10 })).toEqual([]);
  });

  it('sums nested values and insets a rectangle', () => {
    expect(treemapValue({ label: 'g', children: [{ label: 'a', value: 2 }, { label: 'b', children: [{ label: 'c', value: 3 }] }] })).toBe(5);
    expect(treemapValue({ label: 'x', value: -4 })).toBe(0);
    expect(treemapValue({ label: 'x' })).toBe(0);
    expect(treemapValue({ label: 'x', value: Number.POSITIVE_INFINITY })).toBe(0);
    expect(insetRect({ x: 0, y: 0, width: 10, height: 10 }, 4)).toEqual({ x: 2, y: 2, width: 6, height: 6 });
  });
});

describe('TxTreemap', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('draws a tile per positive value with labels and values that fit', () => {
    const tiles = main().querySelectorAll('.tx-treemap__tile');
    expect(tiles).toHaveLength(3);
    expect(tiles[0].classList).toContain('own-tile');
    const labels = [...main().querySelectorAll('.tx-treemap__tile-label')].map((label) => label.textContent?.trim());
    expect(labels).toContain('Hosting');
    expect([...main().querySelectorAll('.tx-treemap__tile-value')].map((value) => value.textContent?.trim())).toContain('600');
  });

  it('draws own tile content from the txTreemapTile template', () => {
    const custom = fixture.nativeElement.querySelector('#custom') as HTMLElement;
    expect([...custom.querySelectorAll('.own-text')].map((text) => text.textContent)).toEqual(['Hosting — 60%', 'Ads — 30%', 'Tools — 10%']);
    expect(custom.querySelector('.tx-treemap__tile-label')).toBeNull();
  });

  it('lays nested items out inside a labelled group', () => {
    const nested = fixture.nativeElement.querySelector('#nested') as HTMLElement;
    expect(nested.querySelectorAll('.tx-treemap__group')).toHaveLength(1);
    expect(nested.querySelector('.tx-treemap__group-label')?.textContent?.trim()).toBe('Europe');
    expect(nested.querySelectorAll('.tx-treemap__tile')).toHaveLength(3);
    const asia = [...nested.querySelectorAll<SVGRectElement>('.tx-treemap__tile')].find((tile) => tile.style.getPropertyValue('--tx-treemap-color') === '#123456');
    expect(asia).toBeTruthy();
  });

  it('shows the tooltip and emits tileClick from the pointer', () => {
    const treemap = fixture.debugElement.query((element) => element.nativeElement === main()).componentInstance as TxTreemap;
    const tile = treemap.layout().tiles[0];
    treemap.onPointer({ x: tile.x + 2, y: tile.y + 2, type: 'click', target: null });
    expect(treemap.tooltip()?.rows[0].label).toBe('Hosting');
    expect(treemap.tooltip()?.rows[0].share).toBe('60%');
    expect(host.clicks[0]).toMatchObject({ label: 'Hosting', value: 600, group: null, path: [0] });
    treemap.onPointer({ x: 0, y: 0, type: 'leave', target: null });
    expect(treemap.hovered()).toBeNull();
  });

  it('walks the tiles with the keyboard', () => {
    const treemap = fixture.debugElement.query((element) => element.nativeElement === main()).componentInstance as TxTreemap;
    treemap.onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(treemap.hovered()).toBe(0);
    treemap.onNavigate(new KeyboardEvent('keydown', { key: 'End' }));
    expect(treemap.hovered()).toBe(2);
    treemap.onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(treemap.hovered()).toBe(0);
    treemap.onNavigate(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(treemap.hovered()).toBeNull();
  });

  it('summarises, shows "No data" and applies dt', () => {
    expect(main().querySelector('.tx-chart-frame__summary, [role="img"]')?.getAttribute('aria-label') ?? main().textContent).toContain('Spend');
    const empty = fixture.nativeElement.querySelector('#empty') as HTMLElement;
    expect(empty.textContent).toContain('No data');
    expect(main().style.getPropertyValue('--tx-chart-treemap-radius')).toBe('2px');
  });
});

describe('TxTreemapTileTemplate', () => {
  it('narrows any given context to the tile context', () => {
    expect(TxTreemapTileTemplate.ngTemplateContextGuard({} as TxTreemapTileTemplate, {})).toBe(true);
    expect(TxTreemapTileTemplate.ngTemplateContextGuard({} as TxTreemapTileTemplate, null)).toBe(false);
  });
});

@Component({
  imports: [TxTreemap, TxChartTooltipTemplate],
  template: `
    <tx-treemap [items]="items()" [height]="300" [showTooltip]="showTooltip()" [tooltipFormatter]="formatter()" (tileClick)="clicks.push($event)">
      @if (template()) {
        <ng-template txChartTooltip let-data><span class="own-tooltip">{{ data.title }}|{{ data.rows[0].value }}</span></ng-template>
      }
    </tx-treemap>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class OptionsHost {
  readonly items = signal<TxTreemapItem[] | null>([
    { label: 'Europe', children: [{ label: 'Germany', value: 40 }, { label: 'France', value: 20 }] },
    { label: 'Asia', value: 40 },
  ]);
  readonly showTooltip = signal(true);
  readonly formatter = signal<TxChartTooltipFormatter | null>(null);
  readonly template = signal(false);
  readonly clicks: TxTreemapTileEvent[] = [];
}

describe('TxTreemap options', () => {
  let fixture: ComponentFixture<OptionsHost>;
  let host: OptionsHost;
  const treemap = () => fixture.debugElement.query(By.directive(TxTreemap)).componentInstance as TxTreemap;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const key = async (name: string) => {
    el('.tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const panel = () => document.querySelector('.tx-chart-frame__tooltip') as HTMLElement | null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(OptionsHost);
    host = fixture.componentInstance;
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('shows the empty state without items and ignores the keyboard', async () => {
    host.items.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    expect(treemap().layout().tiles).toEqual([]);
    treemap().onNavigate(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(treemap().hovered()).toBeNull();
  });

  it('names the group in the tooltip, the table and the announcement', async () => {
    const tiles = treemap().layout().tiles;
    const germany = tiles.findIndex((tile) => tile.label === 'Germany');
    expect(treemap().dataTable().rows.map((row) => row.label)).toContain('Europe / Germany');
    treemap().hovered.set(germany);
    expect(treemap().tooltip()?.title).toBe('Europe');
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    treemap().hovered.set(null);
    for (let step = 0; step <= germany; step += 1) await key('ArrowRight');
    expect(treemap().hovered()).toBe(germany);
    expect(announce).toHaveBeenLastCalledWith('Europe, Germany: 40, 40%');
    const asia = tiles.findIndex((tile) => tile.label === 'Asia');
    await key(asia === 0 ? 'Home' : 'End');
    expect(announce).toHaveBeenLastCalledWith('Asia: 40, 40%');
  });

  it('walks backwards from nothing and wraps around', async () => {
    const count = treemap().layout().tiles.length;
    await key('ArrowLeft');
    expect(treemap().hovered()).toBe(count - 1);
    await key('ArrowUp');
    expect(treemap().hovered()).toBe(count - 2);
    await key('ArrowDown');
    expect(treemap().hovered()).toBe(count - 1);
    await key('ArrowDown');
    expect(treemap().hovered()).toBe(0);
  });

  it('formats the tooltip value with a custom formatter and its own template', async () => {
    host.formatter.set((value, context) => `${value} @${context.seriesIndex}:${context.dataPointIndex}`);
    host.template.set(true);
    await fixture.whenStable();
    const index = treemap().layout().tiles.findIndex((tile) => tile.label === 'Asia');
    await key('Home');
    for (let step = 0; step < index; step += 1) await key('ArrowRight');
    const asia = treemap().layout().tiles[index];
    expect(treemap().tooltip()?.rows[0].value).toBe(`40 @${asia.path[0]}:${index}`);
    expect(panel()?.querySelector('.own-tooltip')?.textContent).toBe(`|40 @${asia.path[0]}:${index}`);
  });

  it('clears the hover between tiles and hides the tooltip when asked', async () => {
    const tile = treemap().layout().tiles[0];
    treemap().onPointer({ x: tile.x + 2, y: tile.y + 2, type: 'move', target: null });
    expect(treemap().hovered()).toBe(0);
    treemap().onPointer({ x: -10, y: -10, type: 'click', target: null });
    expect(treemap().hovered()).toBeNull();
    expect(host.clicks).toEqual([]);
    await key('End');
    expect(treemap().tooltip()).not.toBeNull();
    host.items.set([{ label: 'Asia', value: 40 }]);
    await fixture.whenStable();
    expect(treemap().tooltip()).toBeNull();
    host.showTooltip.set(false);
    await fixture.whenStable();
    treemap().onPointer({ x: tile.x + 2, y: tile.y + 2, type: 'move', target: null });
    expect(treemap().tooltip()).toBeNull();
  });
});

describe('TxTreemap recompiled by TestBed', () => {
  it('still renders its tiles and tooltip template when a test overrides the component', async () => {
    TestBed.overrideComponent(TxTreemap, { set: { styles: [] } });
    const fixture = TestBed.createComponent(OptionsHost);
    fixture.componentInstance.template.set(true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('.tx-treemap__tile')).toHaveLength(3);
    fixture.nativeElement.querySelector('.tx-chart-frame__plot').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    await fixture.whenStable();
    expect(document.querySelector('.tx-chart-frame__tooltip .own-tooltip')).not.toBeNull();
    document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = ''));
  });
});

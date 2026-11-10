import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTreemap } from './treemap.component';
import { insetRect, squarify, treemapValue } from './treemap-layout';
import { TxTreemapItem, TxTreemapTileEvent } from './treemap.types';

@Component({
  imports: [TxTreemap],
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

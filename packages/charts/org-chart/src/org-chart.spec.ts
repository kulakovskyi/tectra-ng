import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxOrgChart } from './org-chart.component';
import { TxOrgChartMinimap } from './org-chart-minimap.component';
import { TxOrgChartNodeTemplate } from './org-chart-templates.directive';
import {
  orgChartChildren,
  orgChartExpandAll,
  orgChartExpandState,
  orgChartPathLine,
  orgChartPathTo,
  orgChartReveal,
  orgChartSearch,
  orgChartToggle,
} from './org-chart-tree';
import { TX_ORG_CHART_ZOOM, boundView, centerOn, clampZoom, fitView, wheelIsMouse, wheelZoom, zoomAt } from './org-chart-view';
import { TxOrgChartNode } from './org-chart.types';

const leaf = (id: string, extra: Partial<TxOrgChartNode> = {}): TxOrgChartNode => ({ id, title: id, ...extra });

const TREE: TxOrgChartNode[] = [
  leaf('ceo', {
    title: 'Ada Brooks',
    subtitle: 'CEO',
    avatar: { name: 'Ada Brooks' },
    children: [
      leaf('cto', { title: 'Ben Cole', subtitle: 'CTO', collapsible: true, expanded: true, children: [leaf('dev', { title: 'Dana Fox', subtitle: 'Developer' })] }),
      leaf('cfo', { title: 'Carl Diaz', subtitle: 'CFO', icon: 'wallet', collapsible: true, children: [leaf('acc', { title: 'Eve Gray' })] }),
      leaf('ops', { title: 'Operations', childrenEmptyText: 'Nobody yet', pills: [{ label: 'New', tone: 'success' }] }),
    ],
  }),
];

@Component({
  imports: [TxOrgChart, TxOrgChartNodeTemplate],
  template: `
    <tx-org-chart
      id="main"
      [nodes]="nodes()"
      [highlightIds]="highlight()"
      height="400px"
      [labels]="{ title: 'Company' }"
      (nodeToggle)="toggles.push($event)"
      (nodeClick)="clicks.push($event.id)"
      (searchChange)="searches.push($event)"
      (expandAll)="expandAllCount = expandAllCount + 1"
    >
      <h3 txOrgChartHeader class="own-header">Team</h3>
    </tx-org-chart>
    <tx-org-chart id="custom" [nodes]="nodes()" [toolbar]="false" [minimap]="false" height="300px">
      <ng-template txOrgChartNode let-node let-highlighted="highlighted">
        <span class="own-node" [class.own-node--hl]="highlighted">{{ node.title }}</span>
      </ng-template>
    </tx-org-chart>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly nodes = signal<TxOrgChartNode[]>(TREE);
  readonly highlight = signal<string[]>([]);
  readonly toggles: string[] = [];
  readonly clicks: string[] = [];
  readonly searches: string[] = [];
  expandAllCount = 0;
}

describe('org chart tree', () => {
  it('decides what a node shows below it', () => {
    expect(orgChartChildren(leaf('a', { collapsible: true, loading: true, children: [leaf('b')] })).kind).toBe('none');
    expect(orgChartChildren(leaf('a', { collapsible: true, expanded: true, loading: true })).kind).toBe('loading');
    expect(orgChartChildren(leaf('a', { children: [leaf('b')] })).nodes.map((node) => node.id)).toEqual(['b']);
    expect(orgChartChildren(leaf('a', { childrenEmptyText: 'Nobody' }))).toEqual({ kind: 'empty', nodes: [], emptyText: 'Nobody' });
    expect(orgChartChildren(leaf('a')).kind).toBe('none');
  });

  it('reports the expand state of nested collapsible nodes', () => {
    expect(orgChartExpandState([leaf('a')])).toEqual({ hasCollapsible: false, allExpanded: false, noneExpanded: true });
    expect(orgChartExpandState(TREE)).toEqual({ hasCollapsible: true, allExpanded: false, noneExpanded: false });
    expect(orgChartExpandState(orgChartExpandAll(TREE, true)).allExpanded).toBe(true);
    expect(orgChartExpandState(orgChartExpandAll(TREE, false)).noneExpanded).toBe(true);
  });

  it('draws the elbow path between cards', () => {
    expect(orgChartPathLine([])).toBe('');
    expect(
      orgChartPathLine([
        { x: 0, y: 0, width: 100, height: 40 },
        { x: 200, y: 100, width: 60, height: 40 },
      ]),
    ).toBe('M 50 40 V 76 H 230 V 100');
    expect(
      orgChartPathLine(
        [
          { x: 0, y: 0, width: 100, height: 40 },
          { x: 200, y: 100, width: 60, height: 40 },
        ],
        20,
        6,
        0.5,
      ),
    ).toBe('M 50.5 40 V 74.5 A 6 6 0 0 0 56.5 80.5 H 224.5 A 6 6 0 0 1 230.5 86.5 V 100');
  });

  it('toggles, searches, finds the path and reveals matches immutably', () => {
    const toggled = orgChartToggle(TREE, 'cfo');
    expect(toggled[0].children?.[1].expanded).toBe(true);
    expect(TREE[0].children?.[1].expanded).toBeUndefined();
    expect(orgChartSearch(TREE, 'c')).toEqual(['ceo', 'cto', 'cfo']);
    expect(orgChartSearch(TREE, 'gray')).toEqual(['acc']);
    expect(orgChartSearch(TREE, '  ')).toEqual([]);
    expect(orgChartPathTo(TREE, 'acc')).toEqual(['ceo', 'cfo', 'acc']);
    expect(orgChartReveal(TREE, ['acc'])[0].children?.[1].expanded).toBe(true);
  });
});

describe('org chart view', () => {
  it('zooms around a point and clamps', () => {
    expect(clampZoom(10)).toBe(TX_ORG_CHART_ZOOM.max);
    expect(clampZoom(0)).toBe(TX_ORG_CHART_ZOOM.min);
    const next = zoomAt({ x: 0, y: 0, zoom: 1 }, 2, { x: 100, y: 50 });
    expect(next).toEqual({ zoom: 2, x: -100, y: -50 });
  });

  it('centres a point and fits the stage', () => {
    expect(centerOn({ x: 0, y: 0, zoom: 1 }, { width: 400, height: 200 }, { x: 50, y: 50 })).toEqual({ zoom: 1, x: 150, y: 50 });
    expect(fitView({ width: 0, height: 0 }, { width: 10, height: 10 })).toBeNull();
    const fit = fitView({ width: 880, height: 480 }, { width: 1600, height: 400 });
    expect(fit?.zoom).toBe(0.5);
    expect(fit?.x).toBe(40);
  });

  it('keeps part of the tree inside the canvas', () => {
    const viewport = { width: 800, height: 400 };
    const stage = { width: 600, height: 300 };
    expect(boundView({ x: -5000, y: -5000, zoom: 1 }, viewport, stage)).toEqual({ x: 64 - 600, y: 64 - 300, zoom: 1 });
    expect(boundView({ x: 5000, y: 5000, zoom: 1 }, viewport, stage)).toEqual({ x: 800 - 64, y: 400 - 64, zoom: 1 });
    expect(boundView({ x: 10, y: 20, zoom: 1 }, viewport, stage)).toEqual({ x: 10, y: 20, zoom: 1 });
    expect(boundView({ x: -5000, y: 0, zoom: 1 }, { width: 0, height: 0 }, stage).x).toBe(-5000);
  });

  it('tells a mouse wheel from a trackpad', () => {
    expect(wheelIsMouse({ deltaMode: 1, deltaX: 0, deltaY: 3 })).toBe(true);
    expect(wheelIsMouse({ deltaMode: 0, deltaX: 0, deltaY: 100 })).toBe(true);
    expect(wheelIsMouse({ deltaMode: 0, deltaX: 2, deltaY: 7.5 })).toBe(false);
    expect(wheelZoom(1, -1000, false)).toBeGreaterThan(1);
    expect(wheelZoom(1, 100, true)).toBeLessThan(wheelZoom(1, 100, false));
  });
});

describe('TxOrgChart', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const main = () => fixture.nativeElement.querySelector('#main') as HTMLElement;
  const chart = () => fixture.debugElement.query((element) => element.nativeElement === main()).componentInstance as TxOrgChart;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('renders the tree of cards, the header slot, the toolbar and the hint', () => {
    expect([...main().querySelectorAll('.tx-org-chart-card__title')].map((title) => title.textContent?.trim())).toEqual(['Ada Brooks', 'Ben Cole', 'Dana Fox', 'Carl Diaz', 'Operations']);
    expect(main().querySelector('.own-header')?.textContent).toBe('Team');
    expect(main().querySelector('.tx-org-chart-node__empty')?.textContent?.trim()).toBe('Nobody yet');
    expect(main().querySelector('.tx-org-chart__canvas')?.getAttribute('aria-label')).toBe('Company');
    expect((main().querySelector('.tx-org-chart__canvas') as HTMLElement).style.height).toBe('400px');
    expect(main().querySelector('.tx-org-chart__hint')?.textContent).toContain('Drag to move');
    expect(main().querySelector('tx-pill')?.textContent?.trim()).toBe('New');
  });

  it('emits nodeToggle from the chevron and nodeClick from the card', () => {
    const toggles = main().querySelectorAll<HTMLButtonElement>('.tx-org-chart-card__toggle');
    expect(toggles).toHaveLength(2);
    expect(toggles[0].getAttribute('aria-expanded')).toBe('true');
    expect(toggles[1].getAttribute('aria-label')).toBe('Expand');
    toggles[1].click();
    expect(host.toggles).toEqual(['cfo']);
    expect(host.clicks).toEqual([]);
    (main().querySelector('.tx-org-chart-node__card') as HTMLElement).click();
    expect(host.clicks).toEqual(['ceo']);
  });

  it('marks matches, counts them and emits search after the delay', async () => {
    vi.useFakeTimers();
    const input = main().querySelector('input') as HTMLInputElement;
    input.value = 'cfo';
    input.dispatchEvent(new Event('input'));
    expect(host.searches).toEqual([]);
    vi.advanceTimersByTime(400);
    expect(host.searches).toEqual(['cfo']);
    vi.useRealTimers();
    host.highlight.set(['cfo']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(main().querySelector('.tx-org-chart-card__box--match .tx-org-chart-card__title')?.textContent?.trim()).toBe('Carl Diaz');
    expect(main().querySelector('tx-org-chart-toolbar tx-pill')?.textContent?.trim()).toBe('1 found');
  });

  it('zooms with the toolbar and the keyboard and pans with the arrows', async () => {
    chart().viewport.set({ width: 800, height: 400 });
    chart().zoomIn();
    expect(chart().view().zoom).toBeCloseTo(1.2);
    chart().resetZoom();
    expect(chart().view().zoom).toBe(1);
    const canvas = main().querySelector('.tx-org-chart__canvas') as HTMLElement;
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: '-', bubbles: true }));
    expect(chart().view().zoom).toBeCloseTo(1 / 1.2);
    const before = chart().view().x;
    canvas.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    expect(chart().view().x).toBe(before - 48);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(main().querySelector('.tx-org-chart__zoom')?.textContent?.trim()).toBe('83%');
  });

  it('drags the canvas and keeps the click after a drag from firing', () => {
    const start = chart().view();
    const target = main().querySelector('.tx-org-chart-node__card') as HTMLElement;
    const event = (type: string, x: number, y: number) => ({ type, pointerId: 1, pointerType: 'mouse', button: 0, clientX: x, clientY: y, target, currentTarget: target }) as unknown as PointerEvent;
    chart().onPointerDown(event('pointerdown', 10, 10));
    chart().onPointerMove(event('pointermove', 40, 30));
    expect(chart().view().x).toBe(start.x + 30);
    expect(chart().view().y).toBe(start.y + 20);
    chart().onNodeClick(TREE[0]);
    expect(host.clicks).toEqual([]);
    chart().onPointerUp(event('pointerup', 40, 30));
  });

  it('switches the overlay full screen and leaves it with Escape', () => {
    chart().exitOverlayFullscreen();
    chart()['enterOverlay']();
    expect(chart().fullscreen()).toBe(true);
    fixture.detectChanges();
    expect(main().querySelector('.tx-org-chart__canvas--fullscreen')).not.toBeNull();
    expect(main().querySelector('.tx-org-chart__floating')).not.toBeNull();
    expect(document.documentElement.style.overflow).toBe('hidden');
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(chart().fullscreen()).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('draws own node content from the txOrgChartNode template', () => {
    const custom = fixture.nativeElement.querySelector('#custom') as HTMLElement;
    expect([...custom.querySelectorAll('.own-node')].map((node) => node.textContent)).toContain('Dana Fox');
    expect(custom.querySelector('tx-org-chart-toolbar')).toBeNull();
    expect(custom.querySelector('tx-org-chart-minimap')).toBeNull();
  });
});

describe('TxOrgChartMinimap', () => {
  it('keeps the viewport frame inside the map', () => {
    const outside = TestBed.createComponent(TxOrgChartMinimap);
    outside.componentRef.setInput('layout', { width: 1200, height: 340, items: [] });
    outside.componentRef.setInput('viewport', { width: 900, height: 600 });
    outside.componentRef.setInput('view', { x: 5000, y: 0, zoom: 1 });
    outside.detectChanges();
    expect(outside.nativeElement.querySelector('.tx-org-chart__map-viewport')).toBeNull();
    const fixture = TestBed.createComponent(TxOrgChartMinimap);
    fixture.componentRef.setInput('layout', { width: 1200, height: 340, items: [{ id: 'a', tone: 'primary', x: 0, y: 0, width: 200, height: 60 }] });
    fixture.componentRef.setInput('viewport', { width: 900, height: 600 });
    fixture.componentRef.setInput('view', { x: 100, y: 200, zoom: 0.5 });
    fixture.detectChanges();
    const map = fixture.componentInstance;
    const rect = map.viewportRect();
    expect(rect.x).toBe(0);
    expect(rect.y).toBe(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(map.mapWidth());
    expect(rect.y + rect.height).toBeLessThanOrEqual(map.mapHeight());
    expect(fixture.nativeElement.querySelectorAll('.tx-org-chart__map-item')).toHaveLength(1);
    expect(map.mapWidth()).toBe(240);
    fixture.componentRef.setInput('viewport', { width: 360, height: 500 });
    fixture.detectChanges();
    expect(map.mapWidth()).toBe(140);
  });
});

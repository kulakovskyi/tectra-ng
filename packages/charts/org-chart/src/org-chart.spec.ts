import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxOrgChartCard } from './org-chart-card.component';
import { TxOrgChart } from './org-chart.component';
import { TxOrgChartMinimap } from './org-chart-minimap.component';
import { TxOrgChartNodeTemplate } from './org-chart-templates.directive';
import { TxOrgChartToolbar } from './org-chart-toolbar.component';
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
import { TxOrgChartLabels, TxOrgChartNode } from './org-chart.types';

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
    vi.runOnlyPendingTimers();
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

const LABELS: TxOrgChartLabels = {
  title: 'Chart',
  hint: '',
  search: 'Find',
  matches: '{count} hits',
  noMatches: 'None',
  zoomIn: 'In',
  zoomOut: 'Out',
  resetZoom: 'Reset',
  fit: 'Fit',
  expandAll: 'Open all',
  collapseAll: 'Close all',
  fullscreen: 'Full',
  exitFullscreen: 'Exit',
  expand: 'Open',
  collapse: 'Close',
  more: 'More',
};

const PEOPLE: TxOrgChartNode[] = [
  leaf('ceo', {
    title: 'Ada Brooks',
    kind: 'person',
    children: [
      leaf('cto', { title: 'Ben Cole', kind: 'person', collapsible: true, expanded: true, children: [leaf('dev', { title: 'Dana Fox' })] }),
      leaf('lab', { title: 'Lab', kind: 'team', collapsible: true, expanded: true, loading: true }),
    ],
  }),
];

@Component({
  imports: [TxOrgChart, TxOrgChartNodeTemplate],
  template: `
    <tx-org-chart
      [nodes]="nodes()"
      [highlightIds]="highlight()"
      [focusId]="focus()"
      [pathKinds]="kinds()"
      [unstyled]="unstyled()"
      [busy]="true"
      [pt]="{ root: { class: 'own-root' } }"
      (nodeClick)="clicks.push($event.id)"
      (nodeToggle)="toggles.push($event)"
      (expandAll)="events.push('expand')"
      (collapseAll)="events.push('collapse')"
    />
    @if (custom()) {
      <tx-org-chart id="templated" [nodes]="nodes()" [toolbar]="false" (nodeToggle)="toggles.push('custom:' + $event)">
        <ng-template txOrgChartNode let-node let-toggle="toggle">
          <button type="button" class="own-toggle" (click)="toggle()">{{ node.title }}</button>
        </ng-template>
      </tx-org-chart>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InteractiveHost {
  readonly nodes = signal<TxOrgChartNode[] | null>(PEOPLE);
  readonly highlight = signal<string[] | null>([]);
  readonly focus = signal<string | null>(null);
  readonly kinds = signal<string[] | null>(null);
  readonly unstyled = signal<boolean | undefined>(undefined);
  readonly custom = signal(false);
  readonly clicks: string[] = [];
  readonly toggles: string[] = [];
  readonly events: string[] = [];
}

type FullscreenCanvas = HTMLElement & {
  requestFullscreen?: () => Promise<void>;
  webkitRequestFullscreen?: () => void;
  showPopover?: () => void;
  hidePopover?: () => void;
};

describe('TxOrgChart interactions', () => {
  let fixture: ComponentFixture<InteractiveHost>;
  let host: InteractiveHost;
  const root = () => fixture.nativeElement.querySelector('tx-org-chart') as HTMLElement;
  const chart = () => fixture.debugElement.query(By.directive(TxOrgChart)).componentInstance as TxOrgChart;
  const canvas = () => root().querySelector('.tx-org-chart__canvas') as FullscreenCanvas;
  const card = (id: string) => root().querySelector(`.tx-org-chart-node__card[data-org-id="${id}"]`) as HTMLElement;
  const key = (target: HTMLElement, init: KeyboardEventInit) => {
    const event = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(event);
    return event;
  };
  const pointer = (type: string, init: { pointerId: number; clientX: number; clientY: number; button?: number; pointerType?: string }) =>
    Object.assign(new MouseEvent(type, { bubbles: true, cancelable: true, clientX: init.clientX, clientY: init.clientY, button: init.button ?? 0 }), {
      pointerId: init.pointerId,
      pointerType: init.pointerType ?? 'touch',
    });
  const settle = async () => {
    fixture.detectChanges();
    await fixture.whenStable();
  };

  beforeEach(async () => {
    vi.stubGlobal('CSS', { escape: (value: string) => value });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(800);
    vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
    fixture = TestBed.createComponent(InteractiveHost);
    host = fixture.componentInstance;
    await settle();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
    const doc = document as unknown as Record<string, unknown>;
    delete doc['fullscreenElement'];
    delete doc['webkitFullscreenElement'];
    delete doc['exitFullscreen'];
    delete doc['webkitExitFullscreen'];
    document.documentElement.removeAttribute('style');
  });

  it('measures the canvas, renders the loading skeleton and passes the root class', () => {
    expect(chart().viewport()).toEqual({ width: 800, height: 400 });
    expect(root().classList).toContain('own-root');
    expect(canvas().getAttribute('aria-busy')).toBe('true');
    expect(canvas().classList).toContain('tx-org-chart__canvas--busy');
    expect(root().querySelector('tx-org-chart-node-skeleton')?.hasAttribute('data-styled')).toBe(true);
    expect(card('lab').closest('tx-org-chart-node')?.hasAttribute('data-styled')).toBe(true);
  });

  it('drops the styling hooks when unstyled', async () => {
    host.unstyled.set(true);
    await settle();
    expect(root().hasAttribute('data-styled')).toBe(false);
    expect(root().querySelector('tx-org-chart-node-skeleton')?.hasAttribute('data-styled')).toBe(false);
    expect(root().querySelector('tx-org-chart-node')?.hasAttribute('data-styled')).toBe(false);
    expect(root().querySelector('tx-org-chart-card')?.hasAttribute('data-styled')).toBe(false);
  });

  it('treats missing nodes and highlights as empty and ignores the keyboard', async () => {
    host.nodes.set(null);
    host.highlight.set(null);
    await settle();
    expect(root().querySelectorAll('.tx-org-chart-node__card')).toHaveLength(0);
    expect(chart().toolbarState().hasContent).toBe(false);
    expect(chart().toolbarState().matchCount).toBe(0);
    const event = key(canvas(), { key: '+' });
    expect(event.defaultPrevented).toBe(false);
    expect(chart().view().zoom).toBe(1);
  });

  it('highlights the path to a hovered card and clears it on leave', async () => {
    card('dev').dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect([...chart().pathIds()]).toEqual(['ceo', 'cto', 'dev']);
    expect(card('cto').querySelector('.tx-org-chart-card__box--path')).not.toBeNull();
    expect(root().querySelector('.tx-org-chart__path path')?.getAttribute('d')).toMatch(/^M /);
    card('dev').dispatchEvent(new FocusEvent('focusout'));
    await settle();
    expect(chart().pathIds().size).toBe(0);
    expect(root().querySelector('.tx-org-chart__path')).toBeNull();
    card('cto').dispatchEvent(new FocusEvent('focusin'));
    expect([...chart().pathIds()]).toEqual(['ceo', 'cto']);
    card('cto').dispatchEvent(new MouseEvent('mouseleave'));
    expect(chart().pathIds().size).toBe(0);
  });

  it('draws the hover path only for the listed node kinds', async () => {
    host.kinds.set(['team']);
    await settle();
    card('dev').dispatchEvent(new MouseEvent('mouseenter'));
    expect(chart().pathIds().size).toBe(0);
    card('lab').dispatchEvent(new MouseEvent('mouseenter'));
    expect([...chart().pathIds()]).toEqual(['ceo', 'lab']);
  });

  it('clicks a card with Enter and Space but not from its own buttons', () => {
    key(card('cto'), { key: 'Enter' });
    key(card('dev'), { key: ' ' });
    expect(host.clicks).toEqual(['cto', 'dev']);
    const toggle = card('cto').querySelector('.tx-org-chart-card__toggle') as HTMLElement;
    key(toggle, { key: 'Enter' });
    expect(host.clicks).toEqual(['cto', 'dev']);
    toggle.click();
    expect(host.toggles).toEqual(['cto']);
  });

  it('hands a toggle callback to the node template', async () => {
    host.custom.set(true);
    await settle();
    const templated = fixture.nativeElement.querySelector('#templated') as HTMLElement;
    const buttons = [...templated.querySelectorAll<HTMLButtonElement>('.own-toggle')];
    expect(buttons.map((button) => button.textContent)).toEqual(['Ada Brooks', 'Ben Cole', 'Dana Fox', 'Lab']);
    buttons[1].click();
    expect(host.toggles).toEqual(['custom:cto']);
    expect(TxOrgChartNodeTemplate.ngTemplateContextGuard({} as TxOrgChartNodeTemplate, {})).toBe(true);
  });

  it('zooms with the wheel, a pinched mouse and the trackpad, and pans with a trackpad', () => {
    const wheel = (init: WheelEventInit) => {
      const event = new WheelEvent('wheel', { bubbles: true, cancelable: true, ...init });
      canvas().dispatchEvent(event);
      return event;
    };
    expect(wheel({ deltaY: -100, ctrlKey: true }).defaultPrevented).toBe(true);
    expect(chart().view().zoom).toBeGreaterThan(1);
    const zoomed = chart().view().zoom;
    wheel({ deltaY: 3, deltaMode: 1 });
    expect(chart().view().zoom).toBeLessThan(zoomed);
    wheel({ deltaY: -2, metaKey: true });
    const before = chart().view();
    wheel({ deltaX: 3, deltaY: 5.5 });
    expect(chart().view().zoom).toBe(before.zoom);
    expect(chart().view().x).not.toBe(before.x);
  });

  it('pans with one pointer, pinches with two and ignores the rest', () => {
    vi.useFakeTimers();
    const start = chart().view();
    canvas().dispatchEvent(pointer('pointerdown', { pointerId: 9, clientX: 0, clientY: 0, button: 2, pointerType: 'mouse' }));
    canvas().dispatchEvent(pointer('pointermove', { pointerId: 9, clientX: 50, clientY: 50 }));
    expect(chart().view()).toEqual(start);
    (root().querySelector('.tx-org-chart-card__toggle') as HTMLElement).dispatchEvent(pointer('pointerdown', { pointerId: 8, clientX: 0, clientY: 0 }));
    canvas().dispatchEvent(pointer('pointerup', { pointerId: 8, clientX: 0, clientY: 0 }));
    canvas().dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 100, clientY: 100 }));
    canvas().dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 101, clientY: 101 }));
    expect(chart().dragging()).toBe(false);
    canvas().dispatchEvent(pointer('pointerdown', { pointerId: 2, clientX: 201, clientY: 101 }));
    canvas().dispatchEvent(pointer('pointermove', { pointerId: 2, clientX: 301, clientY: 101 }));
    expect(chart().view().zoom).toBeCloseTo(2);
    card('ceo').click();
    expect(host.clicks).toEqual([]);
    canvas().dispatchEvent(pointer('pointercancel', { pointerId: 2, clientX: 301, clientY: 101 }));
    canvas().dispatchEvent(pointer('pointermove', { pointerId: 1, clientX: 140, clientY: 101 }));
    expect(chart().dragging()).toBe(true);
    canvas().dispatchEvent(pointer('pointerup', { pointerId: 1, clientX: 140, clientY: 101 }));
    expect(chart().dragging()).toBe(false);
    vi.runOnlyPendingTimers();
    card('ceo').click();
    expect(host.clicks).toEqual(['ceo']);
  });

  it('runs the keyboard shortcuts on the canvas only', () => {
    expect(key(canvas(), { key: '=' }).defaultPrevented).toBe(true);
    expect(chart().view().zoom).toBeCloseTo(1.2);
    key(canvas(), { key: '_' });
    key(canvas(), { key: '-' });
    expect(chart().view().zoom).toBeCloseTo(1 / 1.2);
    key(canvas(), { key: '0' });
    expect(chart().view().zoom).toBe(1);
    expect(key(canvas(), { key: '+', ctrlKey: true }).defaultPrevented).toBe(false);
    expect(key(canvas(), { key: 'q' }).defaultPrevented).toBe(false);
    for (const name of ['f', 'F', 'а', 'А']) expect(key(canvas(), { key: name }).defaultPrevented).toBe(true);
    const start = chart().view();
    key(canvas(), { key: 'ArrowLeft' });
    key(canvas(), { key: 'ArrowUp' });
    expect(chart().view()).toMatchObject({ x: start.x + 48, y: start.y + 48 });
    key(canvas(), { key: 'ArrowDown' });
    expect(chart().view().y).toBe(start.y);
    expect(key(card('ceo'), { key: 'ArrowLeft' }).defaultPrevented).toBe(false);
    const search = root().querySelector('.tx-org-chart__bar input') as HTMLInputElement;
    expect(key(search, { key: '+' }).defaultPrevented).toBe(false);
    const editable = document.createElement('div');
    Object.defineProperty(editable, 'isContentEditable', { value: true });
    card('ceo').appendChild(editable);
    expect(key(editable, { key: '+' }).defaultPrevented).toBe(false);
    key(canvas(), { key: '/' });
    expect(document.activeElement).toBe(search);
  });

  it('enters native full screen, locks the page and leaves it again', async () => {
    const doc = document as unknown as Record<string, unknown>;
    document.documentElement.style.setProperty('scrollbar-gutter', 'stable');
    canvas().requestFullscreen = vi.fn(() => Promise.resolve());
    const exit = vi.fn(() => Promise.reject(new Error('denied')));
    doc['exitFullscreen'] = exit;
    chart().toggleFullscreen();
    expect(canvas().requestFullscreen).toHaveBeenCalled();
    doc['fullscreenElement'] = canvas();
    document.dispatchEvent(new Event('fullscreenchange'));
    await settle();
    expect(chart().native()).toBe(true);
    expect(chart().fullscreen()).toBe(true);
    expect(canvas().classList).toContain('tx-org-chart__canvas--native');
    expect(document.documentElement.style.overflow).toBe('hidden');
    expect(document.documentElement.style.getPropertyValue('scrollbar-gutter')).toBe('auto');
    chart().toggleFullscreen();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(exit).toHaveBeenCalledTimes(2);
    delete doc['fullscreenElement'];
    doc['webkitFullscreenElement'] = null;
    document.dispatchEvent(new Event('webkitfullscreenchange'));
    await settle();
    expect(chart().native()).toBe(false);
    expect(chart().fullscreen()).toBe(false);
    expect(document.documentElement.style.overflow).toBe('');
    expect(document.documentElement.style.getPropertyValue('scrollbar-gutter')).toBe('stable');
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(chart().fullscreen()).toBe(false);
  });

  it('exits native full screen through the prefixed API when destroyed', () => {
    const doc = document as unknown as Record<string, unknown>;
    const exit = vi.fn();
    doc['webkitExitFullscreen'] = exit;
    doc['webkitFullscreenElement'] = canvas();
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(chart().native()).toBe(true);
    fixture.destroy();
    expect(exit).toHaveBeenCalledTimes(1);
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('falls back to the overlay when native full screen is missing or refused', async () => {
    chart().toggleFullscreen();
    expect(chart().fullscreen()).toBe(true);
    expect(chart().native()).toBe(false);
    await settle();
    expect(root().querySelector('.tx-org-chart__backdrop')).not.toBeNull();
    chart().toggleFullscreen();
    expect(chart().fullscreen()).toBe(false);
    canvas().webkitRequestFullscreen = vi.fn(() => {
      throw new Error('blocked');
    });
    chart().toggleFullscreen();
    expect(chart().fullscreen()).toBe(true);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(chart().fullscreen()).toBe(false);
    canvas().webkitRequestFullscreen = vi.fn();
    chart().toggleFullscreen();
    expect(chart().fullscreen()).toBe(false);
    canvas().requestFullscreen = vi.fn(() => Promise.reject(new Error('refused')));
    chart().toggleFullscreen();
    await settle();
    expect(chart().fullscreen()).toBe(true);
  });

  it('shows the overlay in the top layer when popovers are supported', async () => {
    const show = vi.fn();
    const hide = vi.fn(() => {
      throw new Error('not open');
    });
    canvas().showPopover = show;
    canvas().hidePopover = hide;
    chart()['enterOverlay']();
    await settle();
    expect(show).toHaveBeenCalled();
    expect(canvas().getAttribute('popover')).toBe('manual');
    expect(chart().topLayer()).toBe(true);
    expect(root().querySelector('.tx-org-chart__backdrop')).toBeNull();
    chart().exitOverlayFullscreen();
    expect(hide).toHaveBeenCalled();
    expect(canvas().hasAttribute('popover')).toBe(false);
    expect(chart().topLayer()).toBe(false);
    canvas().showPopover = () => {
      throw new Error('unsupported');
    };
    chart()['enterOverlay']();
    await settle();
    expect(chart().topLayer()).toBe(false);
    expect(canvas().hasAttribute('popover')).toBe(false);
    canvas().hidePopover = vi.fn();
    chart().exitOverlayFullscreen();
    expect(chart().fullscreen()).toBe(false);
  });

  it('centres the focused node once per query', async () => {
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(200);
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(60);
    host.focus.set('dev');
    await settle();
    expect(chart().view().zoom).toBe(1.25);
    chart().view.set({ x: 0, y: 0, zoom: 1 });
    host.highlight.set(['dev']);
    await settle();
    expect(chart().view()).toEqual({ x: 0, y: 0, zoom: 1 });
    chart().onSearch('dana');
    await settle();
    expect(chart().view().zoom).toBe(1.25);
    chart().fitToScreen();
    expect(chart().view().zoom).not.toBe(1.25);
  });

  it('reads the connector size from the stage tokens and drops the radius when unstyled', async () => {
    const stage = root().querySelector('.tx-org-chart__stage') as HTMLElement;
    stage.style.setProperty('--tx-chart-org-chart-connector-height', '30px');
    card('dev').dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(root().querySelector('.tx-org-chart__path path')?.getAttribute('d')).toContain('V -29.5');
    card('dev').dispatchEvent(new MouseEvent('mouseleave'));
    host.unstyled.set(true);
    await settle();
    stage.style.setProperty('--tx-chart-org-chart-connector-radius', '8px');
    card('cto').dispatchEvent(new MouseEvent('mouseenter'));
    await settle();
    expect(root().querySelector('.tx-org-chart__path path')?.getAttribute('d')).not.toContain('A ');
  });

  it('zooms in with plus, pinches from a zero distance and focuses the floating search', async () => {
    key(canvas(), { key: '+' });
    expect(chart().view().zoom).toBeCloseTo(1.2);
    const before = chart().view();
    canvas().dispatchEvent(pointer('pointerdown', { pointerId: 1, clientX: 10, clientY: 10 }));
    canvas().dispatchEvent(pointer('pointerdown', { pointerId: 2, clientX: 10, clientY: 10 }));
    canvas().dispatchEvent(pointer('pointermove', { pointerId: 2, clientX: 60, clientY: 10 }));
    expect(chart().view()).toEqual(before);
    canvas().dispatchEvent(pointer('pointermove', { pointerId: 2, clientX: 110, clientY: 10 }));
    expect(chart().view().zoom).toBeCloseTo(2);
    canvas().dispatchEvent(pointer('pointerup', { pointerId: 1, clientX: 0, clientY: 0 }));
    canvas().dispatchEvent(pointer('pointerup', { pointerId: 2, clientX: 0, clientY: 0 }));
    chart().toggleFullscreen();
    await settle();
    key(canvas(), { key: '/' });
    expect(document.activeElement).toBe(root().querySelector('.tx-org-chart__floating input'));
  });

  it('keeps the view for an unknown focus id and moves it from the minimap', async () => {
    const start = chart().view();
    host.focus.set('nobody');
    await settle();
    expect(chart().view()).toEqual(start);
    fixture.debugElement.query(By.directive(TxOrgChartMinimap)).triggerEventHandler('navigate', { x: 100, y: 50 });
    expect(chart().view()).toEqual({ zoom: start.zoom, x: 400 - 100 * start.zoom, y: 200 - 50 * start.zoom });
  });

  it('locks the page once for repeated full screen changes', () => {
    const doc = document as unknown as Record<string, unknown>;
    doc['fullscreenElement'] = canvas();
    document.dispatchEvent(new Event('fullscreenchange'));
    document.documentElement.style.overflow = 'auto';
    document.dispatchEvent(new Event('fullscreenchange'));
    doc['fullscreenElement'] = null;
    document.dispatchEvent(new Event('fullscreenchange'));
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('runs the toolbar buttons and the more menu', async () => {
    const toolbar = fixture.debugElement.query(By.directive(TxOrgChartToolbar)).componentInstance as TxOrgChartToolbar;
    const buttons = root().querySelectorAll<HTMLButtonElement>('.tx-org-chart__expand-group button');
    expect(buttons[0].disabled).toBe(true);
    buttons[1].click();
    toolbar.onMenu('expand');
    toolbar.onMenu('collapse');
    toolbar.onMenu('other');
    expect(host.events).toEqual(['collapse', 'expand', 'collapse']);
    toolbar.onMenu('fullscreen');
    expect(chart().fullscreen()).toBe(true);
    const zoom = root().querySelectorAll<HTMLButtonElement>('.tx-org-chart__zoom-group button');
    zoom[2].click();
    expect(chart().view().zoom).toBeCloseTo(1.2);
    zoom[0].click();
    expect(chart().view().zoom).toBeCloseTo(1);
    zoom[1].click();
    zoom[3].click();
    await settle();
    expect(root().querySelector('.tx-org-chart__floating tx-org-chart-toolbar')).not.toBeNull();
    (root().querySelector('.tx-org-chart__more') as HTMLElement).dispatchEvent(new Event('pointerdown'));
    expect(toolbar.narrow()).toBe(false);
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockReturnValue(300);
    document.documentElement.style.fontSize = '20px';
    key(root().querySelector('.tx-org-chart__more') as HTMLElement, { key: 'Enter' });
    expect(toolbar.narrow()).toBe(true);
  });
});

describe('TxOrgChart before and around rendering', () => {
  afterEach(() => vi.restoreAllMocks());

  it('does nothing that needs the canvas before the first render', () => {
    const fixture = TestBed.createComponent(TxOrgChart);
    const chart = fixture.componentInstance;
    chart.fitToScreen();
    chart.toggleFullscreen();
    chart.exitOverlayFullscreen();
    chart.onWheel(new WheelEvent('wheel', { deltaY: -100, ctrlKey: true, clientX: 10, clientY: 10 }));
    expect(chart.fullscreen()).toBe(false);
    expect(chart.view().zoom).toBeGreaterThan(1);
  });

  it('follows the canvas size with a resize observer and stops on destroy', async () => {
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
    try {
      const fixture = TestBed.createComponent(TxOrgChart);
      fixture.componentRef.setInput('nodes', TREE);
      await fixture.whenStable();
      expect(fixture.componentInstance.viewport().width).toBe(500);
      width.mockReturnValue(700);
      callbacks.forEach((callback) => callback());
      expect(fixture.componentInstance.viewport().width).toBe(700);
      fixture.destroy();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      delete view['ResizeObserver'];
    }
  });
});

describe('TxOrgChart parts', () => {
  it('draws arcs that turn left as well as right', () => {
    expect(
      orgChartPathLine(
        [
          { x: 200, y: 0, width: 100, height: 40 },
          { x: 0, y: 100, width: 60, height: 40 },
        ],
        20,
        6,
      ),
    ).toBe('M 250 40 V 74 A 6 6 0 0 1 244 80 H 36 A 6 6 0 0 0 30 86 V 100');
    expect(orgChartReveal(TREE, ['ceo'])).toEqual(TREE);
    expect(orgChartReveal(TREE, ['ceo'])).not.toBe(TREE);
  });

  it('labels the card toggle from the translations without own labels', () => {
    const fixture = TestBed.createComponent(TxOrgChartCard);
    fixture.componentRef.setInput('node', leaf('a', { collapsible: true, expanded: true, loading: true }));
    fixture.detectChanges();
    const toggle = fixture.nativeElement.querySelector('.tx-org-chart-card__toggle') as HTMLElement;
    expect(toggle.getAttribute('aria-label')).toBe('Collapse');
    expect(fixture.nativeElement.querySelector('.tx-org-chart-card__box--open')).not.toBeNull();
    fixture.componentRef.setInput('node', leaf('a', { collapsible: true }));
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Expand');
    fixture.componentRef.setInput('expandLabel', 'Open');
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Open');
  });

  it('measures a toolbar that is not inside a bar', () => {
    const fixture = TestBed.createComponent(TxOrgChartToolbar);
    fixture.componentRef.setInput('state', { zoomPercent: 100, canZoomIn: true, canZoomOut: true, hasQuery: true, matchCount: 0, isFullscreen: true, hasContent: true, allExpanded: false, noneExpanded: false });
    fixture.componentRef.setInput('labels', LABELS);
    fixture.detectChanges();
    fixture.componentInstance.measure();
    expect(fixture.componentInstance.narrow()).toBe(true);
    expect(fixture.nativeElement.querySelector('tx-pill')?.textContent?.trim()).toBe('None');
    expect(fixture.nativeElement.querySelector('.tx-org-chart__fullscreen')?.getAttribute('aria-label')).toBe('Exit');
  });

  it('moves the main view from the minimap with a pointer', () => {
    const fixture = TestBed.createComponent(TxOrgChartMinimap);
    fixture.componentRef.setInput('layout', { width: 1200, height: 340, items: [] });
    fixture.componentRef.setInput('viewport', { width: 900, height: 600 });
    fixture.componentRef.setInput('view', { x: 0, y: 0, zoom: 1 });
    fixture.detectChanges();
    const points: { x: number; y: number }[] = [];
    fixture.componentInstance.navigate.subscribe((point) => points.push(point));
    const map = fixture.nativeElement.querySelector('.tx-org-chart__map') as HTMLElement;
    const send = (type: string, pointerId: number, clientX: number) => map.dispatchEvent(Object.assign(new MouseEvent(type, { clientX, clientY: 0 }), { pointerId }));
    send('pointermove', 1, 10);
    send('pointerdown', 1, 20);
    send('pointermove', 2, 30);
    send('pointermove', 1, 40);
    send('pointerup', 2, 40);
    send('pointercancel', 1, 40);
    send('pointermove', 1, 60);
    send('pointerup', 1, 60);
    expect(points.map((point) => point.x)).toEqual([100, 200]);
    expect(points[0].y).toBe(0);
  });
});

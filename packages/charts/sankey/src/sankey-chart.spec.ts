import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TxAnnouncer } from '@tectra-ng/core/a11y';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSankeyChart } from './sankey-chart.component';
import { TxSankeyLink, TxSankeyLinkEvent, TxSankeyNode, TxSankeyNodeEvent } from './sankey-chart.types';
import { sankeyLinkY } from './sankey-layout';

@Component({
  imports: [TxSankeyChart],
  template: `
    <tx-sankey-chart
      id="main"
      [nodes]="[{ id: 'ads', label: 'Ads', color: 'red' }]"
      [links]="links"
      [pt]="{ node: { class: 'own-node' } }"
      (nodeClick)="nodes.push($event)"
      (linkClick)="flows.push($event)"
    />
    <tx-sankey-chart id="empty" [links]="[]" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly links: TxSankeyLink[] = [
    { source: 'ads', target: 'site', value: 60 },
    { source: 'search', target: 'site', value: 40 },
    { source: 'site', target: 'signup', value: 30 },
    { source: 'site', target: 'left', value: 70 },
  ];
  readonly nodes: TxSankeyNodeEvent[] = [];
  readonly flows: TxSankeyLinkEvent[] = [];
}

describe('TxSankeyChart', () => {
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

  it('draws nodes, weighted links and labels with values', () => {
    expect(all('#main .tx-sankey-chart__node')).toHaveLength(5);
    expect(el('#main .tx-sankey-chart__node').classList).toContain('own-node');
    expect(el('#main [data-node="ads"]').style.fill).toBe('red');
    const links = all('#main .tx-sankey-chart__link');
    expect(links).toHaveLength(4);
    const thickness = (key: string) => {
      const numbers = (el(`#main [data-link="${key}"]`).getAttribute('d') ?? '').match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
      return numbers[numbers.length - 1] - numbers[1];
    };
    expect(thickness('ads>site') / thickness('search>site')).toBeCloseTo(1.5, 1);
    expect(el('#main [data-link="ads>site"]').style.getPropertyValue('--tx-sankey-chart-color')).toBe('red');
    expect(all('#main .tx-sankey-chart__label').map((label) => label.textContent?.replace(/\s+/g, ' ').trim())).toContain('Ads 60');
    expect(plot().getAttribute('aria-label')).toBe('Sankey diagram, 4 flows');
  });

  it('walks the nodes with the keyboard and lights their links', async () => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    await fixture.whenStable();
    expect(el('#main').classList).toContain('tx-sankey-chart--active');
    expect(all('#main .tx-sankey-chart__link--lit')).toHaveLength(4);
    const panel = document.querySelector('.tx-chart-frame__tooltip') as HTMLElement;
    expect(panel.textContent).toContain('site');
    expect(panel.textContent).toContain('In');
    expect(panel.textContent).toContain('100');
    expect(all('#main .tx-sankey-chart__node--dimmed')).toHaveLength(0);
  });

  it('reports a click on a node and on a link', () => {
    const node = el('#main [data-node="site"]');
    plot().dispatchEvent(new MouseEvent('click', { clientX: Number(node.getAttribute('x')) + 2, clientY: Number(node.getAttribute('y')) + 2, bubbles: true }));
    expect(fixture.componentInstance.nodes[0]).toEqual({ id: 'site', label: 'site', incoming: 100, outgoing: 100 });
    const ads = el('#main [data-node="ads"]');
    const site = el('#main [data-node="site"]');
    const x = (Number(ads.getAttribute('x')) + Number(ads.getAttribute('width')) + Number(site.getAttribute('x'))) / 2;
    const y = (Number(ads.getAttribute('y')) + Number(ads.getAttribute('height')) / 2 + Number(site.getAttribute('y')) + 30) / 2;
    plot().dispatchEvent(new MouseEvent('click', { clientX: x, clientY: y, bubbles: true }));
    expect(fixture.componentInstance.flows[0]).toEqual({ source: 'ads', target: 'site', value: 60 });
  });

  it('shows "No data" without links', () => {
    expect(el('#empty .tx-chart-frame__empty')).not.toBeNull();
  });
});

@Component({
  imports: [TxSankeyChart],
  template: `
    <tx-sankey-chart
      style="--tx-chart-sankey-node-width: 20"
      [nodes]="nodes()"
      [links]="links()"
      [showValues]="showValues()"
      [ariaLabel]="label()"
      (linkClick)="flows.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class InteractiveHost {
  readonly nodes = signal<TxSankeyNode[] | null>(null);
  readonly links = signal<TxSankeyLink[] | null>([
    { source: 'ads', target: 'site', value: 60 },
    { source: 'search', target: 'site', value: 40 },
    { source: 'site', target: 'signup', value: 30 },
    { source: 'site', target: 'left', value: 70 },
  ]);
  readonly showValues = signal(true);
  readonly label = signal('');
  readonly flows: TxSankeyLinkEvent[] = [];
}

describe('TxSankeyChart interaction', () => {
  let fixture: ComponentFixture<InteractiveHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const all = (selector: string) => Array.from(fixture.nativeElement.querySelectorAll(selector)) as HTMLElement[];
  const host = () => fixture.componentInstance;
  const chart = () => fixture.debugElement.query(By.directive(TxSankeyChart)).componentInstance as TxSankeyChart;
  const plot = () => el('.tx-chart-frame__plot');
  const key = async (name: string) => {
    plot().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    await fixture.whenStable();
  };
  const pointer = async (type: string, clientX: number, clientY: number) => {
    plot().dispatchEvent(new MouseEvent(type, { clientX, clientY, bubbles: true }));
    await fixture.whenStable();
  };
  const onLink = (index: number) => {
    const link = chart().layout().links[index];
    const x0 = link.source.x + link.source.width;
    const x = (x0 + link.target.x) / 2;
    return [x, sankeyLinkY(x0, link.y0, link.target.x, link.y1, x)] as const;
  };
  const activeNode = () => {
    const active = chart().active();
    return active?.kind === 'node' ? chart().layout().nodes[active.index].id : null;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(InteractiveHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((container) => (container.innerHTML = '')));

  it('reads the node width from its token', () => {
    expect(chart().geometry().nodeWidth).toBe(20);
    expect(el('.tx-sankey-chart__node').getAttribute('width')).toBe('20');
  });

  it('lights a hovered link and its two nodes and shows its share', async () => {
    const index = chart().layout().links.findIndex((link) => link.source.id === 'site' && link.target.id === 'left');
    await pointer('pointermove', ...onLink(index));
    expect(chart().active()).toEqual({ kind: 'link', index });
    expect(all('.tx-sankey-chart__link--lit').map((link) => link.dataset['link'])).toEqual(['site>left']);
    expect(all('.tx-sankey-chart__node--dimmed').map((node) => node.dataset['node']).sort()).toEqual(['ads', 'search', 'signup']);
    expect(chart().tooltip()).toMatchObject({ title: 'site → left', rows: [{ label: 'Value', value: '70', share: '70%' }] });
    await pointer('click', ...onLink(index));
    expect(host().flows).toEqual([{ source: 'site', target: 'left', value: 70 }]);
    await pointer('click', chart().size().width / 2, chart().size().height + 100);
    expect(chart().active()).toBeNull();
    expect(host().flows).toHaveLength(1);
    await pointer('pointermove', ...onLink(index));
    plot().dispatchEvent(new MouseEvent('pointerleave'));
    await fixture.whenStable();
    expect(chart().active()).toBeNull();
  });

  it('forgets a hovered link that is gone after new data', async () => {
    await pointer('pointermove', ...onLink(3));
    host().links.set([{ source: 'ads', target: 'site', value: 60 }]);
    await fixture.whenStable();
    expect(chart().tooltip()).toBeNull();
    expect(all('.tx-sankey-chart__link')).toHaveLength(1);
    expect(all('.tx-sankey-chart__node--dimmed')).toHaveLength(0);
  });

  it('walks the nodes in column order from either end and announces their flows', async () => {
    const announce = vi.spyOn(TestBed.inject(TxAnnouncer), 'announce');
    await key('ArrowLeft');
    const last = activeNode();
    expect(chart().layout().nodes.find((node) => node.id === last)?.depth).toBe(2);
    expect(announce).toHaveBeenLastCalledWith(`${last}: In ${last === 'left' ? 70 : 30}`);
    expect(chart().tooltip()?.rows.map((row) => row.label)).toEqual(['In']);
    await key('Home');
    expect(['ads', 'search']).toContain(activeNode());
    expect(chart().tooltip()?.rows.map((row) => [row.label, row.color === 'transparent'])).toEqual([['Out', false]]);
    await key('ArrowDown');
    await key('ArrowDown');
    expect(activeNode()).toBe('site');
    expect(chart().tooltip()?.rows.map((row) => [row.label, row.color === 'transparent'])).toEqual([
      ['In', false],
      ['Out', true],
    ]);
    await key('End');
    expect(activeNode()).toBe(last);
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(activeNode()).toBe(last);
    await key('Escape');
    expect(chart().active()).toBeNull();
    await pointer('pointermove', ...onLink(0));
    await key('ArrowRight');
    expect(['ads', 'search']).toContain(activeNode());
    host().links.set([{ source: 'ads', target: 'site', value: 60 }]);
    await fixture.whenStable();
    chart().active.set({ kind: 'node', index: 9 });
    expect(chart().tooltip()).toBeNull();
  });

  it('hides values, drops what does not fit, labels the summary and goes empty', async () => {
    host().nodes.set([{ id: 'site', label: 'A site with a name far too long to fit next to its node in the box' }]);
    host().label.set('Funnel');
    await fixture.whenStable();
    const site = all('.tx-sankey-chart__label').find((label) => label.textContent?.includes('far too long')) as HTMLElement;
    expect(site.querySelector('.tx-sankey-chart__value')).toBeNull();
    expect(plot().getAttribute('aria-label')).toBe('Funnel. Sankey diagram, 4 flows');
    host().showValues.set(false);
    await fixture.whenStable();
    expect(all('.tx-sankey-chart__value')).toHaveLength(0);
    host().links.set(null);
    host().nodes.set(null);
    await fixture.whenStable();
    expect(el('.tx-chart-frame__empty')).not.toBeNull();
    chart().onNavigate(new KeyboardEvent('keydown', { key: 'Home' }));
    expect(chart().active()).toBeNull();
  });
});

describe('TxSankeyChart recompiled by TestBed', () => {
  it('still renders its nodes when a test overrides the component', async () => {
    TestBed.overrideComponent(TxSankeyChart, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelectorAll('#main .tx-sankey-chart__node').length).toBeGreaterThan(0);
  });
});

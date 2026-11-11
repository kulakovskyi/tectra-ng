import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxSankeyChart } from './sankey-chart.component';
import { TxSankeyLink, TxSankeyLinkEvent, TxSankeyNodeEvent } from './sankey-chart.types';

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

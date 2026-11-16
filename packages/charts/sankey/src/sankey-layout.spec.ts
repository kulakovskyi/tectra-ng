import { sankeyLabels, sankeyLayout, sankeyLinkPath, sankeyLinkY, sankeyRibbonPath } from './sankey-layout';
import { TxSankeyLayoutNode } from './sankey-chart.types';

const links = [
  { source: 'Ads', target: 'Site', value: 60 },
  { source: 'Search', target: 'Site', value: 40 },
  { source: 'Site', target: 'Sign-up', value: 30 },
  { source: 'Site', target: 'Left', value: 70 },
  { source: 'Sign-up', target: 'Paid', value: 12 },
];

describe('sankey layout', () => {
  const layout = sankeyLayout([{ id: 'Ads', label: 'Paid ads' }], links, { width: 400, height: 200, nodeWidth: 10, nodePadding: 10 });
  const node = (id: string) => layout.nodes.find((item) => item.id === id) ?? fail(id);

  it('puts nodes in columns by their longest path and sinks in the last column', () => {
    expect(layout.columns).toBe(4);
    expect(['Ads', 'Search', 'Site', 'Sign-up', 'Left', 'Paid'].map((id) => node(id).depth)).toEqual([0, 0, 1, 2, 3, 3]);
    expect(node('Ads').label).toBe('Paid ads');
    expect(node('Site').x).toBe(130);
    expect(node('Paid').x).toBe(390);
  });

  it('sizes nodes by the larger of their in and out flow and keeps them inside', () => {
    expect(node('Site').value).toBe(100);
    expect(node('Site').incoming).toBe(100);
    expect(node('Sign-up').outgoing).toBe(12);
    expect(node('Site').height).toBeCloseTo(190, 0);
    for (const item of layout.nodes) {
      expect(item.y).toBeGreaterThanOrEqual(0);
      expect(item.y + item.height).toBeLessThanOrEqual(200.5);
    }
    expect(node('Ads').height / node('Search').height).toBeCloseTo(1.5, 1);
  });

  it('stacks the links on their nodes without gaps', () => {
    const fromSite = layout.links.filter((link) => link.source.id === 'Site');
    const total = fromSite.reduce((sum, link) => sum + link.width, 0);
    expect(total).toBeCloseTo(node('Site').height, 0);
    const top = Math.min(...fromSite.map((link) => link.y0 - link.width / 2));
    expect(top).toBeCloseTo(node('Site').y, 0);
  });

  it('ignores self links, zero values and cycles', () => {
    const cyclic = sankeyLayout([], [{ source: 'A', target: 'B', value: 5 }, { source: 'B', target: 'A', value: 2 }, { source: 'A', target: 'A', value: 3 }, { source: 'B', target: 'C', value: 0 }], { width: 100, height: 100, nodeWidth: 8, nodePadding: 8 });
    expect(cyclic.links.map((link) => link.key)).toEqual(['A>B']);
  });

  it('draws a smooth horizontal curve and finds its height at any x', () => {
    expect(sankeyLinkPath(0, 10, 100, 50)).toBe('M0,10C50,10 50,50 100,50');
    expect(sankeyRibbonPath(0, 10, 100, 50, 4)).toBe('M0,8C50,8 50,48 100,48L100,52C50,52 50,12 0,12Z');
    expect(sankeyLinkY(0, 10, 100, 50, 50)).toBeCloseTo(30, 3);
    expect(sankeyLinkY(0, 10, 100, 50, -5)).toBe(10);
  });

  it('never lets nodes of one column overlap or leave the box', () => {
    const budget = sankeyLayout(
      [],
      [
        { source: 'Budget', target: 'Engineering', value: 4_200_000 },
        { source: 'Budget', target: 'Sales', value: 1_900_000 },
        { source: 'Budget', target: 'Operations', value: 1_100_000 },
        { source: 'Engineering', target: 'Salaries', value: 3_300_000 },
        { source: 'Engineering', target: 'Cloud', value: 900_000 },
        { source: 'Sales', target: 'Salaries', value: 1_200_000 },
        { source: 'Sales', target: 'Events', value: 700_000 },
        { source: 'Operations', target: 'Office', value: 650_000 },
        { source: 'Operations', target: 'Salaries', value: 450_000 },
      ],
      { width: 600, height: 300, nodeWidth: 12, nodePadding: 14 },
    );
    for (let column = 0; column < budget.columns; column++) {
      const nodes = budget.nodes.filter((item) => item.depth === column).sort((a, b) => a.y - b.y);
      nodes.forEach((item, index) => {
        expect(item.y).toBeGreaterThanOrEqual(-0.01);
        expect(item.y + item.height).toBeLessThanOrEqual(300.01);
        if (index) expect(item.y).toBeGreaterThanOrEqual(nodes[index - 1].y + nodes[index - 1].height + 13.99);
      });
    }
    for (const link of budget.links) {
      expect(link.y0 - link.width / 2).toBeGreaterThanOrEqual(link.source.y - 0.01);
      expect(link.y0 + link.width / 2).toBeLessThanOrEqual(link.source.y + link.source.height + 0.01);
      expect(link.y1 - link.width / 2).toBeGreaterThanOrEqual(link.target.y - 0.01);
      expect(link.y1 + link.width / 2).toBeLessThanOrEqual(link.target.y + link.target.height + 0.01);
    }
  });

  it('keeps early sinks in their column when aligned left and clamps the curve past its end', () => {
    const left = sankeyLayout([], [
      { source: 'A', target: 'B', value: 5 },
      { source: 'A', target: 'C', value: 5 },
      { source: 'C', target: 'D', value: 5 },
    ], { width: 300, height: 100, nodeWidth: 10, nodePadding: 10, align: 'left' });
    expect(left.nodes.map((item) => [item.id, item.depth])).toEqual([
      ['A', 0],
      ['B', 1],
      ['C', 1],
      ['D', 2],
    ]);
    expect(sankeyLinkY(0, 0, 10, 5, 20)).toBe(5);
  });
});

function fail(name: string): never {
  throw new Error(`missing ${name}`);
}

describe('sankey labels', () => {
  const node = (id: string, depth: number, x: number, y: number, height = 20): TxSankeyLayoutNode => ({
    id,
    index: 0,
    label: id,
    color: 'red',
    depth,
    value: 1,
    incoming: 0,
    outgoing: 0,
    x,
    y,
    width: 10,
    height,
  });
  const options = { width: 390, labelGap: 8, fontSize: 12 };

  it('puts the last column on the left of its nodes and the others on the right', () => {
    const labels = sankeyLabels([node('Ads', 0, 0, 0), node('Paid', 1, 380, 0)], { ...options, values: ['10', '10'] });
    expect(labels.map((label) => [label.anchor, label.x, label.value])).toEqual([
      ['start', 18, '10'],
      ['end', 372, '10'],
    ]);
  });

  it('moves a middle label that would run into the last column to the free side', () => {
    const nodes = [node('Leads', 0, 0, 0, 200), node('Discovery', 1, 145, 100), node('Lost', 2, 290, 100)];
    const labels = sankeyLabels(nodes, { ...options, width: 300, values: ['300', '148', '160'] });
    expect(labels[2]).toMatchObject({ anchor: 'end', label: 'Lost', value: '160' });
    expect(labels[1]).toMatchObject({ anchor: 'end', x: 137, label: 'Discovery', value: '148' });
    expect(labels[0].label).toBe('');
  });

  it('drops the value, then shortens the name, then hides a label without room', () => {
    const wide = sankeyLabels([node('Organic search', 0, 0, 0), node('Signed up', 1, 190, 0)], { ...options, width: 200, values: ['1,000', ''] });
    expect(wide[0]).toMatchObject({ label: 'Organic search', value: '' });
    const narrow = sankeyLabels([node('Organic search', 0, 0, 0), node('Signed up', 1, 150, 0)], { ...options, width: 160, values: ['1,000', ''] });
    expect(narrow[0].label.endsWith('…')).toBe(true);
    expect(narrow[1]).toMatchObject({ anchor: 'end', label: 'Signed up' });
    const tight = sankeyLabels([node('Organic search', 0, 0, 0), node('Signed up', 1, 40, 0)], { ...options, width: 50, values: ['', ''] });
    expect(tight.map((label) => label.label)).toEqual(['', '']);
  });
});

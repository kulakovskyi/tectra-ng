import { encodeQr } from './encoder';
import { qrLayout } from './layout';
import { qrToSvg } from './svg';

describe('qrToSvg', () => {
  it('builds a standalone SVG with the quiet zone and colours', () => {
    const size = encodeQr('https://example.com').size;
    const svg = qrToSvg('https://example.com', { size: 256, margin: 2, color: '#1d4ed8', background: '#fef3c7', title: 'Site "link"' });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"')).toBe(true);
    expect(svg).toContain(`viewBox="-2 -2 ${size + 4} ${size + 4}"`);
    expect(svg).toContain('fill="#fef3c7"');
    expect(svg).toContain('fill="#1d4ed8"');
    expect(svg).toContain('<title>Site &quot;link&quot;</title>');
    expect(svg).toContain('shape-rendering="crispEdges"');
  });

  it('adds a gradient, eye colours and a logo with level H', () => {
    const svg = qrToSvg('https://example.com', {
      dotStyle: 'dots',
      gradient: { type: 'radial', colors: ['#000000', '#7c3aed'] },
      eyeColor: '#dc2626',
      logo: '/logo.svg?a=1&b=2',
    });
    const id = /<radialGradient id="([^"]+)"/.exec(svg)?.[1];
    expect(id).toBeTruthy();
    expect(svg).toContain(`fill="url(#${id})"`);
    expect(svg).toContain('fill="#dc2626"');
    expect(svg).toContain('href="/logo.svg?a=1&amp;b=2"');
    expect(svg).not.toContain('crispEdges');
    expect(qrLayout('https://example.com', { logo: '/logo.svg' }).matrix.errorCorrection).toBe('H');
  });
});

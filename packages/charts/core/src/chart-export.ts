import { TxChartLegendItem, TxChartTable } from './chart.types';
import { textWidth } from './format';

/** File format of a chart export. */
export type TxChartExportFormat = 'svg' | 'png' | 'csv';

/** Options of the exported SVG. */
export interface TxChartSvgOptions {
  /** Legend items drawn above the chart; hidden items are left out. */
  legend?: readonly TxChartLegendItem[];
  /** Background colour of the image; transparent when not set. */
  background?: string;
  /** Colour of the legend text (default `currentColor`). */
  textColor?: string;
  /** Font family of the image (default `sans-serif`). */
  fontFamily?: string;
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const BOM = String.fromCharCode(0xfeff);
const LEGEND_ROW = 28;
const LEGEND_FONT = 12;
const SKIPPED_VALUES = new Set(['none', 'normal', 'auto']);
const STYLE_PROPERTIES = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'stroke-linejoin',
  'stop-color',
  'stop-opacity',
  'opacity',
  'visibility',
  'display',
  'transform',
  'transform-origin',
  'transform-box',
  'filter',
  'font-family',
  'font-size',
  'font-weight',
  'letter-spacing',
  'text-anchor',
  'dominant-baseline',
  'r',
  'rx',
  'ry',
];

function escapeCsv(value: string): string {
  return /[",\n\r]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

/**
 * CSV text of a chart table with a byte order mark, so spreadsheets read it as UTF-8; `categoryLabel`
 * heads the first column.
 */
export function chartCsv(table: TxChartTable, categoryLabel = ''): string {
  const rows = [[categoryLabel, ...table.columns.map((column) => column.label)], ...table.rows.map((row) => [row.label, ...row.cells])];
  return `${BOM}${rows.map((row) => row.map((cell) => escapeCsv(cell ?? '')).join(',')).join('\r\n')}`;
}

/**
 * File name for an export: the chart name as a safe slug (up to 60 characters) with the format as
 * extension.
 */
export function chartFileName(name: string, format: TxChartExportFormat): string {
  const base =
    name
      .normalize('NFKD')
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'chart';
  return `${base}.${format}`;
}

function inlineStyles(source: Element, target: Element, view: Window): void {
  const sources = [source, ...source.querySelectorAll('*')];
  const targets = [target, ...target.querySelectorAll('*')];
  sources.forEach((element, index) => {
    const clone = targets[index];
    if (!clone) return;
    if (element.localName === 'foreignObject') {
      clone.remove();
      return;
    }
    const computed = view.getComputedStyle(element);
    const declarations = STYLE_PROPERTIES.flatMap((property) => {
      const value = computed.getPropertyValue(property).trim();
      const kept = property === 'fill' || property === 'stroke' || (!!value && !SKIPPED_VALUES.has(value));
      return kept ? [`${property}:${value || 'none'}`] : [];
    });
    clone.removeAttribute('class');
    clone.setAttribute('style', declarations.join(';'));
  });
}

/** Standalone SVG markup of a chart with computed styles inlined and the legend drawn above it. */
export function chartSvgString(svg: SVGSVGElement, options: TxChartSvgOptions = {}): string {
  const document = svg.ownerDocument;
  const view = document.defaultView;
  const [, , width, height] = (svg.getAttribute('viewBox') ?? '0 0 0 0').split(/\s+/).map(Number);
  const legend = (options.legend ?? []).filter((item) => !item.hidden);
  const top = legend.length ? LEGEND_ROW : 0;
  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (view) {
    inlineStyles(svg, clone, view);
  }
  const root = document.createElementNS(SVG_NS, 'svg');
  root.setAttribute('xmlns', SVG_NS);
  root.setAttribute('width', String(width));
  root.setAttribute('height', String(height + top));
  root.setAttribute('viewBox', `0 0 ${width} ${height + top}`);
  root.setAttribute('font-family', options.fontFamily ?? 'sans-serif');
  if (options.background) {
    const background = document.createElementNS(SVG_NS, 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', options.background);
    root.appendChild(background);
  }
  let x = 0;
  for (const item of legend) {
    const marker = document.createElementNS(SVG_NS, 'circle');
    marker.setAttribute('cx', String(x + 5));
    marker.setAttribute('cy', String(LEGEND_ROW / 2));
    marker.setAttribute('r', '4');
    marker.setAttribute('fill', item.color);
    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('x', String(x + 14));
    label.setAttribute('y', String(LEGEND_ROW / 2));
    label.setAttribute('dominant-baseline', 'central');
    label.setAttribute('font-size', String(LEGEND_FONT));
    label.setAttribute('fill', options.textColor ?? 'currentColor');
    label.textContent = item.label;
    root.appendChild(marker);
    root.appendChild(label);
    x += 14 + textWidth(item.label, LEGEND_FONT) + 16;
  }
  const chart = document.createElementNS(SVG_NS, 'g');
  chart.setAttribute('transform', `translate(0 ${top})`);
  while (clone.firstChild) {
    chart.appendChild(clone.firstChild);
  }
  root.appendChild(chart);
  const Serializer = (view as (Window & { XMLSerializer?: typeof XMLSerializer }) | null)?.XMLSerializer;
  return Serializer ? new Serializer().serializeToString(root) : root.outerHTML;
}

/** Width and height read from the `viewBox` of exported SVG markup. */
export function chartSvgSize(markup: string): { width: number; height: number } {
  const match = /viewBox="0 0 ([\d.]+) ([\d.]+)"/.exec(markup);
  return { width: Number(match?.[1] ?? 0), height: Number(match?.[2] ?? 0) };
}

/** Renders exported SVG markup to a PNG blob; `scale` is the pixel ratio (default 2). */
export function chartPngBlob(document: Document, markup: string, scale = 2): Promise<Blob> {
  const view = document.defaultView;
  const { width, height } = chartSvgSize(markup);
  return new Promise((resolve, reject) => {
    if (!view) {
      reject(new Error('no window'));
      return;
    }
    const image = new view.Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('no canvas'));
        return;
      }
      context.scale(scale, scale);
      context.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('no blob'))), 'image/png');
    };
    image.onerror = () => reject(new Error('image'));
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(markup)}`;
  });
}

/** Saves a blob as a file through a temporary download link. */
export function downloadChartFile(document: Document, data: Blob, filename: string): void {
  const view = document.defaultView;
  if (!view) return;
  const url = view.URL.createObjectURL(data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.rel = 'noopener';
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  link.remove();
  view.setTimeout(() => view.URL.revokeObjectURL(url), 1000);
}

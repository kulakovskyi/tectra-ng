import { TestBed } from '@angular/core/testing';
import { TX_EXPORT_FONT } from '@tectra-ng/ui/export-font';
import { TxExportService, provideTxExport } from './export.service';
import { TxExportFont, TxExportHtmlPdfOptions } from './export.types';
import { base64ToBytes } from './writers/bytes';
import { HtmlElement, decodeEntities, parseHtml, readDom } from './writers/html-parse';
import { writeHtmlPdf } from './writers/html-pdf';
import { parseTrueType } from './writers/truetype';

const FONT: TxExportFont = { regular: TX_EXPORT_FONT.regular, bold: TX_EXPORT_FONT.bold };
const loadFont = () => Promise.resolve(FONT);

function readBlob(blob: Blob): Promise<Uint8Array> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
    reader.readAsArrayBuffer(blob);
  });
}

function latin1(bytes: Uint8Array): string {
  let text = '';
  for (const byte of bytes) text += String.fromCharCode(byte);
  return text;
}

const glyphs = new Map<number, string>();
for (const source of [TX_EXPORT_FONT.regular, TX_EXPORT_FONT.bold]) {
  const font = parseTrueType(base64ToBytes(source));
  for (let code = 32; code < 0x500; code++) {
    const glyph = font.glyphId(code);
    if (glyph && !glyphs.has(glyph)) glyphs.set(glyph, String.fromCodePoint(code));
  }
  for (const char of '•–—“”«»…→✓№') glyphs.set(font.glyphId(char.codePointAt(0) as number), char);
}

function decode(hex: string): string {
  let text = '';
  for (let index = 0; index < hex.length; index += 4) text += glyphs.get(parseInt(hex.slice(index, index + 4), 16)) ?? '?';
  return text;
}

interface Pdf {
  raw: string;
  pages: string[];
  texts: string[];
  count: number;
}

async function render(source: string | Node, options: TxExportHtmlPdfOptions = {}): Promise<Pdf> {
  const raw = latin1(await readBlob(await writeHtmlPdf(source, { compress: false, pageNumbers: false, font: loadFont, ...options }, new Date(2026, 0, 2))));
  const pages = [...raw.matchAll(/stream\n([\s\S]*?)\nendstream/g)].map((match) => match[1]).filter((stream) => /\bBT\b/.test(stream));
  const texts = [...raw.matchAll(/<([0-9a-f]+)> Tj/g)].map((match) => decode(match[1]));
  return { raw, pages, texts, count: Number(/\/Count (\d+)/.exec(raw)?.[1]) };
}

const tagsOf = (element: HtmlElement): unknown => ({ tag: element.tag, children: element.children.map((child) => (typeof child === 'string' ? child : tagsOf(child))) });

describe('html parser', () => {
  it('reads tags, attributes, text and entities without a DOM', () => {
    const root = parseHtml('<p class=lead data-x="a &amp; b" hidden title=\'q\'>Fish &amp; chips &#x41;&#66; &copy; &unknown; &#0;</p>');
    const p = root.children[0] as HtmlElement;
    expect(p.attrs).toEqual({ class: 'lead', 'data-x': 'a & b', hidden: '', title: 'q' });
    expect(p.children).toEqual(['Fish & chips AB © &unknown; &#0;']);
    expect(decodeEntities('&NBSP;&hellip;&#8212;')).toBe(' …—');
  });

  it('closes paragraphs, list items and cells the way browsers do', () => {
    const root = parseHtml('<p>one<p>two<div>x</div><ul><li>a<li>b<ul><li>c</ul></ul><table><tr><td>1<td>2<tr><th>3</table><dl><dt>t<dd>d</dl>');
    expect(root.children.map((child) => tagsOf(child as HtmlElement))).toEqual([
      { tag: 'p', children: ['one'] },
      { tag: 'p', children: ['two'] },
      { tag: 'div', children: ['x'] },
      { tag: 'ul', children: [{ tag: 'li', children: ['a'] }, { tag: 'li', children: ['b', { tag: 'ul', children: [{ tag: 'li', children: ['c'] }] }] }] },
      { tag: 'table', children: [{ tag: 'tr', children: [{ tag: 'td', children: ['1'] }, { tag: 'td', children: ['2'] }] }, { tag: 'tr', children: [{ tag: 'th', children: ['3'] }] }] },
      { tag: 'dl', children: [{ tag: 'dt', children: ['t'] }, { tag: 'dd', children: ['d'] }] },
    ]);
  });

  it('skips comments, doctypes and stray end tags and keeps raw text and loose brackets', () => {
    const root = parseHtml('<!DOCTYPE html><!-- note --><b>a < b</b></i><br/><img src="x.png" alt="A > B"></br><style>p > b { }</style><?xml x?>tail<!-- open');
    expect(root.children.map((child) => (typeof child === 'string' ? child : tagsOf(child)))).toEqual([
      { tag: 'b', children: ['a ', '<', ' b'] },
      { tag: 'br', children: [] },
      { tag: 'img', children: [] },
      { tag: 'br', children: [] },
      { tag: 'style', children: ['p > b { }'] },
      'tail',
    ]);
    expect(parseHtml('<script>if (a < b) {}').children).toEqual([{ tag: 'script', attrs: {}, children: ['if (a < b) {}'] }]);
    expect(parseHtml('<p a="x>y"').children).toEqual([{ tag: 'p', attrs: { a: 'x>y' }, children: [] }]);
  });

  it('reads DOM elements, fragments and documents', () => {
    const element = document.createElement('section');
    element.innerHTML = '<h2 ID="t">Title</h2><!-- c --><p>Body</p>';
    expect(tagsOf(readDom(element))).toEqual({ tag: '#root', children: [{ tag: 'section', children: [{ tag: 'h2', children: ['Title'] }, { tag: 'p', children: ['Body'] }] }] });
    expect(((readDom(element).children[0] as HtmlElement).children[0] as HtmlElement).attrs).toEqual({ id: 't' });
    const fragment = document.createDocumentFragment();
    fragment.appendChild(document.createTextNode('loose'));
    expect(readDom(fragment).children).toEqual(['loose']);
    const doc = document.implementation.createHTMLDocument('x');
    doc.body.innerHTML = '<p>In body</p>';
    expect(tagsOf(readDom(doc))).toEqual({ tag: '#root', children: [{ tag: 'p', children: ['In body'] }] });
    expect(readDom(document.createComment('x')).children).toEqual([]);
    expect(readDom({ nodeType: 9, body: null } as unknown as Node).children).toEqual([]);
  });
});

describe('writeHtmlPdf', () => {
  it('writes headings, paragraphs and inline styles as real text with the bold font', async () => {
    const pdf = await render(
      '<h1>Quarterly report</h1><p>Plain <b>bold</b> <em>italic</em> <strong><i>both</i></strong> <code>npm i</code> <u>under</u> <del>gone</del> x<sup>2</sup> H<sub>2</sub>O <small>tiny</small> <q>quoted</q> <span style="font-weight: 700; font-style: italic; text-decoration: underline line-through">styled</span></p><h6>Small heading</h6>',
      { title: 'Report', author: 'Team' },
    );
    expect(pdf.raw.startsWith('%PDF-1.7')).toBe(true);
    expect(pdf.texts).toContain('Quarterly report');
    expect(pdf.texts).toContain('bold');
    expect(pdf.texts).toContain('npm i');
    expect(pdf.texts.join('')).toContain('“quoted”');
    expect(pdf.raw).toContain('/F2 20 Tf');
    expect(pdf.raw).toContain('/F2 9 Tf');
    expect(pdf.raw).toContain('/BaseFont /TXBOLD+Onest-SemiBold');
    expect(pdf.raw).toMatch(/1 0 0\.2 1 [\d.]+ [\d.]+ Tm <[0-9a-f]+> Tj/);
    expect(pdf.raw).toContain('/F1 9 Tf');
    expect(pdf.raw).toContain('/F1 7.5 Tf');
    expect(pdf.raw).toContain('/F1 8.5 Tf');
    expect(pdf.raw).toContain('0.949 0.957 0.969 rg');
    expect((pdf.raw.match(/ w [\d.]+ [\d.]+ m [\d.]+ [\d.]+ l S/g) ?? []).length).toBeGreaterThanOrEqual(4);
    expect(pdf.raw).toContain('/Title <FEFF005200650070006f00720074>');
    expect(pdf.raw).toContain('/Author <FEFF005400650061006d>');
    expect(pdf.raw).toContain('/MediaBox [0 0 595.28 841.89]');
    expect(pdf.count).toBe(1);
  });

  it('keeps Cyrillic text, collapses spaces and breaks lines with <br>', async () => {
    const pdf = await render('<p>  Звіт   за\n квартал<br>Друга&nbsp;лінія<br></p>');
    expect(pdf.texts).toHaveLength(2);
    expect(pdf.texts[0]).toBe('Звіт за квартал');
    expect(pdf.texts[1]).toMatch(/^Друга.лінія$/);
  });

  it('wraps long paragraphs by the font metrics and breaks words that do not fit', async () => {
    const words = Array.from({ length: 80 }, (_, index) => `word${index}`).join(' ');
    const pdf = await render(`<p>${words}</p><p>${'x'.repeat(400)}</p>`, { pageSize: [300, 400], margin: 20 });
    expect(pdf.texts.length).toBeGreaterThan(8);
    expect(pdf.texts.join(' ')).toContain('word0 word1');
    expect(pdf.texts.filter((line) => /^x+$/.test(line)).length).toBeGreaterThan(2);
  });

  it('draws nested lists with markers and numbers from start', async () => {
    const pdf = await render('<ul><li>One<ul><li>Inner<ul><li>Deep</li></ul></li></ul></li><li><p>Para item</p></li><li></li><p>stray</p></ul><ol start="3"><li>Third</li><li>Fourth</li></ol><li>Orphan</li>');
    expect(pdf.texts).toEqual(expect.arrayContaining(['One', 'Inner', 'Deep', 'Para item', 'stray', '3.', 'Third', '4.', 'Fourth', 'Orphan']));
    expect(pdf.raw).toMatch(/ c f\n/);
    expect(pdf.raw).toMatch(/ c S\n/);
    expect(pdf.raw).toMatch(/ re f\n/);
  });

  it('draws quotes with a bar, rules, code blocks and links', async () => {
    const pdf = await render(
      '<blockquote><p>Quoted one</p><p>Quoted two</p></blockquote><hr><pre><code>\nfunction add(a, b) {\n\treturn a + b;\n}\n</code></pre><p><a href="https://example.com/a b?x=(1)">Docs</a> <a href="#local">Local</a> <a href="javascript:void(0)">Script</a></p>',
      { linkColor: '#ff0000' },
    );
    expect(pdf.texts).toContain('Quoted one');
    expect(pdf.texts).toContain('function add(a, b) {');
    expect(pdf.texts).toContain('    return a + b;');
    expect(pdf.raw).toMatch(/[\d.]+ [\d.]+ 3 [\d.]+ re f/);
    expect(pdf.raw).toContain('0.75 w');
    expect(pdf.raw).toContain('/Subtype /Link');
    expect(pdf.raw).toContain('/URI (https://example.com/a%20b?x=\\(1\\))');
    expect((pdf.raw.match(/\/Subtype \/Link/g) ?? []).length).toBe(1);
    expect(pdf.raw).toContain('/Annots [');
    expect(pdf.raw).toContain('1 0 0 rg');
  });

  it('keeps a malformed link address as written', async () => {
    const pdf = await render('<a href="https://example.com/%E0%A4%A">Broken</a>');
    expect(pdf.raw).toContain('/URI (https://example.com/%25E0%25A4%25A)');
  });

  it('writes tables with a header row repeated on every page and splits tall rows', async () => {
    const rows = Array.from({ length: 70 }, (_, index) => `<tr><td>Row ${index}</td><td align="right">${index * 10}</td><td style="text-align: center">ok</td></tr>`).join('');
    const tall = `<tr><td>${Array.from({ length: 120 }, (_, index) => `line${index}`).join('<br>')}</td><td>short</td><td></td></tr>`;
    const pdf = await render(`<table><caption>Totals</caption><thead><tr><th>Name</th><th>Amount</th><th>State</th></tr></thead><tbody>${rows}${tall}</tbody></table>`, { headerBackground: '#eeeeee' });
    expect(pdf.count).toBeGreaterThan(3);
    expect(pdf.pages.length).toBe(pdf.count);
    for (const page of pdf.pages) {
      const texts = [...page.matchAll(/<([0-9a-f]+)> Tj/g)].map((match) => decode(match[1]));
      expect(texts).toContain('Name');
    }
    expect(pdf.texts).toContain('Totals');
    expect(pdf.texts).toContain('line119');
    expect(pdf.raw).toContain('0.933 0.933 0.933 rg');
    expect(pdf.raw).toMatch(/0\.5 w [\d.]+ [\d.]+ [\d.]+ [\d.]+ re S/);
  });

  it('takes the first row of th cells as the header, spans columns and fits wide content', async () => {
    const long = 'Supercalifragilisticexpialidocious '.repeat(6);
    const pdf = await render(
      `<table><tr><th>A</th><th>B</th></tr><tr><td colspan="2">Both columns</td></tr><tr><td>${long}</td><td>${long}</td></tr><tr><td>1<ul><li>listed</li></ul><b>bold</b></td><td><p>a</p><p>b</p></td></tr></table><table></table><table><caption>Empty</caption></table>`,
      { headerBackground: 'none', pageSize: 'a5', orientation: 'landscape' },
    );
    expect(pdf.texts).toContain('Both columns');
    expect(pdf.texts).toContain('• listed');
    expect(pdf.texts).toContain('Empty');
    expect(pdf.raw).not.toContain('0.949 0.957 0.969 rg');
    expect(pdf.raw).toContain('/MediaBox [0 0 595.28 419.53]');
  });

  it('shrinks columns to the page when even the shortest words do not fit', async () => {
    const cells = Array.from({ length: 30 }, () => '<td>Unbreakable</td>').join('');
    const pdf = await render(`<table><tr>${cells}</tr></table>`, { pageSize: [200, 300], margin: 10 });
    expect(pdf.texts.length).toBeGreaterThan(30);
  });

  it('moves a heading to the next page with the text under it and starts pages on breaks', async () => {
    const filler = Array.from({ length: 52 }, (_, index) => `<p style="margin: 0">Filler ${index}</p>`).join('');
    const pdf = await render(`${filler}<h2>Section</h2><p>Body of the section</p><div style="break-before: page">Second</div><p style="page-break-after: always">Third</p><p>Fourth</p>`);
    const pageOf = (text: string) => pdf.pages.findIndex((page) => [...page.matchAll(/<([0-9a-f]+)> Tj/g)].some((match) => decode(match[1]) === text));
    expect(pageOf('Section')).toBe(pageOf('Body of the section'));
    expect(pageOf('Second')).toBe(pageOf('Section') + 1);
    expect(pageOf('Fourth')).toBe(pageOf('Third') + 1);
  });

  it('skips scripts, forms and images but keeps their alt text and figure captions', async () => {
    const pdf = await render('<html><head><title>T</title><style>p{}</style></head><body><script>alert(1)</script><button>Click</button><figure><img src="a.png" alt="Chart of sales"><img src="b.png"><figcaption>Figure 1</figcaption></figure><center>Centered</center><p align="right">Right</p><dl><dt>Term</dt><dd>Meaning</dd></dl></body></html>');
    expect(pdf.texts).toEqual(['Chart of sales', 'Figure 1', 'Centered', 'Right', 'Term', 'Meaning']);
  });

  it('uses own italic and monospaced fonts, page numbers and the default font', async () => {
    const custom = await render('<p><i>slanted</i> <code>mono</code></p><pre>block</pre>', {
      font: () => Promise.resolve({ regular: TX_EXPORT_FONT.regular, italic: TX_EXPORT_FONT.regular, mono: TX_EXPORT_FONT.bold }),
      pageNumbers: true,
      textColor: '#000000',
    });
    expect(custom.raw).toContain('/BaseFont /TXITAL+Onest-Regular');
    expect(custom.raw).toContain('/BaseFont /TXMONO+Onest-SemiBold');
    expect(custom.raw).toContain('/F3 10 Tf');
    expect(custom.raw).toContain('/F4 9 Tf');
    expect(custom.texts).toContain('1 / 1');
    const fake = await render('<p><b>fake bold</b></p>', { font: () => Promise.resolve({ regular: TX_EXPORT_FONT.regular }) });
    expect(fake.raw).toContain('2 Tr');
    const blob = await writeHtmlPdf('<p>x</p>');
    expect(blob.type).toBe('application/pdf');
  });

  it('reads a DOM element', async () => {
    const element = document.createElement('article');
    element.innerHTML = '<h3>From the page</h3><p>Paragraph</p>';
    const pdf = await render(element);
    expect(pdf.texts).toEqual(['From the page', 'Paragraph']);
  });

  it('writes an empty page for empty content', async () => {
    const pdf = await render('   ');
    expect(pdf.count).toBe(1);
  });
});

describe('TxExportService html pdf', () => {
  it('builds and saves the PDF with the pdf defaults of provideTxExport', async () => {
    TestBed.configureTestingModule({ providers: [provideTxExport({ title: 'Default title', filename: 'notes', pdf: { font: loadFont, compress: false, pageNumbers: false } })] });
    const service = TestBed.inject(TxExportService);
    const file = await service.htmlPdfFile('<p>Hello</p>', { pageSize: 'letter' });
    expect(file.filename).toBe('notes.pdf');
    const raw = latin1(await readBlob(file.blob));
    expect(raw).toContain('/MediaBox [0 0 612 792]');
    expect(raw).toContain('/Title <FEFF');
    expect(await service.exportHtmlPdf('<p>Hello</p>', { filename: 'own' })).toBe('own.pdf');
  });

  it('falls back to the default file name', async () => {
    TestBed.configureTestingModule({ providers: [provideTxExport({ pdf: { font: loadFont } })] });
    const service = TestBed.inject(TxExportService);
    expect((await service.htmlPdfFile('<p>Hello</p>')).filename).toBe('ExportedData.pdf');
  });
});

describe('writeHtmlPdf edge cases', () => {
  it('reads every inline tag and alignment', async () => {
    const pdf = await render(
      '<p align="left"><cite>c</cite> <dfn>d</dfn> <var>v</var> <kbd>k</kbd> <samp>s</samp> <tt>t</tt> <ins>i</ins> <s>s</s> <strike>x</strike> <a name="top">anchor</a> <span><script>x</script>kept</span></p><p style="text-align: justify">J</p><p style="text-align: end">E</p><p style="text-align: inherit">I</p>',
    );
    expect(pdf.texts.join('')).toContain('anchor kept');
    expect(pdf.texts).toContain('J');
  });

  it('reads loose markup in lists, tables and code', async () => {
    const pdf = await render(
      '<ul>\n  <li>a</li>\n</ul><pre></pre><table>\n<colgroup><col></colgroup><tr></tr><tbody><tr><td colspan="x">1</td><td><table><tr><td>in</td><td>ner</td></tr></table></td></tr></tbody><tfoot><tr><td>f</td><td>g</td></tr></tfoot></table><table><tr><td><b>1</b><td>2</table>',
    );
    expect(pdf.texts).toEqual(expect.arrayContaining(['a', '1', 'in ner', 'f']));
    expect(parseHtml('<table><tr><td><b>1<td>2</table>').children.length).toBe(1);
  });

  it('starts one page for breaks in a row and at the start', async () => {
    const pdf = await render('<div style="break-before: page"></div><p style="break-after: page">One</p><p style="break-before: page">Two</p>');
    expect(pdf.count).toBe(2);
  });

  it('keeps the header of a table with its first row wherever the table starts', async () => {
    for (let lines = 0; lines < 12; lines++) {
      const filler = '<p>Filler</p>'.repeat(lines);
      const pdf = await render(`${filler}<table><thead><tr><th>Head</th></tr></thead><tbody><tr><td>First</td></tr><tr><td>Second</td></tr></tbody></table>`, { pageSize: [300, 200], margin: 20 });
      const pageOf = (text: string) => pdf.pages.findIndex((page) => [...page.matchAll(/<([0-9a-f]+)> Tj/g)].some((match) => decode(match[1]) === text));
      expect(pageOf('Head')).toBe(pageOf('First'));
    }
  });

  it('places a row that cannot be split even when it is taller than the page', async () => {
    const pdf = await render('<p>Before</p><table><tr><td><span style="font-weight: bold">Big</span></td></tr></table>', { pageSize: [200, 100], orientation: 'landscape', margin: [20, 10, 20, 10], fontSize: 50 });
    expect(pdf.texts).toContain('Big');
  });
});

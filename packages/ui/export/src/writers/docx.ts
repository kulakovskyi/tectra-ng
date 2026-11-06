import { TxExportTable, TxExportWordOptions } from '../export.types';
import { TxExportTextContext, cellText, escapeXml, hexColor } from '../export.utils';
import { columnShares, dateLine, pageGeometry } from './page';
import { zip } from './zip';

const W = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
const R = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const PKG_REL = 'http://schemas.openxmlformats.org/package/2006/relationships';

function run(text: string, props: string): string {
  const lines = text.split('\n');
  return `<w:r><w:rPr>${props}</w:rPr>${lines.map((line, index) => `${index ? '<w:br/>' : ''}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`).join('')}</w:r>`;
}

function paragraph(text: string, props: string, spacingAfter = 0, align?: string): string {
  const jc = align ? `<w:jc w:val="${align}"/>` : '';
  return `<w:p><w:pPr><w:spacing w:before="0" w:after="${spacingAfter}"/>${jc}</w:pPr>${run(text, props)}</w:p>`;
}

function jc(align: string): string | undefined {
  return align === 'end' ? 'right' : align === 'center' ? 'center' : undefined;
}

export function docxDocument(table: TxExportTable, options: TxExportWordOptions, context: TxExportTextContext, date: Date): string {
  const fontSize = options.fontSize ?? 10;
  const half = Math.round(fontSize * 2);
  const text = hexColor(options.textColor, '1D2939');
  const muted = hexColor(options.mutedColor, '667085');
  const border = hexColor(options.borderColor, 'D0D5DD');
  const headerFill = options.headerBackground === 'none' ? null : hexColor(options.headerBackground, 'F2F4F7');
  const stripeFill = hexColor(options.stripeBackground, 'F9FAFB');
  const page = pageGeometry(options.pageSize, options.orientation, options.margin, table.columns.length);
  const twips = (points: number) => Math.round(points * 20);
  const contentWidth = twips(page.width - page.margin[1] - page.margin[3]);
  const texts = table.rows.map((row) => table.columns.map((column, index) => cellText(row[index], column, context)));
  const shares = columnShares(table, texts);
  const total = shares.reduce((sum, share) => sum + share, 0) || 1;
  const widths = shares.map((share) => Math.floor((contentWidth * share) / total));
  const percents = shares.map((share) => Math.floor((5000 * share) / total));
  const body = `<w:color w:val="${text}"/><w:sz w:val="${half}"/><w:szCs w:val="${half}"/>`;
  const line = `w:val="single" w:sz="4" w:space="0" w:color="${border}"`;
  const borders = options.gridlines === false ? `<w:top ${line}/><w:bottom ${line}/><w:insideH ${line}/>` : `<w:top ${line}/><w:left ${line}/><w:bottom ${line}/><w:right ${line}/><w:insideH ${line}/><w:insideV ${line}/>`;

  const cell = (value: string, index: number, props: string, fill: string | null) =>
    `<w:tc><w:tcPr><w:tcW w:w="${percents[index]}" w:type="pct"/>${fill ? `<w:shd w:val="clear" w:color="auto" w:fill="${fill}"/>` : ''}</w:tcPr><w:p><w:pPr><w:spacing w:before="0" w:after="0"/>${jc(table.columns[index].align) ? `<w:jc w:val="${jc(table.columns[index].align)}"/>` : ''}</w:pPr>${run(value, props)}</w:p></w:tc>`;

  const rows: string[] = [];
  if (options.header !== false) {
    const header = table.columns.map((column, index) => cell(column.title, index, `<w:b/><w:bCs/>${body}`, headerFill)).join('');
    rows.push(`<w:tr><w:trPr>${options.repeatHeader === false ? '' : '<w:tblHeader/>'}<w:cantSplit/></w:trPr>${header}</w:tr>`);
  }
  texts.forEach((values, rowIndex) => {
    const fill = options.striped && rowIndex % 2 === 1 ? stripeFill : null;
    rows.push(`<w:tr><w:trPr><w:cantSplit/></w:trPr>${values.map((value, index) => cell(value, index, body, fill)).join('')}</w:tr>`);
  });

  const heading: string[] = [];
  if (options.title) heading.push(paragraph(options.title, `<w:b/><w:bCs/><w:color w:val="${text}"/><w:sz w:val="${Math.round(half * 1.6)}"/>`, 60));
  if (options.subtitle) heading.push(paragraph(options.subtitle, `<w:color w:val="${muted}"/><w:sz w:val="${half}"/>`, 40));
  const stamp = dateLine(options, context, date);
  if (stamp) heading.push(paragraph(stamp, `<w:color w:val="${muted}"/><w:sz w:val="${Math.round(half * 0.85)}"/>`, 40));
  if (heading.length) heading.push(`<w:p><w:pPr><w:spacing w:before="0" w:after="120"/></w:pPr></w:p>`);

  const orient = page.landscape ? ' w:orient="landscape"' : '';
  const [top, right, bottom, left] = page.margin.map(twips);
  const footer = options.pageNumbers === false ? '' : '<w:footerReference w:type="default" r:id="rId1"/>';
  const section = `<w:sectPr>${footer}<w:pgSz w:w="${twips(page.width)}" w:h="${twips(page.height)}"${orient}/><w:pgMar w:top="${top}" w:right="${right}" w:bottom="${bottom}" w:left="${left}" w:header="${Math.round(top / 2)}" w:footer="${Math.round(bottom / 2)}" w:gutter="0"/></w:sectPr>`;
  const tableXml = table.columns.length
    ? `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblLayout w:type="fixed"/><w:tblBorders>${borders}</w:tblBorders><w:tblCellMar><w:top w:w="40" w:type="dxa"/><w:left w:w="80" w:type="dxa"/><w:bottom w:w="40" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr><w:tblGrid>${widths.map((width) => `<w:gridCol w:w="${width}"/>`).join('')}</w:tblGrid>${rows.join('')}</w:tbl>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:document xmlns:w="${W}" xmlns:r="${R}"><w:body>${heading.join('')}${tableXml}<w:p/>${section}</w:body></w:document>`;
}

function docxFooter(options: TxExportWordOptions): string {
  const half = Math.round((options.fontSize ?? 10) * 1.7);
  const props = `<w:color w:val="${hexColor(options.mutedColor, '667085')}"/><w:sz w:val="${half}"/>`;
  const field = (code: string) => `<w:fldSimple w:instr=" ${code} "><w:r><w:rPr>${props}</w:rPr><w:t>1</w:t></w:r></w:fldSimple>`;
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<w:ftr xmlns:w="${W}" xmlns:r="${R}"><w:p><w:pPr><w:jc w:val="center"/></w:pPr>${field('PAGE')}<w:r><w:rPr>${props}</w:rPr><w:t xml:space="preserve"> / </w:t></w:r>${field('NUMPAGES')}</w:p></w:ftr>`;
}

export async function writeDocx(table: TxExportTable, options: TxExportWordOptions = {}, context: TxExportTextContext = { yes: 'Yes', no: 'No' }, date = new Date()): Promise<Blob> {
  const pageNumbers = options.pageNumbers !== false;
  const created = date.toISOString().replace(/\.\d{3}Z$/, 'Z');
  const core =
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">` +
    (options.title ? `<dc:title>${escapeXml(options.title)}</dc:title>` : '') +
    `<dcterms:created xsi:type="dcterms:W3CDTF">${created}</dcterms:created></cp:coreProperties>`;
  const bytes = await zip(
    [
      {
        name: '[Content_Types].xml',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>${pageNumbers ? '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/>' : ''}<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`,
      },
      {
        name: '_rels/.rels',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${PKG_REL}"><Relationship Id="rId1" Type="${R}/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`,
      },
      { name: 'docProps/core.xml', data: core },
      { name: 'word/document.xml', data: docxDocument(table, { ...options, pageNumbers }, context, date) },
      {
        name: 'word/_rels/document.xml.rels',
        data: `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n<Relationships xmlns="${PKG_REL}">${pageNumbers ? `<Relationship Id="rId1" Type="${R}/footer" Target="footer1.xml"/>` : ''}</Relationships>`,
      },
      ...(pageNumbers ? [{ name: 'word/footer1.xml', data: docxFooter(options) }] : []),
    ],
    date,
    options.compress !== false,
  );
  return new Blob([bytes as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

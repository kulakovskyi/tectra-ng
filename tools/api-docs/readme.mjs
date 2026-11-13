const SCOPE = /^`([*[]?tx[A-Za-z-][\w-]*\]?)`:\s*/;
const HEADING_SCOPE = /\s+[—-]\s+`?([^`]+?)`?\s*$/;

export function rowNames(cell) {
  const head = cell.replace(/`/g, '').trim().replace(/^[[(*]+/, '').split(/[(:]/)[0];
  return head
    .split(/\s+\/\s+|,\s+/)
    .map((part) => part.replace(/^[[(*]+/, '').match(/^[A-Za-z_$][\w$-]*/)?.[0])
    .filter(Boolean);
}

export function splitRow(line) {
  const cells = [];
  let current = '';
  let code = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '\\' && line[index + 1] === '|') {
      current += '|';
      index += 1;
      continue;
    }
    if (char === '`') {
      code = !code;
    }
    if (char === '|' && !code) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
  }
  cells.push(current.trim());
  return cells.slice(1, -1);
}

function isHeaderRow(cells) {
  return cells.every((cell) => /^:?-+:?$/.test(cell)) || ['Name', 'Key'].includes(cells[0]);
}

export function parseReadme(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  const title = lines.find((line) => line.startsWith('# '))?.slice(2).trim() ?? '';
  const introLines = [];
  const codeLines = [];
  const sections = [];
  let section = null;
  let fence = 0;
  let introDone = false;

  for (const line of lines) {
    if (line.startsWith('```')) {
      fence += 1;
      if (introLines.length) {
        introDone = true;
      }
      continue;
    }
    const inCode = fence % 2 === 1;
    if (inCode) {
      if (!section && fence === 1) {
        codeLines.push(line);
      }
      continue;
    }
    if (line.startsWith('## ')) {
      introDone = true;
      const heading = line.slice(3).trim();
      section = { heading: heading.replace(HEADING_SCOPE, '').trim(), scope: heading.match(HEADING_SCOPE)?.[1] ?? null, rows: [] };
      sections.push(section);
      continue;
    }
    if (!section) {
      if (!line.startsWith('# ') && !introDone) {
        if (line.trim()) {
          introLines.push(line.trim());
        } else if (introLines.length) {
          introDone = true;
        }
      }
      continue;
    }
    if (!line.startsWith('|')) {
      continue;
    }
    const cells = splitRow(line);
    if (cells.length < 2 || isHeaderRow(cells)) {
      continue;
    }
    const raw = cells.slice(1).join(' | ');
    section.rows.push({
      cell: cells[0],
      names: rowNames(cells[0]),
      scope: raw.match(SCOPE)?.[1] ?? section.scope,
      description: raw.replace(SCOPE, '').trim(),
    });
  }
  return { title, intro: introLines.join(' '), firstCode: codeLines.join('\n'), sections };
}

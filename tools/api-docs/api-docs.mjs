import { createRequire } from 'node:module';
import { parseReadme } from './readme.mjs';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const INPUTS = 'Inputs';
const OUTPUTS = 'Outputs';
const METHODS = 'Methods';
const SLOTS = 'Slots';
const PIPES = 'Pipes';
const TOP_LEVEL = ['Functions', 'Providers', 'Constants'];
const API_SECTIONS = [INPUTS, OUTPUTS, METHODS, SLOTS, PIPES, ...TOP_LEVEL];

function literal(node) {
  return node && ts.isLiteralTypeNode(node) && ts.isStringLiteral(node.literal) ? node.literal.text : undefined;
}

function propertyName(member) {
  const { name } = member;
  return name && (ts.isStringLiteral(name) || ts.isIdentifier(name)) ? name.text : undefined;
}

function lastName(text) {
  return text.split('.').pop();
}

function aliasMap(node, kind) {
  const map = new Map();
  if (!node || !ts.isTypeLiteralNode(node)) {
    return map;
  }
  for (const member of node.members) {
    const property = propertyName(member);
    if (!property || !member.type) {
      continue;
    }
    if (kind === 'outputs') {
      map.set(literal(member.type) ?? property, property);
      continue;
    }
    const alias = ts.isTypeLiteralNode(member.type) ? member.type.members.find((inner) => propertyName(inner) === 'alias') : undefined;
    map.set(literal(alias?.type) ?? property, property);
  }
  return map;
}

function angularMeta(node, sourceFile) {
  for (const member of node.members) {
    if (!ts.isPropertyDeclaration(member) || !member.type || !ts.isTypeReferenceNode(member.type)) {
      continue;
    }
    const name = propertyName(member);
    const args = member.type.typeArguments ?? [];
    if (name === 'ɵcmp' || name === 'ɵdir') {
      const hostText = args[8] ? args[8].getText(sourceFile) : '';
      return {
        kind: name === 'ɵcmp' ? 'component' : 'directive',
        selector: literal(args[1]) ?? '',
        inputs: aliasMap(args[3], 'inputs'),
        outputs: aliasMap(args[4], 'outputs'),
        hostDirectives: [...hostText.matchAll(/typeof\s+([\w.]+)/g)].map((match) => lastName(match[1])),
        hostAliases: new Set([...hostText.matchAll(/"[^"]+":\s*"([^"]+)"/g)].map((match) => match[1])),
      };
    }
    if (name === 'ɵpipe') {
      return { kind: 'pipe', name: literal(args[1]) ?? '', inputs: new Map(), outputs: new Map(), hostDirectives: [], hostAliases: new Set() };
    }
  }
  return null;
}

export function selectorTokens(selector) {
  return selector.match(/[A-Za-z][\w-]*/g) ?? [];
}

function membersOf(node) {
  const members = new Map();
  for (const member of node.members) {
    const name = propertyName(member);
    if (name && !name.startsWith('ɵ') && !(ts.getCombinedModifierFlags(member) & ts.ModifierFlags.Private) && !members.has(name)) {
      members.set(name, member);
    }
  }
  return members;
}

export function analyze(text, file = 'index.d.ts') {
  const sourceFile = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS);
  const classes = [];
  const functions = new Map();
  const constants = new Map();
  const reexports = new Set();
  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement) && statement.exportClause && ts.isNamedExports(statement.exportClause)) {
      for (const element of statement.exportClause.elements) {
        reexports.add(element.name.text);
      }
      continue;
    }
    if ((ts.isClassDeclaration(statement) || ts.isInterfaceDeclaration(statement)) && statement.name) {
      const base = statement.heritageClauses?.find((clause) => clause.token === ts.SyntaxKind.ExtendsKeyword)?.types[0];
      classes.push({
        name: statement.name.text,
        node: statement,
        members: membersOf(statement),
        meta: ts.isClassDeclaration(statement) ? angularMeta(statement, sourceFile) : null,
        base: base ? lastName(base.expression.getText(sourceFile)) : null,
        isInterface: ts.isInterfaceDeclaration(statement),
      });
    } else if (ts.isFunctionDeclaration(statement) && statement.name && !functions.has(statement.name.text)) {
      functions.set(statement.name.text, statement);
    } else if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          constants.set(declaration.name.text, statement);
        }
      }
    }
  }
  return { sourceFile, classes, functions, constants, reexports };
}

export function buildIndex(analyses) {
  const index = new Map();
  for (const { classes } of analyses) {
    for (const declaration of classes) {
      if (!index.has(declaration.name)) {
        index.set(declaration.name, declaration);
      }
    }
  }
  return index;
}

function related(declaration, index, seen = new Set()) {
  const names = [declaration.base, ...(declaration.meta?.hostDirectives ?? [])].filter(Boolean);
  const result = [];
  for (const name of names) {
    const found = index.get(name);
    if (found && !seen.has(found)) {
      seen.add(found);
      result.push(found, ...related(found, index, seen));
    }
  }
  return result;
}

function inherits(declaration, index, section, name) {
  if (section !== METHODS && declaration.meta?.hostAliases.has(name)) {
    return true;
  }
  return related(declaration, index).some((ancestor) => {
    if (section === INPUTS) {
      return ancestor.meta?.inputs.has(name);
    }
    if (section === OUTPUTS) {
      return ancestor.meta?.outputs.has(name);
    }
    return ancestor.members.has(name);
  });
}

function inScope(declaration, scope, owned = []) {
  if (!scope) {
    return !owned.some((other) => inScope(declaration, other));
  }
  const token = scope.replace(/^[*[(]+|[\])]+$/g, '').split(/[\s[]/)[0];
  return declaration.name === token || (declaration.meta ? selectorTokens(declaration.meta.selector ?? '').includes(token) : false);
}

export function toComment(lines, indent) {
  const body = lines.map((line) => line.replace(/\*\//g, '*\\/'));
  if (body.length === 1) {
    return `/** ${body[0]} */\n${indent}`;
  }
  return `/**\n${body.map((line) => `${indent} *${line ? ` ${line}` : ''}`).join('\n')}\n${indent} */\n${indent}`;
}

function hasDoc(sourceFile, node) {
  return /\*\/\s*$/.test(sourceFile.text.slice(0, node.getStart(sourceFile)));
}

function mainClasses(classes, readme) {
  const components = classes.filter((declaration) => declaration.meta && declaration.meta.kind !== 'pipe');
  const mentioned = components.filter((declaration) =>
    selectorTokens(declaration.meta.selector).some((token) => token.length > 3 && (readme.firstCode.includes(token) || readme.intro.includes(token))),
  );
  if (mentioned.length) {
    return mentioned;
  }
  return components.length === 1 ? components : [];
}

function qualified(row) {
  const match = row.cell.replace(/`/g, '').match(/^(?:new\s+)?([A-Z][\w$]*)(?:\.([A-Za-z_$][\w$]*))?/);
  if (!match || !/^(?:new\s+)?[A-Z][\w$]*(?:\.|\(|$)/.test(row.cell.replace(/`/g, ''))) {
    return null;
  }
  return { owner: match[1], member: match[2] ?? null };
}

function normalizeReadmes(readmes, docsUrl) {
  return (typeof readmes === 'string' ? [{ text: readmes, docsUrl }] : readmes).map((readme) => ({ ...readme, parsed: parseReadme(readme.text) }));
}

export function documentDeclarations(text, readmes, { file = 'index.d.ts', docsUrl, analysis, index } = {}) {
  const { sourceFile, classes, functions, constants, reexports } = analysis ?? analyze(text, file);
  const lookup = index ?? buildIndex([{ classes }]);
  const docs = new Map();
  const unmatched = [];

  const add = (node, lines) => {
    if (!docs.has(node)) {
      docs.set(node, lines);
    }
  };

  const matchMember = (section, row, name, owned) => {
    let matched = false;
    for (const declaration of classes) {
      if (!inScope(declaration, row.scope, owned)) {
        continue;
      }
      if (section === INPUTS || section === OUTPUTS) {
        const property = declaration.meta?.[section === INPUTS ? 'inputs' : 'outputs'].get(name);
        const member = property && declaration.members.get(property);
        if (member) {
          add(member, [row.description]);
          matched = true;
        } else if (declaration.meta && inherits(declaration, lookup, section, name)) {
          matched = true;
        }
      }
    }
    if (section !== METHODS) {
      return matched;
    }
    const owners = classes.filter((declaration) => declaration.members.has(name) && inScope(declaration, row.scope, owned));
    const preferred = owners.some((declaration) => declaration.meta) ? owners.filter((declaration) => declaration.meta) : owners;
    for (const declaration of preferred) {
      add(declaration.members.get(name), [row.description]);
      matched = true;
    }
    return matched || classes.some((declaration) => inScope(declaration, row.scope, owned) && inherits(declaration, lookup, section, name));
  };

  const all = normalizeReadmes(readmes, docsUrl);
  const extraScopes = all.map((readme) => readme.defaultScope).filter(Boolean);
  for (const { parsed: readme, docsUrl: url, mainClass, defaultScope, label } of all) {
    const see = url ? [`@see ${url}`] : [];
    const scopes = [...new Set(readme.sections.map((section) => section.scope).filter(Boolean))];
    const owned = defaultScope ? [] : [...scopes, ...extraScopes];
    for (const section of readme.sections) {
      if (!API_SECTIONS.includes(section.heading)) {
        continue;
      }
      for (const sourceRow of section.rows) {
        const row = { ...sourceRow, scope: sourceRow.scope ?? defaultScope ?? null };
        let matched = false;
        const target = section.heading === METHODS ? qualified(row) : null;
        if (target) {
          const declaration = classes.find((candidate) => candidate.name === target.owner);
          const member = target.member ? declaration?.members.get(target.member) : declaration?.node;
          if (member) {
            add(member, target.member ? [row.description] : [row.description, ...see]);
            matched = true;
          }
        }
        for (const name of matched ? [] : row.names) {
          if (section.heading === INPUTS || section.heading === OUTPUTS || section.heading === METHODS) {
            matched = matchMember(section.heading, row, name, owned) || matchMember(section.heading, row, name, []) || matched;
          } else if (section.heading === SLOTS) {
            for (const declaration of classes) {
              if (declaration.meta?.kind === 'directive' && selectorTokens(declaration.meta.selector).includes(name)) {
                add(declaration.node, [row.description, ...see]);
                const own = declaration.members.get(declaration.meta.inputs.get(name) ?? '');
                if (own) {
                  add(own, [row.description]);
                }
                matched = true;
              }
            }
          } else if (section.heading === PIPES) {
            for (const declaration of classes) {
              if (declaration.meta?.kind === 'pipe' && declaration.meta.name === name) {
                add(declaration.node, [row.description, ...see]);
                matched = true;
              }
            }
          } else {
            const node = functions.get(name) ?? constants.get(name) ?? classes.find((declaration) => declaration.name === name)?.node;
            if (node) {
              add(node, [row.description, ...see]);
              matched = true;
            } else if (reexports.has(name)) {
              matched = true;
            }
          }
        }
        if (!matched && section.heading !== SLOTS) {
          unmatched.push(`${label ? `${label} — ` : ''}${section.heading}${row.scope ? ` (${row.scope})` : ''}: ${row.cell}`);
        }
      }
    }
    const main = mainClass ? classes.filter((declaration) => declaration.name === mainClass) : mainClasses(classes, readme);
    const node = mainClass && !main.length ? functions.get(mainClass) ?? constants.get(mainClass) : null;
    for (const target of node ? [node] : main.map((declaration) => declaration.node)) {
      if (readme.intro && !docs.has(target)) {
        docs.set(target, [readme.intro, ...see]);
      }
    }
  }

  const undocumented = [];
  for (const declaration of classes) {
    for (const kind of ['inputs', 'outputs']) {
      for (const [alias, property] of declaration.meta?.[kind] ?? []) {
        const member = declaration.members.get(property);
        if (member && !docs.has(member)) {
          undocumented.push(`${declaration.name}.${alias} (${kind.slice(0, -1)})`);
        }
      }
    }
  }

  const edits = [...docs]
    .filter(([node]) => !hasDoc(sourceFile, node))
    .map(([node, lines]) => {
      const start = node.getStart(sourceFile);
      const lineStart = text.lastIndexOf('\n', start - 1) + 1;
      const indent = text.slice(lineStart, start);
      return { start, line: sourceFile.getLineAndCharacterOfPosition(start).line, comment: toComment(lines, /^\s*$/.test(indent) ? indent : '') };
    })
    .sort((first, second) => second.start - first.start);

  let output = text;
  const inserted = new Map();
  for (const edit of edits) {
    output = output.slice(0, edit.start) + edit.comment + output.slice(edit.start);
    inserted.set(edit.line, (inserted.get(edit.line) ?? 0) + (edit.comment.match(/\n/g)?.length ?? 0));
  }
  return { text: output, inserted, documented: edits.length, unmatched, undocumented };
}

export function shiftSourceMap(mapText, inserted) {
  if (!inserted.size) {
    return mapText;
  }
  const map = JSON.parse(mapText);
  const shifted = [];
  map.mappings.split(';').forEach((segments, line) => {
    for (let index = 0; index < (inserted.get(line) ?? 0); index += 1) {
      shifted.push('');
    }
    shifted.push(segments);
  });
  map.mappings = shifted.join(';');
  return JSON.stringify(map);
}

function documented(sourceFile, node) {
  return /\*\/\s*$/.test(sourceFile.text.slice(0, node.getStart(sourceFile)));
}

function publicMembers(node) {
  const seen = new Set();
  return node.members.filter((member) => {
    const name = member.name && propertyName(member);
    if (!name || name.startsWith('ɵ') || ts.isConstructorDeclaration(member) || ts.getCombinedModifierFlags(member) & (ts.ModifierFlags.Private | ts.ModifierFlags.Protected) || seen.has(name)) {
      return false;
    }
    seen.add(name);
    return true;
  });
}

export function missingDocs(text, file = 'index.d.ts') {
  const { sourceFile, classes } = analyze(text, file);
  const missing = [];
  const note = (node, name, kind) => {
    if (!documented(sourceFile, node)) {
      missing.push({ kind, name, line: sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1 });
    }
  };
  const functions = new Set();
  for (const statement of sourceFile.statements) {
    if (ts.isFunctionDeclaration(statement) && statement.name && !functions.has(statement.name.text)) {
      functions.add(statement.name.text);
      note(statement, statement.name.text, 'function');
    } else if (ts.isVariableStatement(statement)) {
      note(statement, statement.declarationList.declarations.map((declaration) => declaration.name.getText(sourceFile)).join(', '), 'constant');
    } else if (ts.isTypeAliasDeclaration(statement) || ts.isEnumDeclaration(statement)) {
      note(statement, statement.name.text, 'type');
    }
  }
  for (const declaration of classes) {
    note(declaration.node, declaration.name, declaration.isInterface ? 'interface' : declaration.meta ? declaration.meta.kind : 'class');
    if (declaration.meta) {
      continue;
    }
    for (const member of publicMembers(declaration.node)) {
      note(member, `${declaration.name}.${propertyName(member)}`, declaration.isInterface ? 'field' : 'member');
    }
  }
  return missing;
}

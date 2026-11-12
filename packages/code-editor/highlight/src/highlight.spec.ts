import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxCodeHighlight } from './code-highlight.component';
import { TxCodeToken } from './code-highlight.types';
import { guideLevels } from './code-lines';
import { TxCodeLineStates, getCodeMode, highlightCode, resolveCodeLanguage } from './tokenize';

function typed(code: string, language: string): string[][] {
  const lines = code.split('\n');
  return highlightCode(code, language).map((tokens: TxCodeToken[], index) => tokens.map((token) => `${token.type}:${lines[index].slice(token.from, token.to)}`));
}

describe('guideLevels', () => {
  it('counts indent levels and carries them over blank lines', () => {
    const lines = ['a {', '  b {', '    c', '', '    d', '  }', '}', '', 'e'];
    expect(guideLevels(lines.length, (index) => lines[index], 2)).toEqual([0, 1, 2, 2, 2, 1, 0, 0, 0]);
    expect(guideLevels(lines.length, (index) => lines[index], 2, 2, 4)).toEqual([2, 2]);
  });
});

describe('highlightCode', () => {
  it('reads HTML tags, attributes, comments and the doctype', () => {
    const [doctype, tag, comment] = typed('<!DOCTYPE html>\n<a href="/x" hidden>Hi</a>\n<!-- note -->', 'html');
    expect(doctype).toEqual(['meta:<!DOCTYPE', 'attribute:html', 'meta:>']);
    expect(tag).toEqual([
      'tag-delimiter:<',
      'tag:a',
      'attribute:href',
      'delimiter:=',
      'attribute-value:"/x"',
      'attribute:hidden',
      'tag-delimiter:>',
      'tag-delimiter:</',
      'tag:a',
      'tag-delimiter:>',
    ]);
    expect(comment).toEqual(['comment:<!-- note -->']);
  });

  it('switches to JavaScript, JSON and CSS inside script and style', () => {
    const [script, json, style] = typed(
      '<script>let a = 1;</script>\n<script type="application/ld+json">{"k": true}</script>\n<style>p { color: red; }</style>',
      'html',
    );
    expect(script).toContain('keyword:let');
    expect(script).toContain('number:1');
    expect(json).toContain('key:"k"');
    expect(json).toContain('literal:true');
    expect(style).toContain('attribute:color');
    expect(style).toContain('value:red');
  });

  it('carries comments and attribute values across lines', () => {
    const [, second] = typed('<!-- one\ntwo -->', 'html');
    expect(second).toEqual(['comment:two -->']);
    const [, end] = typed('<a title="one\ntwo">', 'html');
    expect(end[0]).toBe('attribute-value:two"');
  });

  it('tells a regular expression from a division in JavaScript', () => {
    const [division, regexp] = typed('x = a / 2 / b;\ny = s.replace(/\\s+/g, "");', 'javascript');
    expect(division.filter((token) => token.startsWith('regexp'))).toEqual([]);
    expect(regexp).toContain('regexp:/\\s+/g');
    expect(regexp).toContain('string:""');
  });

  it('reads template strings with nested expressions', () => {
    const [line] = typed('const t = `a ${b + {c: 1}.c} d`;', 'javascript');
    expect(line).toContain('string:`a ');
    expect(line).toContain('string: d`');
    expect(line).toContain('number:1');
  });

  it('knows TypeScript keywords and types', () => {
    const [line] = typed('let n: number = Math.max(1, 2);', 'typescript');
    expect(line).toContain('keyword:number');
    expect(line).toContain('type:Math');
    expect(typed('let n: number;', 'javascript')[0]).not.toContain('keyword:number');
  });

  it('separates JSON keys from values', () => {
    const [line] = typed('{"a": "b", "n": -1.5e3, "z": null}', 'json');
    expect(line).toEqual([
      'delimiter:{',
      'key:"a"',
      'delimiter::',
      'value:"b"',
      'delimiter:,',
      'key:"n"',
      'delimiter::',
      'number:-1.5e3',
      'delimiter:,',
      'key:"z"',
      'delimiter::',
      'literal:null',
      'delimiter:}',
    ]);
  });

  it('reads CSS selectors, properties, values and at-rules', () => {
    const [media, rule, declaration] = typed('@media (max-width: 600px) {\n  .a:hover > b {\n    margin: 0 4px !important;', 'css');
    expect(media[0]).toBe('keyword:@media');
    expect(rule).toContain('tag:.a:hover');
    expect(declaration).toEqual(['attribute:margin', 'delimiter::', 'number:0', 'number:4px', 'keyword:!important', 'delimiter:;']);
  });

  it('reads Markdown blocks, inline marks and fenced code', () => {
    const lines = typed('# Title\nSome **bold** and `code`\n> quote\n```json\n{"a": 1}\n```\nsnake_case_word', 'markdown');
    expect(lines[0]).toEqual(['heading:# Title']);
    expect(lines[1]).toContain('strong:**bold**');
    expect(lines[1]).toContain('code:`code`');
    expect(lines[2]).toEqual(['quote:> quote']);
    expect(lines[4]).toContain('key:"a"');
    expect(lines[6]).toEqual([]);
  });

  it('leaves plain text alone and resolves language names', () => {
    expect(typed('let a = 1', 'plain')).toEqual([[]]);
    expect(resolveCodeLanguage('JS')).toBe('javascript');
    expect(resolveCodeLanguage('md')).toBe('markdown');
    expect(resolveCodeLanguage('cobol')).toBeNull();
    expect(getCodeMode('cobol').language).toBe('plain');
  });

  it('keeps line states for incremental highlighting', () => {
    const lines = ['/* a', 'b */ let c;'];
    const states = new TxCodeLineStates(getCodeMode('javascript'));
    expect(states.tokens(1, (index) => lines[index]).map((token) => token.type)).toEqual(['comment', 'keyword', 'delimiter']);
    lines[0] = '// a';
    states.invalidateFrom(0);
    expect(states.tokens(1, (index) => lines[index]).map((token) => token.type)).not.toContain('comment');
  });
});

@Component({
  imports: [TxCodeHighlight],
  template: `<tx-code-highlight language="json" [code]="code()" [lineNumbers]="numbers()" [firstLine]="10" [dt]="{ syntax: { key: 'red' } }" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly code = signal('{\n  "a": 1\n}');
  readonly numbers = signal(true);
}

describe('TxCodeHighlight', () => {
  it('renders highlighted lines with numbers', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-highlight') as HTMLElement;
    expect(root.querySelectorAll('.tx-code-highlight__line').length).toBe(3);
    expect([...root.querySelectorAll('.tx-code-highlight__number')].map((cell) => cell.textContent)).toEqual(['10', '11', '12']);
    expect(root.querySelector('.tx-code-tok-key')?.textContent).toBe('"a"');
    expect(root.style.getPropertyValue('--tx-code-syntax-key')).toBe('red');
    expect(root.querySelector('pre')?.getAttribute('aria-label')).toBe('Code');
    fixture.componentInstance.numbers.set(false);
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-highlight__number')).toBeNull();
  });
});

@Component({
  imports: [TxCodeHighlight],
  template: `<tx-code-highlight [code]="code()" height="120px" ariaLabel="Snippet" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EmptyHost {
  readonly code = signal<string | null>(null);
}

describe('TxCodeHighlight without code', () => {
  it('renders one empty line, the height and the label without tokens', async () => {
    const fixture = TestBed.createComponent(EmptyHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-code-highlight') as HTMLElement;
    expect(root.querySelectorAll('.tx-code-highlight__line').length).toBe(1);
    expect(root.style.height).toBe('120px');
    expect(root.querySelector('pre')?.getAttribute('aria-label')).toBe('Snippet');
    fixture.componentInstance.code.set('<b>');
    await fixture.whenStable();
    expect(root.querySelector('.tx-code-tok-tag')?.textContent).toBe('b');
  });
});

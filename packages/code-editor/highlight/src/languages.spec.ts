import { TxCodeMode, TxCodeToken } from './code-highlight.types';
import { codeLines, guideLevels, lineIndent, lineSegments } from './code-lines';
import { createMarkdownMode } from './languages/markdown';
import { TxCodeStream } from './stream';
import { TxCodeLineStates, getCodeMode, highlightCode, resolveCodeLanguage, tokenizeLine } from './tokenize';

function typed(code: string, language: string): string[][] {
  const lines = code.split('\n');
  return highlightCode(code, language).map((tokens: TxCodeToken[], index) => tokens.map((token) => `${token.type}:${lines[index].slice(token.from, token.to)}`));
}

function incremental(code: string, language: string): string[][] {
  const lines = code.split('\n');
  const states = new TxCodeLineStates(getCodeMode(language));
  return lines.map((line, index) => states.tokens(index, (number) => lines[number]).map((token) => `${token.type}:${line.slice(token.from, token.to)}`));
}

const STUCK_MODE: TxCodeMode<null> = {
  language: 'plain',
  comments: {},
  start: () => null,
  copy: () => null,
  token: () => 'keyword',
};

describe('TxCodeStream', () => {
  it('reads the current token, the rest and the text before it', () => {
    const stream = new TxCodeStream('let name = 1');
    stream.pos = 4;
    stream.start = 4;
    stream.match(/\w+/);
    expect(stream.current()).toBe('name');
    expect(stream.rest()).toBe(' = 1');
    expect(stream.before()).toBe('let ');
  });

  it('matches text ignoring case and only peeks when asked', () => {
    const stream = new TxCodeStream('DocType');
    expect(stream.matchText('doctype', false, true)).toBe(true);
    expect(stream.pos).toBe(0);
    expect(stream.matchText('doctype')).toBe(false);
    expect(stream.matchText('DOC', true, true)).toBe(true);
    expect(stream.pos).toBe(3);
    stream.skipToEnd();
    expect(stream.next()).toBe('');
    expect(stream.pos).toBe(7);
  });
});

describe('tokenize helpers', () => {
  it('resolves empty names to nothing', () => {
    expect(resolveCodeLanguage(null)).toBeNull();
    expect(resolveCodeLanguage('')).toBeNull();
    expect(resolveCodeLanguage(' TSX ')).toBe('typescript');
  });

  it('moves on by one character when a mode does not consume anything', () => {
    expect(tokenizeLine(STUCK_MODE, 'ab', null)).toEqual([{ from: 0, to: 2, type: 'keyword' }]);
  });

  it('knows the language of its line states', () => {
    expect(new TxCodeLineStates(getCodeMode('css')).language).toBe('css');
    expect(incremental('a\nb', 'plain')).toEqual([[], []]);
  });
});

describe('code lines', () => {
  it('counts tabs to the next tab stop', () => {
    expect(lineIndent('\tx', 4)).toBe('4ch');
    expect(lineIndent('  \tx', 4)).toBe('4ch');
    expect(lineIndent('   ')).toBeNull();
    expect(guideLevels(2, (index) => ['\ta', '\t\tb'][index], 4)).toEqual([1, 2]);
  });

  it('gives blank files no guides', () => {
    expect(guideLevels(3, () => '', 2)).toEqual([0, 0, 0]);
  });

  it('keeps plain text after the last token', () => {
    expect(lineSegments('let x', [{ from: 0, to: 3, type: 'keyword' }])).toEqual([
      { text: 'let', className: 'tx-code-tok-keyword' },
      { text: ' x', className: null },
    ]);
    expect(codeLines('let x', 'javascript', 5)[0].number).toBe(5);
  });
});

describe('CSS', () => {
  it('closes block comments on a later line', () => {
    expect(typed('/* a\nb */ p {}', 'css')[1]).toEqual(['comment:b */', 'tag:p', 'delimiter:{}']);
    expect(typed('/* a */ p', 'css')[0]).toEqual(['comment:/* a */', 'tag:p']);
  });

  it('carries an escaped line end inside a string to the next line', () => {
    const lines = typed('a { content: "x\\\ny"; b: \'c', 'css');
    expect(lines[0]).toContain('string:"x\\');
    expect(lines[1][0]).toBe('string:y"');
    expect(lines[1]).toContain("string:'c");
  });

  it('reads hex colours, plain hashes and properties of at-rule preludes', () => {
    expect(typed('a { color: #ff00aa; b: #zz; }', 'css')[0]).toEqual([
      'tag:a',
      'delimiter:{',
      'attribute:color',
      'delimiter::',
      'value:#ff00aa',
      'delimiter:;',
      'attribute:b',
      'delimiter::',
      'delimiter:#',
      'value:zz',
      'delimiter:;',
      'delimiter:}',
    ]);
    expect(typed('@media (min-width: 1px)', 'css')[0]).toContain('attribute:min-width');
  });

  it('keeps comment state for incremental highlighting', () => {
    expect(incremental('/* a\nb */ p', 'css')[1]).toEqual(['comment:b */', 'tag:p']);
  });
});

describe('JSON and JavaScript', () => {
  it('closes JSON block comments on a later line', () => {
    expect(typed('/* a\nb */ 1', 'json')[1]).toEqual(['comment:b */', 'number:1']);
    expect(typed('/* a */ 1', 'json')[0]).toEqual(['comment:/* a */', 'number:1']);
    expect(incremental('/* a\nb */ true', 'json')[1]).toEqual(['comment:b */', 'literal:true']);
  });

  it('skips escaped characters inside template strings', () => {
    expect(typed('`a\\`b`;', 'javascript')[0]).toEqual(['string:`a\\`b`', 'delimiter:;']);
    expect(typed('/* a */ b', 'javascript')[0]).toEqual(['comment:/* a */']);
  });
});

describe('HTML', () => {
  it('picks the script language from its type', () => {
    expect(typed('<script type="module">let a</script>', 'html')[0]).toContain('keyword:let');
    expect(typed('<script type="text/javascript">let a</script>', 'html')[0]).toContain('keyword:let');
    expect(typed("<script type='text/ecmascript'>let a</script>", 'html')[0]).toContain('keyword:let');
    expect(typed('<script type=module>let a</script>', 'html')[0]).toEqual([
      'tag-delimiter:<',
      'tag:script',
      'attribute:type',
      'delimiter:=',
      'attribute-value:module',
      'tag-delimiter:>',
      'keyword:let',
      'tag-delimiter:</',
      'tag:script',
      'tag-delimiter:>',
    ]);
  });

  it('leaves unknown script types and raw text tags unhighlighted', () => {
    expect(typed('<script type="text/x-template"><b>x</b></script>', 'html')[0]).toEqual([
      'tag-delimiter:<',
      'tag:script',
      'attribute:type',
      'delimiter:=',
      'attribute-value:"text/x-template"',
      'tag-delimiter:>',
      'tag-delimiter:</',
      'tag:script',
      'tag-delimiter:>',
    ]);
    expect(typed('<title>a < b</title>', 'html')[0]).not.toContain('tag:b');
  });

  it('reads a script type split over lines', () => {
    const lines = typed('<script type="text/\njavascript">let a</script>', 'html');
    expect(lines[0]).toContain('attribute-value:"text/');
    expect(lines[1]).toContain('keyword:let');
  });

  it('reads self-closing tags, unquoted values and stray characters', () => {
    expect(typed('<br/><img src=a.png "x" />', 'html')[0]).toEqual([
      'tag-delimiter:<',
      'tag:br',
      'tag-delimiter:/><',
      'tag:img',
      'attribute:src',
      'delimiter:=',
      'attribute-value:a.png',
      'tag-delimiter:"',
      'attribute:x',
      'tag-delimiter:"',
      'tag-delimiter:/>',
    ]);
    expect(typed('<a =>', 'html')[0]).toEqual(['tag-delimiter:<', 'tag:a', 'delimiter:=', 'tag-delimiter:>']);
  });

  it('copies embedded states for incremental highlighting', () => {
    const lines = incremental('<script>\nlet a = `x\ny`;\n</script>\n<script type="text/x-template">\n<b>\n</script>\n<p>', 'html');
    expect(lines[1]).toContain('keyword:let');
    expect(lines[2][0]).toBe('string:y`');
    expect(lines[5]).toEqual([]);
    expect(lines[7]).toEqual(['tag-delimiter:<', 'tag:p', 'tag-delimiter:>']);
  });
});

describe('Markdown', () => {
  it('reads emphasis, comments, links and thematic breaks', () => {
    const [emphasis, comment, rule, list] = typed('*a* and _b_\n<!-- c --> <https://x.dev> https://y.dev/z\n---\n1. item', 'markdown');
    expect(emphasis).toEqual(['emphasis:*a*', 'emphasis:_b_']);
    expect(comment).toEqual(['comment:<!-- c -->', 'link:<https://x.dev>', 'link:https://y.dev/z']);
    expect(rule).toEqual(['keyword:---']);
    expect(list).toEqual(['keyword:1.']);
  });

  it('skips escaped characters and reads links and images', () => {
    expect(typed('\\*a* [b](c) ![d](e.png) [f]', 'markdown')[0]).toEqual(['link:[b](c)', 'link:![d](e.png)']);
  });

  it('keeps fenced code of unknown languages as code', () => {
    const lines = typed('```\nlet a\n~~~\n```\nafter', 'markdown');
    expect(lines[1]).toEqual(['code:let a']);
    expect(lines[2]).toEqual(['code:~~~']);
    expect(lines[3]).toEqual(['string:```']);
    expect(lines[4]).toEqual([]);
  });

  it('copies the fenced language state for incremental highlighting', () => {
    const lines = incremental('```js\n/* a\nb */ let c\n```', 'markdown');
    expect(lines[1]).toEqual(['comment:/* a']);
    expect(lines[2]).toEqual(['comment:b */', 'keyword:let']);
  });

  it('moves on when the fenced language does not consume anything', () => {
    const mode = createMarkdownMode({ resolve: () => 'javascript', mode: () => STUCK_MODE as TxCodeMode });
    const state = mode.start();
    tokenizeLine(mode, '```x', state);
    expect(tokenizeLine(mode, 'ab', state)).toEqual([{ from: 0, to: 2, type: 'keyword' }]);
  });
});

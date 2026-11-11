import fc from 'fast-check';
import { TxCodeLanguage } from './code-highlight.types';
import { highlightCode, splitCodeLines } from './tokenize';

const LANGUAGES: TxCodeLanguage[] = ['html', 'css', 'javascript', 'typescript', 'json', 'markdown', 'plain'];

const PIECES = [
  '<div class="a">', '</div>', '<!--', '-->', '<script>', '</script>', '<style>', '</style>', '<?xml', '?>', '<![CDATA[', ']]>',
  '{', '}', '(', ')', '[', ']', ';', ':', ',', '.', '=', '=>', '/', '*', '/*', '*/', '//', '\\', '"', "'", '`', '${', '#', '@media',
  'const', 'let', 'function', 'return', 'class', 'interface', 'type', 'import', 'export', 'true', 'null', '0x1F', '1e3', '42',
  '/ab+c/gi', 'color: red', '!important', 'url(', '# Heading', '**bold**', '_em_', '[link](http://x)', '```', '> quote', '- item',
  ' ', '\t', '\n', '\r\n', 'é', '👋', 'Привіт',
];

const source = fc.oneof(
  fc.array(fc.constantFrom(...PIECES), { maxLength: 60 }).map((parts) => parts.join('')),
  fc.string({ unit: 'binary', maxLength: 200 }),
);

describe('highlightCode properties', () => {
  it('returns ordered, non-overlapping, non-empty tokens inside every line for any input', () => {
    fc.assert(
      fc.property(source, fc.constantFrom(...LANGUAGES), (code, language) => {
        const lines = splitCodeLines(code);
        const tokens = highlightCode(code, language);
        expect(tokens).toHaveLength(lines.length);
        tokens.forEach((line, index) => {
          let end = 0;
          for (const token of line) {
            expect(token.from).toBeGreaterThanOrEqual(end);
            expect(token.to).toBeGreaterThan(token.from);
            expect(token.to).toBeLessThanOrEqual(lines[index].length);
            end = token.to;
          }
        });
      }),
      { numRuns: 300 },
    );
  });

  it('gives the same tokens for the same input', () => {
    fc.assert(
      fc.property(source, fc.constantFrom(...LANGUAGES), (code, language) => {
        expect(highlightCode(code, language)).toEqual(highlightCode(code, language));
      }),
    );
  });
});

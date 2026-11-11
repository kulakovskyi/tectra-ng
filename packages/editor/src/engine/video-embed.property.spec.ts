import fc from 'fast-check';
import { toVideoEmbed } from './schema';

const PARTS = [
  'https://', 'http://', 'javascript:', 'data:text/html,', '//', 'www.', 'm.', 'youtube.com', 'youtu.be', 'youtube-nocookie.com',
  'vimeo.com', 'player.vimeo.com', 'evil.example', '@', ':', '/', '/watch', '/embed/', '/shorts/', '/video/', '?v=', '&v=', '#',
  'dQw4w9WgXcQ', '76979871', '"', "'", '<', '>', ' ', '\t', '\n', '%20', '%0a', '\\', 'onerror=', 'alert(1)',
];

const urls = fc.oneof(
  fc.array(fc.constantFrom(...PARTS), { maxLength: 12 }).map((parts) => parts.join('')),
  fc.webUrl({ withQueryParameters: true, withFragments: true }),
  fc.string({ unit: 'binary', maxLength: 120 }),
);

describe('toVideoEmbed properties', () => {
  it('returns only an https address without whitespace, or nothing', () => {
    fc.assert(
      fc.property(urls, (value) => {
        const embed = toVideoEmbed(value);
        if (embed !== null) {
          expect(embed).toMatch(/^https:\/\/\S+$/i);
        }
      }),
      { numRuns: 500 },
    );
  });

  it('rewrites known video hosts only to their embed players', () => {
    fc.assert(
      fc.property(urls, (value) => {
        const embed = toVideoEmbed(value);
        if (embed && embed !== value.trim()) {
          expect(embed).toMatch(/^https:\/\/(www\.youtube\.com\/embed\/[\w-]+|player\.vimeo\.com\/video\/\d+)$/);
        }
      }),
      { numRuns: 500 },
    );
  });
});

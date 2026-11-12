import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxCapitalizePipe, TxHttpPrefixPipe, TxTruncatePipe, capitalize, escapeHtml, normalizeKeyword, slugify, transliterate, truncate, withHttpPrefix } from './text';

@Component({
  imports: [TxTruncatePipe, TxCapitalizePipe, TxHttpPrefixPipe],
  template: `{{ 'abcdef' | txTruncate: 3 }}|{{ 'kyiv' | txCapitalize }}|{{ 'example.com' | txHttpPrefix }}`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TextHost {}

describe('text', () => {
  it('truncates at the end or in the middle, by characters', () => {
    expect(truncate('Quarterly report for the board', 9)).toBe('Quarterly...');
    expect(truncate('short', 9)).toBe('short');
    expect(truncate('', 9)).toBe('-');
    expect(truncate(null, 9, '…', 'end', '')).toBe('');
    expect(truncate('https://example.com/a/very/long/path/file.pdf', 16, '…', 'middle')).toBe('https://…file.pdf');
    expect(truncate('👍👍👍👍', 2)).toBe('👍👍...');
    expect(new TxTruncatePipe().transform('abcdef', 3)).toBe('abc...');
  });

  it('capitalizes and normalizes keywords', () => {
    expect(capitalize('ready')).toBe('Ready');
    expect(capitalize('їжак')).toBe('Їжак');
    expect(capitalize(null)).toBe('');
    expect(new TxCapitalizePipe().transform('a')).toBe('A');
    expect(normalizeKeyword('  Running Shoes ')).toBe('running shoes');
  });

  it('adds a protocol only when missing', () => {
    expect(withHttpPrefix('example.com')).toBe('https://example.com');
    expect(withHttpPrefix('//cdn.example.com/a.js')).toBe('https://cdn.example.com/a.js');
    expect(withHttpPrefix('http://example.com')).toBe('http://example.com');
    expect(withHttpPrefix('mailto:ann@example.com')).toBe('mailto:ann@example.com');
    expect(withHttpPrefix('example.com', 'http')).toBe('http://example.com');
    expect(new TxHttpPrefixPipe().transform(undefined)).toBe('');
  });

  it('transliterates Cyrillic and makes slugs', () => {
    expect(transliterate('Щука і Їжак')).toBe('Shchuka i Yizhak');
    expect(slugify('Привіт, світе! Hello — World')).toBe('privit-svite-hello-world');
    expect(slugify('Crème brûlée', '_')).toBe('creme_brulee');
  });

  it('escapes HTML', () => {
    expect(escapeHtml(`<a href="x">Tom & 'Jerry'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;Tom &amp; &#39;Jerry&#39;&lt;/a&gt;');
  });

  it('keeps only the head when the middle limit is one character', () => {
    expect(truncate('abcdef', 1, '…', 'middle')).toBe('a…');
    expect(normalizeKeyword(null)).toBe('');
  });

  it('works as template pipes', () => {
    const fixture = TestBed.createComponent(TextHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toBe('abc...|Kyiv|https://example.com');
  });
});

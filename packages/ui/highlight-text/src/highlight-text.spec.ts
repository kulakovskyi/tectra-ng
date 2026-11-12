import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { highlightParts } from './highlight-parts';
import { TxHighlightText } from './highlight-text.component';
import { TxHighlightTerms } from './highlight-text.types';

@Component({
  imports: [TxHighlightText],
  template: `<tx-highlight-text [text]="text()" [highlight]="terms()" [pt]="{ mark: { class: 'own' } }" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly text = signal<string | number | null>('Café <b>Kyiv</b> and cafe Lviv');
  readonly terms = signal<TxHighlightTerms>('cafe');
}

describe('highlightParts', () => {
  it('ignores case and accents and keeps the original text', () => {
    expect(highlightParts('Café and CAFE', 'cafe')).toEqual([
      { text: 'Café', match: true },
      { text: ' and ', match: false },
      { text: 'CAFE', match: true },
    ]);
  });

  it('keeps combining marks with their letter and merges several terms', () => {
    expect(highlightParts('Café Lviv', ['café', 'lv', 'viv'])).toEqual([
      { text: 'Café', match: true },
      { text: ' ', match: false },
      { text: 'Lviv', match: true },
    ]);
  });

  it('matches the case when asked, and returns the text without terms', () => {
    expect(highlightParts('Kyiv kyiv', 'kyiv', { caseSensitive: true }).filter((part) => part.match)).toEqual([{ text: 'kyiv', match: true }]);
    expect(highlightParts('Kyiv', '  ')).toEqual([{ text: 'Kyiv', match: false }]);
    expect(highlightParts('', 'a')).toEqual([]);
    expect(highlightParts(null, 'a')).toEqual([]);
    expect(highlightParts('Kyiv', null)).toEqual([{ text: 'Kyiv', match: false }]);
  });
});

describe('TxHighlightText', () => {
  let fixture: ComponentFixture<Host>;
  const marks = () => Array.from(fixture.nativeElement.querySelectorAll('mark') as NodeListOf<HTMLElement>);

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('wraps matches in marks and never renders the text as HTML', async () => {
    expect(marks().map((mark) => mark.textContent)).toEqual(['Café', 'cafe']);
    expect(marks()[0].classList).toContain('own');
    expect(fixture.nativeElement.querySelector('b')).toBeNull();
    expect(fixture.nativeElement.textContent).toBe('Café <b>Kyiv</b> and cafe Lviv');
    fixture.componentInstance.terms.set(['kyiv', 'lviv']);
    await fixture.whenStable();
    expect(marks().map((mark) => mark.textContent)).toEqual(['Kyiv', 'Lviv']);
  });

  it('shows numbers and nothing for a missing text', async () => {
    fixture.componentInstance.text.set(2026);
    fixture.componentInstance.terms.set('20');
    await fixture.whenStable();
    expect(marks().map((mark) => mark.textContent)).toEqual(['20']);
    fixture.componentInstance.text.set(null);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toBe('');
  });
});


import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { plural, pluralCategory, pluralForm } from './plural.functions';
import { TxPluralFormPipe, TxPluralPipe } from './plural.pipe';

@Component({
  imports: [TxPluralFormPipe, TxPluralPipe],
  template: `<span class="form">{{ count() | txPluralForm }}</span><span class="text">{{ count() | txPlural: template }}</span>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PluralHost {
  readonly count = signal(1);
  readonly template = '{count, plural, one {# file} few {# файли} many {# файлів} other {# files}}';
}

describe('plural', () => {
  it('maps plural rules to one / few / many', () => {
    expect(pluralForm(1, 'en-US')).toBe('one');
    expect(pluralForm(5, 'en-US')).toBe('many');
    expect(pluralForm(0, 'en-US')).toBe('many');
    expect(pluralForm(1, 'uk-UA')).toBe('one');
    expect(pluralForm(3, 'uk-UA')).toBe('few');
    expect(pluralForm(11, 'uk-UA')).toBe('many');
    expect(pluralForm(21, 'uk-UA')).toBe('one');
    expect(pluralForm(1.5, 'uk-UA')).toBe('many');
    expect(pluralCategory(1.5, 'uk-UA')).toBe('other');
  });

  it('picks a text by exact value, category and fallback', () => {
    const forms = { '=0': 'No files', one: '# file', few: '# файли', many: '# файлів', other: '# files' };
    expect(plural(0, forms)).toBe('No files');
    expect(plural(1, forms)).toBe('1 file');
    expect(plural(7, forms)).toBe('7 files');
    expect(plural(3, forms, 'uk-UA')).toBe('3 файли');
    expect(plural(5, forms, 'uk-UA')).toBe('5 файлів');
    expect(plural(2, { many: '# items' })).toBe('2 items');
    expect(plural(2, '{count, plural, one {# row} other {# rows}}')).toBe('2 rows');
  });

  it('follows the tectra locale in templates', async () => {
    const fixture = TestBed.createComponent(PluralHost);
    fixture.detectChanges();
    const text = (selector: string) => (fixture.nativeElement as HTMLElement).querySelector(selector)?.textContent;
    expect(text('.form')).toBe('one');
    expect(text('.text')).toBe('1 file');

    fixture.componentInstance.count.set(3);
    fixture.detectChanges();
    expect(text('.form')).toBe('many');
    expect(text('.text')).toBe('3 files');

    await TestBed.inject(TxLocaleService).setLocale('ua');
    fixture.detectChanges();
    expect(text('.form')).toBe('few');
    expect(text('.text')).toBe('3 файли');
  });
});

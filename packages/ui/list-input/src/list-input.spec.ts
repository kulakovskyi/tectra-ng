import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { provideTxTooltip } from '@tectra-ng/ui/tooltip';
import { TxListInput } from './list-input.component';
import { TX_LIST_INPUT_PARSERS, txParseDomain, txParseEmail, txParseList, txParseText, txParseUrl } from './list-input.parsers';
import { TxListInputResult } from './list-input.types';

@Component({
  imports: [TxListInput, ReactiveFormsModule],
  template: `
    <tx-list-input
      id="domains"
      type="domain"
      [(text)]="text"
      [invalidLimit]="2"
      [disabled]="locked()"
      [dt]="{ field: { minHeight: '90px' } }"
      [pt]="{ footer: { class: 'own-footer' } }"
      (itemsChange)="items = $event"
      (parsedChange)="parsed = $event"
    />
    <tx-list-input id="form" type="email" [formControl]="emails" ariaLabel="Recipients" />
    <tx-list-input id="ids" [parser]="toId" splitByLines countLabel="{count, plural, one {# id} other {# ids}}" readonly text="12, 7&#10;abc&#10;12" />
    <tx-list-input id="plain" unstyled />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly text = signal('');
  readonly locked = signal(false);
  readonly emails = new FormControl<string[]>(['ann@example.com']);
  items: string[] = [];
  parsed: TxListInputResult | null = null;
  readonly toId = (token: string) => (/^\d+$/.test(token) ? token : null);
}

describe('TxListInput', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const field = (id: string) => el(`#${id} textarea`) as HTMLTextAreaElement;
  const type = async (id: string, value: string) => {
    field(id).value = value;
    field(id).dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const buttons = (id: string) => Array.from(el(`#${id}`).querySelectorAll('button')) as HTMLButtonElement[];
  const pills = (id: string, part = 'footer') => Array.from(el(`#${id} .tx-list-input__${part}`).querySelectorAll('tx-pill')).map((pill) => pill.textContent?.trim());

  beforeEach(async () => {
    TestBed.configureTestingModule({ providers: [provideTxTooltip({ showDelay: 0 })] });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('parses domains, emails, links and own items', () => {
    expect(txParseDomain('HTTPS://Sub.Example.com:8080/path?q=1')).toBe('sub.example.com');
    expect(txParseDomain('example.com.')).toBe('example.com');
    expect(txParseDomain('приклад.укр')).toBe('приклад.укр');
    expect(txParseDomain('localhost')).toBeNull();
    expect(txParseDomain('-bad.com')).toBeNull();
    expect(txParseEmail('mailto:Ann@Example.COM')).toBe('ann@example.com');
    expect(txParseEmail('<bo@mail.org>')).toBe('bo@mail.org');
    expect(txParseEmail('no-at.example.com')).toBeNull();
    expect(txParseEmail('a b@example.com')).toBeNull();
    expect(txParseUrl('example.com')).toBe('https://example.com');
    expect(txParseUrl('http://example.com/a?b=1#c')).toBe('http://example.com/a?b=1#c');
    expect(txParseUrl('ftp://example.com')).toBeNull();
    expect(txParseUrl('not a url')).toBeNull();
    expect(txParseList('a.com b.com, a.com; nope', txParseDomain)).toEqual({ items: ['a.com', 'b.com'], invalid: ['nope'], duplicates: 1 });
    expect(TX_LIST_INPUT_PARSERS.text).toBe(txParseText);
    expect(txParseList('one two one', txParseText)).toEqual({ items: ['one', 'two'], invalid: [], duplicates: 1 });
    expect(txParseList(null, txParseText)).toEqual({ items: [], invalid: [], duplicates: 0 });
  });

  it('counts items, duplicates and unrecognized lines as the user types', async () => {
    const domains = el('#domains');
    expect(domains.querySelector('.tx-list-input__hint')?.textContent).toContain('Paste domains or URLs');
    expect(field('domains').getAttribute('placeholder')).toBe('example.com, another.org or one domain per line');
    expect(field('domains').hasAttribute('aria-label')).toBe(false);
    expect(field('domains').hasAttribute('id')).toBe(false);
    expect(buttons('domains')).toHaveLength(0);

    await type('domains', 'https://one.com/page two.com\none.com bad_value x y z');
    expect(pills('domains')).toEqual(['2 domains', '1 duplicate', '4 not recognized']);
    expect(pills('domains', 'invalid')).toEqual(['bad_value', 'x']);
    expect(el('#domains .tx-list-input__invalid .tx-list-input__hint').textContent?.trim()).toBe('+2 more');
    expect(fixture.componentInstance.items).toEqual(['one.com', 'two.com']);
    expect(fixture.componentInstance.parsed?.duplicates).toBe(1);
    expect(fixture.componentInstance.text()).toContain('bad_value');
    expect(domains.classList).toContain('tx-list-input--filled');
    expect(field('domains').getAttribute('aria-describedby')).toBe(el('#domains .tx-list-input__stats').id);

    await type('domains', 'one.com');
    expect(pills('domains')).toEqual(['1 domain']);
    expect(el('#domains .tx-list-input__invalid')).toBeNull();
  });

  it('cleans up to one item per line and clears', async () => {
    await type('domains', 'b.com, a.com b.com junk');
    const [cleanUp, clear] = buttons('domains');
    expect(cleanUp.textContent).toContain('Clean up');
    expect(clear.textContent).toContain('Clear');
    cleanUp.click();
    await fixture.whenStable();
    expect(field('domains').value).toBe('b.com\na.com');
    expect(fixture.componentInstance.text()).toBe('b.com\na.com');
    expect(document.activeElement).toBe(field('domains'));
    expect(buttons('domains').map((button) => button.textContent?.trim())).toEqual(['Clear']);
    buttons('domains')[0].click();
    await fixture.whenStable();
    expect(field('domains').value).toBe('');
    expect(fixture.componentInstance.items).toEqual([]);
    expect(buttons('domains')).toHaveLength(0);
  });

  it('works as a form control with the parsed array as its value', async () => {
    const emails = fixture.componentInstance.emails;
    expect(field('form').value).toBe('ann@example.com');
    expect(field('form').getAttribute('aria-label')).toBe('Recipients');
    await type('form', 'ann@example.com, Bo@Example.org nope');
    expect(emails.value).toEqual(['ann@example.com', 'bo@example.org']);
    expect(field('form').value).toBe('ann@example.com, Bo@Example.org nope');
    expect(pills('form')).toEqual(['2 emails', '1 not recognized']);
    field('form').dispatchEvent(new Event('blur'));
    expect(emails.touched).toBe(true);
    emails.setValue(['c@example.net', 'd@example.net']);
    await fixture.whenStable();
    expect(field('form').value).toBe('c@example.net\nd@example.net');
    emails.setValue(['c@example.net', 'd@example.net']);
    await fixture.whenStable();
    expect(field('form').value).toBe('c@example.net\nd@example.net');
    emails.setValue(null);
    await fixture.whenStable();
    expect(field('form').value).toBe('');
    emails.disable();
    await fixture.whenStable();
    expect(field('form').disabled).toBe(true);
    expect(el('#form').classList).toContain('tx-list-input--disabled');
    expect(el('#form').getAttribute('aria-disabled')).toBe('true');
    expect(el('#form').getAttribute('role')).toBe('group');
    emails.enable();
    await fixture.whenStable();
    expect(el('#form').hasAttribute('aria-disabled')).toBe(false);
    expect(el('#form').hasAttribute('role')).toBe(false);
    emails.setErrors({ required: true });
    emails.markAsTouched();
    fixture.componentInstance.locked.set(true);
    await fixture.whenStable();
    expect(field('domains').disabled).toBe(true);
  });

  it('uses an own parser, splits by lines, counts with plural forms and stays read-only', async () => {
    expect(field('ids').readOnly).toBe(true);
    expect(pills('ids')).toEqual(['2 ids', '1 duplicate', '1 not recognized']);
    expect(el('#ids .tx-list-input__actions')).toBeNull();
    await TestBed.inject(TxLocaleService).setLocale('ua');
    await fixture.whenStable();
    expect(pills('ids')[1]).toBe('1 дублікат');
    await type('domains', 'a.com b.com c.com d.com e.com');
    expect(pills('domains')[0]).toBe('5 доменів');
  });

  it('takes design tokens and pass-through, and drops its styles when unstyled', () => {
    expect(el('#domains').style.getPropertyValue('--tx-list-input-field-min-height')).toBe('90px');
    expect(el('#domains .tx-list-input__footer').classList).toContain('own-footer');
    expect(el('#domains').hasAttribute('data-styled')).toBe(true);
    expect(el('#domains').getAttribute('data-type')).toBe('domain');
    expect(el('#plain').hasAttribute('data-styled')).toBe(false);
  });
});

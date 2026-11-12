import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxEmailSuggestion } from './email-suggestion.component';
import { editDistance, suggestEmail } from './suggest-email';

describe('suggestEmail', () => {
  it('completes the company domain', () => {
    expect(suggestEmail('olena', ['example.com'])).toEqual({ email: 'olena@example.com', kind: 'complete' });
    expect(suggestEmail('olena@', ['@example.com'])).toEqual({ email: 'olena@example.com', kind: 'complete' });
    expect(suggestEmail('olena@exa', ['example.com', 'example.org'])).toEqual({ email: 'olena@example.com', kind: 'complete' });
    expect(suggestEmail('olena@example.com', ['example.com'])).toBeNull();
    expect(suggestEmail('olena', [])).toBeNull();
  });

  it('fixes typos in common domains', () => {
    expect(suggestEmail('taras@gmial.com', [])).toEqual({ email: 'taras@gmail.com', kind: 'typo' });
    expect(suggestEmail('taras@hotmial.con', [])).toEqual({ email: 'taras@hotmail.com', kind: 'typo' });
    expect(suggestEmail('taras@company.io', [])).toBeNull();
    expect(suggestEmail('bad value@', ['example.com'])).toBeNull();
    expect(editDistance('kitten', 'sitting')).toBe(3);
  });

  it('allows one typo in short domains and ignores very short or empty input', () => {
    expect(suggestEmail('a@xy.co', [], ['xy.com'])).toEqual({ email: 'a@xy.com', kind: 'typo' });
    expect(suggestEmail('a@ab.io', [], ['ab.com'])).toBeNull();
    expect(suggestEmail('a@gm', [])).toBeNull();
    expect(suggestEmail(null, ['example.com'])).toBeNull();
  });
});

@Component({
  imports: [TxEmailSuggestion],
  template: `<tx-email-suggestion [value]="value()" [domain]="'example.com'" (applied)="applied = $event" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly value = signal('');
  applied = '';
}

describe('TxEmailSuggestion', () => {
  it('offers the fix in a live region and applies it', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('tx-email-suggestion') as HTMLElement;
    expect(root.getAttribute('role')).toBe('status');
    expect(root.querySelector('button')).toBeNull();
    fixture.componentInstance.value.set('iryna@gmal.com');
    fixture.detectChanges();
    expect(root.textContent?.trim()).toBe('Did you mean iryna@gmail.com?');
    fixture.componentInstance.value.set('iryna');
    fixture.detectChanges();
    const button = root.querySelector('button') as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('Use iryna@example.com');
    button.click();
    expect(fixture.componentInstance.applied).toBe('iryna@example.com');
  });
});

@Component({
  imports: [TxEmailSuggestion],
  template: `<tx-email-suggestion value="anna" [domain]="['team.dev', 'example.com']" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class DomainsHost {}

describe('TxEmailSuggestion with several domains', () => {
  it('completes with the first own domain', () => {
    const fixture = TestBed.createComponent(DomainsHost);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tx-email-suggestion button')?.textContent?.trim()).toBe('Use anna@team.dev');
  });
});


import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxPasswordContentTemplate, TxPasswordFooterTemplate, TxPasswordHeaderTemplate } from './password-templates.directive';
import { TxPassword } from './password.component';
import { TxPasswordStrength } from './password.types';

@Component({
  imports: [TxPassword, TxPasswordContentTemplate, ReactiveFormsModule],
  template: `
    <tx-password
      id="pwd"
      [formControl]="password"
      [feedback]="true"
      [toggleMask]="true"
      [showClear]="true"
      placeholder="Password"
      autocomplete="new-password"
      [strongLabel]="strongLabel()"
      [dt]="{ meter: { height: '8px' } }"
      [pt]="{ input: { class: 'own-input' } }"
      (strengthChange)="strengths.push($event)"
    >
      <ng-template txPasswordContent let-value="value"><p class="rule">{{ value.length }} characters</p></ng-template>
    </tx-password>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly password = new FormControl('', Validators.required);
  readonly strongLabel = signal<string | undefined>(undefined);
  strengths: (TxPasswordStrength | null)[] = [];
}

describe('TxPassword', () => {
  let fixture: ComponentFixture<Host>;
  const input = () => fixture.nativeElement.querySelector('#pwd input') as HTMLInputElement;
  const panel = () => document.querySelector('.tx-password__panel') as HTMLElement | null;
  const type = async (value: string) => {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('is a masked input with the native attributes', () => {
    expect(input().type).toBe('password');
    expect(input().getAttribute('autocomplete')).toBe('new-password');
    expect(input().placeholder).toBe('Password');
    expect(input().classList).toContain('tx-input');
    expect(input().classList).toContain('own-input');
  });

  it('writes the typed value to the form and back', async () => {
    await type('secret');
    expect(fixture.componentInstance.password.value).toBe('secret');
    fixture.componentInstance.password.setValue('from form');
    await fixture.whenStable();
    expect(input().value).toBe('from form');
    expect(fixture.nativeElement.querySelector('#pwd').classList).toContain('tx-password--filled');
  });

  it('shows and hides the password', async () => {
    const toggle = fixture.nativeElement.querySelector('.tx-password__toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-label')).toBe('Show password');
    expect(toggle.getAttribute('aria-pressed')).toBe('false');
    toggle.click();
    await fixture.whenStable();
    expect(input().type).toBe('text');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
  });

  it('opens the meter on focus and grades the password', async () => {
    input().dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(panel()?.querySelector('.tx-password__info')?.textContent?.trim()).toBe('Enter a password');
    expect(input().getAttribute('aria-describedby')).toBe(panel()?.querySelector('.tx-password__info')?.id);
    await type('abc');
    expect(panel()?.querySelector('.tx-password__meter')?.getAttribute('data-strength')).toBe('weak');
    await type('abc123');
    expect(panel()?.querySelector('.tx-password__meter')?.getAttribute('data-strength')).toBe('medium');
    fixture.componentInstance.strongLabel.set('Great');
    await type('Abc12345');
    expect(panel()?.querySelector('.tx-password__info')?.textContent?.trim()).toBe('Great');
    expect(panel()?.querySelector('.rule')?.textContent).toBe('8 characters');
    expect(fixture.componentInstance.strengths).toEqual(['weak', 'medium', 'strong']);
    input().dispatchEvent(new Event('blur'));
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(fixture.componentInstance.password.touched).toBe(true);
  });

  it('clears the value', async () => {
    await type('secret');
    (fixture.nativeElement.querySelector('.tx-password__clear') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.password.value).toBe('');
    expect(fixture.nativeElement.querySelector('.tx-password__clear')).toBeNull();
  });

  it('turns invalid and disabled from the form control', async () => {
    fixture.componentInstance.password.markAsTouched();
    await fixture.whenStable();
    expect(input().getAttribute('aria-invalid')).toBe('true');
    fixture.componentInstance.password.disable();
    await fixture.whenStable();
    expect(input().disabled).toBe(true);
  });

  it('keeps one meter open on a second focus and names a strong password by default', async () => {
    input().dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    input().dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(document.querySelectorAll('.tx-password__panel')).toHaveLength(1);
    await type('Abc12345');
    expect(panel()?.querySelector('.tx-password__info')?.textContent?.trim()).toBe('Strong');
  });

  it('fills a value, revealing it unless asked not to, and shows an empty value for null', async () => {
    const password = fixture.debugElement.query((node) => node.componentInstance instanceof TxPassword).componentInstance as TxPassword;
    password.fill('generated-1', false);
    await fixture.whenStable();
    expect(fixture.componentInstance.password.value).toBe('generated-1');
    expect(input().type).toBe('password');
    password.fill('generated-2');
    await fixture.whenStable();
    expect(input().type).toBe('text');
    fixture.componentInstance.password.setValue(null);
    await fixture.whenStable();
    expect(input().value).toBe('');
  });
});

@Component({
  imports: [TxPassword, TxPasswordHeaderTemplate, TxPasswordFooterTemplate],
  template: `
    <tx-password id="rules" feedback mediumRegex="^.{4,}$" [strongRegex]="strong" ariaLabel="Rules">
      <ng-template txPasswordHeader><p class="own-header">Pick a password</p></ng-template>
      <ng-template txPasswordFooter><p class="own-footer">No reuse</p></ng-template>
    </tx-password>
    <tx-password id="locked" feedback readonly ariaLabel="Locked" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RulesHost {
  readonly strong = /^.{10,}$/;
}

describe('TxPassword with own rules', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('grades by string patterns, shows own header and footer and opens no meter when readonly', async () => {
    const fixture = TestBed.createComponent(RulesHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const locked = fixture.nativeElement.querySelector('#locked input') as HTMLInputElement;
    locked.dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(document.querySelector('.tx-password__panel')).toBeNull();
    const input = fixture.nativeElement.querySelector('#rules input') as HTMLInputElement;
    input.dispatchEvent(new Event('focus'));
    input.value = 'abcd';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    const panel = document.querySelector('.tx-password__panel') as HTMLElement;
    expect(panel.querySelector('.tx-password__meter')?.getAttribute('data-strength')).toBe('medium');
    expect(panel.querySelector('.own-header')).not.toBeNull();
    expect(panel.querySelector('.own-footer')).not.toBeNull();
  });
});

describe('TxPassword recompiled by TestBed', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('still finds its panel templates when a test overrides the component', async () => {
    TestBed.overrideComponent(TxPassword, { set: { styles: [] } });
    const fixture = TestBed.createComponent(RulesHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('#rules input') as HTMLInputElement).dispatchEvent(new Event('focus'));
    await fixture.whenStable();
    expect(document.querySelector('.tx-password__panel .own-header')).not.toBeNull();
  });
});


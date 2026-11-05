import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxPasswordContentTemplate } from './password-templates.directive';
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
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxInput } from '@tectra/ui/input';
import { TxRadioButton, TxRadioGroup } from '@tectra/ui/radio-button';
import { TxSelect } from '@tectra/ui/select';
import { TxField } from './field.component';
import { TxFieldLayout } from './field.types';

@Component({
  imports: [TxField, TxInput, TxSelect, TxRadioGroup, TxRadioButton, ReactiveFormsModule],
  template: `
    <form [formGroup]="form">
      <tx-field
        id="email-field"
        label="Email"
        [required]="true"
        hint="We never share it"
        [errorText]="serverError()"
        [layout]="layout()"
        [dt]="{ horizontal: { labelWidth: '120px' } }"
        [pt]="{ label: { class: 'own-label' } }"
      >
        <input txInput formControlName="email" />
      </tx-field>
      <tx-field id="name-field" label="Name">
        <input txInput id="own-id" formControlName="name" />
      </tx-field>
      <tx-field id="plan-field" label="Plan">
        <tx-select [options]="plans" formControlName="plan" />
      </tx-field>
      <tx-field id="size-field" label="Size" hint="Pick one">
        <tx-radio-group formControlName="size">
          <tx-radio-button value="s" label="S" />
          <tx-radio-button value="m" label="M" />
        </tx-radio-group>
      </tx-field>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly form = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    name: new FormControl(''),
    plan: new FormControl<unknown>(null),
    size: new FormControl<string | null>(null),
  });
  readonly plans = [{ label: 'Free' }, { label: 'Team' }];
  readonly serverError = signal<string | undefined>(undefined);
  readonly layout = signal<TxFieldLayout>('vertical');
}

describe('TxField', () => {
  let fixture: ComponentFixture<Host>;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('gives the control an id, points the label at it and links hint and error', () => {
    const input = query('#email-field input');
    const label = query('#email-field label');
    expect(input.id).toMatch(/^tx-field-\d+-control$/);
    expect(label.getAttribute('for')).toBe(input.id);
    expect(label.textContent).toContain('Email');
    expect(query('#email-field .tx-label__required')).not.toBeNull();
    const describedBy = input.getAttribute('aria-describedby')?.split(' ') ?? [];
    expect(describedBy).toContain(query('#email-field tx-field-hint').id);
    expect(describedBy).toContain(query('#email-field tx-field-error').id);
  });

  it('keeps an own id and finds a tx-select trigger', () => {
    expect(query('#name-field label').getAttribute('for')).toBe('own-id');
    const trigger = query('#plan-field [role="combobox"]');
    expect(trigger.id).toBeTruthy();
    expect(query('#plan-field label').getAttribute('for')).toBe(trigger.id);
  });

  it('names a group with aria-labelledby instead of pointing for at the first option', () => {
    const group = query('#size-field [role="radiogroup"]');
    const label = query('#size-field tx-label');
    expect(group.getAttribute('aria-labelledby')).toBe(label.id);
    expect(query('#size-field label.tx-label__text').getAttribute('for')).toBeNull();
    expect(group.getAttribute('aria-describedby')?.split(' ')).toContain(query('#size-field tx-field-hint').id);
  });

  it('shows the error of the projected control after touch', async () => {
    fixture.componentInstance.form.controls.email.markAsTouched();
    await fixture.whenStable();
    expect(query('#email-field tx-field-error').textContent?.trim()).toBe('This field is required');
    expect(query('#email-field input').getAttribute('aria-invalid')).toBe('true');
  });

  it('shows an error from outside the form and marks the control invalid', async () => {
    fixture.componentInstance.form.controls.email.setValue('ann@site.dev');
    fixture.componentInstance.serverError.set('This email is already registered');
    await fixture.whenStable();
    expect(query('#email-field tx-field-error').textContent?.trim()).toBe('This email is already registered');
    expect(query('#email-field input').getAttribute('aria-invalid')).toBe('true');
  });

  it('switches the layout and applies dt and pt', async () => {
    fixture.componentInstance.layout.set('horizontal');
    await fixture.whenStable();
    const field = query('#email-field');
    expect(field.getAttribute('data-layout')).toBe('horizontal');
    expect(field.style.getPropertyValue('--tx-field-horizontal-label-width')).toBe('120px');
    expect(query('#email-field tx-label').classList).toContain('own-label');
  });
});

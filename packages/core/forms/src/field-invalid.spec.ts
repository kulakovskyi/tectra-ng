import { ChangeDetectionStrategy, Component, Directive, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectFieldInvalid } from './field-invalid';
import { TX_FIELD_STATE } from './field-state';

@Directive({ selector: '[testField]', host: { '[attr.data-invalid]': 'isInvalid()' } })
class TestField {
  readonly invalid = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly isInvalid = injectFieldInvalid(this.invalid);
}

@Component({
  imports: [TestField, ReactiveFormsModule],
  template: `<input testField [formControl]="control" /><input testField id="forced" [invalid]="true" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly control = new FormControl('', Validators.required);
}

describe('injectFieldInvalid', () => {
  it('turns invalid only after the control is touched', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(field.getAttribute('data-invalid')).toBe('false');
    fixture.componentInstance.control.markAsTouched();
    await fixture.whenStable();
    expect(field.getAttribute('data-invalid')).toBe('true');
    fixture.componentInstance.control.setValue('ok');
    await fixture.whenStable();
    expect(field.getAttribute('data-invalid')).toBe('false');
  });

  it('lets the input win', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect((fixture.nativeElement.querySelector('#forced') as HTMLElement).getAttribute('data-invalid')).toBe('true');
  });

  it('follows the invalid state of a wrapping field', async () => {
    const invalid = signal(false);
    TestBed.configureTestingModule({ providers: [{ provide: TX_FIELD_STATE, useValue: { invalid } }] });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(field.getAttribute('data-invalid')).toBe('false');
    invalid.set(true);
    await fixture.whenStable();
    expect(field.getAttribute('data-invalid')).toBe('true');
  });
});

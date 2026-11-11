import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxSelect } from '@tectra-ng/ui/select';
import { firstInvalidElement, focusTarget, markAllTouched } from './form-validation.functions';
import { TxFormValidation } from './form-validation.service';
import { TxScrollToInvalid } from './scroll-to-invalid.directive';

@Component({
  imports: [ReactiveFormsModule, TxScrollToInvalid, TxSelect],
  template: `
    <form [formGroup]="form" txScrollToInvalid (invalidSubmit)="invalid = invalid + 1" (validSubmit)="valid = valid + 1">
      <input formControlName="name" aria-label="Name" />
      <div formGroupName="address" class="group">
        <input formControlName="city" aria-label="City" />
      </div>
      <tx-select class="custom" formControlName="role" ariaLabel="Role" [options]="['admin', 'editor']" />
      <button type="submit">Save</button>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormHost {
  invalid = 0;
  valid = 0;
  readonly form = new FormGroup({
    name: new FormControl('Ann', { nonNullable: true }),
    address: new FormGroup({ city: new FormControl('', Validators.required) }),
    role: new FormControl<string | null>(null, Validators.required),
  });
}

describe('form validation', () => {
  beforeEach(() => {
    Element.prototype.scrollIntoView = vi.fn();
  });

  it('marks nested groups and arrays touched and dirty', () => {
    const form = new FormGroup({ list: new FormArray([new FormControl('')]), group: new FormGroup({ a: new FormControl('') }) });
    markAllTouched(form);
    expect(form.get('list.0')?.touched && form.get('list.0')?.dirty).toBe(true);
    expect(form.get('group.a')?.touched && form.get('group.a')?.dirty).toBe(true);
  });

  it('finds the first invalid leaf and the element to focus', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    expect(firstInvalidElement(root)?.getAttribute('aria-label')).toBe('City');
    expect(focusTarget(root.querySelector('.custom') as HTMLElement).getAttribute('aria-label')).toBe('Role');
  });

  it('scrolls to the first invalid field and focuses it', () => {
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const found = TestBed.inject(TxFormValidation).scrollToFirstInvalid(fixture.componentInstance.form, { scope: root });
    const city = root.querySelector('[aria-label="City"]') as HTMLElement;
    expect(found).toBe(true);
    expect(city.scrollIntoView).toHaveBeenCalled();
    expect(document.activeElement).toBe(city);
    expect(fixture.componentInstance.form.get('role')?.touched).toBe(true);
  });

  it('scrolls on submit of an invalid form and reports valid submits', () => {
    const fixture = TestBed.createComponent(FormHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const submit = () => root.querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    submit();
    expect(fixture.componentInstance.invalid).toBe(1);
    expect(document.activeElement?.getAttribute('aria-label')).toBe('City');

    fixture.componentInstance.form.patchValue({ address: { city: 'Lviv' } });
    fixture.detectChanges();
    submit();
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Role');

    fixture.componentInstance.form.patchValue({ role: 'admin' });
    submit();
    expect(fixture.componentInstance.valid).toBe(1);
    fixture.nativeElement.remove();
  });
});

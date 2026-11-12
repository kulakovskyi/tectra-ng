import { ChangeDetectionStrategy, Component, PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AsyncValidatorFn, FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NEVER } from 'rxjs';
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

@Component({
  imports: [ReactiveFormsModule, TxScrollToInvalid],
  template: `
    <form [formGroup]="form" txScrollToInvalid (invalidSubmit)="invalid = invalid + 1" (validSubmit)="valid = valid + 1">
      <input formControlName="name" aria-label="Name" />
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PendingHost {
  invalid = 0;
  valid = 0;
  private readonly checkLater: AsyncValidatorFn = () => NEVER;
  readonly form = new FormGroup({ name: new FormControl('Ann', { asyncValidators: this.checkLater }) });
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

  it('finds nothing in a valid scope and focuses an element without focusable children itself', () => {
    const scope = document.createElement('div');
    scope.innerHTML = '<span class="ng-invalid">Note</span>';
    const note = scope.querySelector('span') as HTMLElement;
    expect(focusTarget(note)).toBe(note);
    expect(firstInvalidElement(document.createElement('div'))).toBeNull();
  });

  it('searches the whole page, scrolls without motion when asked and can skip focus', () => {
    const matchMedia = window.matchMedia;
    window.matchMedia = vi.fn(() => ({ matches: true }) as MediaQueryList);
    const fixture = TestBed.createComponent(FormHost);
    document.body.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    const city = (fixture.nativeElement as HTMLElement).querySelector('[aria-label="City"]') as HTMLElement;
    const validation = TestBed.inject(TxFormValidation);
    expect(validation.scrollToFirstInvalid(fixture.componentInstance.form, { focus: false, block: 'start' })).toBe(true);
    expect(city.scrollIntoView).toHaveBeenCalledWith({ behavior: 'auto', block: 'start' });
    expect(document.activeElement).not.toBe(city);
    window.matchMedia = matchMedia;
    fixture.nativeElement.remove();
  });

  it('reports false when no invalid field is on the page', () => {
    const form = new FormGroup({ name: new FormControl('', Validators.required) });
    expect(TestBed.inject(TxFormValidation).scrollToFirstInvalid(form, { scope: document.createElement('div') })).toBe(false);
    expect(form.get('name')?.touched).toBe(true);
  });

  it('only marks the form on the server', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });
    const form = new FormGroup({ name: new FormControl('', Validators.required) });
    expect(TestBed.inject(TxFormValidation).scrollToFirstInvalid(form)).toBe(true);
    expect(form.get('name')?.dirty).toBe(true);
  });

  it('waits for pending async validation on submit', () => {
    const fixture = TestBed.createComponent(PendingHost);
    fixture.detectChanges();
    expect(fixture.componentInstance.form.pending).toBe(true);
    (fixture.nativeElement as HTMLElement).querySelector('form')?.dispatchEvent(new Event('submit', { cancelable: true }));
    expect(fixture.componentInstance.invalid + fixture.componentInstance.valid).toBe(0);
  });
});

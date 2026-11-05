import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxSelect } from './select.component';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: `<tx-select [options]="options" [formControl]="control" [placeholder]="'City'" [filter]="filter()" [optionValue]="optionValue()" [variant]="'filled'" [readonly]="readonly()" (closed)="closed = closed + 1" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  options = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
    { label: 'Odesa', value: 'odesa' },
  ];
  control = new FormControl<unknown>(null);
  readonly filter = signal(false);
  readonly optionValue = signal('value');
  readonly readonly = signal(false);
  closed = 0;
}

describe('TxSelect', () => {
  let fixture: ComponentFixture<Host>;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option')) as HTMLElement[];
  const key = (target: HTMLElement, name: string) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('shows the placeholder and opens the list', () => {
    expect(trigger().textContent).toContain('City');
    trigger().click();
    fixture.detectChanges();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Kyiv', 'Lviv', 'Odesa']);
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('selects with a click and closes, marking the control touched', () => {
    trigger().click();
    fixture.detectChanges();
    options()[1].click();
    fixture.detectChanges();
    expect(fixture.componentInstance.control.value).toBe('lviv');
    expect(fixture.componentInstance.control.touched).toBe(true);
    expect(fixture.componentInstance.closed).toBe(1);
    expect(trigger().textContent).toContain('Lviv');
  });

  it('works from the keyboard', () => {
    key(trigger(), 'ArrowDown');
    key(trigger(), 'ArrowDown');
    key(trigger(), 'Enter');
    expect(fixture.componentInstance.control.value).toBe('lviv');
  });

  it('jumps with Home / End and finds by typed letters', () => {
    key(trigger(), 'ArrowDown');
    key(trigger(), 'End');
    key(trigger(), 'Enter');
    expect(fixture.componentInstance.control.value).toBe('odesa');
    key(trigger(), 'k');
    expect(fixture.componentInstance.control.value).toBe('kyiv');
  });

  it('filters the options', () => {
    fixture.componentInstance.filter.set(true);
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = 'od';
    search.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Odesa']);
  });

  it('writes the whole option with an empty optionValue', () => {
    fixture.componentInstance.optionValue.set('');
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    options()[0].click();
    expect(fixture.componentInstance.control.value).toEqual({ label: 'Kyiv', value: 'kyiv' });
  });

  it('does not open when readonly and shows the variant', () => {
    fixture.componentRef.instance.readonly.set(true);
    fixture.detectChanges();
    trigger().click();
    fixture.detectChanges();
    expect(options()).toHaveLength(0);
    expect(trigger().getAttribute('aria-readonly')).toBe('true');
    expect((fixture.nativeElement.querySelector('tx-select') as HTMLElement).getAttribute('data-variant')).toBe('filled');
  });

  it('turns invalid when a required control is touched without a value', async () => {
    fixture.componentInstance.control.setValidators(Validators.required);
    fixture.componentInstance.control.updateValueAndValidity();
    fixture.autoDetectChanges();
    await fixture.whenStable();
    trigger().click();
    fixture.detectChanges();
    key(trigger(), 'Escape');
    await fixture.whenStable();
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
  });

  it('follows the disabled state of the form control', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger().disabled).toBe(true);
  });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelect } from './select.component';

@Component({
  imports: [TxSelect, ReactiveFormsModule],
  template: `<tx-select [options]="options" [formControl]="control" [placeholder]="'City'" [filter]="filter()" [optionValue]="optionValue()" (closed)="closed = closed + 1" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  options = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv' },
    { label: 'Odesa', value: 'odesa' },
  ];
  control = new FormControl<unknown>(null);
  filter = signal(false);
  optionValue = signal('value');
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

  it('follows the disabled state of the form control', () => {
    fixture.componentInstance.control.disable();
    fixture.detectChanges();
    expect(trigger().disabled).toBe(true);
  });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxCountrySelect } from './country-select.component';
import { TxCountryOption } from './country-select.types';

@Component({
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `<tx-country-select [formControl]="control" [options]="options()" [multiple]="multiple()" [maxFlags]="2" [ariaLabel]="'Country'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  control = new FormControl<string | string[] | null>(null);
  readonly options = signal<(string | TxCountryOption)[] | undefined>(undefined);
  readonly multiple = signal(false);
}

describe('TxCountrySelect', () => {
  beforeAll(() => {
    Element.prototype.scrollTo ??= function scrollTo(this: Element) {
      return undefined;
    };
  });

  let fixture: ComponentFixture<Host>;
  let host: Host;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option[role="option"]')) as HTMLElement[];
  const render = () => fixture.detectChanges();

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('lists every country in a virtual list', async () => {
    trigger().click();
    render();
    await fixture.whenStable();
    expect(document.querySelector('cdk-virtual-scroll-viewport')).not.toBeNull();
  });

  it('filters by name or code', () => {
    host.options.set(['PL', 'UA', 'GB']);
    render();
    trigger().click();
    render();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = 'UA';
    search.dispatchEvent(new Event('input'));
    render();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['🇺🇦Ukraine']);
  });

  it('shows counts, hints and disabled options and writes the value', () => {
    host.options.set([{ code: 'pl', count: 12, hint: 'EU' }, { code: 'UA', count: 30 }, { code: 'DE', disabled: true }]);
    render();
    trigger().click();
    render();
    expect(options().map((option) => option.querySelector('.tx-country__name')?.textContent)).toEqual(['Germany', 'Poland', 'Ukraine']);
    expect(options()[1].querySelector('.tx-country-select__hint')?.textContent?.trim()).toBe('EU');
    expect(options()[1].querySelector('.tx-country-select__count')?.textContent?.trim()).toBe('12');
    expect(options()[0].getAttribute('aria-disabled')).toBe('true');
    options()[2].click();
    render();
    expect(host.control.value).toBe('UA');
    expect(trigger().textContent).toContain('Ukraine');
    expect(host.control.touched).toBe(true);
  });

  it('shows a few flags and a counter for several countries', async () => {
    host.multiple.set(true);
    host.options.set(['FR', 'IT', 'ES', 'PT']);
    host.control.setValue(['FR', 'IT', 'ES']);
    render();
    await fixture.whenStable();
    render();
    expect(fixture.nativeElement.querySelectorAll('.tx-country-select__flags tx-country')).toHaveLength(2);
    expect(fixture.nativeElement.querySelector('.tx-country-select__more')?.textContent?.trim()).toBe('+1');
  });

  it('follows the disabled form control', async () => {
    host.control.disable();
    render();
    await fixture.whenStable();
    render();
    expect(trigger().disabled).toBe(true);
  });
});

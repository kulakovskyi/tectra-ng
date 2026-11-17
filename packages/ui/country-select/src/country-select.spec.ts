import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxCountrySelect } from './country-select.component';
import { TxCountryOption, TxCountrySort } from './country-select.types';

@Component({
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `<tx-country-select
    [formControl]="control"
    [options]="options()"
    [multiple]="multiple()"
    [sort]="sort()"
    [maxFlags]="2"
    [maxNamed]="maxNamed()"
    [ariaLabel]="'Country'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  control = new FormControl<string | string[] | null>(null, Validators.required);
  readonly maxNamed = signal(1);
  readonly options = signal<(string | TxCountryOption)[] | undefined>(undefined);
  readonly multiple = signal(false);
  readonly sort = signal<TxCountrySort>('name');
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

  it('keeps the given order and own labels without sorting', () => {
    host.options.set([{ code: 'ua', label: 'Home', value: 'home' }, 'PL', 'DE']);
    host.sort.set('none');
    render();
    trigger().click();
    render();
    expect(options().map((option) => option.querySelector('.tx-country__name')?.textContent)).toEqual(['Home', 'Poland', 'Germany']);
    options()[0].click();
    render();
    expect(host.control.value).toBe('home');
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

  it('names the picked countries up to maxNamed, then shows only flags', async () => {
    host.multiple.set(true);
    host.options.set(['FR', 'IT', 'ES']);
    host.control.setValue(['FR', 'IT']);
    render();
    await fixture.whenStable();
    render();
    const names = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-country-select__flags .tx-country__name')).map((name) => (name as HTMLElement).textContent);
    expect(names()).toEqual([]);
    host.maxNamed.set(2);
    render();
    expect(names()).toEqual(['France', 'Italy']);
  });

  it('draws codes that are not countries as text and keeps their value', async () => {
    host.options.set([{ code: 'none', label: 'Not set' }, { code: 'ZZ', label: 'Other' }, 'eu', { code: 'PL', flag: false }]);
    host.sort.set('none');
    render();
    trigger().click();
    render();
    const flags = options().map((option) => option.querySelector('.tx-country__flag')?.textContent?.trim() ?? null);
    expect(flags).toEqual([null, null, '🇪🇺', null]);
    expect(options().map((option) => option.querySelector('.tx-country__name')?.textContent)).toEqual(['Not set', 'Other', 'European Union', 'Poland']);
    options()[0].click();
    render();
    expect(host.control.value).toBe('none');
    expect(trigger().textContent?.trim()).toBe('Not set');
    expect(trigger().querySelector('.tx-country__flag')).toBeNull();
  });

  it('shows the name of a text option among several picked', async () => {
    host.multiple.set(true);
    host.options.set([{ code: 'other', label: 'Other' }, 'FR', 'IT']);
    host.control.setValue(['other', 'FR']);
    render();
    await fixture.whenStable();
    render();
    expect(Array.from(fixture.nativeElement.querySelectorAll('.tx-country-select__flags .tx-country__name')).map((name) => (name as HTMLElement).textContent)).toEqual(['Other']);
  });

  it('turns invalid with the touched invalid form control', async () => {
    await fixture.whenStable();
    render();
    expect(trigger().getAttribute('aria-invalid')).toBeNull();
    host.control.markAsTouched();
    await fixture.whenStable();
    render();
    expect(trigger().getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('tx-select')?.classList).toContain('tx-select--invalid');
    host.control.setValue('UA');
    await fixture.whenStable();
    render();
    expect(trigger().getAttribute('aria-invalid')).toBeNull();
  });

  it('follows the disabled form control', async () => {
    host.control.disable();
    render();
    await fixture.whenStable();
    render();
    expect(trigger().disabled).toBe(true);
  });
});

@Component({
  imports: [TxCountrySelect, ReactiveFormsModule],
  template: `<form [formGroup]="form"><tx-country-select formControlName="country" ariaLabel="Country" [multiple]="multiple()" /></form>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FormHost {
  readonly form = new FormGroup({ country: new FormControl<string | string[] | null>('FR') });
  readonly multiple = signal(false);
}

describe('TxCountrySelect in a form group', () => {
  afterEach(() => vi.restoreAllMocks());

  it('keeps its own select out of the parent form', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const fixture = TestBed.createComponent(FormHost);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.multiple.set(true);
    fixture.componentInstance.form.setValue({ country: ['FR'] });
    fixture.detectChanges();
    await fixture.whenStable();
    expect(warn).not.toHaveBeenCalled();
    expect(Object.keys(fixture.componentInstance.form.controls)).toEqual(['country']);
    fixture.destroy();
  });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { TxSelectHeaderTemplate, TxSelectItem } from '@tectra-ng/ui/select';
import { TxAutocomplete } from './autocomplete.component';
import { TxAutocompleteChangeEvent, TxAutocompleteDropdownMode } from './autocomplete.types';

const CITIES = ['Kyiv', 'Kharkiv', 'Kherson', 'Lviv', 'Odesa'];

@Component({
  imports: [TxAutocomplete, ReactiveFormsModule],
  template: `
    <tx-autocomplete
      [suggestions]="suggestions()"
      [formControl]="control"
      [multiple]="multiple()"
      [dropdown]="true"
      [forceSelection]="force()"
      [delay]="0"
      [minLength]="minLength()"
      [showClear]="true"
      [placeholder]="'City'"
      (completed)="complete($event.query)"
      (changed)="changes.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly suggestions = signal<string[]>([]);
  readonly multiple = signal(false);
  readonly force = signal(false);
  readonly minLength = signal(1);
  control = new FormControl<unknown>(null);
  queries: string[] = [];
  changes: TxAutocompleteChangeEvent[] = [];

  complete(query: string): void {
    this.queries.push(query);
    this.suggestions.set(CITIES.filter((city) => city.toLowerCase().startsWith(query.toLowerCase())));
  }
}

describe('TxAutocomplete', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const input = () => fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option[role="option"]')) as HTMLElement[];
  const render = () => fixture.detectChanges();
  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    render();
  };
  const key = (name: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('asks for suggestions while typing and keeps free text', () => {
    type('kh');
    expect(host.queries).toEqual(['kh']);
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Kharkiv', 'Kherson']);
    expect(input().getAttribute('aria-expanded')).toBe('true');
    expect(input().getAttribute('aria-autocomplete')).toBe('list');
    expect(host.control.value).toBe('kh');
  });

  it('picks a suggestion with the keys and fills the field', () => {
    type('kh');
    expect(input().getAttribute('aria-activedescendant')).toBeNull();
    key('ArrowDown');
    key('ArrowDown');
    key('Enter');
    expect(host.control.value).toBe('Kherson');
    expect(input().value).toBe('Kherson');
    expect(input().getAttribute('aria-expanded')).toBe('false');
    expect(host.changes.at(-1)).toEqual({ value: 'Kherson', option: 'Kherson', selected: true });
  });

  it('waits for minLength and opens all with the dropdown button', () => {
    host.minLength.set(2);
    render();
    type('k');
    expect(host.queries).toEqual([]);
    (fixture.nativeElement.querySelector('.tx-autocomplete__dropdown') as HTMLButtonElement).click();
    render();
    expect(host.queries).toEqual(['']);
    expect(options()).toHaveLength(5);
  });

  it('drops text that is not a suggestion with forceSelection', () => {
    host.force.set(true);
    render();
    type('kyi');
    expect(host.control.value).toBeNull();
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(input().value).toBe('');
    type('lviv');
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(host.control.value).toBe('Lviv');
  });

  it('collects chips in multiple mode and removes the last with Backspace', () => {
    host.multiple.set(true);
    render();
    type('k');
    options()[0].click();
    render();
    type('o');
    key('ArrowDown');
    key('Enter');
    expect(host.control.value).toEqual(['Kyiv', 'Odesa']);
    expect(input().value).toBe('');
    const chips = Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')) as HTMLElement[];
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['Kyiv', 'Odesa']);
    key('Backspace');
    expect(host.control.value).toEqual(['Kyiv']);
  });

  it('keeps chips on one line until the field has focus', () => {
    host.multiple.set(true);
    host.control.setValue(['Kyiv', 'Odesa']);
    render();
    const list = () => fixture.nativeElement.querySelector('.tx-autocomplete__chips') as HTMLElement;
    const more = () => fixture.nativeElement.querySelector('.tx-select__chip--more') as HTMLElement;
    expect(list().classList).toContain('tx-autocomplete__chips--fit');
    expect(more().classList).toContain('tx-select__chip--hidden');
    input().dispatchEvent(new FocusEvent('focus'));
    render();
    expect(list().classList).not.toContain('tx-autocomplete__chips--fit');
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(list().classList).toContain('tx-autocomplete__chips--fit');
  });

  it('shows the written value and clears it', () => {
    host.control.setValue('Lviv');
    render();
    expect(input().value).toBe('Lviv');
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toBeNull();
    expect(input().value).toBe('');
  });
});

const CITY_OPTIONS = [
  { label: 'Kyiv', value: 'kyiv' },
  { label: 'Lviv', value: 'lviv', disabled: true },
  { label: 'Odesa', value: 'odesa' },
];

@Component({
  imports: [TxAutocomplete, ReactiveFormsModule, TxSelectHeaderTemplate],
  template: `
    <tx-autocomplete
      [suggestions]="suggestions()"
      [formControl]="control"
      [multiple]="multiple()"
      [dropdown]="true"
      [dropdownMode]="mode()"
      [forceSelection]="force()"
      [localSearch]="local()"
      [delay]="delay()"
      [completeOnFocus]="focusComplete()"
      [autoOptionFocus]="autoFocus()"
      [showEmptyMessage]="showEmpty()"
      [loading]="loading()"
      [readonly]="readonly()"
      [placeholder]="'City'"
      (completed)="queries.push($event.query)"
      (changed)="changes.push($event)"
    >
      <ng-template txSelectHeader><button type="button" class="own-header">Top</button></ng-template>
    </tx-autocomplete>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class FeatureHost {
  readonly suggestions = signal<readonly unknown[]>(CITY_OPTIONS);
  readonly multiple = signal(false);
  readonly mode = signal<TxAutocompleteDropdownMode>('blank');
  readonly force = signal(false);
  readonly local = signal(false);
  readonly delay = signal(0);
  readonly focusComplete = signal(false);
  readonly autoFocus = signal(false);
  readonly showEmpty = signal(true);
  readonly loading = signal(false);
  readonly readonly = signal(false);
  control = new FormControl<unknown>(null);
  queries: string[] = [];
  changes: TxAutocompleteChangeEvent[] = [];
}

describe('TxAutocomplete features', () => {
  let fixture: ComponentFixture<FeatureHost>;
  let host: FeatureHost;
  const component = () => fixture.debugElement.query(By.directive(TxAutocomplete)).componentInstance as TxAutocomplete;
  const input = () => fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement;
  const dropdown = () => fixture.nativeElement.querySelector('.tx-autocomplete__dropdown') as HTMLButtonElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option[role="option"]')) as HTMLElement[];
  const labels = () => options().map((option) => option.textContent?.trim());
  const isOpen = () => component().isOpen();
  const render = () => fixture.detectChanges();
  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    render();
  };
  const key = (name: string) => {
    const event = new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true });
    input().dispatchEvent(event);
    render();
    return event;
  };
  const blur = (relatedTarget: EventTarget | null = null) => {
    input().dispatchEvent(new FocusEvent('blur', { relatedTarget }));
    render();
  };
  const set = (apply: () => void) => {
    apply();
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureHost);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('filters locally and focuses the first option when asked', () => {
    set(() => {
      host.local.set(true);
      host.autoFocus.set(true);
    });
    type('o');
    expect(labels()).toEqual(['Odesa']);
    expect(input().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    expect(input().getAttribute('aria-expanded')).toBe('true');
  });

  it('takes the value of a suggestion whose label is typed and empties on blank text', () => {
    type('KYIV');
    expect(host.control.value).toBe('kyiv');
    expect(host.changes.at(-1)).toEqual({ value: 'kyiv', option: CITY_OPTIONS[0], selected: true });
    type('');
    expect(host.control.value).toBeNull();
    expect(host.changes.at(-1)).toEqual({ value: null, option: null, selected: false });
    expect(isOpen()).toBe(false);
  });

  it('shows labels of written values from suggestions, remembered picks and plain objects', () => {
    set(() => host.control.setValue('odesa'));
    expect(input().value).toBe('Odesa');
    type('kyiv');
    set(() => host.suggestions.set([]));
    set(() => host.control.setValue('kyiv'));
    expect(input().value).toBe('Kyiv');
    set(() => host.control.setValue({ label: 'Rivne', value: 'rivne' }));
    expect(input().value).toBe('Rivne');
    set(() => host.control.setValue({ value: 'rivne' }));
    expect(input().value).toBe('');
    set(() => host.control.setValue('kharkiv'));
    expect(input().value).toBe('kharkiv');
  });

  it('waits for the delay, restarts it on each key and drops it when destroyed', () => {
    vi.useFakeTimers();
    try {
      set(() => host.delay.set(300));
      type('k');
      vi.advanceTimersByTime(200);
      type('ky');
      vi.advanceTimersByTime(200);
      expect(host.queries).toEqual([]);
      vi.advanceTimersByTime(100);
      render();
      expect(host.queries).toEqual(['ky']);
      expect(isOpen()).toBe(true);
      type('kyi');
      fixture.destroy();
      vi.advanceTimersByTime(300);
      expect(host.queries).toEqual(['ky']);
    } finally {
      vi.useRealTimers();
    }
  });

  it('cancels a pending search when the text gets too short', () => {
    vi.useFakeTimers();
    try {
      set(() => host.delay.set(300));
      type('k');
      type('');
      vi.advanceTimersByTime(300);
      expect(host.queries).toEqual([]);
    } finally {
      vi.useRealTimers();
    }
  });

  it('completes on focus once while closed', () => {
    set(() => host.focusComplete.set(true));
    input().dispatchEvent(new FocusEvent('focus'));
    render();
    expect(host.queries).toEqual(['']);
    expect(isOpen()).toBe(true);
    input().dispatchEvent(new FocusEvent('focus'));
    render();
    expect(host.queries).toEqual(['']);
  });

  it('keeps text while focus stays inside and settles it with forceSelection when it leaves', () => {
    set(() => host.force.set(true));
    type('kyi');
    expect(host.control.value).toBeNull();
    blur(dropdown());
    expect(input().value).toBe('kyi');
    type('kyi');
    blur(document.querySelector('.own-header'));
    expect(input().value).toBe('kyi');
    blur();
    expect(input().value).toBe('');
    expect(host.changes).toEqual([]);
    type('kyiv');
    blur();
    expect(host.control.value).toBe('kyiv');
    expect(input().value).toBe('Kyiv');
    blur();
    expect(input().value).toBe('Kyiv');
    type('kyi');
    blur();
    expect(host.control.value).toBeNull();
    expect(host.changes.at(-1)).toEqual({ value: null, option: null, selected: false });
    blur();
    expect(input().value).toBe('');
    type('kyiv');
    blur();
    expect(host.control.value).toBe('kyiv');
    type('');
    expect(host.control.value).toBeNull();
  });

  it('labels chips of unknown values and clears them to an empty list', () => {
    set(() => host.multiple.set(true));
    set(() => host.control.setValue(['odesa', 'rivne']));
    const chips = Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')) as HTMLElement[];
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['Odesa', 'rivne']);
    component().clear();
    render();
    expect(host.control.value).toEqual([]);
    expect(host.changes.at(-1)).toEqual({ value: [], option: null, selected: false });
    expect(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')).toHaveLength(0);
  });

  it('settles the text on Tab', () => {
    set(() => host.force.set(true));
    type('zz');
    key('Tab');
    expect(input().value).toBe('');
    expect(isOpen()).toBe(false);
  });

  it('opens with the current text from the dropdown in current mode and closes with it', () => {
    set(() => host.mode.set('current'));
    type('ky');
    expect(isOpen()).toBe(true);
    dropdown().click();
    render();
    expect(isOpen()).toBe(false);
    expect(document.activeElement).toBe(input());
    dropdown().click();
    render();
    expect(host.queries).toEqual(['ky', 'ky']);
    expect(isOpen()).toBe(true);
  });

  it('ignores Enter while closed and opens with ArrowDown', () => {
    const enter = key('Enter');
    expect(enter.defaultPrevented).toBe(false);
    expect(isOpen()).toBe(false);
    const down = key('ArrowDown');
    expect(down.defaultPrevented).toBe(true);
    expect(host.queries).toEqual(['']);
    expect(isOpen()).toBe(true);
  });

  it('focuses the field on a box click', () => {
    input().blur();
    (fixture.nativeElement.querySelector('.tx-select__box') as HTMLElement).click();
    expect(document.activeElement).toBe(input());
  });

  it('keeps or settles chip text, picks a chosen option again and guards removal', () => {
    set(() => host.multiple.set(true));
    set(() => host.control.setValue('kyiv'));
    expect(component().selectedValues()).toEqual([]);
    key('Backspace');
    expect(host.changes).toEqual([]);
    type('k');
    options()[0].click();
    render();
    type('k');
    options()[0].click();
    render();
    expect(host.control.value).toEqual(['kyiv']);
    expect(host.changes.map((change) => change.value)).toEqual([['kyiv'], ['kyiv']]);
    type('zz');
    blur();
    expect(input().value).toBe('zz');
    set(() => host.force.set(true));
    blur();
    expect(input().value).toBe('');
    set(() => host.readonly.set(true));
    const item = component().selectedItems()[0];
    component().removeItem(item, new MouseEvent('click'));
    expect(host.control.value).toEqual(['kyiv']);
  });

  it('does not pick a disabled suggestion', () => {
    const lviv = component().rows()[1] as TxSelectItem;
    expect(lviv.disabled).toBe(true);
    component().onOptionClick(lviv);
    expect(host.control.value).toBeNull();
    expect(host.changes).toEqual([]);
  });

  it('hides the panel without suggestions unless loading or the empty message is shown', () => {
    set(() => {
      host.suggestions.set([]);
      host.showEmpty.set(false);
    });
    key('ArrowDown');
    expect(isOpen()).toBe(true);
    expect(component().showPanel()).toBe(false);
    expect(input().getAttribute('aria-expanded')).toBe('false');
    set(() => host.loading.set(true));
    expect(component().showPanel()).toBe(true);
    expect(document.querySelector('.tx-select__empty')?.textContent?.trim()).toBe('Loading');
  });
});

describe('TxAutocomplete recompiled by TestBed', () => {
  it('still binds to a form control when a test overrides the component', () => {
    TestBed.overrideComponent(TxAutocomplete, { set: { styles: [] } });
    const fixture = TestBed.createComponent(FeatureHost);
    fixture.detectChanges();
    fixture.componentInstance.control.setValue('odesa');
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('input[role="combobox"]') as HTMLInputElement).value).toBe('Odesa');
  });
});

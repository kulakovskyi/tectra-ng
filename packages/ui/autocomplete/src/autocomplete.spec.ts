import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxAutocomplete } from './autocomplete.component';
import { TxAutocompleteChangeEvent } from './autocomplete.types';

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
    const chips = Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip')) as HTMLElement[];
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['Kyiv', 'Odesa']);
    key('Backspace');
    expect(host.control.value).toEqual(['Kyiv']);
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

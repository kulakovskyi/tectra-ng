import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxMultiselect } from './multiselect.component';
import { TxMultiselectChangeEvent, TxMultiselectDisplay } from './multiselect.types';

@Component({
  imports: [TxMultiselect, ReactiveFormsModule],
  template: `
    <tx-multiselect
      [options]="options"
      [formControl]="control"
      [placeholder]="'Tags'"
      [display]="display()"
      [filter]="filter()"
      [showClear]="true"
      [maxSelectedLabels]="maxLabels()"
      [selectionLimit]="limit()"
      [showToggleAll]="toggleAll()"
      [unstyled]="unstyled()"
      [pt]="{ chip: { class: 'own-chip' }, toggleAll: { class: 'own-toggle' } }"
      (changed)="changes.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly options = [
    { label: 'Design', value: 'design' },
    { label: 'Backend', value: 'backend' },
    { label: 'Frontend', value: 'frontend' },
    { label: 'Archive', value: 'archive', disabled: true },
  ];
  control = new FormControl<string[] | null>(null);
  readonly display = signal<TxMultiselectDisplay>('comma');
  readonly filter = signal(false);
  readonly maxLabels = signal(3);
  readonly limit = signal<number | undefined>(undefined);
  readonly toggleAll = signal(true);
  readonly unstyled = signal<boolean | undefined>(undefined);
  changes: TxMultiselectChangeEvent[] = [];
}

describe('TxMultiselect', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-multiselect') as HTMLElement;
  const trigger = () => fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement;
  const options = () => Array.from(document.querySelectorAll('.tx-select__option[role="option"]')) as HTMLElement[];
  const toggleAll = () => document.querySelector('.tx-multiselect__toggle-all') as HTMLButtonElement;
  const render = () => fixture.detectChanges();
  const key = (target: HTMLElement, name: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
    render();
  };
  const open = () => {
    trigger().click();
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('toggles options with clicks and keeps the panel open', () => {
    open();
    expect(document.querySelector('[role="listbox"]')?.getAttribute('aria-multiselectable')).toBe('true');
    options()[0].click();
    render();
    options()[2].click();
    render();
    expect(host.control.value).toEqual(['design', 'frontend']);
    expect(options()[0].getAttribute('aria-selected')).toBe('true');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(trigger().textContent).toContain('Design, Frontend');
    options()[0].click();
    render();
    expect(host.control.value).toEqual(['frontend']);
    expect(host.changes.map((change) => change.selected)).toEqual([true, true, false]);
  });

  it('toggles from the keyboard and skips disabled options', () => {
    key(trigger(), 'ArrowDown');
    key(trigger(), 'Enter');
    key(trigger(), 'ArrowDown');
    key(trigger(), ' ');
    key(trigger(), 'End');
    expect(document.querySelector('.tx-select__option--active')?.textContent?.trim()).toBe('Frontend');
    expect(host.control.value).toEqual(['design', 'backend']);
  });

  it('selects all and clears all with the toggle and with Ctrl+A', () => {
    open();
    expect(toggleAll().getAttribute('aria-checked')).toBe('false');
    expect(toggleAll().classList).toContain('own-toggle');
    toggleAll().click();
    render();
    expect(host.control.value).toEqual(['design', 'backend', 'frontend']);
    expect(toggleAll().getAttribute('aria-checked')).toBe('true');
    key(trigger(), 'a', { ctrlKey: true });
    expect(host.control.value).toEqual([]);
    options()[1].click();
    render();
    expect(toggleAll().getAttribute('aria-checked')).toBe('mixed');
  });

  it('selects only the filtered options with the toggle', () => {
    host.filter.set(true);
    render();
    open();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = 'end';
    search.dispatchEvent(new Event('input'));
    render();
    toggleAll().click();
    render();
    expect(host.control.value).toEqual(['backend', 'frontend']);
  });

  it('stops at the selection limit', () => {
    host.limit.set(2);
    render();
    open();
    toggleAll().click();
    render();
    expect(host.control.value).toEqual(['design', 'backend']);
    expect(options()[2].getAttribute('aria-disabled')).toBe('true');
    options()[2].click();
    render();
    expect(host.control.value).toEqual(['design', 'backend']);
  });

  it('summarizes long selections and shows chips that can be removed', () => {
    host.control.setValue(['design', 'backend', 'frontend']);
    host.maxLabels.set(2);
    render();
    expect(trigger().textContent?.trim()).toBe('3 items selected');
    host.maxLabels.set(5);
    host.display.set('chip');
    render();
    const chips = Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip')) as HTMLElement[];
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['Design', 'Backend', 'Frontend']);
    expect(chips[0].classList).toContain('own-chip');
    (chips[1].querySelector('.tx-select__chip-remove') as HTMLElement).click();
    render();
    expect(host.control.value).toEqual(['design', 'frontend']);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    key(trigger(), 'Backspace');
    expect(host.control.value).toEqual(['design']);
  });

  it('clears to an empty array and treats null as empty', () => {
    expect(root().classList).not.toContain('tx-multiselect--filled');
    host.control.setValue(['design']);
    render();
    expect(root().classList).toContain('tx-multiselect--filled');
    (fixture.nativeElement.querySelector('.tx-select__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toEqual([]);
    expect(trigger().textContent?.trim()).toBe('Tags');
  });

  it('hides the toggle and drops styles when asked', () => {
    host.toggleAll.set(false);
    host.unstyled.set(true);
    render();
    open();
    expect(toggleAll()).toBeNull();
    expect(root().hasAttribute('data-styled')).toBe(false);
  });
});

@Component({
  imports: [TxMultiselect],
  template: `<tx-multiselect [options]="['a', 'b', 'c']" [selectAllLabel]="'Усі'" [countLabel]="'{selected}/{total}'" [ariaLabel]="'Letters'" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LabelsHost {}

describe('TxMultiselect texts', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('takes own select-all and count texts', () => {
    const fixture = TestBed.createComponent(LabelsHost);
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLButtonElement).click();
    fixture.detectChanges();
    const all = document.querySelector('.tx-multiselect__toggle-all') as HTMLElement;
    expect(all.querySelector('.tx-multiselect__all-label')?.textContent?.trim()).toBe('Усі');
    expect(all.querySelector('.tx-multiselect__count')?.textContent?.trim()).toBe('0/3');
  });
});

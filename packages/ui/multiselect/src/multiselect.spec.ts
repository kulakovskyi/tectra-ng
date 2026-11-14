import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxSelectItem } from '@tectra-ng/ui/select';
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
    const chips = Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')) as HTMLElement[];
    expect(chips.map((chip) => chip.textContent?.trim())).toEqual(['Design', 'Backend', 'Frontend']);
    expect(chips.some((chip) => chip.classList.contains('tx-select__chip--hidden'))).toBe(false);
    expect(fixture.nativeElement.querySelector('.tx-select__chip--more').classList).toContain('tx-select__chip--hidden');
    expect(chips[0].classList).toContain('own-chip');
    (chips[1].querySelector('.tx-select__chip-remove') as HTMLElement).click();
    render();
    expect(host.control.value).toEqual(['design', 'frontend']);
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    key(trigger(), 'Backspace');
    expect(host.control.value).toEqual(['design']);
  });

  it('keeps chips on one line and counts the ones that do not fit in a +N chip', async () => {
    const observers: { callback: () => void; disconnected: boolean }[] = [];
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly entry = { callback: () => undefined as void, disconnected: false };
        constructor(callback: () => void) {
          this.entry.callback = callback;
          observers.push(this.entry);
        }
        observe(): void {
          return;
        }
        disconnect(): void {
          this.entry.disconnected = true;
        }
      },
    );
    let available = 150;
    const chipWidth = (element: HTMLElement) => (element.classList.contains('tx-select__chip--more') ? 30 : element.classList.contains('tx-select__chip') ? 60 : 0);
    const labelWidth = (element: HTMLElement) => (element.classList.contains('tx-select__chip-label') ? (element.textContent?.trim().length ?? 0) * 5 : 0);
    vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return chipWidth(this);
    });
    vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return this.classList.contains('tx-select__chips') ? available : labelWidth(this);
    });
    vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (this: HTMLElement) {
      return labelWidth(this);
    });
    try {
      host.maxLabels.set(10);
      host.display.set('chip');
      host.control.setValue(['design', 'backend', 'frontend']);
      render();
      await fixture.whenStable();
      const chips = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-select__chip:not(.tx-select__chip--more)')) as HTMLElement[];
      const more = () => fixture.nativeElement.querySelector('.tx-select__chip--more') as HTMLElement;
      const hidden = () => chips().map((chip) => chip.classList.contains('tx-select__chip--hidden'));
      expect(hidden()).toEqual([false, false, true]);
      expect(chips()[2].getAttribute('aria-hidden')).toBe('true');
      expect(more().classList).not.toContain('tx-select__chip--hidden');
      expect(more().textContent?.trim()).toBe('+1');

      available = 40;
      observers.at(-1)?.callback();
      render();
      expect(hidden()).toEqual([false, true, true]);
      expect(more().textContent?.trim()).toBe('+2');

      available = 200;
      (fixture.nativeElement.querySelector('.tx-select__chips') as HTMLElement).style.columnGap = '4px';
      observers.at(-1)?.callback();
      render();
      expect(hidden()).toEqual([false, false, false]);
      expect(more().classList).toContain('tx-select__chip--hidden');

      available = 140;
      observers.at(-1)?.callback();
      render();
      expect(hidden()).toEqual([false, true, true]);

      host.display.set('comma');
      render();
      await fixture.whenStable();
      expect(observers.every((observer) => observer.disconnected)).toBe(true);
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
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

  it('keeps showing a selected option that the filter hides and drops unknown values', () => {
    host.filter.set(true);
    render();
    open();
    options()[0].click();
    render();
    const search = document.querySelector('.tx-select__filter-input') as HTMLInputElement;
    search.value = 'back';
    search.dispatchEvent(new Event('input'));
    render();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Backend']);
    expect(trigger().textContent).toContain('Design');
    search.value = 'zzz';
    search.dispatchEvent(new Event('input'));
    render();
    key(search, 'Enter');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    host.control.setValue(['ghost', 'frontend']);
    render();
    expect(trigger().textContent?.trim()).toBe('Frontend');
  });

  it('opens on a typed letter, ignores Backspace without chips and unselects a disabled option', () => {
    host.display.set('chip');
    render();
    key(trigger(), 'Backspace');
    expect(host.changes).toEqual([]);
    key(trigger(), 'b');
    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    const multiselect = fixture.debugElement.query((node) => node.componentInstance instanceof TxMultiselect).componentInstance as TxMultiselect;
    const archive = (selected: boolean): TxSelectItem => ({ type: 'option', id: 'archive', index: 3, label: 'Archive', value: 'archive', option: host.options[3], selected, disabled: true });
    multiselect.toggleItem(archive(false));
    expect(host.control.value).toBeNull();
    host.control.setValue(['archive']);
    render();
    multiselect.toggleItem(archive(true));
    expect(host.control.value).toEqual([]);
  });

  it('does not remove chips while disabled', () => {
    host.display.set('chip');
    host.control.setValue(['design']);
    host.control.disable();
    render();
    const multiselect = fixture.debugElement.query((node) => node.componentInstance instanceof TxMultiselect).componentInstance as TxMultiselect;
    const event = new MouseEvent('click');
    multiselect.removeItem(multiselect.selectedItems()[0], event);
    expect(host.control.value).toEqual(['design']);
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

describe('TxMultiselect recompiled by TestBed', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.replaceChildren());

  it('still binds to a form control when a test overrides the component', () => {
    TestBed.overrideComponent(TxMultiselect, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.control.setValue(['backend']);
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('.tx-select__trigger') as HTMLElement).textContent).toContain('Backend');
  });
});


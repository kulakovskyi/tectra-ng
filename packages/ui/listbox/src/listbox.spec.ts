import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxListbox } from './listbox.component';
import { TxListboxChangeEvent } from './listbox.types';

@Component({
  imports: [TxListbox, ReactiveFormsModule],
  template: `
    <tx-listbox
      [options]="options"
      [formControl]="control"
      [multiple]="multiple()"
      [checkbox]="checkbox()"
      [metaKeySelection]="meta()"
      [filter]="filter()"
      [readonly]="readonly()"
      [ariaLabel]="'Cities'"
      [dt]="{ root: { borderRadius: '2px' } }"
      [pt]="{ option: { class: 'own-option' } }"
      (changed)="changes.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly options = [
    { label: 'Kyiv', value: 'kyiv' },
    { label: 'Lviv', value: 'lviv', disabled: true },
    { label: 'Odesa', value: 'odesa' },
    { label: 'Dnipro', value: 'dnipro' },
  ];
  control = new FormControl<unknown>(null);
  readonly multiple = signal(false);
  readonly checkbox = signal(false);
  readonly meta = signal(false);
  readonly filter = signal(false);
  readonly readonly = signal(false);
  changes: TxListboxChangeEvent[] = [];
}

describe('TxListbox', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const root = () => fixture.nativeElement.querySelector('tx-listbox') as HTMLElement;
  const list = () => fixture.nativeElement.querySelector('[role="listbox"]') as HTMLElement;
  const options = () => Array.from(fixture.nativeElement.querySelectorAll('[role="option"]')) as HTMLElement[];
  const render = () => fixture.detectChanges();
  const key = (target: HTMLElement, name: string, init: KeyboardEventInit = {}) => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, ...init }));
    render();
  };
  const click = (option: HTMLElement, init: MouseEventInit = {}) => {
    option.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, ...init }));
    option.dispatchEvent(new MouseEvent('click', { bubbles: true, ...init }));
    render();
  };
  const focus = () => {
    list().dispatchEvent(new FocusEvent('focus'));
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  it('is a focusable, named listbox with options inline', () => {
    expect(list().getAttribute('tabindex')).toBe('0');
    expect(list().getAttribute('aria-label')).toBe('Cities');
    expect(options()).toHaveLength(4);
    expect(options()[0].classList).toContain('own-option');
    expect(root().style.getPropertyValue('--tx-listbox-border-radius')).toBe('2px');
  });

  it('selects one value by click and by keys, skipping disabled options', () => {
    click(options()[2]);
    expect(host.control.value).toBe('odesa');
    focus();
    key(list(), 'ArrowUp');
    expect(list().getAttribute('aria-activedescendant')).toBe(options()[0].id);
    key(list(), 'Enter');
    expect(host.control.value).toBe('kyiv');
    click(options()[1]);
    expect(host.control.value).toBe('kyiv');
    expect(host.changes.map((change) => change.value)).toEqual(['odesa', 'kyiv']);
  });

  it('toggles several values, selects all and extends with Shift', () => {
    host.multiple.set(true);
    render();
    expect(list().getAttribute('aria-multiselectable')).toBe('true');
    click(options()[0]);
    click(options()[2]);
    expect(host.control.value).toEqual(['kyiv', 'odesa']);
    click(options()[0]);
    expect(host.control.value).toEqual(['odesa']);
    focus();
    key(list(), 'a', { ctrlKey: true });
    expect(host.control.value).toEqual(['odesa', 'kyiv', 'dnipro']);
    key(list(), 'a', { ctrlKey: true });
    expect(host.control.value).toEqual([]);
    key(list(), 'Home');
    key(list(), 'ArrowDown', { shiftKey: true });
    expect(host.control.value).toEqual(['odesa']);
  });

  it('replaces the selection on a plain click with metaKeySelection', () => {
    host.multiple.set(true);
    host.meta.set(true);
    render();
    click(options()[0]);
    click(options()[2], { ctrlKey: true });
    expect(host.control.value).toEqual(['kyiv', 'odesa']);
    click(options()[3]);
    expect(host.control.value).toEqual(['dnipro']);
  });

  it('shows checkboxes and filters', () => {
    host.checkbox.set(true);
    host.filter.set(true);
    render();
    expect(fixture.nativeElement.querySelectorAll('.tx-select__checkbox')).toHaveLength(4);
    const search = fixture.nativeElement.querySelector('.tx-listbox__filter-input') as HTMLInputElement;
    search.value = 'pro';
    search.dispatchEvent(new Event('input'));
    render();
    expect(options().map((option) => option.textContent?.trim())).toEqual(['Dnipro']);
    search.dispatchEvent(new FocusEvent('focus'));
    key(search, 'Enter');
    expect(host.control.value).toEqual(['dnipro']);
  });

  it('does not change when readonly and is touched on blur', () => {
    host.readonly.set(true);
    render();
    click(options()[0]);
    expect(host.control.value).toBeNull();
    focus();
    list().dispatchEvent(new FocusEvent('blur'));
    expect(host.control.touched).toBe(true);
  });
});

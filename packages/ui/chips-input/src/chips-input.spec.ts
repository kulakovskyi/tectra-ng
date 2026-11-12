import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInputItemTemplate } from './chips-input-item.directive';
import { TxChipsInput } from './chips-input.component';
import { TxChipsInputEvent } from './chips-input.types';

@Component({
  imports: [TxChipsInput, TxChipsInputItemTemplate, ReactiveFormsModule],
  template: `
    <tx-chips-input
      [formControl]="control"
      [placeholder]="'Keywords'"
      [separator]="separator()"
      [max]="max()"
      [maxLength]="maxLength()"
      [itemPattern]="pattern()"
      [showClear]="true"
      (added)="added.push($event.value)"
      (removed)="removed.push($event.value)"
      (rejected)="rejected.push($event)"
    >
      @if (custom()) {
        <ng-template txChipsInputItem let-item>#{{ item }}</ng-template>
      }
    </tx-chips-input>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  control = new FormControl<string[] | null>(null);
  readonly separator = signal<string | RegExp>(',');
  readonly max = signal<number | undefined>(undefined);
  readonly maxLength = signal<number | undefined>(undefined);
  readonly pattern = signal<RegExp | undefined>(undefined);
  readonly custom = signal(false);
  added: string[] = [];
  removed: string[] = [];
  rejected: TxChipsInputEvent[] = [];
}

describe('TxChipsInput', () => {
  let fixture: ComponentFixture<Host>;
  let host: Host;
  const input = () => fixture.nativeElement.querySelector('.tx-chips-input__input') as HTMLInputElement;
  const chips = () => Array.from(fixture.nativeElement.querySelectorAll('tx-chip')) as HTMLElement[];
  const render = () => fixture.detectChanges();
  const type = (text: string) => {
    input().value = text;
    input().dispatchEvent(new Event('input'));
    render();
  };
  const key = (name: string) => {
    input().dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true }));
    render();
  };
  const paste = (text: string) => {
    const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & { clipboardData: { getData: () => string } };
    Object.defineProperty(event, 'clipboardData', { value: { getData: () => text } });
    input().dispatchEvent(event);
    render();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(Host);
    host = fixture.componentInstance;
    render();
  });

  it('adds with Enter and the separator, trims and skips duplicates', () => {
    type('angular');
    key('Enter');
    type('signals, rxjs,');
    expect(host.control.value).toEqual(['angular', 'signals', 'rxjs']);
    expect(input().value).toBe('');
    type('Angular');
    key('Enter');
    expect(host.control.value).toHaveLength(3);
    expect(host.rejected.map((event) => event.value)).toEqual(['Angular']);
    expect(chips().map((chip) => chip.textContent?.trim())).toEqual(['angular', 'signals', 'rxjs']);
    expect(chips()[0].getAttribute('role')).toBe('listitem');
  });

  it('splits a pasted list by lines and a pattern separator', () => {
    host.separator.set(/[\s,;]+/);
    render();
    paste('one.example.com\ntwo.example.com; three.example.com');
    expect(host.control.value).toEqual(['one.example.com', 'two.example.com', 'three.example.com']);
  });

  it('removes with Backspace in an empty field and with the chip button', () => {
    host.control.setValue(['a', 'b', 'c']);
    render();
    key('Backspace');
    expect(host.control.value).toEqual(['a', 'b']);
    const remove = chips()[0].querySelector('button') as HTMLButtonElement;
    expect(remove.getAttribute('aria-label')).toBe('Remove a');
    remove.click();
    render();
    expect(host.control.value).toEqual(['b']);
    expect(host.removed).toEqual(['c', 'a']);
  });

  it('respects max, maxLength and pattern', () => {
    host.max.set(2);
    host.maxLength.set(10);
    host.pattern.set(/^[a-z]+$/);
    render();
    type('averyveryverylongword');
    key('Enter');
    type('B2');
    key('Enter');
    type('ok');
    key('Enter');
    type('more');
    key('Enter');
    expect(host.control.value).toEqual(['averyveryv', 'ok']);
    expect(input().readOnly).toBe(true);
    expect(host.rejected.map((event) => event.value)).toEqual(['B2', 'more']);
  });

  it('adds on blur, clears and renders own chip content', () => {
    host.custom.set(true);
    render();
    type('draft');
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(host.control.value).toEqual(['draft']);
    expect(host.control.touched).toBe(true);
    expect(chips()[0].textContent?.trim()).toBe('#draft');
    (fixture.nativeElement.querySelector('.tx-chips-input__clear') as HTMLButtonElement).click();
    render();
    expect(host.control.value).toEqual([]);
  });

  it('keeps the browser paste for a single item and without clipboard data', () => {
    const single = new Event('paste', { cancelable: true });
    Object.defineProperty(single, 'clipboardData', { value: { getData: () => 'one' } });
    input().dispatchEvent(single);
    const empty = new Event('paste', { cancelable: true });
    input().dispatchEvent(empty);
    expect(single.defaultPrevented).toBe(false);
    expect(empty.defaultPrevented).toBe(false);
    expect(host.control.value).toBeNull();
  });

  it('does nothing for Enter, Backspace and blur without text to act on', () => {
    key('Enter');
    key('Backspace');
    input().dispatchEvent(new FocusEvent('blur'));
    render();
    expect(host.control.value).toBeNull();
    host.control.setValue(['a']);
    render();
    type('b');
    key('Backspace');
    expect(host.control.value).toEqual(['a']);
    expect(host.added).toEqual([]);
  });

  it('focuses the field on a click in the box but not on a chip button', () => {
    host.control.setValue(['a']);
    render();
    const box = fixture.nativeElement.querySelector('.tx-chips-input__box') as HTMLElement;
    box.click();
    expect(document.activeElement).toBe(input());
    input().blur();
    const button = chips()[0].querySelector('button') as HTMLButtonElement;
    const focus = vi.spyOn(input(), 'focus');
    button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    fixture.nativeElement.querySelector('tx-chips-input').dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(focus).toHaveBeenCalledTimes(1);
    focus.mockClear();
    button.click();
    render();
    expect(focus).toHaveBeenCalledTimes(1);
    expect(host.control.value).toEqual([]);
  });

  it('does not remove items while disabled', () => {
    host.control.setValue(['a']);
    host.control.disable();
    render();
    const chipsInput = fixture.debugElement.query((node) => node.componentInstance instanceof TxChipsInput).componentInstance as TxChipsInput;
    chipsInput.removeAt(0);
    expect(host.control.value).toEqual(['a']);
    expect(host.removed).toEqual([]);
  });
});

@Component({
  imports: [TxChipsInput],
  template: `
    <tx-chips-input id="plain" ariaLabel="Tags" caseSensitive [addOnBlur]="false" (added)="added.push($event.value)" />
    <tx-chips-input id="locked" ariaLabel="Locked" readonly />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  added: string[] = [];
}

describe('TxChipsInput without a form control', () => {
  let fixture: ComponentFixture<PlainHost>;
  const field = (id: string) => fixture.nativeElement.querySelector(`#${id} .tx-chips-input__input`) as HTMLInputElement;
  const component = (id: string) => fixture.debugElement.query((node) => node.nativeElement.id === id).componentInstance as TxChipsInput;
  const enter = (id: string, text: string) => {
    field(id).value = text;
    field(id).dispatchEvent(new Event('input'));
    field(id).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));
    fixture.detectChanges();
  };

  beforeEach(() => {
    fixture = TestBed.createComponent(PlainHost);
    fixture.detectChanges();
  });

  it('starts empty, compares case-sensitively and keeps text on blur', () => {
    expect(component('plain').values()).toEqual([]);
    enter('plain', 'Tag');
    enter('plain', 'tag');
    enter('plain', 'Tag');
    expect(fixture.componentInstance.added).toEqual(['Tag', 'tag']);
    field('plain').value = 'draft';
    field('plain').dispatchEvent(new Event('input'));
    field('plain').dispatchEvent(new FocusEvent('blur'));
    fixture.detectChanges();
    expect(component('plain').values()).toEqual(['Tag', 'tag']);
    expect(field('plain').value).toBe('draft');
  });

  it('ignores keys and removals when readonly', () => {
    enter('locked', 'one');
    expect(component('locked').values()).toEqual([]);
    component('locked').writeValue(['kept']);
    component('locked').removeAt(0);
    expect(component('locked').values()).toEqual(['kept']);
  });
});

describe('TxChipsInput recompiled by TestBed', () => {
  it('still finds its item template when a test overrides the component', () => {
    TestBed.overrideComponent(TxChipsInput, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.custom.set(true);
    fixture.componentInstance.control.setValue(['x']);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tx-chip').textContent.trim()).toBe('#x');
  });
});

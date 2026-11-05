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
});

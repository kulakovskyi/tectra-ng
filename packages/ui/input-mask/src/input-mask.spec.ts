import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInputMask } from './input-mask.directive';

@Component({
  imports: [TxInputMask, ReactiveFormsModule],
  template: `<input aria-label="Phone" txInputMask="(999) 999-9999" [unmask]="unmask()" [autoClear]="autoClear()" [formControl]="phone" (completed)="done.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly phone = new FormControl<string | null>(null);
  readonly unmask = signal(false);
  readonly autoClear = signal(true);
  done: string[] = [];
}

describe('TxInputMask', () => {
  let fixture: ComponentFixture<Host>;
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const send = (inputType: string, data: string | null = null) => {
    const event = new InputEvent('beforeinput', { inputType, data, cancelable: true });
    input().dispatchEvent(event);
    return event.defaultPrevented;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    input().focus();
    input().dispatchEvent(new Event('focus'));
  });

  it('shows the mask on focus and types into the slots', () => {
    expect(input().value).toBe('(___) ___-____');
    input().setSelectionRange(1, 1);
    expect(send('insertText', '0')).toBe(true);
    send('insertText', '5');
    expect(input().value).toBe('(05_) ___-____');
    expect(input().selectionStart).toBe(3);
    expect(fixture.componentInstance.phone.value).toBe('(05');
  });

  it('never types past the first empty position', () => {
    input().setSelectionRange(9, 9);
    send('insertText', '7');
    expect(input().value).toBe('(7__) ___-____');
    input().setSelectionRange(12, 12);
    input().dispatchEvent(new Event('click'));
    expect(input().selectionStart).toBe(2);
  });

  it('pastes a formatted number, completes and reports it', () => {
    input().setSelectionRange(1, 1);
    send('insertFromPaste', '+38 (050) 123-45-67');
    expect(input().value).toBe('(380) 501-2345');
    expect(fixture.componentInstance.phone.value).toBe('(380) 501-2345');
    expect(fixture.componentInstance.done).toEqual(['(380) 501-2345']);
  });

  it('writes the value without literals with unmask', async () => {
    fixture.componentInstance.unmask.set(true);
    await fixture.whenStable();
    input().setSelectionRange(1, 1);
    send('insertText', '0501234567'.slice(0, 1));
    send('insertFromPaste', '501234567');
    expect(fixture.componentInstance.phone.value).toBe('0501234567');
  });

  it('deletes backward over a literal', () => {
    fixture.componentInstance.phone.setValue('(050) 123-4567');
    input().setSelectionRange(6, 6);
    send('deleteContentBackward');
    expect(input().value).toBe('(051) 234-567_');
    expect(input().selectionStart).toBe(3);
  });

  it('clears an incomplete value on blur, or keeps it without autoClear', async () => {
    input().setSelectionRange(1, 1);
    send('insertText', '0');
    input().dispatchEvent(new Event('blur'));
    expect(input().value).toBe('');
    expect(fixture.componentInstance.phone.value).toBe('');
    expect(fixture.componentInstance.phone.touched).toBe(true);
    fixture.componentInstance.autoClear.set(false);
    await fixture.whenStable();
    input().dispatchEvent(new Event('focus'));
    input().setSelectionRange(1, 1);
    send('insertText', '0');
    input().dispatchEvent(new Event('blur'));
    expect(input().value).toBe('(0');
  });

  it('formats a value written by the form', () => {
    input().dispatchEvent(new Event('blur'));
    fixture.componentInstance.phone.setValue('0501234567');
    expect(input().value).toBe('(050) 123-4567');
  });
});

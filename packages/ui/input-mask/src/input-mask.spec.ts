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

@Component({
  imports: [TxInputMask],
  template: `<input aria-label="Code" [txInputMask]="mask()" [readOnly]="readOnly()" (completed)="done.push($event)" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly mask = signal('99-99');
  readonly readOnly = signal(false);
  done: string[] = [];
}

describe('TxInputMask without a form', () => {
  let fixture: ComponentFixture<PlainHost>;
  const input = () => fixture.nativeElement.querySelector('input') as HTMLInputElement;
  const send = (inputType: string, data: string | null = null, dataTransfer: DataTransfer | null = null) => {
    const event = new InputEvent('beforeinput', { inputType, data, cancelable: true });
    if (dataTransfer) {
      Object.defineProperty(event, 'dataTransfer', { value: dataTransfer });
    }
    input().dispatchEvent(event);
    return event.defaultPrevented;
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(PlainHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    input().focus();
    input().dispatchEvent(new Event('focus'));
  });

  it('types, cuts and deletes a selection or forward without a form control', () => {
    input().setSelectionRange(0, 0);
    send('insertText', '1234');
    expect(input().value).toBe('12-34');
    expect(fixture.componentInstance.done).toEqual(['12-34']);
    input().setSelectionRange(1, 4);
    expect(send('deleteByCut')).toBe(true);
    expect(input().value).toBe('14-__');
    input().setSelectionRange(0, 0);
    send('deleteContentForward');
    expect(input().value).toBe('4_-__');
    input().setSelectionRange(0, 1);
    send('deleteWordForward');
    expect(input().value).toBe('__-__');
    send('insertText', '56');
    input().setSelectionRange(0, 2);
    send('deleteContentBackward');
    expect(input().value).toBe('__-__');
    input().dispatchEvent(new Event('blur'));
    expect(input().value).toBe('');
  });

  it('takes dropped text from the data transfer and ignores other edits', () => {
    const transfer = { getData: () => '78' } as unknown as DataTransfer;
    input().setSelectionRange(0, 0);
    send('insertFromDrop', null, transfer);
    expect(input().value).toBe('78-__');
    send('insertReplacementText');
    expect(input().value).toBe('78-__');
    expect(send('historyUndo')).toBe(false);
  });

  it('reads the selection as the start when the input has none', () => {
    send('insertText', '9');
    Object.defineProperty(input(), 'selectionStart', { configurable: true, get: () => null });
    Object.defineProperty(input(), 'selectionEnd', { configurable: true, get: () => null });
    send('insertText', '1');
    expect(input().value).toBe('19-__');
    input().dispatchEvent(new Event('click'));
    expect(input().value).toBe('19-__');
  });

  it('leaves a read-only input alone', async () => {
    fixture.componentInstance.readOnly.set(true);
    await fixture.whenStable();
    expect(send('insertText', '1')).toBe(false);
    expect(input().value).toBe('__-__');
  });

  it('formats text set by the browser and keeps the values when the mask keeps its length', async () => {
    input().value = '4321';
    input().dispatchEvent(new Event('input'));
    expect(input().value).toBe('43-21');
    expect(input().selectionStart).toBe(5);
    fixture.componentInstance.mask.set('99/99');
    await fixture.whenStable();
    expect(input().value).toBe('43/21');
    input().blur();
    input().value = '12';
    input().dispatchEvent(new Event('input'));
    expect(input().value).toBe('12-__'.replace('-', '/'));
  });
});

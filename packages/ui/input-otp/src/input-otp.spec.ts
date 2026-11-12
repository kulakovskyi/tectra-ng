import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxInputOtp } from './input-otp.component';

@Component({
  imports: [TxInputOtp, ReactiveFormsModule],
  template: `<tx-input-otp
    [formControl]="code"
    [length]="6"
    [integerOnly]="integerOnly()"
    [mask]="mask()"
    [groupSize]="3"
    ariaLabel="Code"
    [dt]="{ root: { gap: '4px' } }"
    [pt]="{ cell: { class: 'own-cell' } }"
    (completed)="completed.push($event)"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly code = new FormControl('', [Validators.required, Validators.minLength(6)]);
  readonly integerOnly = signal(true);
  readonly mask = signal(false);
  completed: string[] = [];
}

describe('TxInputOtp', () => {
  let fixture: ComponentFixture<Host>;
  const cells = () => Array.from(fixture.nativeElement.querySelectorAll('input')) as HTMLInputElement[];
  const host = () => fixture.nativeElement.querySelector('tx-input-otp') as HTMLElement;
  const type = async (index: number, value: string) => {
    const cell = cells()[index];
    cell.focus();
    cell.value = value;
    cell.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  const key = async (index: number, name: string) => {
    cells()[index].dispatchEvent(new KeyboardEvent('keydown', { key: name, cancelable: true }));
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders named cells in a labelled group with a separator', () => {
    expect(host().getAttribute('role')).toBe('group');
    expect(host().getAttribute('aria-label')).toBe('Code');
    expect(cells()).toHaveLength(6);
    expect(cells()[2].getAttribute('aria-label')).toBe('Character 3 of 6');
    expect(cells()[0].getAttribute('autocomplete')).toBe('one-time-code');
    expect(cells()[0].getAttribute('inputmode')).toBe('numeric');
    expect(host().querySelectorAll('.tx-input-otp__separator')).toHaveLength(1);
    expect(cells()[0].classList).toContain('own-cell');
    expect(host().style.getPropertyValue('--tx-input-otp-gap')).toBe('4px');
  });

  it('moves forward while typing and reports the complete code', async () => {
    await type(0, '1');
    expect(document.activeElement).toBe(cells()[1]);
    await type(1, 'a');
    expect(cells()[1].value).toBe('');
    for (const [index, digit] of ['2', '3', '4', '5', '6'].entries()) {
      await type(index + 1, digit);
    }
    expect(fixture.componentInstance.code.value).toBe('123456');
    expect(fixture.componentInstance.completed).toEqual(['123456']);
    expect(host().classList).toContain('tx-input-otp--filled');
  });

  it('spreads a pasted or autofilled code over the cells', async () => {
    const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    Object.defineProperty(paste, 'clipboardData', { value: { getData: () => '98 76 54' } });
    cells()[0].dispatchEvent(paste);
    await fixture.whenStable();
    expect(fixture.componentInstance.code.value).toBe('987654');
    expect(cells().map((cell) => cell.value)).toEqual(['9', '8', '7', '6', '5', '4']);
    fixture.componentInstance.code.setValue('');
    await fixture.whenStable();
    await type(0, '1234');
    expect(fixture.componentInstance.code.value).toBe('1234');
    expect(document.activeElement).toBe(cells()[4]);
  });

  it('goes back with Backspace and the arrow keys', async () => {
    fixture.componentInstance.code.setValue('12');
    await fixture.whenStable();
    cells()[2].focus();
    await key(2, 'Backspace');
    expect(fixture.componentInstance.code.value).toBe('1');
    expect(document.activeElement).toBe(cells()[1]);
    await key(1, 'ArrowLeft');
    expect(document.activeElement).toBe(cells()[0]);
    await key(0, 'End');
    expect(document.activeElement).toBe(cells()[5]);
    await key(5, 'Home');
    expect(document.activeElement).toBe(cells()[0]);
  });

  it('masks, follows the form state', async () => {
    fixture.componentInstance.mask.set(true);
    await fixture.whenStable();
    expect(cells()[0].type).toBe('password');
    fixture.componentInstance.code.markAsTouched();
    await fixture.whenStable();
    expect(cells()[0].getAttribute('aria-invalid')).toBe('true');
    fixture.componentInstance.code.disable();
    await fixture.whenStable();
    expect(cells().every((cell) => cell.disabled)).toBe(true);
  });

  it('deletes in place, moves right, and keeps a cell on Backspace when it has a character', async () => {
    fixture.componentInstance.code.setValue('123');
    await fixture.whenStable();
    await key(1, 'Delete');
    expect(cells().map((cell) => cell.value)).toEqual(['1', '', '3', '', '', '']);
    await key(0, 'ArrowRight');
    expect(document.activeElement).toBe(cells()[1]);
    await key(5, 'ArrowRight');
    expect(document.activeElement).toBe(cells()[5]);
    await key(0, 'Backspace');
    expect(cells()[0].value).toBe('1');
    await key(0, 'Tab');
    expect(fixture.componentInstance.code.value).toBe('13');
  });

  it('replaces a character typed over an existing one and clears an emptied cell', async () => {
    fixture.componentInstance.code.setValue('12');
    await fixture.whenStable();
    await type(3, ' ');
    expect(cells()[3].value).toBe('');
    await type(0, '15');
    expect(cells()[0].value).toBe('5');
    expect(cells()[1].value).toBe('2');
    await type(1, '');
    expect(cells()[1].value).toBe('2');
    await type(3, ' ');
    expect(cells()[3].value).toBe('');
    expect(fixture.componentInstance.code.value).toBe('52');
  });

  it('ignores an empty paste and accepts letters without integerOnly', async () => {
    const paste = new Event('paste', { cancelable: true }) as ClipboardEvent;
    cells()[0].dispatchEvent(paste);
    await fixture.whenStable();
    expect(paste.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.code.value).toBe('');
    fixture.componentInstance.integerOnly.set(false);
    await fixture.whenStable();
    await type(0, 'ab');
    expect(fixture.componentInstance.code.value).toBe('ab');
  });

  it('focuses the first empty cell and shows an empty code for null', async () => {
    fixture.componentInstance.code.setValue('12');
    await fixture.whenStable();
    const otp = fixture.debugElement.query((node) => node.componentInstance instanceof TxInputOtp).componentInstance as TxInputOtp;
    otp.focus();
    expect(document.activeElement).toBe(cells()[2]);
    fixture.componentInstance.code.setValue('123456');
    await fixture.whenStable();
    otp.focus();
    expect(document.activeElement).toBe(cells()[5]);
    fixture.componentInstance.code.setValue(null);
    await fixture.whenStable();
    expect(cells().every((cell) => cell.value === '')).toBe(true);
  });
});

@Component({
  imports: [TxInputOtp],
  template: `<tx-input-otp [length]="4" autoFocus ariaLabel="Pin" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AutoFocusHost {}

describe('TxInputOtp with autoFocus', () => {
  it('focuses the first cell after the first render', async () => {
    const fixture = TestBed.createComponent(AutoFocusHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('input'));
  });
});

describe('TxInputOtp recompiled by TestBed', () => {
  it('still reads its cells when a test overrides the component', async () => {
    TestBed.overrideComponent(TxInputOtp, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    fixture.componentInstance.code.setValue('42');
    await fixture.whenStable();
    expect(Array.from(fixture.nativeElement.querySelectorAll('input'), (cell: HTMLInputElement) => cell.value).slice(0, 3)).toEqual(['4', '2', '']);
  });
});

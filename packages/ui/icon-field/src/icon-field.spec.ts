import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxIconField } from './icon-field.component';
import { TxInputClear } from './input-clear.component';
import { TxInputCopy } from './input-copy.component';
import { TxInputIcon } from './input-icon.component';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxIconField, TxInputIcon, TxInputClear, TxInputCopy, TxInput, ReactiveFormsModule],
  template: `
    <tx-icon-field>
      <tx-input-icon [icon]="'search'" />
      <input txInput [formControl]="control" />
      <tx-input-icon position="end">.com</tx-input-icon>
      <tx-input-clear (cleared)="cleared = cleared + 1" />
      <tx-input-copy (copied)="copied = $event" />
    </tx-icon-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly control = new FormControl('hello');
  cleared = 0;
  copied = '';
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxIconField', () => {
  let fixture: ComponentFixture<Host>;
  const query = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;

  beforeEach(async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('puts icons into the start and end slots', () => {
    expect(query('.tx-icon-field__slot--start tx-input-icon tx-icon')).not.toBeNull();
    expect(query('.tx-icon-field__slot--end tx-input-icon')?.textContent?.trim()).toBe('.com');
  });

  it('marks what its slots hold, so the input leaves room before it is measured', () => {
    const field = query('tx-icon-field');
    expect(field.classList).toContain('tx-icon-field--start-icon');
    expect(field.classList).toContain('tx-icon-field--end-action');
    expect(field.classList).not.toContain('tx-icon-field--end-icon');
  });

  it('clears the form value and hides the clear button', async () => {
    const clear = query('tx-input-clear button');
    expect(clear).not.toBeNull();
    clear.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('');
    expect(fixture.componentInstance.cleared).toBe(1);
    expect(query('tx-input-clear button')).toBeNull();
  });

  it('copies the value and shows a check', async () => {
    query('tx-input-copy button').click();
    await fixture.whenStable();
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('hello');
    expect(fixture.componentInstance.copied).toBe('hello');
    expect(query('tx-input-copy button').getAttribute('aria-label')).toBe('Copied');
  });
});

@Component({
  imports: [TxIconField, TxInputIcon, TxInputClear, TxInput],
  template: `
    <tx-icon-field>
      <tx-input-icon icon="own-icon-class" />
      <input txInput value="draft" [readOnly]="readOnly()" />
      <tx-input-icon position="end" icon="search" />
    </tx-icon-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly readOnly = signal(false);
}

@Component({
  imports: [TxIconField, TxInputCopy],
  template: `
    <tx-icon-field>
      <span class="no-input">Code</span>
      <tx-input-copy (copied)="copied.push($event)" />
    </tx-icon-field>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class EmptyHost {
  readonly copied: string[] = [];
}

describe('TxIconField without a form control', () => {
  const observers: { callback: ResizeObserverCallback; targets: Element[]; disconnect: ReturnType<typeof vi.fn> }[] = [];

  beforeEach(() => {
    observers.length = 0;
    vi.stubGlobal(
      'ResizeObserver',
      class {
        readonly targets: Element[] = [];
        readonly disconnect = vi.fn();
        constructor(readonly callback: ResizeObserverCallback) {
          observers.push(this);
        }
        observe(target: Element): void {
          this.targets.push(target);
        }
      },
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('measures its slots into insets and stops observing when destroyed', async () => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (this: HTMLElement) {
      return { width: this.classList.contains('tx-icon-field__slot--start') ? 20.4 : 0 } as DOMRect;
    });
    const fixture = TestBed.createComponent(PlainHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const field = fixture.nativeElement.querySelector('tx-icon-field') as HTMLElement;
    expect(observers).toHaveLength(1);
    expect(observers[0].targets).toHaveLength(2);
    expect(field.style.getPropertyValue('--tx-field-inset-start')).toBe('26px');
    expect(field.style.getPropertyValue('--tx-field-inset-end')).toBe('0px');
    expect(field.classList).toContain('tx-icon-field--end-icon');
    expect(field.querySelector('.tx-icon-field__slot--start span.own-icon-class')).not.toBeNull();
    fixture.destroy();
    expect(observers[0].disconnect).toHaveBeenCalled();
  });

  it('clears a plain input through an input event', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const events: string[] = [];
    input.addEventListener('input', () => events.push(input.value));
    const field = fixture.debugElement.query((node) => node.componentInstance instanceof TxIconField).componentInstance as TxIconField;
    expect(field.value()).toBe('draft');
    expect(field.hasValue()).toBe(true);
    field.clear();
    expect(input.value).toBe('');
    expect(events).toEqual(['']);
    expect(field.hasValue()).toBe(false);
    expect(document.activeElement === input || !input.isConnected).toBe(true);
  });

  it('does not offer clearing for a read-only input', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    fixture.componentInstance.readOnly.set(true);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const field = fixture.debugElement.query((node) => node.componentInstance instanceof TxIconField).componentInstance as TxIconField;
    expect(field.isEditable()).toBe(false);
  });

  it('copies an empty value without an input and resets the check after a while', async () => {
    Object.assign(navigator, { clipboard: undefined });
    const fixture = TestBed.createComponent(EmptyHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    vi.useFakeTimers();
    const field = fixture.debugElement.query((node) => node.componentInstance instanceof TxIconField).componentInstance as TxIconField;
    field.clear();
    expect(field.value()).toBe('');
    const button = fixture.nativeElement.querySelector('tx-input-copy button') as HTMLButtonElement;
    button.click();
    button.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.copied).toEqual(['', '']);
    expect(button.getAttribute('aria-label')).toBe('Copied');
    vi.advanceTimersByTime(1500);
    fixture.detectChanges();
    expect(button.getAttribute('aria-label')).toBe('Copy');
    button.click();
    fixture.destroy();
  });
});

describe('TxIconField with a disabled control', () => {
  it('hides the clear button when the control gets disabled', async () => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('tx-input-clear button')).not.toBeNull();
    fixture.componentInstance.control.disable();
    await fixture.whenStable();
    await Promise.resolve();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('tx-input-clear button')).toBeNull();
  });
});

describe('TxIconField recompiled by TestBed', () => {
  it('still finds the projected input and its control when a test overrides the component', async () => {
    TestBed.overrideComponent(TxIconField, { set: { styles: [] } });
    Object.assign(navigator, { clipboard: { writeText: vi.fn() } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    (fixture.nativeElement.querySelector('tx-input-clear button') as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.control.value).toBe('');
    expect(fixture.componentInstance.control.dirty).toBe(true);
  });
});

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxInput } from '@tectra-ng/ui/input';
import { TxIconField } from './icon-field.component';
import { TxInputClear } from './input-clear.component';
import { TxInputCopy } from './input-copy.component';
import { TxInputIcon } from './input-icon.component';

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

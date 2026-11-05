import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxConfirmService } from './confirm.service';

@Component({
  template: `<button id="delete">Delete</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {}

describe('TxConfirmService', () => {
  let fixture: ComponentFixture<Host>;
  let confirm: TxConfirmService;
  const query = (selector: string) => document.querySelector(selector) as HTMLElement | null;
  const settle = async () => {
    await fixture.whenStable();
    for (let i = 0; i < 4; i++) {
      await Promise.resolve();
    }
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    confirm = TestBed.inject(TxConfirmService);
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('asks in an alertdialog with translated defaults and focus on the safe button', async () => {
    const answer = confirm.dialog({ message: 'The file will be gone.', severity: 'danger' });
    await settle();
    const dialog = query('.tx-dialog') as HTMLElement;
    expect(dialog.getAttribute('role')).toBe('alertdialog');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Are you sure?');
    expect(document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent).toBe('The file will be gone.');
    expect(query('.tx-confirm')?.getAttribute('data-severity')).toBe('danger');
    expect(query('.tx-confirm__icon tx-icon')?.getAttribute('data-icon')).toBe('trash');
    expect(query('.tx-confirm__accept')?.textContent?.trim()).toBe('Delete');
    expect(query('.tx-confirm__reject')?.textContent?.trim()).toBe('Cancel');
    expect(document.activeElement).toBe(query('.tx-confirm__reject'));
    query('.tx-confirm__accept')?.click();
    expect(await answer).toBe(true);
  });

  it('answers false on cancel and on Escape', async () => {
    const cancelled = confirm.dialog({ title: 'Leave the page?' });
    await settle();
    expect(query('.tx-confirm__accept')?.textContent?.trim()).toBe('Confirm');
    query('.tx-confirm__reject')?.click();
    expect(await cancelled).toBe(false);

    const escaped = confirm.dialog({ title: 'Archive?' });
    await settle();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    expect(await escaped).toBe(false);
  });

  it('waits for an async accept with a loading button and stays open when it fails', async () => {
    let finish: () => void = () => undefined;
    let fail: () => void = () => undefined;
    let attempt = 0;
    const answer = confirm.dialog({
      title: 'Revoke the key?',
      accept: () =>
        new Promise<void>((resolve, reject) => {
          attempt++;
          finish = resolve;
          fail = () => reject(new Error('offline'));
        }),
    });
    await settle();
    query('.tx-confirm__accept')?.click();
    await settle();
    expect(query('.tx-confirm__accept')?.getAttribute('aria-busy')).toBe('true');
    expect(query('.tx-confirm__reject')?.hasAttribute('disabled')).toBe(true);
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fail();
    await settle();
    expect(query('.tx-dialog')).not.toBeNull();
    expect(query('.tx-confirm__accept')?.hasAttribute('aria-busy')).toBe(false);
    query('.tx-confirm__accept')?.click();
    await settle();
    finish();
    expect(await answer).toBe(true);
    expect(attempt).toBe(2);
  });

  it('asks in a popup next to the element', async () => {
    const target = document.getElementById('delete') as HTMLElement;
    const answer = confirm.popup(target, { message: 'Remove this member?', severity: 'warn', acceptLabel: 'Remove' });
    await settle();
    const popup = query('tx-confirm-popup') as HTMLElement;
    expect(popup.getAttribute('role')).toBe('alertdialog');
    expect(popup.getAttribute('aria-label')).toBe('Are you sure?');
    expect(document.getElementById(popup.getAttribute('aria-describedby') ?? '')?.textContent).toBe('Remove this member?');
    expect(popup.getAttribute('data-side')).toBe('bottom');
    expect(document.activeElement).toBe(popup.querySelector('.tx-confirm__reject'));
    (popup.querySelector('.tx-confirm__accept') as HTMLButtonElement).click();
    expect(await answer).toBe(true);
    await settle();
    expect(query('tx-confirm-popup')).toBeNull();
  });
});

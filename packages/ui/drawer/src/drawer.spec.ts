import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxDialogClose } from '@tectra/ui/dialog';
import { TxDrawer, TxDrawerFooter } from './drawer.component';

@Component({
  imports: [TxDrawer, TxDrawerFooter, TxDialogClose],
  template: `
    <tx-drawer header="Filters" size="large" [(visible)]="filters" (closed)="closed = closed + 1">
      <label><input type="checkbox" class="paid" /> Paid only</label>
      <div txDrawerFooter><button class="apply" txDialogClose>Apply</button></div>
    </tx-drawer>
    <tx-drawer position="left" ariaLabel="Navigation" [modal]="false" [(visible)]="menu">
      <a class="link" href="#">Home</a>
    </tx-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly filters = signal(false);
  readonly menu = signal(false);
  closed = 0;
}

describe('TxDrawer', () => {
  let fixture: ComponentFixture<Host>;
  const container = () => document.querySelector('tx-dialog-container') as HTMLElement | null;
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
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('slides in from the right as a named modal dialog with a footer', async () => {
    fixture.componentInstance.filters.set(true);
    await settle();
    const host = container() as HTMLElement;
    expect(host.getAttribute('data-drawer')).toBe('right');
    expect(host.style.getPropertyValue('--_drawer-size')).toBe('var(--tx-dialog-drawer-lg)');
    const panel = host.querySelector('.tx-dialog') as HTMLElement;
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(panel.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Filters');
    expect(panel.querySelector('.tx-dialog-footer .apply')).not.toBeNull();
    expect(host.querySelector('.tx-dialog-mask')).not.toBeNull();
    (panel.querySelector('.apply') as HTMLButtonElement).click();
    await settle();
    expect(container()).toBeNull();
    expect(fixture.componentInstance.filters()).toBe(false);
    expect(fixture.componentInstance.closed).toBe(1);
  });

  it('closes with Escape and the mask', async () => {
    fixture.componentInstance.filters.set(true);
    await settle();
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await settle();
    expect(container()).toBeNull();
    fixture.componentInstance.filters.set(true);
    await settle();
    (document.querySelector('.tx-dialog-mask') as HTMLElement).click();
    await settle();
    expect(container()).toBeNull();
  });

  it('opens without a mask on the left when not modal', async () => {
    fixture.componentInstance.menu.set(true);
    await settle();
    const host = container() as HTMLElement;
    expect(host.getAttribute('data-drawer')).toBe('left');
    expect(host.querySelector('.tx-dialog-mask')).toBeNull();
    const panel = host.querySelector('.tx-dialog') as HTMLElement;
    expect(panel.hasAttribute('aria-modal')).toBe(false);
    expect(panel.getAttribute('aria-label')).toBe('Navigation');
    expect(panel.querySelector('.tx-dialog-header')).toBeNull();
    fixture.componentInstance.menu.set(false);
    await settle();
    expect(container()).toBeNull();
  });
});

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxDialogClose } from '@tectra-ng/ui/dialog';
import { TxDrawer, TxDrawerFooter, TxDrawerHeader } from './drawer.component';

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

@Component({
  imports: [TxDrawer, TxDrawerHeader],
  template: `
    <tx-drawer #drawer [(visible)]="open" (closed)="closed = closed + 1">
      <div txDrawerHeader><h2 class="own-header">Settings</h2></div>
      <button class="done" (click)="drawer.close()">Done</button>
    </tx-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class HeaderHost {
  readonly open = signal(true);
  closed = 0;
}

describe('TxDrawer with an own header', () => {
  let fixture: ComponentFixture<HeaderHost>;
  const settle = async () => {
    await fixture.whenStable();
    for (let i = 0; i < 4; i++) {
      await Promise.resolve();
    }
    await fixture.whenStable();
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(HeaderHost);
    fixture.autoDetectChanges();
    await settle();
  });

  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('shows the own header and closes from its content', async () => {
    expect(document.querySelector('tx-dialog-container .own-header')?.textContent).toBe('Settings');
    (document.querySelector('tx-dialog-container .done') as HTMLButtonElement).click();
    await settle();
    expect(document.querySelector('tx-dialog-container')).toBeNull();
    expect(fixture.componentInstance.open()).toBe(false);
    expect(fixture.componentInstance.closed).toBe(1);
    fixture.destroy();
  });

  it('closes quietly when its host goes away', async () => {
    fixture.destroy();
    await Promise.resolve();
    await Promise.resolve();
    expect(fixture.componentInstance.closed).toBe(0);
    expect(fixture.componentInstance.open()).toBe(true);
  });
});

describe('TxDrawer recompiled by TestBed', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('still finds its header and footer when a test overrides the component', async () => {
    TestBed.overrideComponent(TxDrawer, { set: { styles: [] } });
    const fixture = TestBed.createComponent(HeaderHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
    expect(document.querySelector('tx-dialog-container .own-header')).not.toBeNull();
    fixture.destroy();
  });
});


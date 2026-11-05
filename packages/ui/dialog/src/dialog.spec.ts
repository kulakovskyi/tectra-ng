import { ChangeDetectionStrategy, Component, TemplateRef, input, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { TxDialogContent, TxDialogClose, TxDialogFooter, TxDialogHeader } from './dialog-parts.component';
import { injectDialogData, injectDialogRef } from './dialog-ref';
import { TxDialog } from './dialog.component';
import { TxDialogService } from './dialog.service';
import { TxDialogTemplateContext } from './dialog.types';

@Component({
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxDialogClose],
  template: `
    <tx-dialog-header title="Rename project" subtitle="Visible to the whole team" />
    <tx-dialog-content>
      <input class="name" aria-label="Name" [value]="data.name" />
      <span class="note">{{ note() }}</span>
    </tx-dialog-content>
    <tx-dialog-footer>
      <button class="cancel" txDialogClose>Cancel</button>
      <button class="save" [txDialogClose]="'saved'">Save</button>
    </tx-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class RenameDialog {
  readonly data = injectDialogData<{ name: string }>();
  readonly ref = injectDialogRef<string>();
  readonly note = input('');
}

@Component({
  imports: [TxDialog, TxDialogFooter, TxDialogClose],
  template: `
    <button id="opener">Open</button>
    <tx-dialog header="Delete file" [(visible)]="visible" [maximizable]="true" (closed)="closedCount = closedCount + 1">
      <p class="body">The file will be gone.</p>
      <tx-dialog-footer>
        <button class="keep" txDialogClose>Keep</button>
      </tx-dialog-footer>
    </tx-dialog>
    <ng-template #quick let-name let-close="close">
      <p class="quick">Hello {{ name }}</p>
      <button class="quick-ok" (click)="close('ok')">OK</button>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly visible = signal(false);
  readonly quick = viewChild.required<TemplateRef<TxDialogTemplateContext<string, string>>>('quick');
  closedCount = 0;
}

describe('TxDialog', () => {
  let fixture: ComponentFixture<Host>;
  let dialogs: TxDialogService;
  const panel = () => document.querySelector('.tx-dialog') as HTMLElement | null;
  const panels = () => [...document.querySelectorAll('.tx-dialog')] as HTMLElement[];
  const settle = async () => {
    await fixture.whenStable();
    for (let i = 0; i < 4; i++) {
      await Promise.resolve();
    }
    await fixture.whenStable();
  };
  const escape = () => document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    dialogs = TestBed.inject(TxDialogService);
    await settle();
  });

  afterEach(async () => {
    dialogs.closeAll();
    await settle();
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('opens a component with data and inputs as a named modal dialog and closes with a result', async () => {
    const opener = document.getElementById('opener') as HTMLButtonElement;
    opener.focus();
    const ref = dialogs.open<RenameDialog, { name: string }, string>(RenameDialog, { data: { name: 'Atlas' }, inputs: { note: 'Shared' }, size: 'small' });
    await settle();
    const dialog = panel() as HTMLElement;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('data-size')).toBe('small');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Rename project');
    expect(dialog.querySelector('.tx-dialog-header__subtitle')?.textContent).toBe('Visible to the whole team');
    expect((dialog.querySelector('.name') as HTMLInputElement).value).toBe('Atlas');
    expect(dialog.querySelector('.note')?.textContent).toBe('Shared');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(ref.componentInstance?.ref).toBe(ref);
    expect(dialogs.openDialogs()).toEqual([ref]);
    expect(document.querySelector('.tx-dialog-mask')).not.toBeNull();

    const result = firstValueFrom(ref.closed);
    (dialog.querySelector('.save') as HTMLButtonElement).click();
    expect(await result).toBe('saved');
    await settle();
    expect(panel()).toBeNull();
    expect(dialogs.openDialogs()).toEqual([]);
    expect(document.activeElement).toBe(opener);
  });

  it('closes with Escape, the mask and the close button unless told not to', async () => {
    dialogs.open(RenameDialog, { data: { name: 'A' } });
    await settle();
    escape();
    await settle();
    expect(panel()).toBeNull();

    dialogs.open(RenameDialog, { data: { name: 'B' } });
    await settle();
    (document.querySelector('.tx-dialog-mask') as HTMLElement).click();
    await settle();
    expect(panel()).toBeNull();

    dialogs.open(RenameDialog, { data: { name: 'C' }, closable: false });
    await settle();
    expect(document.querySelector('.tx-dialog-header__button')).toBeNull();
    escape();
    (document.querySelector('.tx-dialog-mask') as HTMLElement).click();
    await settle();
    expect(panel()).not.toBeNull();
    (document.querySelector('.cancel') as HTMLButtonElement).click();
    await settle();
    expect(panel()).toBeNull();
  });

  it('asks its guard before closing', async () => {
    const allow = signal(false);
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' }, canClose: () => allow() });
    await settle();
    expect(await ref.close()).toBe(false);
    expect(panel()).not.toBeNull();
    allow.set(true);
    expect(await ref.close()).toBe(true);
    await settle();
    expect(panel()).toBeNull();
  });

  it('stacks dialogs and closes the top one with Escape', async () => {
    dialogs.open(RenameDialog, { data: { name: 'Bottom' } });
    dialogs.open(RenameDialog, { data: { name: 'Top' }, role: 'alertdialog', ariaLabel: 'Top dialog' });
    await settle();
    expect(panels().length).toBe(2);
    expect(panels()[1].getAttribute('role')).toBe('alertdialog');
    expect(panels()[1].getAttribute('aria-label')).toBe('Top dialog');
    expect(panels()[1].hasAttribute('aria-labelledby')).toBe(false);
    escape();
    await settle();
    expect(panels().map((dialog) => (dialog.querySelector('.name') as HTMLInputElement).value)).toEqual(['Bottom']);
  });

  it('renders a template with data and a close function', async () => {
    const ref = dialogs.open(fixture.componentInstance.quick(), { data: 'Ann', ariaLabel: 'Greeting' });
    await settle();
    expect(panel()?.querySelector('.quick')?.textContent).toBe('Hello Ann');
    const result = firstValueFrom(ref.closed);
    (panel()?.querySelector('.quick-ok') as HTMLButtonElement).click();
    expect(await result).toBe('ok');
  });

  it('sizes, maximizes, positions and drawers', async () => {
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' }, width: '500px', maximizable: true, position: 'top', dt: { root: { borderRadius: '2px' } } });
    await settle();
    const container = document.querySelector('tx-dialog-container') as HTMLElement;
    expect(container.getAttribute('data-position')).toBe('top');
    expect(container.style.getPropertyValue('--tx-dialog-border-radius')).toBe('2px');
    expect(panel()?.style.width).toBe('500px');
    const maximize = document.querySelector('.tx-dialog-header__button') as HTMLButtonElement;
    expect(maximize.getAttribute('aria-label')).toBe('Maximize');
    maximize.click();
    await settle();
    expect(ref.maximized()).toBe(true);
    expect(panel()?.classList).toContain('tx-dialog--maximized');
    expect(panel()?.style.width).toBe('100%');
    expect(maximize.getAttribute('aria-label')).toBe('Restore');
    ref.restore();
    ref.updateSize('600px');
    await settle();
    expect(panel()?.style.width).toBe('600px');
    await ref.close();

    dialogs.open(RenameDialog, { data: { name: 'D' }, drawer: 'right', drawerSize: 'large' });
    await settle();
    const drawer = document.querySelector('tx-dialog-container') as HTMLElement;
    expect(drawer.getAttribute('data-drawer')).toBe('right');
    expect(drawer.style.getPropertyValue('--_drawer-size')).toBe('var(--tx-dialog-drawer-lg)');
  });

  it('opens a declarative dialog from its model and closes it from projected content', async () => {
    fixture.componentInstance.visible.set(true);
    await settle();
    const dialog = panel() as HTMLElement;
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('Delete file');
    expect(dialog.querySelector('.body')?.textContent).toBe('The file will be gone.');
    expect(dialog.querySelector('.tx-dialog-footer .keep')).not.toBeNull();
    expect(dialog.querySelectorAll('.tx-dialog-header__button').length).toBe(2);
    (dialog.querySelector('.keep') as HTMLButtonElement).click();
    await settle();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.visible()).toBe(false);
    expect(fixture.componentInstance.closedCount).toBe(1);

    fixture.componentInstance.visible.set(true);
    await settle();
    fixture.componentInstance.visible.set(false);
    await settle();
    expect(panel()).toBeNull();
  });
});

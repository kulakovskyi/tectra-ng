import { ChangeDetectionStrategy, Component, TemplateRef, input, signal, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { TxOverlayStack } from '@tectra-ng/core/overlay';
import { TxDialogContent, TxDialogClose, TxDialogFooter, TxDialogHeader, TxDialogTitle } from './dialog-parts.component';
import { TxDialogRef, injectDialogData, injectDialogRef } from './dialog-ref';
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
  imports: [TxDialogHeader, TxDialogContent, TxDialogTitle],
  template: `
    <tx-dialog-header>
      @if (customId()) {
        <h2 txDialogTitle id="custom-title">Own title</h2>
      } @else {
        <h2 txDialogTitle>Own title</h2>
      }
    </tx-dialog-header>
    <tx-dialog-content>
      <a class="link" href="#more">More</a>
      <input class="field" aria-label="Field" />
    </tx-dialog-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TitledDialog {
  readonly customId = input(false);
}

@Component({
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxDialogClose],
  template: `
    <tx-dialog-header title="Loose" />
    <tx-dialog-content>Text</tx-dialog-content>
    <tx-dialog-footer><button class="loose-close" txDialogClose>Close</button></tx-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LooseParts {}

@Component({
  imports: [TxDialog],
  template: `
    @if (shown()) {
      <tx-dialog [(visible)]="visible" [canClose]="guard()" (closed)="closedCount = closedCount + 1">
        <p class="plain">No header</p>
      </tx-dialog>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class GuardedHost {
  readonly shown = signal(true);
  readonly visible = signal(false);
  readonly guard = signal<(() => boolean) | undefined>(undefined);
  readonly dialog = viewChild(TxDialog);
  closedCount = 0;
}

@Component({
  imports: [TxDialog, TxDialogFooter, TxDialogClose],
  template: `
    <button id="opener">Open</button>
    <tx-dialog header="Delete file" [(visible)]="visible" [maximizable]="true" minWidth="12rem" maxWidth="36rem" maxHeight="24rem" (closed)="closedCount = closedCount + 1">
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
    expect(dialog.querySelector('tx-dialog-header')?.hasAttribute('title')).toBe(false);
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
    expect([dialog.style.minWidth, dialog.style.maxWidth, dialog.style.maxHeight]).toEqual(['12rem', '36rem', '24rem']);
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

  it('focuses the dialog, nothing or a selector when asked', async () => {
    dialogs.open(TitledDialog, { autoFocus: 'dialog' });
    await settle();
    expect(document.activeElement).toBe(panel());
    dialogs.closeAll();
    await settle();

    const opener = document.getElementById('opener') as HTMLButtonElement;
    opener.focus();
    dialogs.open(TitledDialog, { autoFocus: 'none' });
    await settle();
    expect(document.activeElement).toBe(opener);
    dialogs.closeAll();
    await settle();

    dialogs.open(TitledDialog, { autoFocus: '.field' });
    await settle();
    expect(document.activeElement).toBe(panel()?.querySelector('.field'));
  });

  it('names the dialog from an own title element', async () => {
    dialogs.open(TitledDialog);
    await settle();
    const title = panel()?.querySelector('h2') as HTMLElement;
    expect(title.classList).toContain('tx-dialog-header__title');
    expect(title.id).toMatch(/^tx-dialog-title/);
    expect(panel()?.getAttribute('aria-labelledby')).toBe(title.id);
    dialogs.closeAll();
    await settle();

    dialogs.open(TitledDialog, { inputs: { customId: true } });
    await settle();
    expect(panel()?.querySelector('h2')?.id).toBe('custom-title');
  });

  it('keeps the newest title when an older one unregisters', () => {
    const ref = new TxDialogRef('ref', {});
    const first = ref.registerTitle('first');
    ref.registerTitle('second');
    first();
    expect(ref.titleId()).toBe('second');
    ref.maximize();
    expect(ref.maximized()).toBe(true);
    ref.toggleMaximize();
    expect(ref.maximized()).toBe(false);
    expect(() => ref.dragFrom(new MouseEvent('pointerdown') as PointerEvent)).not.toThrow();
  });

  it('answers a guard given as an observable and ignores a second close while closing', async () => {
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' }, canClose: () => of(true) });
    await settle();
    const first = ref.close('one');
    expect(await ref.close('two')).toBe(false);
    expect(await first).toBe(true);
    expect(await ref.close('three')).toBe(false);
  });

  it('opens a non-modal dialog without a mask, scroll block or focus restore', async () => {
    const opener = document.getElementById('opener') as HTMLButtonElement;
    opener.focus();
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' }, modal: false, restoreFocus: false, panelClass: ['one', 'two'], minWidth: '10rem', maxWidth: '40rem', maxHeight: '30rem', height: '20rem' });
    await settle();
    const container = document.querySelector('tx-dialog-container') as HTMLElement;
    expect(document.querySelector('.tx-dialog-mask')).toBeNull();
    expect(panel()?.hasAttribute('aria-modal')).toBe(false);
    expect(panel()?.classList).toContain('one');
    expect(panel()?.classList).toContain('two');
    expect(panel()?.style.minWidth).toBe('10rem');
    expect(panel()?.style.maxWidth).toBe('40rem');
    expect(panel()?.style.maxHeight).toBe('30rem');
    expect(panel()?.style.height).toBe('20rem');
    expect((container.closest('.cdk-overlay-pane') as HTMLElement).style.pointerEvents).toBe('none');
    await ref.close();
    await settle();
    expect(document.activeElement).not.toBe(opener);

    dialogs.open(RenameDialog, { data: { name: 'B' }, blockScroll: false, drawer: 'left', drawerSize: '30rem', dismissableMask: false });
    await settle();
    const drawer = document.querySelector('tx-dialog-container') as HTMLElement;
    expect(drawer.style.getPropertyValue('--_drawer-size')).toBe('30rem');
    expect(panel()?.hasAttribute('data-size')).toBe(false);
    (document.querySelector('.tx-dialog-mask') as HTMLElement).click();
    await settle();
    expect(panel()).not.toBeNull();
  });

  it('closes open transient overlays before a modal opens and raises the layers kept on top after it', async () => {
    const stack = TestBed.inject(TxOverlayStack);
    const opener = document.getElementById('opener') as HTMLButtonElement;
    const order: string[] = [];
    const raise = vi.spyOn(stack, 'raise').mockImplementation(() => order.push('raise'));
    stack.addTransient(() => {
      order.push('closed');
      opener.focus();
    });
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' } });
    await settle();
    expect(order).toEqual(['closed', 'raise']);
    await ref.close();
    await settle();
    expect(document.activeElement).toBe(opener);

    stack.addTransient(() => order.push('closed again'));
    dialogs.open(RenameDialog, { data: { name: 'B' }, modal: false });
    await settle();
    expect(order).toEqual(['closed', 'raise']);
    stack.closeTransient();
    raise.mockRestore();
  });

  it('closes from the header close button', async () => {
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' } });
    await settle();
    const closed = firstValueFrom(ref.closed);
    (document.querySelector('.tx-dialog-header__button[aria-label="Close"]') as HTMLButtonElement).click();
    expect(await closed).toBeUndefined();
  });

  it('drags the dialog by its header inside the viewport', async () => {
    const view = document.documentElement;
    Object.defineProperty(view, 'clientWidth', { configurable: true, value: 1000 });
    Object.defineProperty(view, 'clientHeight', { configurable: true, value: 800 });
    const ref = dialogs.open(TitledDialog, { draggable: true, maximizable: true });
    await settle();
    const dialog = panel() as HTMLElement;
    dialog.getBoundingClientRect = () => ({ left: 100, right: 400, top: 100, bottom: 300, width: 300, height: 200, x: 100, y: 100, toJSON: () => ({}) });
    const header = dialog.querySelector('tx-dialog-header') as HTMLElement;
    const press = (target: Element, button = 0) => target.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, cancelable: true, button, clientX: 200, clientY: 150 }));
    const move = (x: number, y: number) => document.dispatchEvent(new MouseEvent('pointermove', { clientX: x, clientY: y }));

    expect(header.classList).toContain('tx-dialog-header--draggable');
    press(header, 2);
    press(dialog.querySelector('.tx-dialog-header__button') as HTMLElement);
    move(250, 180);
    await settle();
    expect(dialog.style.translate).toBe('');

    press(header);
    await settle();
    expect(dialog.classList).toContain('tx-dialog--dragging');
    move(250, 180);
    await settle();
    expect(dialog.style.translate).toBe('50px 30px');
    move(-500, 2000);
    await settle();
    expect(dialog.style.translate).toBe('-100px 500px');
    document.dispatchEvent(new MouseEvent('pointerup'));
    move(260, 160);
    await settle();
    expect(dialog.classList).not.toContain('tx-dialog--dragging');
    expect(dialog.style.translate).toBe('-100px 500px');

    ref.maximize();
    await settle();
    press(header);
    expect(dialog.classList).not.toContain('tx-dialog--dragging');
    expect(dialog.style.translate).toBe('');
    Reflect.deleteProperty(view, 'clientWidth');
    Reflect.deleteProperty(view, 'clientHeight');
  });

  it('picks the width of the matching breakpoint and follows viewport changes', async () => {
    const listeners = new Map<string, () => void>();
    const matching = new Set(['(max-width: 640px)']);
    const removed: string[] = [];
    const matchMedia = (query: string) => ({
      get matches() {
        return matching.has(query);
      },
      addEventListener: (_type: string, listener: () => void) => listeners.set(query, listener),
      removeEventListener: () => removed.push(query),
    });
    Object.defineProperty(window, 'matchMedia', { configurable: true, value: matchMedia });
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' } });
    await settle();
    expect(panel()?.style.width).toBe('90vw');
    matching.clear();
    matching.add('(max-width: 960px)');
    listeners.get('(max-width: 960px)')?.();
    await settle();
    expect(panel()?.style.width).toBe('500px');
    matching.clear();
    listeners.get('(max-width: 960px)')?.();
    await settle();
    expect(panel()?.style.width).toBe('');
    await ref.close();
    expect(removed.sort()).toEqual(['(max-width: 640px)', '(max-width: 960px)']);
    Reflect.deleteProperty(window, 'matchMedia');
  });

  it('waits for leave animations before removing the dialog', async () => {
    const cancelled = Promise.reject(new Error('cancelled'));
    cancelled.catch(() => undefined);
    const finished = [cancelled, Promise.resolve()];
    const animations = finished.map((done) => ({ finished: done }));
    Object.defineProperty(HTMLElement.prototype, 'getAnimations', { configurable: true, value: () => [animations.pop()].filter(Boolean) });
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' } });
    await settle();
    expect(await ref.close()).toBe(true);
    expect(document.querySelector('tx-dialog-container')).toBeNull();
    Reflect.deleteProperty(HTMLElement.prototype, 'getAnimations');
  });

  it('closes when the overlay is detached from outside', async () => {
    const ref = dialogs.open(RenameDialog, { data: { name: 'A' } });
    await settle();
    const closed = firstValueFrom(ref.closed);
    window.dispatchEvent(new PopStateEvent('popstate'));
    await closed;
    await settle();
    expect(panel()).toBeNull();
    expect(dialogs.openDialogs()).toEqual([]);
  });

  it('renders parts outside a dialog without a ref', async () => {
    const loose = TestBed.createComponent(LooseParts);
    await loose.whenStable();
    const element = loose.nativeElement as HTMLElement;
    const header = element.querySelector('tx-dialog-header') as HTMLElement;
    expect(header.querySelector('h2')?.textContent).toBe('Loose');
    header.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
    (header.querySelector('.tx-dialog-header__button') as HTMLButtonElement).click();
    (element.querySelector('.loose-close') as HTMLButtonElement).click();
    await loose.whenStable();
    expect(element.querySelector('tx-dialog-content')?.textContent).toBe('Text');
    expect(element.querySelector('tx-dialog-footer')?.classList).not.toContain('tx-dialog-footer--drawer');
    loose.destroy();
  });

  it('asks the guard of a declarative dialog, closes from the API and stays quiet when destroyed', async () => {
    const guarded = TestBed.createComponent(GuardedHost);
    guarded.autoDetectChanges();
    const host = guarded.componentInstance;
    host.guard.set(() => false);
    host.visible.set(true);
    await guarded.whenStable();
    expect(panel()?.querySelector('.plain')?.textContent).toBe('No header');
    expect(panel()?.querySelector('tx-dialog-header')).toBeNull();
    host.dialog()?.close();
    await settle();
    expect(panel()).not.toBeNull();
    expect(host.visible()).toBe(true);

    host.shown.set(false);
    await guarded.whenStable();
    await settle();
    expect(host.closedCount).toBe(0);
    guarded.destroy();
  });

  it('closes a declarative dialog from its close method', async () => {
    const guarded = TestBed.createComponent(GuardedHost);
    guarded.autoDetectChanges();
    const host = guarded.componentInstance;
    host.visible.set(true);
    await guarded.whenStable();
    host.dialog()?.close();
    await settle();
    await guarded.whenStable();
    expect(panel()).toBeNull();
    expect(host.visible()).toBe(false);
    expect(host.closedCount).toBe(1);
    host.shown.set(false);
    await guarded.whenStable();
    guarded.destroy();
  });
});

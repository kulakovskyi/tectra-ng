import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxContextMenu } from './context-menu.component';
import { TxMenu, TxMenuItemTemplate, TxMenuTrigger } from './menu.component';
import { TxMenuItem } from './menu.types';

@Component({
  imports: [TxMenu, TxMenuTrigger, TxContextMenu, TxMenuItemTemplate],
  template: `
    <tx-menu id="inline" ariaLabel="Document" [model]="inline" [dt]="{ root: { minWidth: '240px' } }" [pt]="{ item: { class: 'own-item' } }" (itemSelected)="picked.push($event.item.id ?? '')" />
    <button id="trigger" [txMenuTrigger]="actions">Actions</button>
    <tx-tiered-menu #actions popup ariaLabel="Actions" [model]="tiered" (itemSelected)="picked.push($event.item.id ?? '')" />
    <div id="area" tabindex="0">Right-click here</div>
    <tx-context-menu ariaLabel="Row" [target]="area" [model]="context" (itemSelected)="picked.push($event.item.id ?? '')" />
    <tx-menu id="custom" ariaLabel="Custom" [model]="context">
      <ng-template txMenuItem let-item><span class="custom">{{ item.label }}!</span></ng-template>
    </tx-menu>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly actions = viewChild.required<TxMenu>('actions');
  get area(): HTMLElement {
    return document.getElementById('area') as HTMLElement;
  }
  readonly picked: string[] = [];
  readonly commands: string[] = [];
  readonly inline: TxMenuItem[] = [
    {
      label: 'File',
      items: [
        { id: 'new', label: 'New', icon: 'plus', shortcut: '⌘N', command: () => this.commands.push('new') },
        { id: 'open', label: 'Open', disabled: true },
        { id: 'share', label: 'Share', badge: 3 },
      ],
    },
    { separator: true },
    { id: 'hidden', label: 'Hidden', visible: false },
    { id: 'delete', label: 'Delete', severity: 'danger' },
  ];
  readonly tiered: TxMenuItem[] = [
    { id: 'edit', label: 'Edit' },
    { id: 'move', label: 'Move to', items: [{ id: 'inbox', label: 'Inbox' }, { id: 'archive', label: 'Archive' }] },
    { id: 'remove', label: 'Remove' },
  ];
  readonly context: TxMenuItem[] = [
    { id: 'copy', label: 'Copy' },
    { id: 'paste', label: 'Paste' },
  ];
}

describe('TxMenu', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => document.querySelector(selector) as HTMLElement;
  const items = (root: Element | null) => [...(root?.querySelectorAll(':scope > div > [role="menuitem"]') ?? [])] as HTMLElement[];
  const key = (target: Element, name: string, extra: KeyboardEventInit = {}) =>
    target.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true, cancelable: true, ...extra }));
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
  };
  const popupList = () => document.querySelector('.cdk-overlay-container tx-menu-list[data-panel="popup"]') as HTMLElement | null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await settle();
  });

  afterEach(() => {
    fixture.destroy();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  it('renders an inline menu with groups, separators and item details', () => {
    const list = el('#inline tx-menu-list');
    expect(list.getAttribute('role')).toBe('menu');
    expect(list.getAttribute('aria-label')).toBe('Document');
    expect(el('#inline').style.getPropertyValue('--tx-menu-min-width')).toBe('240px');
    expect(list.querySelector('.tx-menu__group-label')?.textContent?.trim()).toBe('File');
    expect(list.querySelector('[role="separator"]')).not.toBeNull();
    const entries = items(list);
    expect(entries.map((item) => item.querySelector('.tx-menu__label')?.textContent)).toEqual(['New', 'Open', 'Share', 'Delete']);
    expect(entries[0].getAttribute('tabindex')).toBe('0');
    expect(entries[1].getAttribute('tabindex')).toBe('-1');
    expect(entries[0].classList).toContain('own-item');
    expect(entries[0].querySelector('.tx-menu__shortcut')?.textContent).toBe('⌘N');
    expect(entries[1].getAttribute('aria-disabled')).toBe('true');
    expect(entries[2].querySelector('tx-badge')?.textContent?.trim()).toBe('3');
    expect(entries[3].getAttribute('data-severity')).toBe('danger');
  });

  it('moves with arrows, Home, End and letters, skipping disabled items, and runs commands', async () => {
    const list = el('#inline tx-menu-list');
    const entries = items(list);
    entries[0].focus();
    key(entries[0], 'ArrowDown');
    expect(document.activeElement).toBe(entries[2]);
    key(entries[2], 'End');
    expect(document.activeElement).toBe(entries[3]);
    key(entries[3], 'ArrowDown');
    expect(document.activeElement).toBe(entries[0]);
    key(entries[0], 's');
    expect(document.activeElement).toBe(entries[2]);
    await settle();
    expect(entries[2].getAttribute('tabindex')).toBe('0');
    key(entries[2], 'Home');
    key(entries[0], 'Enter');
    expect(fixture.componentInstance.commands).toEqual(['new']);
    expect(fixture.componentInstance.picked).toEqual(['new']);
    entries[1].click();
    expect(fixture.componentInstance.picked).toEqual(['new']);
  });

  it('opens a popup from its trigger, focuses the first item and closes with Escape', async () => {
    const trigger = el('#trigger');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    trigger.focus();
    trigger.click();
    await settle();
    const list = popupList() as HTMLElement;
    expect(list.getAttribute('aria-label')).toBe('Actions');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(list.id);
    expect(document.activeElement).toBe(items(list)[0]);
    key(document.activeElement as HTMLElement, 'Escape');
    await settle();
    expect(popupList()).toBeNull();
    expect(document.activeElement).toBe(trigger);

    key(trigger, 'ArrowUp');
    await settle();
    expect(document.activeElement).toBe(items(popupList())[2]);
    key(document.activeElement as HTMLElement, 'Tab');
    await settle();
    expect(popupList()).toBeNull();
  });

  it('opens sub-menus with ArrowRight, leaves them with ArrowLeft and closes everything on a pick', async () => {
    fixture.componentInstance.actions().show(el('#trigger'));
    await settle();
    const [, move] = items(popupList());
    expect(move.getAttribute('aria-haspopup')).toBe('menu');
    move.focus();
    key(move, 'ArrowRight');
    await settle();
    expect(move.getAttribute('aria-expanded')).toBe('true');
    const submenu = document.querySelector('tx-menu-list[data-panel="submenu"]') as HTMLElement;
    expect(document.activeElement).toBe(items(submenu)[0]);
    key(items(submenu)[0], 'ArrowLeft');
    await settle();
    expect(document.querySelector('tx-menu-list[data-panel="submenu"]')).toBeNull();
    expect(document.activeElement).toBe(move);
    key(move, 'Enter');
    await settle();
    const archive = items(document.querySelector('tx-menu-list[data-panel="submenu"]'))[1];
    archive.click();
    await settle();
    expect(fixture.componentInstance.picked).toEqual(['archive']);
    expect(popupList()).toBeNull();
    expect(document.querySelector('tx-menu-list[data-panel="submenu"]')).toBeNull();
  });

  it('opens a context menu at the pointer and with Shift + F10', async () => {
    const area = el('#area');
    area.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 120, clientY: 80 }));
    await settle();
    const list = popupList() as HTMLElement;
    expect(list.getAttribute('aria-label')).toBe('Row');
    const anchor = [...document.body.children].find((child) => (child as HTMLElement).style.left === '120px') as HTMLElement;
    expect(anchor.style.top).toBe('80px');
    items(list)[1].click();
    await settle();
    expect(fixture.componentInstance.picked).toEqual(['paste']);
    expect(anchor.isConnected).toBe(false);

    area.focus();
    key(area, 'F10', { shiftKey: true });
    await settle();
    expect(popupList()).not.toBeNull();
  });

  it('renders items from a template', () => {
    expect([...document.querySelectorAll('#custom .custom')].map((item) => item.textContent)).toEqual(['Copy!', 'Paste!']);
  });
});

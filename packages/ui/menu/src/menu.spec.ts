import { ChangeDetectionStrategy, Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TxContextMenu } from './context-menu.component';
import { TxMenuList } from './menu-list.component';
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

@Component({
  imports: [TxMenu, TxContextMenu],
  template: `
    <tx-menu id="plain" ariaLabel="Plain" [model]="plain" (itemSelected)="picked.push($event.item.label ?? '')" />
    <tx-tiered-menu id="hover" ariaLabel="Hover" [model]="hover" />
    <button id="toggler" (click)="popup.toggle($event)">Toggle</button>
    <button id="other">Other</button>
    <tx-menu #popup popup ariaLabel="Popup" [model]="flat" (opened)="events.push('opened')" (closed)="events.push('closed')" />
    <tx-menu #empty popup ariaLabel="Empty" [model]="[]" />
    <tx-menu #arrowed popup arrow placement="top" ariaLabel="Arrowed" [model]="flat" [pt]="{ arrow: { class: 'own-arrow' } }" />
    <tx-menu #bare popup arrow unstyled [offset]="2" ariaLabel="Bare" [model]="flat" />
    <tx-context-menu #global global ariaLabel="Page" [model]="flat" (closed)="events.push('context closed')" />
    <tx-context-menu ariaLabel="Detached" [model]="flat" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class MoreHost {
  readonly popup = viewChild.required<TxMenu>('popup');
  readonly empty = viewChild.required<TxMenu>('empty');
  readonly arrowed = viewChild.required<TxMenu>('arrowed');
  readonly bare = viewChild.required<TxMenu>('bare');
  readonly global = viewChild.required<TxContextMenu>('global');
  readonly picked: string[] = [];
  readonly events: string[] = [];
  readonly plain: TxMenuItem[] = [
    { label: 'Alpha' },
    { label: 'Docs', url: '#menu-docs' },
    { icon: 'plus', title: 'Add' },
    { label: 'Off', disabled: true },
    { label: 'Group', items: [{ label: 'Inside' }, { separator: true }, { label: 'Last' }] },
  ];
  readonly hover: TxMenuItem[] = [
    { label: 'Alpha', items: [{ label: 'A1' }, { label: 'A2' }] },
    { label: 'Beta', items: [{ label: 'B1' }] },
    { label: 'Gamma' },
    { label: 'Delta', disabled: true },
  ];
  readonly flat: TxMenuItem[] = [{ label: 'One' }, { label: 'Two' }];
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

  describe('more cases', () => {
    let more: ComponentFixture<MoreHost>;
    const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
    const calm = async () => {
      await more.whenStable();
      await Promise.resolve();
      await more.whenStable();
    };
    const hoverOver = async (item: HTMLElement) => {
      item.dispatchEvent(new MouseEvent('mouseenter'));
      await wait(150);
      await calm();
    };
    const submenu = () => document.querySelector('tx-menu-list[data-panel="submenu"]') as HTMLElement | null;
    const popupOf = (label: string) => document.querySelector(`.cdk-overlay-container tx-menu-list[aria-label="${label}"]`) as HTMLElement | null;

    beforeEach(async () => {
      fixture.destroy();
      more = TestBed.createComponent(MoreHost);
      more.autoDetectChanges();
      await calm();
    });

    afterEach(() => {
      more.destroy();
      document.querySelector('.cdk-overlay-container')?.remove();
    });

    it('handles keys that do nothing, links and items without labels', async () => {
      const list = el('#plain tx-menu-list');
      const entries = items(list);
      expect(entries.map((item) => item.tagName)).toEqual(['DIV', 'A', 'DIV', 'DIV', 'DIV', 'DIV']);
      expect(entries[2].getAttribute('title')).toBe('Add');
      expect(list.querySelectorAll('[role="separator"]').length).toBe(1);

      key(entries[0], 'Enter');
      expect(more.componentInstance.picked).toEqual([]);

      entries[0].focus();
      key(entries[0], 'ArrowRight');
      key(entries[0], 'ArrowLeft');
      key(entries[0], 'g', { ctrlKey: true });
      expect(document.activeElement).toBe(entries[0]);
      key(entries[0], 'i');
      expect(document.activeElement).toBe(entries[4]);
      key(entries[4], 'z');
      expect(document.activeElement).toBe(entries[4]);

      entries[3].focus();
      key(entries[3], ' ');
      expect(more.componentInstance.picked).toEqual([]);

      entries[1].focus();
      key(entries[1], 'Enter');
      expect(more.componentInstance.picked).toEqual(['Docs']);

      entries[3].dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.activeElement).toBe(entries[1]);
      entries[4].dispatchEvent(new MouseEvent('mouseenter'));
      expect(document.activeElement).toBe(entries[4]);
      await calm();
      expect(entries[4].getAttribute('tabindex')).toBe('0');
    });

    it('ignores keys that come from outside the list', () => {
      const list = more.debugElement.query(By.directive(TxMenuList)).componentInstance as TxMenuList;
      const entries = items(el('#plain tx-menu-list'));
      entries[0].focus();
      const outside = el('#other');
      outside.addEventListener('keydown', (event) => list.onKeydown(event));
      key(outside, 'ArrowDown');
      expect(document.activeElement).toBe(entries[0]);
    });

    it('opens and switches sub-menus on hover', async () => {
      const entries = items(el('#hover tx-menu-list'));
      await hoverOver(entries[0]);
      expect(entries[0].getAttribute('aria-expanded')).toBe('true');
      expect(items(submenu()).map((item) => item.textContent?.trim())).toEqual(['A1', 'A2']);
      expect(document.activeElement).toBe(entries[0]);

      await hoverOver(entries[0]);
      expect(items(submenu()).length).toBe(2);
      key(entries[0], 'ArrowRight');
      expect(document.activeElement).toBe(items(submenu())[0]);

      await hoverOver(entries[1]);
      await wait(300);
      await calm();
      expect(entries[0].getAttribute('aria-expanded')).toBe('false');
      expect(entries[1].getAttribute('aria-expanded')).toBe('true');
      expect(items(submenu()).map((item) => item.textContent?.trim())).toEqual(['B1']);

      await hoverOver(entries[3]);
      expect(entries[1].getAttribute('aria-expanded')).toBe('true');
      await hoverOver(entries[2]);
      await wait(300);
      await calm();
      expect(entries[1].getAttribute('aria-expanded')).toBe('false');
      expect(submenu()).toBeNull();
    });

    it('opens a popup from an event, moves it to another anchor and toggles it closed', async () => {
      const host = more.componentInstance;
      const toggler = el('#toggler');
      const other = el('#other');
      host.popup().show();
      await calm();
      expect(host.popup().isOpen()).toBe(false);

      toggler.click();
      await calm();
      expect(host.popup().isOpen()).toBe(true);
      expect(host.popup().isOpenFor(toggler)).toBe(true);
      expect(popupOf('Popup')).not.toBeNull();

      host.popup().show(toggler);
      host.popup().show(other);
      await calm();
      expect(host.popup().isOpenFor(other)).toBe(true);
      expect(host.events).toEqual(['opened', 'closed', 'opened']);

      host.popup().toggle();
      await calm();
      expect(host.popup().isOpen()).toBe(false);
      host.popup().show();
      await calm();
      expect(host.popup().isOpenFor(other)).toBe(true);
      host.popup().hide();
      await calm();
    });

    it('moves an open popup to the element of a dispatched event when toggled from there', async () => {
      const host = more.componentInstance;
      const toggler = el('#toggler');
      const other = el('#other');
      toggler.click();
      await calm();
      const click = new MouseEvent('click');
      other.dispatchEvent(click);
      host.popup().toggle(click);
      await calm();
      expect(host.popup().isOpenFor(other)).toBe(true);
      expect(toggler.getAttribute('aria-expanded')).toBeNull();
      host.popup().toggle(other);
      await calm();
      expect(host.popup().isOpen()).toBe(false);
    });

    it('draws an arrow that points at the element when asked', async () => {
      const host = more.componentInstance;
      const other = el('#other');
      host.arrowed().show(other);
      await calm();
      const popup = popupOf('Arrowed')?.parentElement as HTMLElement;
      expect(popup.classList).toContain('tx-menu-popup');
      expect(popup.getAttribute('data-side')).toBe(host.arrowed().side());
      expect(['top', 'bottom']).toContain(popup.getAttribute('data-placement'));
      expect(popup.hasAttribute('data-styled')).toBe(true);
      expect(popup.style.getPropertyValue('--tx-menu-arrow-offset')).toContain('50%');
      expect(popup.querySelector('.tx-menu-popup__arrow')?.classList).toContain('own-arrow');
      host.arrowed().hide();
      await calm();
      host.bare().show(other);
      await calm();
      const bare = popupOf('Bare')?.parentElement as HTMLElement;
      expect(bare.hasAttribute('data-styled')).toBe(false);
      expect(bare.getAttribute('data-side')).toBe('bottom');
      host.bare().hide();
      await calm();
      expect(popupOf('Empty')).toBeNull();
    });

    it('opens an empty popup without focusing anything', async () => {
      const other = el('#other');
      other.focus();
      more.componentInstance.empty().show(other, 'last');
      await calm();
      expect(items(popupOf('Empty'))).toEqual([]);
      expect(document.activeElement).toBe(other);
    });

    it('opens a page-wide context menu and closes it on a pointer press outside', async () => {
      const host = more.componentInstance;
      document.body.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true }));
      await calm();
      const list = popupOf('Page') as HTMLElement;
      expect(list).not.toBeNull();
      items(list)[0].dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      await calm();
      expect(popupOf('Page')).not.toBeNull();
      document.body.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true }));
      await calm();
      expect(popupOf('Page')).toBeNull();
      expect(host.events).toContain('context closed');

      key(document.body, 'a');
      await calm();
      expect(popupOf('Page')).toBeNull();
      key(document.body, 'ContextMenu');
      await calm();
      expect(popupOf('Page')).not.toBeNull();
      document.dispatchEvent(new MouseEvent('pointerdown'));
      await calm();
      expect(popupOf('Page')).toBeNull();

      key(document.body, 'ContextMenu');
      await calm();
      host.global().hide();
      await calm();
      expect(popupOf('Page')).toBeNull();
    });
  });
});

describe('menu item template directive', () => {
  it('narrows its template context', () => {
    expect(TxMenuItemTemplate.ngTemplateContextGuard({} as TxMenuItemTemplate<string>, { $implicit: { label: 'A' }, hasSubmenu: false })).toBe(true);
    expect(TxMenuItemTemplate.ngTemplateContextGuard({} as TxMenuItemTemplate<string>, undefined)).toBe(false);
  });
});

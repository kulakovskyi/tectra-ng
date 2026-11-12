import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMenuItem, TxMenuItemEvent } from '@tectra-ng/ui/menu';
import { TxMenubar, TxMenubarItemTemplate } from './menubar.component';

@Component({
  imports: [TxMenubar, TxMenubarItemTemplate],
  template: `
    <tx-menubar
      id="bar"
      ariaLabel="Editor"
      [model]="items"
      [breakpoint]="breakpoint()"
      [autoDisplay]="autoDisplay()"
      (itemClick)="events.push($event)"
      [dt]="{ root: { padding: '2px' } }"
      [pt]="{ item: { class: 'my-item' } }"
    >
      <span txMenubarStart class="logo">Logo</span>
      <span txMenubarEnd class="end">End</span>
    </tx-menubar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly runs: string[] = [];
  readonly events: TxMenuItemEvent[] = [];
  readonly breakpoint = signal('1px');
  readonly autoDisplay = signal(false);
  readonly items: TxMenuItem[] = [
    { label: 'File', icon: 'file', items: [{ label: 'New', command: () => this.runs.push('new') }, { label: 'Open', items: [{ label: 'Recent' }] }] },
    { label: 'Edit', items: [{ label: 'Undo' }, { label: 'Redo' }] },
    { label: 'Archive', disabled: true },
    { label: 'Search', badge: 4, command: () => this.runs.push('search') },
  ];
}

function keydown(target: Element, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

describe('TxMenubar', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const roots = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-menubar__list--root > li > [role="menuitem"]')) as HTMLElement[];
  const panel = () => document.querySelector('tx-menu-list[data-panel="submenu"]') as HTMLElement | null;

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('renders a named menubar with root items, slots, badge and tokens', () => {
    const list = el('[role="menubar"]');
    expect(list.getAttribute('aria-label')).toBe('Editor');
    expect(list.getAttribute('aria-orientation')).toBe('horizontal');
    expect(roots().map((item) => item.textContent?.trim())).toEqual(['File', 'Edit', 'Archive', 'Search4']);
    expect(roots()[0].getAttribute('aria-haspopup')).toBe('menu');
    expect(roots()[0].getAttribute('aria-expanded')).toBe('false');
    expect(roots()[0].getAttribute('tabindex')).toBe('0');
    expect(roots()[1].getAttribute('tabindex')).toBe('-1');
    expect(roots()[2].getAttribute('aria-disabled')).toBe('true');
    expect(roots()[0].classList).toContain('my-item');
    expect(el('.tx-menubar__start .logo')).not.toBeNull();
    expect(el('.tx-menubar__end .end')).not.toBeNull();
    expect(el('#bar').style.getPropertyValue('--tx-menubar-padding')).toBe('2px');
  });

  it('opens a submenu on click, switches on hover and runs commands', async () => {
    roots()[0].click();
    await fixture.whenStable();
    expect(roots()[0].getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.textContent).toContain('New');
    roots()[1].dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(roots()[1].getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.textContent).toContain('Undo');
    roots()[3].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.runs).toEqual(['search']);
    expect(fixture.componentInstance.events[0].item.label).toBe('Search');
    expect(panel()).toBeNull();
  });

  it('does not open on hover until a submenu is open, unless autoDisplay', async () => {
    roots()[0].dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    fixture.componentInstance.autoDisplay.set(true);
    await fixture.whenStable();
    roots()[0].dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(panel()?.textContent).toContain('New');
  });

  it('moves between root items with the arrows and opens with Down', async () => {
    const [file, edit, , search] = roots();
    file.focus();
    keydown(file, 'ArrowRight');
    expect(document.activeElement).toBe(edit);
    keydown(edit, 'ArrowRight');
    expect(document.activeElement).toBe(search);
    keydown(search, 'ArrowRight');
    expect(document.activeElement).toBe(file);
    keydown(file, 'End');
    expect(document.activeElement).toBe(search);
    keydown(search, 'Home');
    expect(document.activeElement).toBe(file);
    keydown(file, 'ArrowDown');
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(panel()).not.toBeNull();
    expect(document.activeElement?.textContent?.trim()).toBe('New');
  });

  it('picks a submenu item and closes the submenu', async () => {
    roots()[0].click();
    await fixture.whenStable();
    (panel()?.querySelector('[role="menuitem"]') as HTMLElement).click();
    await fixture.whenStable();
    expect(fixture.componentInstance.runs).toEqual(['new']);
    expect(fixture.componentInstance.events[0].item.label).toBe('New');
    expect(panel()).toBeNull();
  });

  it('moves to the next root submenu with Right inside a submenu', async () => {
    roots()[0].focus();
    keydown(roots()[0], 'ArrowDown');
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    const first = panel()?.querySelector('[role="menuitem"]') as HTMLElement;
    keydown(first, 'ArrowRight');
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
    expect(roots()[1].getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.textContent).toContain('Undo');
  });
});

describe('TxMenubar desktop details', () => {
  let fixture: ComponentFixture<Host>;
  const roots = () => Array.from(fixture.nativeElement.querySelectorAll('.tx-menubar__list--root > li > [role="menuitem"]')) as HTMLElement[];
  const panel = () => document.querySelector('tx-menu-list[data-panel="submenu"]') as HTMLElement | null;
  const settle = async () => {
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve));
  };

  beforeEach(async () => {
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => fixture.destroy());

  it('ignores clicks and hover on a disabled item', async () => {
    const archive = roots()[2];
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    archive.dispatchEvent(click);
    archive.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(click.defaultPrevented).toBe(true);
    expect(fixture.componentInstance.events).toEqual([]);
    expect(panel()).toBeNull();
  });

  it('toggles a submenu with a pointer click without moving focus into it', async () => {
    const file = roots()[0];
    file.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    await settle();
    expect(panel()?.textContent).toContain('New');
    expect(panel()?.contains(document.activeElement)).toBe(false);
    file.dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(panel()).not.toBeNull();
    file.focus();
    keydown(file, 'ArrowDown');
    await settle();
    expect(document.activeElement?.textContent?.trim()).toBe('New');
    file.dispatchEvent(new MouseEvent('click', { bubbles: true, detail: 1 }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(file.getAttribute('aria-expanded')).toBe('false');
  });

  it('closes the submenu when hovering a root item without children', async () => {
    roots()[0].click();
    await fixture.whenStable();
    roots()[3].dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it('handles Left, Up, Enter, Space, Escape and typeahead on root items', async () => {
    const [file, edit, , search] = roots();
    file.focus();
    keydown(file, 'ArrowLeft');
    expect(document.activeElement).toBe(search);
    keydown(search, 'ArrowDown');
    await fixture.whenStable();
    expect(panel()).toBeNull();
    keydown(search, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.runs).toEqual(['search']);
    keydown(search, 'e');
    expect(document.activeElement).toBe(edit);
    keydown(edit, 'ArrowUp');
    await settle();
    expect(document.activeElement?.textContent?.trim()).toBe('Redo');
    keydown(edit, 'Escape');
    await fixture.whenStable();
    expect(panel()).toBeNull();
    keydown(edit, ' ');
    await settle();
    expect(document.activeElement?.textContent?.trim()).toBe('Undo');
  });

  it('skips typeahead with modifiers or keys that match nothing', () => {
    const [file] = roots();
    file.focus();
    file.dispatchEvent(new KeyboardEvent('keydown', { key: 'e', ctrlKey: true, bubbles: true }));
    expect(document.activeElement).toBe(file);
    keydown(file, 'Tab');
    keydown(file, 'z');
    expect(document.activeElement).toBe(file);
  });

  it('ignores keys that do not come from an item', () => {
    const list = fixture.nativeElement.querySelector('[role="menubar"]') as HTMLElement;
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    list.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
  });

  it('keeps an open submenu open while moving with Right and Left', async () => {
    const [file, edit] = roots();
    file.click();
    await fixture.whenStable();
    file.focus();
    keydown(file, 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement).toBe(edit);
    expect(edit.getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.textContent).toContain('Undo');
  });

  it('goes back to the previous root submenu with Left inside a submenu', async () => {
    const edit = roots()[1];
    edit.focus();
    keydown(edit, 'ArrowDown');
    await settle();
    keydown(document.activeElement as HTMLElement, 'ArrowLeft');
    await settle();
    expect(roots()[0].getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement?.textContent?.trim()).toBe('New');
  });

  it('lets a nested submenu handle Right on an item with children', async () => {
    const file = roots()[0];
    file.focus();
    keydown(file, 'ArrowDown');
    await settle();
    const open = Array.from(panel()?.querySelectorAll('[role="menuitem"]') ?? []).find((item) => item.textContent?.includes('Open')) as HTMLElement;
    open.focus();
    keydown(open, 'ArrowRight');
    await settle();
    expect(file.getAttribute('aria-expanded')).toBe('true');
    expect(roots()[1].getAttribute('aria-expanded')).toBe('false');
  });

  it('closes on a pointer down outside, not inside the bar or the submenu', async () => {
    roots()[0].click();
    await fixture.whenStable();
    roots()[1].dispatchEvent(new Event('pointerdown', { bubbles: true }));
    panel()?.querySelector('[role="menuitem"]')?.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(panel()).not.toBeNull();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    roots()[0].click();
    await fixture.whenStable();
    document.dispatchEvent(new Event('pointerdown'));
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it('emits focused and blurred only when focus crosses the bar', async () => {
    const menubar = fixture.debugElement.query((debug) => debug.componentInstance instanceof TxMenubar).componentInstance as TxMenubar;
    const focused = vi.fn();
    const blurred = vi.fn();
    menubar.focused.subscribe(focused);
    menubar.blurred.subscribe(blurred);
    const [file, edit] = roots();
    file.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: null }));
    edit.dispatchEvent(new FocusEvent('focusin', { bubbles: true, relatedTarget: file }));
    file.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: edit }));
    edit.dispatchEvent(new FocusEvent('focusout', { bubbles: true, relatedTarget: document.body }));
    expect(focused).toHaveBeenCalledTimes(1);
    expect(blurred).toHaveBeenCalledTimes(1);
  });
});

@Component({
  imports: [TxMenubar, TxMenubarItemTemplate],
  template: `
    <tx-menubar [model]="items()">
      <ng-template txMenubarItem let-item let-hasSubmenu="hasSubmenu">
        <span class="custom">{{ item.label ?? 'none' }}{{ hasSubmenu ? '+' : '' }}</span>
      </ng-template>
    </tx-menubar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class TemplateHost {
  readonly items = signal<TxMenuItem[]>([{ label: 'File', items: [{ label: 'New' }] }, { separator: true }, { icon: 'star' }, { label: 'Help', visible: false }]);
}

describe('TxMenubar item template and edge models', () => {
  it('renders items through the item template and skips hidden ones', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const custom = Array.from(fixture.nativeElement.querySelectorAll('.custom')) as HTMLElement[];
    expect(custom.map((item) => item.textContent)).toEqual(['File+', 'none']);
    expect(fixture.nativeElement.querySelector('[role="separator"]')).not.toBeNull();
    expect(TxMenubarItemTemplate.ngTemplateContextGuard({} as TxMenubarItemTemplate, { $implicit: {} })).toBe(true);
    const unlabeled = fixture.nativeElement.querySelectorAll('[role="menuitem"]')[1] as HTMLElement;
    unlabeled.focus();
    keydown(unlabeled, 'f');
    expect(document.activeElement?.textContent).toBe('File+');
    fixture.destroy();
  });

  it('copes with a model where every item is disabled', async () => {
    const fixture = TestBed.createComponent(TemplateHost);
    fixture.componentInstance.items.set([{ label: 'One', disabled: true }]);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const item = fixture.nativeElement.querySelector('[role="menuitem"]') as HTMLElement;
    expect(item.getAttribute('tabindex')).toBe('-1');
    item.focus();
    keydown(item, 'ArrowRight');
    keydown(item, 'Home');
    keydown(item, 'End');
    expect(document.activeElement).toBe(item);
    fixture.destroy();
  });
});

describe('TxMenubar mobile', () => {
  let fixture: ComponentFixture<Host>;
  let matches = true;
  let listeners: (() => void)[] = [];
  const removed = vi.fn();
  const original = window.matchMedia;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const item = (label: string) =>
    (Array.from(fixture.nativeElement.querySelectorAll('[role="menuitem"]')) as HTMLElement[]).find(
      (element) => element.querySelector('.tx-menubar__label')?.textContent === label,
    ) as HTMLElement;

  beforeEach(async () => {
    matches = true;
    listeners = [];
    removed.mockClear();
    window.matchMedia = ((query: string) =>
      ({
        media: query,
        get matches() {
          return matches;
        },
        addEventListener: (_: string, listener: () => void) => listeners.push(listener),
        removeEventListener: removed,
      }) as unknown as MediaQueryList) as typeof window.matchMedia;
    fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  afterEach(() => {
    fixture.destroy();
    window.matchMedia = original;
  });

  it('shows a toggle button and a vertical list that collapses into groups', async () => {
    const button = el('.tx-menubar__button');
    expect(el('tx-menubar').classList).toContain('tx-menubar--mobile');
    expect(el('[role="menubar"]').getAttribute('aria-orientation')).toBe('vertical');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(el('tx-menubar').classList).toContain('tx-menubar--mobile-open');
    const file = item('File');
    expect(file.getAttribute('aria-controls')).toBe(`${file.id}-menu`);
    expect(el(`#${file.id}-menu`).hasAttribute('inert')).toBe(true);
    file.click();
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('true');
    expect(el(`#${file.id}-menu`).hasAttribute('inert')).toBe(false);
    item('Open').click();
    await fixture.whenStable();
    expect(item('Open').getAttribute('aria-expanded')).toBe('true');
    item('Edit').click();
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('false');
    expect(item('Edit').getAttribute('aria-expanded')).toBe('true');
    item('Edit').click();
    await fixture.whenStable();
    expect(item('Edit').getAttribute('aria-expanded')).toBe('false');
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('collapses a group with all its open descendants', async () => {
    el('.tx-menubar__button').click();
    await fixture.whenStable();
    item('File').click();
    await fixture.whenStable();
    item('Open').click();
    await fixture.whenStable();
    item('File').click();
    await fixture.whenStable();
    item('File').click();
    await fixture.whenStable();
    expect(item('Open').getAttribute('aria-expanded')).toBe('false');
  });

  it('runs a command and closes the menu when a leaf is picked', async () => {
    el('.tx-menubar__button').click();
    await fixture.whenStable();
    item('File').click();
    await fixture.whenStable();
    item('New').click();
    await fixture.whenStable();
    expect(fixture.componentInstance.runs).toEqual(['new']);
    expect(el('.tx-menubar__button').getAttribute('aria-expanded')).toBe('false');
  });

  it('does not open overlays on hover', async () => {
    fixture.componentInstance.autoDisplay.set(true);
    await fixture.whenStable();
    item('File').dispatchEvent(new MouseEvent('mouseenter'));
    await fixture.whenStable();
    expect(document.querySelector('tx-menu-list[data-panel="submenu"]')).toBeNull();
  });

  it('closes when a pointer goes down outside', async () => {
    el('.tx-menubar__button').click();
    await fixture.whenStable();
    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    await fixture.whenStable();
    expect(el('.tx-menubar__button').getAttribute('aria-expanded')).toBe('false');
  });

  it('walks the visible items with the keyboard', async () => {
    el('.tx-menubar__button').click();
    await fixture.whenStable();
    const file = item('File');
    file.focus();
    keydown(file, 'ArrowRight');
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('true');
    keydown(file, 'ArrowRight');
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('true');
    keydown(file, 'ArrowDown');
    expect(document.activeElement).toBe(item('New'));
    keydown(item('New'), 'ArrowRight');
    keydown(item('New'), 'ArrowUp');
    expect(document.activeElement).toBe(file);
    keydown(file, 'ArrowUp');
    expect(document.activeElement).toBe(item('Search'));
    keydown(item('Search'), 'Home');
    expect(document.activeElement).toBe(file);
    keydown(file, 'End');
    expect(document.activeElement).toBe(item('Search'));
    keydown(item('Search'), 'o');
    expect(document.activeElement).toBe(item('Open'));
    keydown(item('Open'), 'ArrowLeft');
    await fixture.whenStable();
    expect(document.activeElement).toBe(file);
    expect(file.getAttribute('aria-expanded')).toBe('false');
    keydown(file, 'ArrowLeft');
    expect(document.activeElement).toBe(file);
    keydown(file, 'Enter');
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('true');
    keydown(file, ' ');
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('false');
    keydown(file, 'ArrowLeft');
    keydown(file, 'Escape');
    await fixture.whenStable();
    expect(el('.tx-menubar__button').getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(el('.tx-menubar__button'));
  });

  it('collapses an expanded group with Left', async () => {
    el('.tx-menubar__button').click();
    await fixture.whenStable();
    const file = item('File');
    file.click();
    await fixture.whenStable();
    file.focus();
    keydown(file, 'ArrowLeft');
    await fixture.whenStable();
    expect(file.getAttribute('aria-expanded')).toBe('false');
  });

  it('switches layouts when the media query changes and stops listening on breakpoint change', async () => {
    matches = false;
    listeners.forEach((listener) => listener());
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.tx-menubar__button')).toBeNull();
    expect(el('[role="menubar"]').getAttribute('aria-orientation')).toBe('horizontal');
    fixture.componentInstance.breakpoint.set('2px');
    await fixture.whenStable();
    expect(removed).toHaveBeenCalled();
  });
});

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

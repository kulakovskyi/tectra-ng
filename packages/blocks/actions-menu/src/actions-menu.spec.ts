import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TxActionsMenu } from './actions-menu.component';
import { TxActionsMenuItem, TxActionsMenuSize } from './actions-menu.types';

@Component({
  imports: [TxActionsMenu],
  template: `
    <tx-actions-menu
      tooltip="Team actions"
      [items]="items()"
      [size]="size()"
      [dt]="{ list: { minWidth: '200px' } }"
      [pt]="{ item: { class: 'own-item' } }"
      (itemSelect)="selected.push($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly selected: string[] = [];
  readonly size = signal<TxActionsMenuSize>('medium');
  readonly items = signal<TxActionsMenuItem[]>([
    { id: 'rename', label: 'Rename', icon: 'pencil' },
    { id: 'move', label: 'Move' },
    { id: 'delete', label: 'Delete', icon: 'trash', danger: true },
  ]);
}

describe('TxActionsMenu', () => {
  const panelItems = () => Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));

  async function open() {
    const fixture = TestBed.createComponent(Host);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('.tx-actions-menu__trigger') as HTMLButtonElement;
    trigger.click();
    await fixture.whenStable();
    return { fixture, trigger };
  }

  it('opens a menu of actions from an outlined more button', async () => {
    const { fixture, trigger } = await open();
    expect(trigger.getAttribute('aria-label')).toBe('Team actions');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('data-variant') ?? trigger.className).toContain('outlined');
    const menu = document.querySelector('.tx-actions-menu__list') as HTMLElement;
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menu.style.getPropertyValue('--tx-actions-menu-list-min-width')).toBe('200px');
    expect(panelItems().map((item) => item.textContent?.trim())).toEqual(['Rename', 'Move', 'Delete']);
    expect(panelItems()[2].classList).toContain('tx-actions-menu__item--danger');
    expect(panelItems()[0].classList).toContain('own-item');
    expect(panelItems()[0].querySelector('tx-icon')?.getAttribute('data-icon')).toBe('pencil');
    expect(panelItems()[1].querySelector('tx-icon')).toBeNull();
    fixture.destroy();
  });

  it('moves between actions with the arrows, Home and End, and emits the chosen id after closing', async () => {
    const { fixture } = await open();
    const press = (key: string) => (document.activeElement as HTMLElement).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
    panelItems()[0].focus();
    press('ArrowDown');
    expect(document.activeElement).toBe(panelItems()[1]);
    press('End');
    expect(document.activeElement).toBe(panelItems()[2]);
    press('ArrowDown');
    expect(document.activeElement).toBe(panelItems()[0]);
    press('ArrowUp');
    expect(document.activeElement).toBe(panelItems()[2]);
    press('Home');
    expect(document.activeElement).toBe(panelItems()[0]);
    panelItems()[1].click();
    await fixture.whenStable();
    await new Promise((resolve) => setTimeout(resolve, 300));
    await fixture.whenStable();
    expect(fixture.componentInstance.selected).toEqual(['move']);
    fixture.destroy();
  });

  it('renders nothing without items and a small trigger when small', async () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.size.set('small');
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-actions-menu') as HTMLElement;
    expect(root.getAttribute('data-size')).toBe('small');
    expect(root.querySelector('.tx-actions-menu__trigger')?.getAttribute('data-size')).toBe('small');
    fixture.componentInstance.items.set([]);
    await fixture.whenStable();
    expect(root.querySelector('.tx-actions-menu__trigger')).toBeNull();
  });
});

@Component({
  imports: [TxActionsMenu],
  template: `<tx-actions-menu [ariaLabel]="ariaLabel()" [items]="items" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PlainHost {
  readonly ariaLabel = signal<string | undefined>(undefined);
  readonly items: TxActionsMenuItem[] = [
    { id: 'copy', label: 'Copy' },
    { id: 'share', label: 'Share' },
  ];
}

describe('TxActionsMenu labels and other keys', () => {
  it('names the trigger from the aria label or the default text and ignores keys that do not move', async () => {
    const fixture = TestBed.createComponent(PlainHost);
    await fixture.whenStable();
    const trigger = fixture.nativeElement.querySelector('.tx-actions-menu__trigger') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-label')).toBe('More actions');
    fixture.componentInstance.ariaLabel.set('File actions');
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-label')).toBe('File actions');

    trigger.click();
    await fixture.whenStable();
    const items = Array.from(document.querySelectorAll<HTMLButtonElement>('[role="menuitem"]'));
    items[1].focus();
    const letter = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    items[1].dispatchEvent(letter);
    expect(letter.defaultPrevented).toBe(false);
    expect(document.activeElement).toBe(items[1]);
    fixture.destroy();
  });
});

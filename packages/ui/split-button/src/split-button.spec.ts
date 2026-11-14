import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxSplitButton } from './split-button.component';

@Component({
  imports: [TxSplitButton],
  template: `
    <tx-split-button label="Save" icon="check" severity="success" [model]="items" (clicked)="saved = saved + 1" (itemSelected)="picked.push($event.item.id ?? '')" />
    <tx-split-button id="outlined" label="Export" [outlined]="true" [menuDisabled]="true" menuAriaLabel="Export formats" [model]="items" />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  saved = 0;
  readonly picked: string[] = [];
  readonly items: TxMenuItem[] = [
    { id: 'draft', label: 'Save as draft' },
    { id: 'template', label: 'Save as template' },
  ];
}

describe('TxSplitButton', () => {
  let fixture: ComponentFixture<Host>;
  const el = (selector: string) => document.querySelector(selector) as HTMLElement;
  const settle = async () => {
    await fixture.whenStable();
    await Promise.resolve();
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

  it('runs the main action and opens the menu from its own button', async () => {
    const main = el('tx-split-button .tx-split-button__button');
    const toggle = el('tx-split-button .tx-split-button__menu-button');
    expect(main.textContent?.trim()).toBe('Save');
    expect(main.getAttribute('data-severity')).toBe('success');
    expect(el('tx-split-button').hasAttribute('data-filled')).toBe(true);
    main.click();
    expect(fixture.componentInstance.saved).toBe(1);

    expect(toggle.getAttribute('aria-label')).toBe('More actions');
    expect(toggle.getAttribute('aria-haspopup')).toBe('menu');
    toggle.click();
    await settle();
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    const menu = el('.cdk-overlay-container tx-menu-list');
    expect(menu.getAttribute('aria-label')).toBe('More actions');
    expect(toggle.getAttribute('aria-controls')).toBe(menu.id);
    const popup = el('.cdk-overlay-container .tx-menu-popup');
    expect(popup.getAttribute('data-side')).toBe('bottom');
    expect(popup.querySelector('.tx-menu-popup__arrow')?.getAttribute('aria-hidden')).toBe('true');
    expect(popup.style.getPropertyValue('--tx-menu-arrow-offset')).toContain('100% -');
    (menu.querySelectorAll('[role="menuitem"]')[1] as HTMLElement).click();
    await settle();
    expect(fixture.componentInstance.picked).toEqual(['template']);
    expect(el('.cdk-overlay-container tx-menu-list')).toBeNull();
  });

  it('opens at the last item with Arrow Up and can disable only the menu', async () => {
    const toggle = el('tx-split-button .tx-split-button__menu-button');
    toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }));
    await settle();
    const items = [...document.querySelectorAll('.cdk-overlay-container [role="menuitem"]')];
    expect(document.activeElement).toBe(items[1]);
    const outlined = el('#outlined .tx-split-button__menu-button');
    expect(outlined.hasAttribute('disabled')).toBe(true);
    expect(outlined.getAttribute('aria-label')).toBe('Export formats');
    expect(el('#outlined .tx-split-button__button').hasAttribute('disabled')).toBe(false);
    expect(el('#outlined').hasAttribute('data-filled')).toBe(false);
  });

  it('opens at the first item with Arrow Down and gives focus back on Escape', async () => {
    const toggle = el('tx-split-button .tx-split-button__menu-button');
    toggle.focus();
    toggle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }));
    await settle();
    const items = [...document.querySelectorAll('.cdk-overlay-container [role="menuitem"]')];
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    expect(document.activeElement).toBe(items[0]);
    items[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
    await settle();
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(toggle);
  });
});

describe('TxSplitButton recompiled by TestBed', () => {
  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove());

  it('still reaches its menu when a test overrides the component', async () => {
    TestBed.overrideComponent(TxSplitButton, { set: { styles: [] } });
    const fixture = TestBed.createComponent(Host);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    (document.querySelector('tx-split-button .tx-split-button__menu-button') as HTMLElement).click();
    await fixture.whenStable();
    await Promise.resolve();
    await fixture.whenStable();
    expect(document.querySelector('.cdk-overlay-container tx-menu-list')).not.toBeNull();
    fixture.destroy();
  });
});


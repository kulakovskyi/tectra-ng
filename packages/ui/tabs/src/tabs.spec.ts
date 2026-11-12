import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TxTab } from './tab.component';
import { TxTabList } from './tab-list.component';
import { TxTabPanel, TxTabPanelContent } from './tab-panel.component';
import { TxTabPanels } from './tab-panels.component';
import { TxTabs } from './tabs.component';
import { TxTabItem, TxTabValue, TxTabsVariant } from './tabs.types';
import { TX_ICONS, provideTxIcons } from '@tectra-ng/icons';

@Component({
  imports: [TxTabs],
  template: `
    <tx-tabs
      id="items"
      [tabs]="tabs()"
      ariaLabel="Mail"
      [variant]="variant()"
      size="small"
      [raised]="true"
      [selectOnFocus]="selectOnFocus()"
      [(value)]="active"
      (tabChange)="changes.push($event)"
      [dt]="{ segmented: { padding: '6px' } }"
      [pt]="{ tab: { class: 'my-tab' }, badge: { class: 'my-badge' } }"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ItemsHost {
  readonly tabs = signal<TxTabItem[]>([
    { value: 'inbox', label: 'Inbox', icon: 'inbox', badge: 0, description: 'New mail' },
    { value: 'spam', label: 'Spam', disabled: true },
    { value: 'sent', label: 'Sent', badge: 4 },
  ]);
  readonly variant = signal<TxTabsVariant>('segmented');
  readonly selectOnFocus = signal(false);
  readonly active = signal<TxTabValue | undefined>('inbox');
  readonly changes: TxTabValue[] = [];
}

@Component({
  imports: [TxTabs, TxTabList, TxTab, TxTabPanels, TxTabPanel, TxTabPanelContent],
  template: `
    <tx-tabs id="parts" variant="line" [lazy]="lazy()" [(value)]="active" [unstyled]="unstyled()">
      <tx-tab-list ariaLabel="Project">
        <tx-tab value="a">A</tx-tab>
        <tx-tab value="b">B</tx-tab>
        <tx-tab [value]="3">C</tx-tab>
      </tx-tab-list>
      <tx-tab-panels>
        <tx-tab-panel value="a"><p class="eager">Eager A</p></tx-tab-panel>
        <tx-tab-panel value="b">
          <ng-template txTabPanelContent let-value><p class="lazy">Lazy {{ value }}</p></ng-template>
        </tx-tab-panel>
        <tx-tab-panel [value]="3"><p class="eager-c">Eager C</p></tx-tab-panel>
      </tx-tab-panels>
    </tx-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class PartsHost {
  readonly active = signal<TxTabValue | undefined>('a');
  readonly lazy = signal(false);
  readonly unstyled = signal(false);
}

function keydown(target: HTMLElement, key: string): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}

beforeEach(() => TestBed.configureTestingModule({ providers: [provideTxIcons(TX_ICONS)] }));

describe('TxTabs with items', () => {
  let fixture: ComponentFixture<ItemsHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const tabs = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(ItemsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('renders a tab list with icons, badges, the description and the variant', () => {
    const host = el('#items');
    expect(host.getAttribute('data-variant')).toBe('segmented');
    expect(host.getAttribute('data-size')).toBe('small');
    expect(host.classList).toContain('tx-tabs--raised');
    expect(host.style.getPropertyValue('--tx-tabs-segmented-padding')).toBe('6px');
    expect(el('[role="tablist"]').getAttribute('aria-label')).toBe('Mail');
    expect(tabs().map((tab) => tab.textContent?.trim())).toEqual(['Inbox0', 'Spam', 'Sent4']);
    expect(tabs()[0].querySelector('tx-icon')?.getAttribute('data-icon')).toBe('inbox');
    expect(tabs()[0].classList).toContain('my-tab');
    expect(el('.tx-tab__badge').classList).toContain('my-badge');
    expect(el('.tx-tab-list__description').textContent).toBe('New mail');
  });

  it('marks the active tab and keeps one tab in the tab order', () => {
    const [inbox, spam, sent] = tabs();
    expect(inbox.getAttribute('aria-selected')).toBe('true');
    expect(inbox.classList).toContain('tx-tab--active');
    expect(inbox.getAttribute('tabindex')).toBe('0');
    expect(sent.getAttribute('tabindex')).toBe('-1');
    expect(spam.getAttribute('aria-disabled')).toBe('true');
    expect(inbox.hasAttribute('aria-controls')).toBe(false);
  });

  it('selects on click, ignores disabled tabs and emits tabChange', async () => {
    const [, spam, sent] = tabs();
    spam.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe('inbox');
    sent.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe('sent');
    expect(fixture.componentInstance.changes).toEqual(['sent']);
    expect(el('.tx-tab-list__description')).toBeNull();
    sent.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.changes).toEqual(['sent']);
  });

  it('moves focus with the arrows, skips disabled tabs and picks with Enter', async () => {
    const [inbox, , sent] = tabs();
    inbox.focus();
    keydown(inbox, 'ArrowRight');
    expect(document.activeElement).toBe(sent);
    expect(fixture.componentInstance.active()).toBe('inbox');
    keydown(sent, 'ArrowRight');
    expect(document.activeElement).toBe(inbox);
    keydown(inbox, 'End');
    expect(document.activeElement).toBe(sent);
    keydown(sent, 'Home');
    expect(document.activeElement).toBe(inbox);
    keydown(inbox, 'ArrowLeft');
    keydown(sent, 'Enter');
    await fixture.whenStable();
    expect(fixture.componentInstance.active()).toBe('sent');
  });

  it('selects on focus when asked', async () => {
    fixture.componentInstance.selectOnFocus.set(true);
    await fixture.whenStable();
    const [inbox, , sent] = tabs();
    inbox.focus();
    keydown(inbox, 'ArrowRight');
    await fixture.whenStable();
    expect(document.activeElement).toBe(sent);
    expect(fixture.componentInstance.active()).toBe('sent');
  });

  it('passes the variant to the tabs', async () => {
    fixture.componentInstance.variant.set('pills');
    await fixture.whenStable();
    expect(tabs()[0].getAttribute('data-variant')).toBe('pills');
    expect(el('tx-tab-list').getAttribute('data-variant')).toBe('pills');
  });
});

describe('TxTabs from parts', () => {
  let fixture: ComponentFixture<PartsHost>;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement | null;
  const panels = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];
  const tabs = () => Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')) as HTMLElement[];

  beforeEach(async () => {
    fixture = TestBed.createComponent(PartsHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
  });

  it('wires tabs and panels by value', () => {
    const [a, , c] = tabs();
    const [panelA, panelB, panelC] = panels();
    expect(el('[role="tablist"]')?.getAttribute('aria-label')).toBe('Project');
    expect(a.getAttribute('aria-controls')).toBe(panelA.id);
    expect(panelA.getAttribute('aria-labelledby')).toBe(a.id);
    expect(c.getAttribute('aria-controls')).toBe(panelC.id);
    expect(panelA.hasAttribute('hidden')).toBe(false);
    expect(panelB.hasAttribute('hidden')).toBe(true);
  });

  it('creates template content on the first visit and keeps it', async () => {
    expect(el('.lazy')).toBeNull();
    fixture.componentInstance.active.set('b');
    await fixture.whenStable();
    expect(el('.lazy')?.textContent).toBe('Lazy b');
    fixture.componentInstance.active.set('a');
    await fixture.whenStable();
    expect(el('.lazy')).not.toBeNull();
    expect(panels()[1].hasAttribute('hidden')).toBe(true);
  });

  it('renders only the active panel when lazy', async () => {
    fixture.componentInstance.lazy.set(true);
    await fixture.whenStable();
    expect(el('.eager')).not.toBeNull();
    expect(el('.eager-c')).toBeNull();
    fixture.componentInstance.active.set('b');
    await fixture.whenStable();
    expect(el('.eager')).toBeNull();
    expect(el('.lazy')).not.toBeNull();
    fixture.componentInstance.active.set(3);
    await fixture.whenStable();
    expect(el('.lazy')).toBeNull();
    expect(el('.eager-c')).not.toBeNull();
  });

  it('draws the active bar under the line tab', () => {
    expect(el('.tx-tab-list__active-bar')).not.toBeNull();
  });

  it('drops the styles when unstyled', async () => {
    fixture.componentInstance.unstyled.set(true);
    await fixture.whenStable();
    expect(el('#parts')?.hasAttribute('data-styled')).toBe(false);
    expect(tabs()[0].hasAttribute('data-styled')).toBe(false);
  });
});

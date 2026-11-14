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

@Component({
  imports: [TxTabs, TxTabList, TxTab],
  template: `
    <tx-tabs id="scroll" variant="line" [scrollable]="scrollable()" [orientation]="orientation()" [(value)]="active">
      <tx-tab-list ariaLabelledBy="heading">
        <tx-tab value="one" icon="custom-glyph">One</tx-tab>
        <button txTab value="two">Two</button>
        <tx-tab value="three" disabled>Three</tx-tab>
        <tx-tab value="four">Four</tx-tab>
      </tx-tab-list>
    </tx-tabs>
    <tx-tabs id="off" [value]="'x'">
      <tx-tab-list>
        <tx-tab value="x" disabled>X</tx-tab>
      </tx-tab-list>
    </tx-tabs>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class ScrollHost {
  readonly scrollable = signal<boolean | undefined>(true);
  readonly orientation = signal<'horizontal' | 'vertical'>('horizontal');
  readonly active = signal<TxTabValue | undefined>('one');
}

class FakeResizeObserver {
  static readonly all: FakeResizeObserver[] = [];
  readonly observed: Element[] = [];
  disconnected = false;

  constructor(readonly callback: () => void) {
    FakeResizeObserver.all.push(this);
  }

  observe(element: Element): void {
    this.observed.push(element);
  }

  unobserve(): void {
    this.observed.length = 0;
  }

  disconnect(): void {
    this.observed.length = 0;
    this.disconnected = true;
  }
}

function rect(left: number, width: number): DOMRect {
  return { left, right: left + width, width, top: 0, bottom: 20, height: 20, x: left, y: 0, toJSON: () => ({}) };
}

describe('TxTabs scrolling', () => {
  let fixture: ComponentFixture<ScrollHost>;
  let scrollLeft = 0;
  const el = (selector: string) => fixture.nativeElement.querySelector(selector) as HTMLElement;
  const tabs = () => Array.from(fixture.nativeElement.querySelectorAll('#scroll [role="tab"]')) as HTMLElement[];

  beforeEach(async () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    FakeResizeObserver.all.length = 0;
    scrollLeft = 0;
    fixture = TestBed.createComponent(ScrollHost);
    fixture.autoDetectChanges();
    await fixture.whenStable();
    const content = el('#scroll [role="tablist"]');
    Object.defineProperty(content, 'scrollWidth', { value: 500, configurable: true });
    Object.defineProperty(content, 'clientWidth', { value: 200, configurable: true });
    Object.defineProperty(content, 'scrollLeft', { get: () => scrollLeft, set: (value: number) => (scrollLeft = value), configurable: true });
  });

  afterEach(() => {
    fixture.destroy();
    vi.unstubAllGlobals();
  });

  it('observes the list and its tabs and shows the navigators the content needs', async () => {
    const content = el('#scroll [role="tablist"]');
    const observer = FakeResizeObserver.all.find((each) => each.observed.includes(content)) as FakeResizeObserver;
    expect(observer.observed).toHaveLength(5);
    expect(el('#scroll [role="tablist"]').getAttribute('aria-labelledby')).toBe('heading');
    const previous = el('.tx-tab-list__nav--previous');
    const next = el('.tx-tab-list__nav--next');
    expect(next.classList).toContain('tx-tab-list__nav--hidden');
    observer.callback();
    await fixture.whenStable();
    expect(next.classList).not.toContain('tx-tab-list__nav--hidden');
    expect(previous.classList).toContain('tx-tab-list__nav--hidden');
    next.click();
    expect(scrollLeft).toBe(160);
    el('#scroll [role="tablist"]').dispatchEvent(new Event('scroll'));
    await fixture.whenStable();
    expect(previous.classList).not.toContain('tx-tab-list__nav--hidden');
    previous.click();
    expect(scrollLeft).toBe(0);
    previous.click();
    expect(scrollLeft).toBe(0);
    fixture.destroy();
    expect(observer.disconnected).toBe(true);
  });

  it('shows the scroll buttons by itself only while the tabs do not fit', async () => {
    const content = el('#scroll [role="tablist"]');
    const observer = FakeResizeObserver.all.find((each) => each.observed.includes(content)) as FakeResizeObserver;
    fixture.componentInstance.scrollable.set(undefined);
    await fixture.whenStable();
    expect(el('#scroll .tx-tab-list').classList).toContain('tx-tab-list--scrollable');
    expect(el('.tx-tab-list__nav--next').classList).not.toContain('tx-tab-list__nav--hidden');
    Object.defineProperty(content, 'clientWidth', { value: 500, configurable: true });
    observer.callback();
    await fixture.whenStable();
    expect(el('#scroll .tx-tab-list').classList).not.toContain('tx-tab-list--scrollable');
    expect(el('.tx-tab-list__nav--next')).toBeNull();
    Object.defineProperty(content, 'clientWidth', { value: 200, configurable: true });
    fixture.componentInstance.scrollable.set(false);
    await fixture.whenStable();
    observer.callback();
    await fixture.whenStable();
    expect(el('.tx-tab-list__nav--next')).toBeNull();
  });

  it('scrolls the active tab into view from either side', async () => {
    const content = el('#scroll [role="tablist"]');
    content.getBoundingClientRect = () => rect(100, 200);
    const [, two, , four] = tabs();
    four.getBoundingClientRect = () => rect(350, 50);
    two.getBoundingClientRect = () => rect(40, 50);
    fixture.componentInstance.active.set('four');
    await fixture.whenStable();
    expect(scrollLeft).toBeGreaterThan(50);
    const after = scrollLeft;
    fixture.componentInstance.active.set('two');
    await fixture.whenStable();
    expect(scrollLeft).toBeLessThan(after);
    expect(two.getAttribute('type')).toBe('button');
  });

  it('draws an unknown icon as a class and sets the bar along a vertical list', async () => {
    expect(tabs()[0].querySelector('.tx-tab__icon span')?.className).toBe('custom-glyph');
    const [one] = tabs();
    Object.defineProperty(one, 'offsetTop', { value: 12, configurable: true });
    Object.defineProperty(one, 'offsetHeight', { value: 30, configurable: true });
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();
    const bar = el('.tx-tab-list__active-bar');
    expect(bar.style.getPropertyValue('--_bar-start')).toBe('12px');
    expect(bar.style.getPropertyValue('--_bar-size')).toBe('30px');
    expect(el('.tx-tab-list__nav--next')).toBeNull();
  });

  it('moves with the up and down arrows when vertical and ignores other keys', async () => {
    fixture.componentInstance.orientation.set('vertical');
    await fixture.whenStable();
    const [one, two, , four] = tabs();
    one.focus();
    keydown(one, 'ArrowDown');
    expect(document.activeElement).toBe(two);
    keydown(two, 'ArrowUp');
    expect(document.activeElement).toBe(one);
    keydown(one, 'ArrowUp');
    expect(document.activeElement).toBe(four);
    const other = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });
    four.dispatchEvent(other);
    expect(other.defaultPrevented).toBe(false);
    (document.activeElement as HTMLElement).blur();
    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    el('#scroll [role="tablist"]').dispatchEvent(enter);
    expect(enter.defaultPrevented).toBe(false);
  });

  it('leaves a list of disabled tabs alone and keeps its disabled value', () => {
    const tab = el('#off [role="tab"]');
    const event = new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, cancelable: true });
    tab.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(tab.getAttribute('tabindex')).toBe('-1');
  });
});

describe('TxTabPanelContent', () => {
  it('narrows the template context', () => {
    const directive = {} as TxTabPanelContent;
    expect(TxTabPanelContent.ngTemplateContextGuard(directive, { $implicit: 'a' })).toBe(true);
    expect(TxTabPanelContent.ngTemplateContextGuard(directive, undefined)).toBe(false);
  });
});

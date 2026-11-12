import { CdkDragDrop, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, input, signal, viewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TxFluid, injectFluid } from '@tectra-ng/core/fluid';
import { TestBed } from '@angular/core/testing';
import { TxFilterField, TxFiltersReset } from './filter-field.directive';
import { TxFiltersPanel } from './filters-panel.component';
import { TxFiltersPanelLayout } from './filters-panel.types';
import { TxHasFilterValuePipe, hasFilterValue } from './has-filter-value.pipe';

const STATE_KEY = 'tx-spec-filters';

@Component({
  imports: [TxFiltersPanel, TxFilterField, TxFiltersReset, TxHasFilterValuePipe],
  template: `
    <tx-filters-panel
      #panel
      ariaLabel="Orders"
      [stateKey]="stateKey()"
      [stateStorage]="stateStorage()"
      [defaultVisible]="2"
      [busy]="busy()"
      [variant]="variant()"
      [dt]="{ root: { padding: '4px' } }"
      [pt]="{ fields: { class: 'own-fields' } }"
      (layoutChange)="layouts.push($event)"
      (expandedChange)="expansions.push($event)"
    >
      <div class="field-search" txFilterField="search" filterLabel="Search" [filterActive]="search() | hasFilterValue">
        <input aria-label="Search" />
      </div>
      <div class="field-status" txFilterField="status" filterLabel="Status" [filterActive]="status() | hasFilterValue">
        <input aria-label="Status" />
      </div>
      <div class="field-owner" txFilterField="owner" filterLabel="Owner" [filterActive]="owner() | hasFilterValue">
        <input aria-label="Owner" />
      </div>
      <button txFiltersActions txFiltersReset type="button" class="reset" (click)="resets = resets + 1">Reset</button>
      <button txFiltersActions type="button" class="create">Create</button>
    </tx-filters-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class Host {
  readonly panel = viewChild.required<TxFiltersPanel>('panel');
  readonly stateKey = signal<string | undefined>(undefined);
  readonly stateStorage = signal<'local' | 'session'>('local');
  readonly busy = signal(false);
  readonly variant = signal<'card' | 'plain'>('card');
  readonly search = signal('');
  readonly status = signal<string | null>(null);
  readonly owner = signal<string[]>([]);
  readonly layouts: (TxFiltersPanelLayout | null)[] = [];
  readonly expansions: boolean[] = [];
  resets = 0;
}

@Component({
  imports: [TxFiltersPanel, TxFilterField],
  template: `
    <tx-filters-panel unstyled>
      <div txFilterField="one" filterLabel="One"><input aria-label="One" /></div>
    </tx-filters-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class SingleHost {}

@Component({ selector: 'spec-fluid-probe', template: '', changeDetection: ChangeDetectionStrategy.OnPush })
class FluidProbe {
  readonly fluid = input<boolean | undefined>(undefined);
  readonly isFluid = injectFluid(this.fluid);
}

@Component({
  imports: [TxFiltersPanel, TxFilterField, FluidProbe],
  template: `
    <tx-filters-panel [collapse]="collapse()" stateKey="tx-spec-collapse" [defaultVisible]="1">
      <div txFilterField="one" filterLabel="One"><spec-fluid-probe class="inside" /></div>
      <div txFilterField="two" filterLabel="Two"><input aria-label="Two" /></div>
      <spec-fluid-probe txFiltersActions class="action" />
    </tx-filters-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class CollapseHost {
  readonly collapse = signal<'auto' | 'always' | 'never'>('always');
}

describe('TxFiltersPanel', () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove()));

  async function setup(prepare?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    prepare?.(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-filters-panel') as HTMLElement;
    return { fixture, host: fixture.componentInstance, root };
  }

  const field = (root: HTMLElement, key: string) => root.querySelector(`.field-${key}`) as HTMLElement;
  const isHidden = (element: HTMLElement) => element.hasAttribute('hidden') && element.style.display === 'none';

  it('renders the fields and actions in a search landmark with tokens, variant and busy state', async () => {
    const { fixture, host, root } = await setup();
    expect(root.getAttribute('role')).toBe('search');
    expect(root.getAttribute('aria-label')).toBe('Orders');
    expect(root.hasAttribute('data-styled')).toBe(true);
    expect(root.getAttribute('data-variant')).toBe('card');
    expect(root.style.getPropertyValue('--tx-filters-panel-padding')).toBe('4px');
    expect(root.querySelector('.tx-filters-panel__fields')?.classList).toContain('own-fields');
    expect(root.querySelectorAll('.tx-filters-panel__fields .tx-filter-field')).toHaveLength(3);
    expect(root.querySelector('.tx-filters-panel__actions .reset')).not.toBeNull();
    expect(root.querySelector('.tx-filters-panel__menu-button')).toBeNull();
    expect(['search', 'status', 'owner'].some((key) => isHidden(field(root, key)))).toBe(false);

    host.busy.set(true);
    host.variant.set('plain');
    await fixture.whenStable();
    expect(root.classList).toContain('tx-filters-panel--busy');
    expect(root.getAttribute('aria-busy')).toBe('true');
    expect(root.getAttribute('data-variant')).toBe('plain');
  });

  it('shows the default number of fields and the hidden count once a state key is set', async () => {
    const { root } = await setup((host) => host.stateKey.set(STATE_KEY));
    expect(isHidden(field(root, 'search'))).toBe(false);
    expect(isHidden(field(root, 'status'))).toBe(false);
    expect(isHidden(field(root, 'owner'))).toBe(true);
    expect(field(root, 'owner').style.order).toBe('2');
    const button = root.querySelector('.tx-filters-panel__menu-button') as HTMLButtonElement;
    expect(button.getAttribute('aria-haspopup')).toBe('menu');
    expect(button.getAttribute('aria-label')).toBe('Show filters, 1 hidden');
    expect(button.querySelector('.tx-filters-panel__count')?.textContent?.trim()).toBe('1');
  });

  it('shows and hides fields, saves the layout and keeps fields with a value', async () => {
    const { fixture, host, root } = await setup((host) => host.stateKey.set(STATE_KEY));
    const panel = host.panel();
    panel.toggle('owner');
    await fixture.whenStable();
    expect(isHidden(field(root, 'owner'))).toBe(false);
    expect(JSON.parse(localStorage.getItem(STATE_KEY) ?? 'null')).toEqual({ order: ['search', 'status', 'owner'], visible: ['search', 'status', 'owner'] });

    panel.toggle('search');
    await fixture.whenStable();
    expect(isHidden(field(root, 'search'))).toBe(true);
    expect(host.layouts.at(-1)).toEqual({ order: ['search', 'status', 'owner'], visible: ['status', 'owner'] });

    host.search.set('kyiv');
    await fixture.whenStable();
    expect(isHidden(field(root, 'search'))).toBe(false);
    expect(panel.options().find((option) => option.key === 'search')).toEqual({ key: 'search', label: 'Search', visible: true, active: true });
    panel.toggle('search');
    expect(host.layouts).toHaveLength(2);
  });

  it('moves fields, resets the layout and reads an older array value', async () => {
    localStorage.setItem(STATE_KEY, JSON.stringify(['owner']));
    const { fixture, host, root } = await setup((host) => host.stateKey.set(STATE_KEY));
    const panel = host.panel();
    expect(isHidden(field(root, 'owner'))).toBe(false);
    expect(isHidden(field(root, 'search'))).toBe(true);

    panel.move('owner', -1);
    await fixture.whenStable();
    expect(panel.options().map((option) => option.key)).toEqual(['search', 'owner', 'status']);
    expect(field(root, 'owner').style.order).toBe('1');

    panel.reset();
    await fixture.whenStable();
    expect(localStorage.getItem(STATE_KEY)).toBeNull();
    expect(host.layouts.at(-1)).toBeNull();
    expect(panel.options().map((option) => [option.key, option.visible])).toEqual([
      ['search', true],
      ['status', true],
      ['owner', false],
    ]);
  });

  it('opens the menu with checkbox rows, a counter and keyboard moves', async () => {
    const { fixture, host, root } = await setup((host) => host.stateKey.set(STATE_KEY));
    host.status.set('paid');
    await fixture.whenStable();
    (root.querySelector('.tx-filters-panel__menu-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const menu = document.querySelector('.tx-filters-panel-menu') as HTMLElement;
    expect(menu).not.toBeNull();
    expect(menu.querySelector('.tx-filters-panel-menu__counter')?.textContent?.trim()).toBe('2 of 3');
    const rows = Array.from(menu.querySelectorAll<HTMLButtonElement>('[role="menuitemcheckbox"]'));
    expect(rows.map((row) => row.getAttribute('aria-checked'))).toEqual(['true', 'true', 'false']);
    expect(rows[1].getAttribute('aria-disabled')).toBe('true');
    expect(rows[1].title).toBe('Has a value — shown while it is set');

    rows[2].click();
    await fixture.whenStable();
    expect(rows[2].getAttribute('aria-checked')).toBe('true');

    rows[0].focus();
    rows[0].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    expect(document.activeElement).toBe(rows[1]);
    rows[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    expect(document.activeElement?.classList).toContain('tx-filters-panel-menu__reset');

    rows[2].dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', altKey: true, bubbles: true }));
    await fixture.whenStable();
    expect(host.panel().options().map((option) => option.key)).toEqual(['search', 'owner', 'status']);
  });

  it('folds the fields behind a toggle that counts active filters, closes outside and clears through the reset action', async () => {
    const { fixture, host, root } = await setup();
    host.status.set('paid');
    host.owner.set(['ann']);
    await fixture.whenStable();
    const toggle = root.querySelector('.tx-filters-panel__toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(toggle.getAttribute('aria-controls')).toBe(root.querySelector('.tx-filters-panel__panel')?.id);
    expect(toggle.querySelector('.tx-filters-panel__count')?.textContent?.trim()).toBe('2');

    toggle.click();
    await fixture.whenStable();
    expect(root.classList).toContain('tx-filters-panel--expanded');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');
    field(root, 'search').querySelector('input')?.click();
    await fixture.whenStable();
    expect(host.panel().expanded()).toBe(true);

    const clear = root.querySelector('.tx-filters-panel__panel-footer button') as HTMLButtonElement;
    expect(clear.textContent?.trim()).toBe('Clear filters');
    clear.click();
    expect(host.resets).toBe(1);

    document.body.click();
    await fixture.whenStable();
    expect(host.panel().expanded()).toBe(false);

    toggle.click();
    await fixture.whenStable();
    toggle.focus();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(host.panel().expanded()).toBe(false);
    expect(document.activeElement).toBe(toggle);
    expect(host.expansions).toEqual([true, false, true, false]);
  });

  it('shows the hidden fields while folded on a narrow screen', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((query: string) => ({ matches: true, media: query, addEventListener: () => undefined, removeEventListener: () => undefined })) as unknown as typeof window.matchMedia;
    try {
      const { root } = await setup((host) => host.stateKey.set(STATE_KEY));
      expect(isHidden(field(root, 'owner'))).toBe(false);
    } finally {
      window.matchMedia = original;
    }
  });

  it('never folds a single field and drops the styles when unstyled', async () => {
    const fixture = TestBed.createComponent(SingleHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-filters-panel') as HTMLElement;
    expect(root.hasAttribute('data-styled')).toBe(false);
    expect(root.querySelector('.tx-filters-panel__toggle')).toBeNull();
    expect(root.querySelector('.tx-filters-panel__actions')?.children).toHaveLength(0);
  });
});

describe('TxFiltersPanel collapse and fluid fields', () => {
  it('folds at any width with always, never folds with never, and stretches only the field controls', async () => {
    const fixture = TestBed.createComponent(CollapseHost);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-filters-panel') as HTMLElement;
    const panel = fixture.debugElement.query((node) => node.componentInstance instanceof TxFiltersPanel).componentInstance as TxFiltersPanel;
    expect(root.getAttribute('data-collapse')).toBe('always');
    expect(panel.folded()).toBe(true);
    expect(root.querySelector('.tx-filters-panel__toggle')).not.toBeNull();
    expect((root.querySelector('[txfilterfield="two"]') as HTMLElement).hasAttribute('hidden')).toBe(false);

    const probes = fixture.debugElement.queryAll((node) => node.componentInstance instanceof FluidProbe);
    const [inside, action] = probes.map((node) => node.componentInstance as FluidProbe);
    expect(inside.isFluid()).toBe(true);
    expect(action.isFluid()).toBe(false);
    expect(fixture.debugElement.query((node) => node.nativeElement?.getAttribute?.('txfilterfield') === 'one').injector.get(TxFluid)).toBeInstanceOf(TxFluid);

    fixture.componentInstance.collapse.set('never');
    await fixture.whenStable();
    expect(panel.collapsible()).toBe(false);
    expect(root.querySelector('.tx-filters-panel__toggle')).toBeNull();
    expect((root.querySelector('[txfilterfield="two"]') as HTMLElement).hasAttribute('hidden')).toBe(true);
  });
});

describe('hasFilterValue', () => {
  it('treats blank strings, empty arrays and nullish values as empty', () => {
    const pipe = new TxHasFilterValuePipe();
    expect(pipe.transform('  ')).toBe(false);
    expect(pipe.transform([])).toBe(false);
    expect(pipe.transform(null, undefined)).toBe(false);
    expect(pipe.transform(0)).toBe(true);
    expect(pipe.transform(false)).toBe(true);
    expect(pipe.transform('', ['a'])).toBe(true);
    expect(hasFilterValue(' x ')).toBe(true);
  });
});

@Component({
  imports: [TxFilterField],
  template: `<div txFilterField="alone" filterLabel="Alone"><input aria-label="Alone" /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class LooseFieldHost {}

function mockMedia(state: { narrow: boolean; reduced: boolean }) {
  const listeners: (() => void)[] = [];
  const original = window.matchMedia;
  window.matchMedia = ((query: string) => ({
    get matches() {
      return query.includes('reduce') ? state.reduced : state.narrow;
    },
    media: query,
    addEventListener: (_type: string, listener: () => void) => listeners.push(listener),
    removeEventListener: () => undefined,
  })) as unknown as typeof window.matchMedia;
  return {
    change: () => listeners.forEach((listener) => listener()),
    restore: () => {
      window.matchMedia = original;
    },
  };
}

describe('TxFiltersPanel folding, storage and menu edges', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.querySelectorAll('.cdk-overlay-container').forEach((node) => node.remove());
  });

  async function setup(prepare?: (host: Host) => void) {
    const fixture = TestBed.createComponent(Host);
    prepare?.(fixture.componentInstance);
    await fixture.whenStable();
    const root = fixture.nativeElement.querySelector('tx-filters-panel') as HTMLElement;
    return { fixture, host: fixture.componentInstance, root };
  }

  it('animates the fold closed on a narrow screen until the animation or the fallback ends', async () => {
    const media = mockMedia({ narrow: true, reduced: false });
    try {
      const { fixture, host, root } = await setup();
      const panel = host.panel();
      const panelElement = root.querySelector('.tx-filters-panel__panel') as HTMLElement;
      panel.setExpanded(true);
      panel.setExpanded(true);
      expect(host.expansions).toEqual([true]);

      panel.setExpanded(false);
      fixture.detectChanges();
      expect(root.classList).toContain('tx-filters-panel--closing');
      panelElement.querySelector('.tx-filter-field')?.dispatchEvent(new Event('animationend', { bubbles: true }));
      fixture.detectChanges();
      expect(root.classList).toContain('tx-filters-panel--closing');
      panelElement.dispatchEvent(new Event('animationend'));
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-filters-panel--closing');
      panelElement.dispatchEvent(new Event('animationend'));
      expect(root.classList).not.toContain('tx-filters-panel--closing');

      vi.useFakeTimers();
      panel.setExpanded(true);
      panel.setExpanded(false);
      fixture.detectChanges();
      expect(root.classList).toContain('tx-filters-panel--closing');
      vi.advanceTimersByTime(400);
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-filters-panel--closing');
    } finally {
      media.restore();
    }
  });

  it('closes without the animation when motion is reduced and unfolds once the screen grows', async () => {
    const state = { narrow: true, reduced: true };
    const media = mockMedia(state);
    try {
      const { fixture, host, root } = await setup();
      const panel = host.panel();
      panel.setExpanded(true);
      panel.setExpanded(false);
      fixture.detectChanges();
      expect(root.classList).not.toContain('tx-filters-panel--closing');

      panel.setExpanded(true);
      media.change();
      expect(panel.expanded()).toBe(true);
      state.narrow = false;
      media.change();
      await fixture.whenStable();
      expect(panel.folded()).toBe(false);
      expect(panel.expanded()).toBe(false);
      expect(root.classList).not.toContain('tx-filters-panel--expanded');
      expect(host.expansions).toEqual([true, false, true, false]);
    } finally {
      media.restore();
    }
  });

  it('stays open for clicks and Escape that come from an overlay or a detached node', async () => {
    const { fixture, host, root } = await setup();
    const panel = host.panel();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(host.expansions).toEqual([]);

    (root.querySelector('.tx-filters-panel__toggle') as HTMLButtonElement).click();
    await fixture.whenStable();
    const overlay = document.createElement('div');
    overlay.className = 'cdk-overlay-container';
    const inside = document.createElement('button');
    overlay.appendChild(inside);
    document.body.appendChild(overlay);
    inside.click();
    inside.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    const detached = document.createElement('button');
    detached.addEventListener('click', () => detached.remove());
    document.body.appendChild(detached);
    detached.click();
    expect(panel.expanded()).toBe(true);

    root.querySelector('.tx-filters-panel__toggle')?.dispatchEvent(new Event('focus'));
    (document.activeElement as HTMLElement | null)?.blur();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    await fixture.whenStable();
    expect(panel.expanded()).toBe(false);
    expect(document.activeElement).toBe(document.body);
  });

  it('keeps the layout in memory without a state key and ignores moves out of range', async () => {
    const { host } = await setup();
    const panel = host.panel();
    expect(panel.customizable()).toBe(false);
    expect(panel.options().map((option) => option.visible)).toEqual([true, true, false]);
    expect(panel.fieldOrder('search')).toBeNull();

    panel.move('missing', 1);
    panel.move('search', -1);
    panel.move('owner', 1);
    panel.toggle('missing');
    expect(host.layouts).toEqual([]);

    panel.toggle('owner');
    expect(host.layouts).toEqual([
      { order: ['search', 'status', 'owner'], visible: ['search', 'status', 'owner'] },
    ]);
    expect(localStorage.length).toBe(0);
  });

  it('reads a stored object layout from session storage and survives broken values', async () => {
    sessionStorage.setItem(STATE_KEY, JSON.stringify({ order: ['owner', 7], visible: ['owner'] }));
    const { fixture, host } = await setup((host) => host.stateKey.set(STATE_KEY));
    const panel = host.panel();
    expect(panel.options().map((option) => option.key)).toEqual(['search', 'status', 'owner']);

    host.stateStorage.set('session');
    host.stateKey.set(undefined);
    await fixture.whenStable();
    host.stateKey.set(STATE_KEY);
    await fixture.whenStable();
    expect(panel.options().map((option) => [option.key, option.visible])).toEqual([
      ['owner', true],
      ['search', false],
      ['status', false],
    ]);

    panel.toggle('search');
    expect(JSON.parse(sessionStorage.getItem(STATE_KEY) ?? 'null')).toEqual({
      order: ['owner', 'search', 'status'],
      visible: ['owner', 'search'],
    });

    const layoutFor = async (value: string) => {
      sessionStorage.setItem('tx-spec-broken', value);
      host.stateKey.set('tx-spec-broken');
      await fixture.whenStable();
      const options = panel.options().map((option) => [option.key, option.visible]);
      host.stateKey.set(STATE_KEY);
      await fixture.whenStable();
      return options;
    };
    const defaults = [
      ['search', true],
      ['status', true],
      ['owner', false],
    ];
    expect(await layoutFor('{oops')).toEqual(defaults);
    expect(await layoutFor('42')).toEqual(defaults);
    expect(await layoutFor(JSON.stringify({ order: 'owner', visible: 'owner' }))).toEqual(defaults);
  });

  it('falls back to the defaults when the storage cannot be used', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('quota');
    });
    const { host } = await setup((host) => host.stateKey.set(STATE_KEY));
    const panel = host.panel();
    panel.toggle('owner');
    expect(host.layouts).toHaveLength(1);
    expect(panel.options().every((option) => option.visible)).toBe(true);

    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new Error('blocked');
    });
    panel.reset();
    expect(host.layouts.at(-1)).toBeNull();
    expect(panel.options().map((option) => option.visible)).toEqual([true, true, false]);
  });

  it('reorders the menu with Alt and ArrowDown and with a drop on the list', async () => {
    const { fixture, host, root } = await setup((host) => host.stateKey.set(STATE_KEY));
    (root.querySelector('.tx-filters-panel__menu-button') as HTMLButtonElement).click();
    await fixture.whenStable();
    const menu = document.querySelector('.tx-filters-panel-menu') as HTMLElement;
    const row = (key: string) => menu.querySelector(`[data-key="${key}"]`) as HTMLButtonElement;
    row('search').dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', altKey: true, bubbles: true }));
    await fixture.whenStable();
    expect(host.panel().options().map((option) => option.key)).toEqual(['status', 'search', 'owner']);
    expect(document.activeElement).toBe(row('search'));

    row('owner').focus();
    row('owner').dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    expect(document.activeElement).toBe(row('owner'));
    row('owner').dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    expect(document.activeElement).toBe(row('status'));

    const list = fixture.debugElement.query(By.directive(CdkDropList)).injector.get(CdkDropList);
    list.dropped.emit({ previousIndex: 1, currentIndex: 1 } as CdkDragDrop<unknown>);
    expect(host.layouts).toHaveLength(1);
    list.dropped.emit({ previousIndex: 2, currentIndex: 0 } as CdkDragDrop<unknown>);
    expect(host.layouts.at(-1)).toEqual({ order: ['owner', 'status', 'search'], visible: ['search', 'status'] });
  });

  it('lets a filter field work outside a panel', async () => {
    const fixture = TestBed.createComponent(LooseFieldHost);
    await fixture.whenStable();
    const element = fixture.nativeElement.querySelector('.tx-filter-field') as HTMLElement;
    const directive = fixture.debugElement.query(By.directive(TxFilterField)).injector.get(TxFilterField);
    expect(directive.hidden()).toBe(false);
    expect(directive.order()).toBeNull();
    expect(element.hasAttribute('hidden')).toBe(false);
    expect(element.style.order).toBe('');
  });

  it('keeps the layout in memory when the window has no storage', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockReturnValue(null as unknown as Storage);
    const { host } = await setup((host) => host.stateKey.set(STATE_KEY));
    const panel = host.panel();
    panel.toggle('owner');
    expect(panel.options().every((option) => option.visible)).toBe(true);
    expect(host.layouts).toHaveLength(1);
  });
});

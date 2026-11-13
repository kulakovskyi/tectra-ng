import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  AfterViewInit,
  Injector,
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  linkedSignal,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraFiltersPanelTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_FILTERS_PANEL, TxFilterField, TxFiltersPanelContext, TxFiltersReset } from './filter-field.directive';
import {
  TxFiltersPanelCollapse,
  TxFiltersPanelLayout,
  TxFiltersPanelOption,
  TxFiltersPanelPart,
  TxFiltersPanelStateStorage,
  TxFiltersPanelVariant,
} from './filters-panel.types';
import { FILTERS_PANEL_ICON_DEFAULTS } from './filters-panel.icons';
import { FILTERS_PANEL_THEME } from './filters-panel.theme';

const COLLAPSE_QUERY = '(width < 64rem)';
const OVERLAY_CONTAINER = '.cdk-overlay-container';
const CLOSE_FALLBACK_MS = 400;

/** A row of filter fields with reset, a "Filters" fold on narrow screens and an optional saved layout. */
@Component({
  selector: 'tx-filters-panel',
  imports: [CdkDropList, CdkDrag, CdkDragHandle, TxIcon, TxButton, TxPopover, TxPopoverTrigger, TxTooltip],
  templateUrl: './filters-panel.component.html',
  styleUrl: './filters-panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: TX_FILTERS_PANEL, useExisting: forwardRef(() => TxFiltersPanel) }],
  host: {
    class: 'tx-filters-panel',
    role: 'search',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-collapse]': 'collapse()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-busy]': 'busy() || null',
    '[class.tx-filters-panel--busy]': 'busy()',
    '[class.tx-filters-panel--collapsible]': 'collapsible()',
    '[class.tx-filters-panel--expanded]': 'expanded()',
    '[class.tx-filters-panel--closing]': 'closing()',
    '(document:click)': 'closeOnOutsideClick($event)',
    '(document:keydown.escape)': 'closeOnEscape($event)',
  },
  viewProviders: [provideTxIconDefaults(FILTERS_PANEL_ICON_DEFAULTS)],
})
export class TxFiltersPanel implements TxFiltersPanelContext, AfterViewInit {
  private readonly filtersPanelTheme = injectTokens(FILTERS_PANEL_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly locale = inject(TxLocaleService);

  readonly variant = input<TxFiltersPanelVariant>('card');
  readonly busy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly stateKey = input<string | undefined>(undefined);
  readonly stateStorage = input<TxFiltersPanelStateStorage>('local');
  readonly defaultVisible = input<number, unknown>(3, { transform: numberAttribute });
  readonly collapse = input<TxFiltersPanelCollapse>('auto');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraFiltersPanelTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFiltersPanelPart, TxFiltersPanel> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly layoutChange = output<TxFiltersPanelLayout | null>();
  readonly expandedChange = output<boolean>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('filtersPanel', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly id = uniqueId('tx-filters-panel');

  private readonly fields = contentChildren(TxFilterField, { descendants: true });
  protected readonly resetAction = contentChild(TxFiltersReset, { descendants: true });
  private readonly fieldsContainer = viewChild.required<ElementRef<HTMLElement>>('fieldsContainer');
  private readonly toggleButton = viewChild<ElementRef<HTMLButtonElement>>('toggleButton');
  private readonly menuList = viewChild<ElementRef<HTMLElement>>('menuList');

  private readonly projectedCount = signal(0);
  private readonly narrow = signal(false);
  readonly expanded = signal(false);
  protected readonly closing = signal(false);
  private closingTimer: ReturnType<typeof setTimeout> | undefined;
  protected readonly menuOpen = signal(false);

  readonly collapsible = computed(() => this.collapse() !== 'never' && Math.max(this.fields().length, this.projectedCount()) > 1);
  readonly folded = computed(() => this.collapsible() && (this.collapse() === 'always' || this.narrow()));
  readonly activeCount = computed(() => this.fields().filter((field) => field.filterActive()).length);
  readonly customizable = computed(() => !!this.stateKey() && this.fields().length > 0);

  private readonly layout = linkedSignal<TxFiltersPanelLayout | null>(() => this.readLayout(this.stateKey()));

  private readonly orderedKeys = computed(() => {
    const keys = this.fields().map((field) => field.txFilterField());
    const stored = (this.layout()?.order ?? []).filter((key) => keys.includes(key));
    return [...stored, ...keys.filter((key) => !stored.includes(key))];
  });

  private readonly chosenKeys = computed(() => this.layout()?.visible ?? this.orderedKeys().slice(0, this.defaultVisible()));

  private readonly visibleKeys = computed(
    () =>
      new Set([
        ...this.chosenKeys(),
        ...this.fields()
          .filter((field) => field.filterActive())
          .map((field) => field.txFilterField()),
      ]),
  );

  readonly options = computed<TxFiltersPanelOption[]>(() => {
    const fields = new Map(this.fields().map((field) => [field.txFilterField(), field]));
    const visible = this.visibleKeys();
    return this.orderedKeys().map((key) => ({
      key,
      label: fields.get(key)?.filterLabel() ?? key,
      visible: visible.has(key),
      active: fields.get(key)?.filterActive() ?? false,
    }));
  });

  readonly visibleCount = computed(() => this.options().filter((option) => option.visible).length);
  readonly hiddenCount = computed(() => this.options().length - this.visibleCount());
  protected readonly counterText = computed(() => this.locale.translate('filtersShown', { shown: this.visibleCount(), total: this.options().length }));
  protected readonly menuButtonLabel = computed(() => {
    const label = this.translations().showFilters;
    const count = this.hiddenCount();
    return count ? this.locale.translate('filtersHidden', { label, count }) : label;
  });


  protected readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-filters-panel'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  protected readonly menuPopoverDt = {
    root: {
      borderRadius: 'var(--tx-filters-panel-menu-border-radius)',
      shadow: 'var(--tx-filters-panel-menu-shadow)',
      padding: '0',
    },
    content: { padding: '0' },
  };
  protected readonly menuPopoverPt = computed(() => ({ root: { style: this.tokenStyle() } }));

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.closingTimer));
    effect((onCleanup) => {
      const view = this.document.defaultView;
      if (!view?.matchMedia) {
        return;
      }
      const media = view.matchMedia(COLLAPSE_QUERY);
      const update = () => {
        this.narrow.set(media.matches);
        if (!this.folded()) {
          this.setExpanded(false);
        }
      };
      untracked(update);
      media.addEventListener?.('change', update);
      onCleanup(() => media.removeEventListener?.('change', update));
    });
  }

  ngAfterViewInit(): void {
    this.projectedCount.set(this.fieldsContainer().nativeElement.children.length);
  }

  isFieldHidden(key: string): boolean {
    return this.customizable() && !this.folded() && !this.visibleKeys().has(key);
  }

  fieldOrder(key: string): number | null {
    return this.customizable() ? this.orderedKeys().indexOf(key) : null;
  }

  toggle(key: string): void {
    const option = this.options().find((item) => item.key === key);
    if (!option || option.active) {
      return;
    }
    const chosen = this.chosenKeys();
    const next = chosen.includes(key) ? chosen.filter((item) => item !== key) : [...chosen, key];
    const order = this.orderedKeys();
    this.saveLayout({ order, visible: order.filter((item) => next.includes(item)) });
  }

  move(key: string, offset: number): void {
    const order = [...this.orderedKeys()];
    const from = order.indexOf(key);
    const to = from + offset;
    if (from < 0 || to < 0 || to >= order.length) {
      return;
    }
    moveItemInArray(order, from, to);
    this.saveLayout({ order, visible: this.chosenKeys() });
  }

  reset(): void {
    this.layout.set(null);
    this.writeLayout(null);
    this.layoutChange.emit(null);
  }

  setExpanded(expanded: boolean): void {
    if (this.expanded() === expanded) {
      return;
    }
    this.finishClosing();
    if (!expanded && this.folded() && !this.isUnstyled() && !this.document.defaultView?.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      this.closing.set(true);
      this.closingTimer = setTimeout(() => this.finishClosing(), CLOSE_FALLBACK_MS);
    }
    this.expanded.set(expanded);
    this.expandedChange.emit(expanded);
  }

  protected onPanelAnimationEnd(event: AnimationEvent): void {
    if (event.target === event.currentTarget && this.closing()) {
      this.finishClosing();
    }
  }

  private finishClosing(): void {
    clearTimeout(this.closingTimer);
    this.closing.set(false);
  }

  protected clearFilters(): void {
    this.resetAction()?.trigger();
  }

  protected drop(event: CdkDragDrop<unknown>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const order = [...this.orderedKeys()];
    moveItemInArray(order, event.previousIndex, event.currentIndex);
    this.saveLayout({ order, visible: this.chosenKeys() });
  }

  protected onMenuKeydown(event: KeyboardEvent, key: string): void {
    const menu = (event.currentTarget as HTMLElement | null)?.closest('.tx-filters-panel-menu');
    const items = Array.from(menu?.querySelectorAll<HTMLElement>('[role^="menuitem"]') ?? []);
    const index = items.indexOf(event.target as HTMLElement);
    if (event.altKey && (event.key === 'ArrowUp' || event.key === 'ArrowDown')) {
      event.preventDefault();
      this.move(key, event.key === 'ArrowUp' ? -1 : 1);
      afterNextRender(() => this.focusMenuItem(key), { injector: this.injector });
      return;
    }
    const target = {
      ArrowDown: (index + 1) % items.length,
      ArrowUp: (index - 1 + items.length) % items.length,
      Home: 0,
      End: items.length - 1,
    }[event.key];
    if (target !== undefined && items.length) {
      event.preventDefault();
      items[target].focus();
    }
  }

  protected closeOnOutsideClick(event: Event): void {
    if (!this.expanded()) {
      return;
    }
    const target = event.target as HTMLElement | null;
    if (!target?.isConnected || target.closest(OVERLAY_CONTAINER)) {
      return;
    }
    const host = this.host.nativeElement;
    const inside = host.contains(target) && !!target.closest('.tx-filters-panel__panel, .tx-filters-panel__toggle');
    if (!inside) {
      this.setExpanded(false);
    }
  }

  protected closeOnEscape(event: Event): void {
    if (!this.expanded() || (event.target as HTMLElement | null)?.closest?.(OVERLAY_CONTAINER)) {
      return;
    }
    const hadFocus = this.host.nativeElement.contains(this.document.activeElement);
    this.setExpanded(false);
    if (hadFocus) {
      this.toggleButton()?.nativeElement.focus();
    }
  }

  private focusMenuItem(key: string): void {
    const items = Array.from(this.menuList()?.nativeElement.querySelectorAll<HTMLElement>('[data-key]') ?? []);
    items.find((item) => item.getAttribute('data-key') === key)?.focus();
  }

  private saveLayout(layout: TxFiltersPanelLayout): void {
    this.layout.set(layout);
    this.writeLayout(layout);
    this.layoutChange.emit(layout);
  }

  private storage(): Storage | null {
    try {
      const view = this.document.defaultView;
      return (this.stateStorage() === 'session' ? view?.sessionStorage : view?.localStorage) ?? null;
    } catch {
      return null;
    }
  }

  private readLayout(key: string | undefined): TxFiltersPanelLayout | null {
    if (!key) {
      return null;
    }
    try {
      const stored: unknown = JSON.parse(this.storage()?.getItem(key) ?? 'null');
      if (Array.isArray(stored)) {
        return { order: [], visible: stored.map(String) };
      }
      if (stored && typeof stored === 'object') {
        const { order, visible } = stored as Partial<TxFiltersPanelLayout>;
        return {
          order: Array.isArray(order) ? order.map(String) : [],
          visible: Array.isArray(visible) ? visible.map(String) : null,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  private writeLayout(layout: TxFiltersPanelLayout | null): void {
    const key = this.stateKey();
    if (!key) {
      return;
    }
    try {
      if (layout) {
        this.storage()?.setItem(key, JSON.stringify(layout));
      } else {
        this.storage()?.removeItem(key);
      }
    } catch {
      return;
    }
  }
}


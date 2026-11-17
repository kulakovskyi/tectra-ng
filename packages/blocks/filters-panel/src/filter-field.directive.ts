import {
  DestroyRef,
  Directive,
  ElementRef,
  Injectable,
  InjectionToken,
  OnInit,
  Provider,
  Signal,
  WritableSignal,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { TxFluid } from '@tectra-ng/core/fluid';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { FILTERS_PANEL_ICON_DEFAULTS } from './filters-panel.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { FILTERS_PANEL_THEME } from './filters-panel.theme';

/** What a `txFilterField` asks its panel: whether it is hidden and where it sits. */
export interface TxFiltersPanelContext {
  /** Tells whether the field with this key is hidden. */
  isFieldHidden(key: string): boolean;
  /** Position of the field with this key, or `null` when the order is not customised. */
  fieldOrder(key: string): number | null;
  /** Adds a field once its inputs are set; returns the function that removes it. */
  registerField?(field: TxFilterField): () => void;
  /** Adds a reset action; returns the function that removes it. */
  registerReset?(reset: TxFiltersReset): () => void;
}

/** Injection token through which `txFilterField` finds its `tx-filters-panel`. */
export const TX_FILTERS_PANEL = new InjectionToken<TxFiltersPanelContext>('TX_FILTERS_PANEL');

/** Marks a field inside `tx-filters-panel` so the user can show, hide and reorder it. */
@Directive({
  selector: '[txFilterField]',
  providers: [provideTxIconDefaults(FILTERS_PANEL_ICON_DEFAULTS), { provide: TxFluid, useFactory: () => new TxFluid() }],
  host: {
    class: 'tx-filter-field',
    '[attr.hidden]': 'hidden() ? "" : null',
    '[style.display]': 'hidden() ? "none" : null',
    '[style.order]': 'order()',
  },
})
export class TxFilterField implements OnInit {
  private readonly filtersPanelTheme = injectTokens(FILTERS_PANEL_THEME);

  private readonly panel = inject(TX_FILTERS_PANEL, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  readonly txFilterField = input.required<string>();
  readonly filterLabel = input.required<string>();
  readonly filterActive = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly hidden: Signal<boolean> = computed(() => this.panel?.isFieldHidden(this.txFilterField()) ?? false);
  readonly order: Signal<number | null> = computed(() => this.panel?.fieldOrder(this.txFilterField()) ?? null);

  ngOnInit(): void {
    const unregister = this.panel?.registerField?.(this);
    if (unregister) {
      this.destroyRef.onDestroy(unregister);
    }
  }
}

@Directive({
  selector: '[txFiltersReset]',
  host: { class: 'tx-filters-panel__reset' },
  providers: [provideTxIconDefaults(FILTERS_PANEL_ICON_DEFAULTS)],
})
export class TxFiltersReset {
  private readonly filtersPanelTheme = injectTokens(FILTERS_PANEL_THEME);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    const unregister = inject(TX_FILTERS_PANEL, { optional: true })?.registerReset?.(this);
    if (unregister) {
      inject(DestroyRef).onDestroy(unregister);
    }
  }

  trigger(): void {
    this.host.nativeElement.click();
  }
}

/**
 * Passes the fields projected into a wrapper component to the `tx-filters-panel` inside that wrapper, which
 * Angular cannot find through the wrapper. Provide it with `provideTxFiltersPanelRelay()`.
 */
@Injectable()
export class TxFiltersPanelRelay implements TxFiltersPanelContext {
  private readonly target = signal<TxFiltersPanelContext | null>(null);
  private readonly fieldList = signal<readonly TxFilterField[]>([]);
  private readonly resetList = signal<readonly TxFiltersReset[]>([]);

  /** Fields registered through the relay, in the order they were created. */
  readonly fields = this.fieldList.asReadonly();
  /** Reset actions registered through the relay. */
  readonly resets = this.resetList.asReadonly();

  /** Whether the connected panel hides the field with this key; `false` before a panel connects. */
  isFieldHidden(key: string): boolean {
    return this.target()?.isFieldHidden(key) ?? false;
  }

  /** Position the connected panel gives the field with this key; `null` before a panel connects. */
  fieldOrder(key: string): number | null {
    return this.target()?.fieldOrder(key) ?? null;
  }

  /** Adds a projected field to the relay; returns the function that removes it. */
  registerField(field: TxFilterField): () => void {
    return register(this.fieldList, field);
  }

  /** Adds a projected reset action to the relay; returns the function that removes it. */
  registerReset(reset: TxFiltersReset): () => void {
    return register(this.resetList, reset);
  }

  /** Connects the first panel created inside the wrapper; returns the function that disconnects it, or `null` when another panel is connected. */
  connect(panel: TxFiltersPanelContext): (() => void) | null {
    if (this.target()) {
      return null;
    }
    this.target.set(panel);
    return () => this.target.set(null);
  }
}

/**
 * Providers for a component that wraps `tx-filters-panel` and projects `txFilterField` elements into it:
 * `providers: [provideTxFiltersPanelRelay()]`.
 */
export function provideTxFiltersPanelRelay(): Provider[] {
  return [TxFiltersPanelRelay, { provide: TX_FILTERS_PANEL, useExisting: TxFiltersPanelRelay }];
}

function register<T>(list: WritableSignal<readonly T[]>, item: T): () => void {
  list.update((items) => [...items, item]);
  return () => list.update((items) => items.filter((entry) => entry !== item));
}

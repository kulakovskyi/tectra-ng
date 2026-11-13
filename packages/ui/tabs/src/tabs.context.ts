import { InjectionToken, Signal } from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxTabValue, TxTabsOrientation, TxTabsPart, TxTabsSize, TxTabsVariant } from './tabs.types';

/** What a tab tells its `tx-tabs` parent so the list can navigate it. */
export interface TxTabRegistration {
  /** Value of the tab. */
  value: Signal<TxTabValue>;
  /** Hint shown while the tab is active. */
  description: Signal<string | undefined>;
  /** Whether the tab cannot be picked. */
  disabled: Signal<boolean>;
}

/** State and actions `tx-tabs` shares with its tabs, list and panels. */
export interface TxTabsContext {
  /** Value of the active tab. */
  readonly value: Signal<TxTabValue | undefined>;
  /** Current look of the tabs. */
  readonly variant: Signal<TxTabsVariant>;
  /** Current size of the tabs. */
  readonly size: Signal<TxTabsSize>;
  /** Current direction of the tab list. */
  readonly orientation: Signal<TxTabsOrientation>;
  /** Whether the tabs have a card background, ring and shadow. */
  readonly raised: Signal<boolean>;
  /** Whether the list scrolls when the tabs do not fit. */
  readonly scrollable: Signal<boolean>;
  /** Whether a scrollable list shows the previous / next buttons. */
  readonly showNavigators: Signal<boolean>;
  /** Whether only the active panel is rendered. */
  readonly lazy: Signal<boolean>;
  /** Whether the arrow keys pick the tab at once. */
  readonly selectOnFocus: Signal<boolean>;
  /** Whether the tectra styles are removed. */
  readonly isUnstyled: Signal<boolean>;
  /** Resolved `pt` classes and styles of the parts. */
  readonly passThrough: Signal<TxResolvedPassThrough<TxTabsPart>>;
  /** Hint of the active tab, shown under the control. */
  readonly activeDescription: Signal<string | undefined>;
  /** Value of the tab that holds the focus stop of the list. */
  readonly focusValue: Signal<TxTabValue | undefined>;
  /** Whether a panel is registered for the value. */
  hasPanel(value: TxTabValue): boolean;
  /** Makes the tab with the value active. */
  select(value: TxTabValue): void;
  /** Id of the tab element for the value, used for `aria-labelledby`. */
  tabId(value: TxTabValue): string;
  /** Id of the panel element for the value, used for `aria-controls`. */
  panelId(value: TxTabValue): string;
  /** Registers a tab; returns a function that unregisters it. */
  registerTab(tab: TxTabRegistration): () => void;
  /** Registers a panel by value; returns a function that unregisters it. */
  registerPanel(value: Signal<TxTabValue>): () => void;
}

export const TX_TABS = new InjectionToken<TxTabsContext>('TX_TABS');

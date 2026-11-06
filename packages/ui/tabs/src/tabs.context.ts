import { InjectionToken, Signal } from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxTabValue, TxTabsOrientation, TxTabsPart, TxTabsSize, TxTabsVariant } from './tabs.types';

export interface TxTabRegistration {
  value: Signal<TxTabValue>;
  description: Signal<string | undefined>;
  disabled: Signal<boolean>;
}

export interface TxTabsContext {
  readonly value: Signal<TxTabValue | undefined>;
  readonly variant: Signal<TxTabsVariant>;
  readonly size: Signal<TxTabsSize>;
  readonly orientation: Signal<TxTabsOrientation>;
  readonly raised: Signal<boolean>;
  readonly scrollable: Signal<boolean>;
  readonly showNavigators: Signal<boolean>;
  readonly lazy: Signal<boolean>;
  readonly selectOnFocus: Signal<boolean>;
  readonly isUnstyled: Signal<boolean>;
  readonly passThrough: Signal<TxResolvedPassThrough<TxTabsPart>>;
  readonly activeDescription: Signal<string | undefined>;
  readonly focusValue: Signal<TxTabValue | undefined>;
  hasPanel(value: TxTabValue): boolean;
  select(value: TxTabValue): void;
  tabId(value: TxTabValue): string;
  panelId(value: TxTabValue): string;
  registerTab(tab: TxTabRegistration): () => void;
  registerPanel(value: Signal<TxTabValue>): () => void;
}

export const TX_TABS = new InjectionToken<TxTabsContext>('TX_TABS');

import { Injectable, InjectionToken, Provider, Signal, computed, signal } from '@angular/core';

/** What a `tx-stat-tile` reads from its grid. */
export interface TxStatTilesContext {
  /** Whether the grid is compact. */
  readonly compact: Signal<boolean>;
}

/**
 * Injection token through which a `tx-stat-tile` finds its grid; `tx-stat-tiles` provides it, and so can a
 * component that wraps the grid (`provideTxStatTilesRelay`).
 */
export const TX_STAT_TILES = new InjectionToken<TxStatTilesContext>('TX_STAT_TILES');

/**
 * Passes the settings of the `tx-stat-tiles` inside a wrapper component to the tiles projected into that
 * wrapper, which Angular cannot find through the wrapper. Provide it with `provideTxStatTilesRelay()`.
 */
@Injectable()
export class TxStatTilesRelay implements TxStatTilesContext {
  private readonly target = signal<TxStatTilesContext | null>(null);

  /** Whether the connected grid is compact; `false` before a grid connects. */
  readonly compact = computed(() => this.target()?.compact() ?? false);

  /** Connects the first grid created inside the wrapper; returns the function that disconnects it, or `null` when another grid is connected. */
  connect(grid: TxStatTilesContext): (() => void) | null {
    if (this.target()) {
      return null;
    }
    this.target.set(grid);
    return () => this.target.set(null);
  }
}

/**
 * Providers for a component that wraps `tx-stat-tiles` and projects `tx-stat-tile` elements into it:
 * `providers: [provideTxStatTilesRelay()]`.
 */
export function provideTxStatTilesRelay(): Provider[] {
  return [TxStatTilesRelay, { provide: TX_STAT_TILES, useExisting: TxStatTilesRelay }];
}

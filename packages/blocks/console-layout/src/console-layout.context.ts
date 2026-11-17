import { Injectable, InjectionToken, Provider, Signal, computed, signal } from '@angular/core';
import { TxAppFooterLink } from '@tectra-ng/blocks/app-footer';
import { TxConsoleResponsive } from './console-layout.types';

/** What a `tx-console-panel` reads from its console. */
export interface TxConsoleLayoutContext {
  /** What the console breakpoints measure. */
  readonly responsive: Signal<TxConsoleResponsive>;
  /** Name in the footer that the panel shows next to its page; empty for none. */
  readonly footerName: Signal<string | undefined>;
  /** Footer links, already translated. */
  readonly visibleFooterLinks: Signal<readonly TxAppFooterLink[]>;
  /** Tells the console that a panel shows the footer; returns the function to call when the panel goes away. */
  registerPanel(): () => void;
}

/**
 * Injection token through which a `tx-console-panel` finds its console; `tx-console-layout` provides it, and
 * so can a component that wraps the console (`provideTxConsoleLayoutRelay`).
 */
export const TX_CONSOLE_LAYOUT = new InjectionToken<TxConsoleLayoutContext>('TX_CONSOLE_LAYOUT');

/**
 * Passes the settings of the `tx-console-layout` inside a wrapper component to the panels projected into that
 * wrapper, which Angular cannot find through the wrapper. Provide it with `provideTxConsoleLayoutRelay()`.
 */
@Injectable()
export class TxConsoleLayoutRelay implements TxConsoleLayoutContext {
  private readonly target = signal<TxConsoleLayoutContext | null>(null);
  private readonly panels = signal(0);

  /** Number of panels registered through the relay. */
  readonly panelCount = this.panels.asReadonly();
  /** What the connected console's breakpoints measure; `viewport` before a console connects. */
  readonly responsive = computed<TxConsoleResponsive>(() => this.target()?.responsive() ?? 'viewport');
  /** Footer name of the connected console. */
  readonly footerName = computed(() => this.target()?.footerName());
  /** Translated footer links of the connected console; empty before a console connects. */
  readonly visibleFooterLinks = computed<readonly TxAppFooterLink[]>(() => this.target()?.visibleFooterLinks() ?? []);

  /** Counts a projected panel that shows the footer; returns the function to call when the panel goes away. */
  registerPanel(): () => void {
    this.panels.update((count) => count + 1);
    return () => this.panels.update((count) => count - 1);
  }

  /** Connects the first console created inside the wrapper; returns the function that disconnects it, or `null` when another console is connected. */
  connect(layout: TxConsoleLayoutContext): (() => void) | null {
    if (this.target()) {
      return null;
    }
    this.target.set(layout);
    return () => this.target.set(null);
  }
}

/**
 * Providers for a component that wraps `tx-console-layout` and projects `tx-console-panel` into it:
 * `providers: [provideTxConsoleLayoutRelay()]`.
 */
export function provideTxConsoleLayoutRelay(): Provider[] {
  return [TxConsoleLayoutRelay, { provide: TX_CONSOLE_LAYOUT, useExisting: TxConsoleLayoutRelay }];
}

import { computed, signal } from '@angular/core';

/** How `TxPanelWidth` sizes the panel of a field. */
export interface TxPanelWidthOptions {
  /**
   * CSS length the panel grows up to with its content (a token such as `var(--tx-select-overlay-max-width)`);
   * a field wider than it gives the panel the width of the field. Without it the panel grows up to the viewport.
   */
  maxWidth?: string;
  /** Makes the panel at least as wide as its origin (default `true`). */
  matchOrigin?: boolean;
  /** Sizes the panel by its content and keeps the width it has once it opens, so it never jumps while open (default `true`). */
  fitContent?: boolean;
  /** Free space kept between the panel and each side of the viewport, in px (default 8). */
  margin?: number;
}

interface PanelBox {
  origin: number;
  limit: number | null;
  locked: number | null;
}

function px(value: number): string {
  return `${value}px`;
}

function measured(value: string | undefined): number {
  return parseFloat(value ?? '');
}

/**
 * Width of the panel of a field-like overlay: at least the width of the field, growing with its content up to a
 * cap, never wider than the viewport minus its margins, and kept while the panel stays open. Bind `style()` on
 * the panel element, call `open(origin)` when the panel opens and `lock(panel)` once it is laid out.
 */
export class TxPanelWidth {
  private readonly box = signal<PanelBox | null>(null);
  private readonly maxWidth: string | undefined;
  private readonly matchOrigin: boolean;
  private readonly fitContent: boolean;
  private readonly margin: number;

  /** Signal with the inline styles of the panel element; empty until the panel opens. */
  readonly style = computed<Record<string, string>>(() => {
    const box = this.box();
    if (!box) {
      return {};
    }
    const { origin, limit, locked } = box;
    const reach = this.maxWidth ? (this.matchOrigin ? `max(${this.maxWidth}, ${px(origin)})` : this.maxWidth) : null;
    const max = reach && limit !== null ? `min(${reach}, ${px(limit)})` : (reach ?? (limit !== null ? px(limit) : null));
    const style: Record<string, string> = {};
    if (this.matchOrigin) {
      style['min-width'] = px(limit !== null ? Math.min(origin, limit) : origin);
    }
    if (max) {
      style['max-width'] = max;
    }
    if (this.fitContent) {
      style['width'] = locked !== null ? px(locked) : 'max-content';
    }
    return style;
  });

  constructor(options: TxPanelWidthOptions = {}) {
    this.maxWidth = options.maxWidth;
    this.matchOrigin = options.matchOrigin ?? true;
    this.fitContent = options.fitContent ?? true;
    this.margin = options.margin ?? 8;
  }

  /** Measures the origin and the viewport when the panel opens; the panel sizes itself by its content again. */
  open(origin: Element): void {
    const viewport = origin.ownerDocument.documentElement.clientWidth;
    this.box.set({
      origin: origin instanceof HTMLElement ? origin.offsetWidth : origin.getBoundingClientRect().width,
      limit: viewport > 0 ? Math.max(0, viewport - this.margin * 2) : null,
      locked: null,
    });
  }

  /**
   * Keeps the width the panel has now until it opens again, widened by the hidden part of the elements matching
   * `overflowing` (labels cut with an ellipsis that a virtual list leaves out of the content width) within the
   * cap.
   */
  lock(panel: HTMLElement | null | undefined, overflowing?: string): void {
    const box = this.box();
    if (!panel || !box || box.locked !== null || !this.fitContent) {
      return;
    }
    const style = panel.ownerDocument.defaultView?.getComputedStyle(panel);
    const current = measured(style?.width);
    const width = Number.isNaN(current) ? panel.offsetWidth : current;
    const hidden = overflowing ? Array.from(panel.querySelectorAll(overflowing), (element) => element.scrollWidth - element.clientWidth) : [];
    const wanted = Math.ceil(width + Math.max(0, ...hidden));
    const max = measured(style?.maxWidth);
    const locked = Number.isNaN(max) ? wanted : Math.min(wanted, Math.floor(max));
    this.box.set({ ...box, locked });
    panel.style.width = px(locked);
  }
}

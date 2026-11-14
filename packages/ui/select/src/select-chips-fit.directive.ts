import { Directive, ElementRef, afterRenderEffect, computed, inject, input, signal } from '@angular/core';

/**
 * Keeps the chips of a multiple-choice field on one line: measures the chip list and tells the field how many
 * chips fit, so the rest go into a `+N` chip. Shared by `tx-multiselect`, `tx-tree-select` and `tx-autocomplete`.
 * The list holds `.tx-select__chip` elements followed by one `.tx-select__chip--more`; any other child (the text
 * input of an autocomplete) keeps its `min-width` free.
 */
@Directive({ selector: '[txSelectChipsFit]', exportAs: 'txSelectChipsFit' })
export class TxSelectChipsFit {
  private readonly list = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  /** The selected items behind the chips; a new list measures again. */
  readonly items = input<readonly unknown[]>([], { alias: 'txSelectChipsFit' });
  /** Shows every chip and stops measuring, e.g. while an autocomplete has focus. */
  readonly paused = input<boolean>(false, { alias: 'txSelectChipsFitPaused' });

  private readonly limit = signal<number | null>(null);

  /** Number of chips that fit; `Infinity` while every chip fits or nothing was measured. */
  readonly visible = computed(() => (this.paused() ? Infinity : (this.limit() ?? Infinity)));
  /** Number of chips counted in the `+N` chip. */
  readonly hidden = computed(() => Math.max(0, this.items().length - this.visible()));

  constructor() {
    afterRenderEffect((onCleanup) => {
      this.items();
      if (this.paused() || typeof ResizeObserver === 'undefined') {
        this.limit.set(null);
        return;
      }
      const fit = () => this.limit.set(fittingChips(this.list));
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(this.list);
      onCleanup(() => observer.disconnect());
    });
  }
}

function fittingChips(list: HTMLElement): number | null {
  const children = Array.from(list.children) as HTMLElement[];
  const more = children.find((child) => child.classList.contains('tx-select__chip--more'));
  const chips = children.filter((child) => child.classList.contains('tx-select__chip') && child !== more);
  if (!more || !chips.length) {
    return null;
  }
  const style = getComputedStyle(list);
  const gap = parseFloat(style.columnGap) || 0;
  const reserved = children
    .filter((child) => !child.classList.contains('tx-select__chip'))
    .reduce((sum, child) => sum + (parseFloat(getComputedStyle(child).minWidth) || 0) + gap, 0);
  const available = list.clientWidth - reserved;
  const widths = chips.map(fullWidth);
  if (widths.reduce((sum, width, index) => sum + width + (index ? gap : 0), 0) <= available) {
    return null;
  }
  const moreLabel = more.firstElementChild as HTMLElement;
  const moreText = String(moreLabel.textContent).trim();
  const charWidth = moreLabel.scrollWidth / Math.max(1, moreText.length);
  const moreWidth = fullWidth(more);
  let used = 0;
  let count = 0;
  for (const width of widths) {
    const next = used + (count ? gap : 0) + width;
    const label = `+${chips.length - count - 1}`;
    if (next + gap + moreWidth + (label.length - moreText.length) * charWidth > available) {
      break;
    }
    used = next;
    count++;
  }
  return Math.max(1, count);
}

function fullWidth(chip: HTMLElement): number {
  const label = chip.firstElementChild as HTMLElement;
  return chip.offsetWidth + label.scrollWidth - label.clientWidth;
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  afterRenderEffect,
  computed,
  contentChildren,
  inject,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxTab } from './tab.component';
import { TX_TABS } from './tabs.context';

const SCROLL_GAP = 8;

@Component({
  selector: 'tx-tab-list',
  imports: [TxIcon],
  templateUrl: './tab-list.component.html',
  styleUrl: './tab-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-tab-list',
    '[class]': 'tabs.passThrough().list?.class',
    '[style]': 'tabs.passThrough().list?.style',
    '[attr.data-styled]': '!tabs.isUnstyled() || null',
    '[attr.data-variant]': 'tabs.variant()',
    '[attr.data-size]': 'tabs.size()',
    '[attr.data-orientation]': 'tabs.orientation()',
    '[class.tx-tab-list--raised]': 'tabs.raised()',
    '[class.tx-tab-list--scrollable]': 'tabs.scrollable()',
  },
})
export class TxTabList {
  protected readonly tabs = inject(TX_TABS);
  private readonly items = contentChildren(TxTab, { descendants: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly content = viewChild.required<ElementRef<HTMLElement>>('content');

  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);

  protected readonly canScrollPrevious = signal(false);
  protected readonly canScrollNext = signal(false);
  protected readonly bar = signal<{ start: number; size: number } | null>(null);
  protected readonly vertical = computed(() => this.tabs.orientation() === 'vertical');
  protected readonly navigators = computed(() => this.tabs.scrollable() && this.tabs.showNavigators() && !this.vertical());

  constructor() {
    afterRenderEffect(() => {
      this.tabs.value();
      this.items();
      this.vertical();
      this.navigators();
      this.tabs.variant();
      untracked(() => {
        this.observe();
        this.scrollToActive();
        this.updateBar();
        this.updateNavigators();
      });
    });

    afterNextRender(() => {
      if (typeof ResizeObserver === 'undefined') {
        return;
      }
      const observer = new ResizeObserver(() => {
        this.updateBar();
        this.updateNavigators();
      });
      this.observer = observer;
      this.observe();
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

  private observer: ResizeObserver | null = null;

  private observe(): void {
    const observer = this.observer;
    if (!observer) {
      return;
    }
    observer.disconnect();
    observer.observe(this.content().nativeElement);
    for (const tab of this.items()) {
      observer.observe(tab.element);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const enabled = this.items().filter((tab) => !tab.disabled());
    if (!enabled.length) {
      return;
    }
    const current = enabled.findIndex((tab) => tab.element === document.activeElement);
    const nextKey = this.vertical() ? 'ArrowDown' : 'ArrowRight';
    const previousKey = this.vertical() ? 'ArrowUp' : 'ArrowLeft';
    let target: TxTab | undefined;
    switch (event.key) {
      case nextKey:
        target = enabled[(current + 1) % enabled.length];
        break;
      case previousKey:
        target = enabled[(current - 1 + enabled.length) % enabled.length];
        break;
      case 'Home':
        target = enabled[0];
        break;
      case 'End':
        target = enabled[enabled.length - 1];
        break;
      case 'Enter':
      case ' ':
        if (current >= 0) {
          event.preventDefault();
          enabled[current].element.click();
        }
        return;
      default:
        return;
    }
    event.preventDefault();
    target.focus();
    if (this.tabs.selectOnFocus()) {
      this.tabs.select(target.value());
    }
  }

  protected scrollPrevious(): void {
    const content = this.content().nativeElement;
    content.scrollLeft = Math.max(0, content.scrollLeft - this.scrollStep());
  }

  protected scrollNext(): void {
    const content = this.content().nativeElement;
    content.scrollLeft = content.scrollLeft + this.scrollStep();
  }

  protected updateNavigators(): void {
    if (!this.navigators()) {
      this.canScrollPrevious.set(false);
      this.canScrollNext.set(false);
      return;
    }
    const content = this.content().nativeElement;
    const max = content.scrollWidth - content.clientWidth;
    this.canScrollPrevious.set(content.scrollLeft > 1);
    this.canScrollNext.set(max - content.scrollLeft > 1);
  }

  private scrollStep(): number {
    const content = this.content().nativeElement;
    return Math.max(content.clientWidth * 0.8, 1);
  }

  private activeTab(): TxTab | undefined {
    const value = this.tabs.value();
    return this.items().find((tab) => tab.value() === value);
  }

  private scrollToActive(): void {
    const tab = this.activeTab();
    if (!tab || this.vertical()) {
      return;
    }
    const content = this.content().nativeElement;
    const listRect = content.getBoundingClientRect();
    const itemRect = tab.element.getBoundingClientRect();
    if (itemRect.left < listRect.left) {
      content.scrollLeft -= listRect.left - itemRect.left + SCROLL_GAP;
    } else if (itemRect.right > listRect.right) {
      content.scrollLeft += itemRect.right - listRect.right + SCROLL_GAP;
    }
  }

  private updateBar(): void {
    const tab = this.tabs.variant() === 'line' ? this.activeTab() : undefined;
    if (!tab) {
      this.bar.set(null);
      return;
    }
    const element = tab.element;
    const next = this.vertical()
      ? { start: element.offsetTop, size: element.offsetHeight }
      : { start: element.offsetLeft, size: element.offsetWidth };
    const current = this.bar();
    if (!current || current.start !== next.start || current.size !== next.size) {
      this.bar.set(next);
    }
  }
}

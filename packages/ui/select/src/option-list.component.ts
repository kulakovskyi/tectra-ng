import { CdkFixedSizeVirtualScroll, CdkVirtualForOf, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  afterRenderEffect,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { injectTokens, TxResolvedPassThrough } from '@tectra-ng/core/config';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxSkeleton } from '@tectra-ng/ui/skeleton';
import { TxSelectGroupRow, TxSelectItem, TxSelectOptionContext, TxSelectPart, TxSelectRow } from './select.types';
import { SELECT_ICON_DEFAULTS } from './select.icons';
import { SELECT_THEME } from './select.theme';

/** A group heading with the rows below it, as the option list lays them out. */
interface TxOptionSection {
  /** The group heading, or `null` for rows without a group. */
  group: TxSelectGroupRow | null;
  /** Rows of the section with their position in the list. */
  rows: { row: TxSelectRow; index: number }[];
}

/** Range of rows rendered by the virtual scroll of the option list. */
export interface TxOptionRange {
  /** Index of the first rendered row. */
  start: number;
  /** Index after the last rendered row. */
  end: number;
}

const DEFAULT_LIST_HEIGHT = 200;

/**
 * The list of options, groups and loaders inside the panel of select-like components; renders virtual
 * scroll when asked.
 */
@Component({
  selector: 'tx-option-list',
  imports: [CdkVirtualScrollViewport, CdkFixedSizeVirtualScroll, CdkVirtualForOf, NgTemplateOutlet, TxIcon, TxSkeleton],
  templateUrl: './option-list.component.html',
  styleUrl: './option-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-option-list',
    '[attr.data-styled]': 'unstyled() ? null : true',
  },
  viewProviders: [provideTxIconDefaults(SELECT_ICON_DEFAULTS)],
})
export class TxOptionList {
  private readonly selectTheme = injectTokens(SELECT_THEME);

  readonly rows = input.required<readonly TxSelectRow[]>();
  readonly listboxId = input.required<string>();
  readonly activeIndex = input<number>(-1);
  readonly multiple = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly checkbox = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly checkmark = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScroll = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly itemSize = input<number>(36);
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly query = input<string>('');
  readonly emptyText = input<string>('');
  readonly loadingText = input<string>('');
  readonly optionTemplate = input<TemplateRef<TxSelectOptionContext> | undefined>(undefined);
  readonly groupTemplate = input<TemplateRef<{ $implicit: unknown }> | undefined>(undefined);
  readonly emptyTemplate = input<TemplateRef<unknown> | undefined>(undefined);
  readonly emptyFilterTemplate = input<TemplateRef<{ $implicit: string }> | undefined>(undefined);
  readonly passThrough = input<TxResolvedPassThrough<TxSelectPart>>({});
  readonly unstyled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly focusable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly disabled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly ariaDescribedBy = input<string | undefined>(undefined);
  readonly ariaInvalid = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly optionClick = output<TxSelectItem>();
  readonly optionHover = output<number>();
  readonly rangeChange = output<TxOptionRange>();
  readonly listKeydown = output<KeyboardEvent>();
  readonly listFocus = output<FocusEvent>();
  readonly listBlur = output<FocusEvent>();

  private document = inject(DOCUMENT);
  readonly viewport = viewChild(CdkVirtualScrollViewport);
  readonly list = viewChild<ElementRef<HTMLElement>>('list');

  readonly sections = computed<TxOptionSection[]>(() => {
    const sections: TxOptionSection[] = [];
    this.rows().forEach((row, index) => {
      if (row.type === 'group') {
        sections.push({ group: row, rows: [] });
      } else {
        if (!sections.length) {
          sections.push({ group: null, rows: [] });
        }
        sections[sections.length - 1].rows.push({ row, index });
      }
    });
    return sections;
  });
  readonly optionCount = computed(() => this.rows().filter((row) => row.type !== 'group').length);
  readonly activeId = computed(() => {
    const row = this.rows()[this.activeIndex()];
    return row?.type === 'option' ? row.id : null;
  });
  readonly virtualHeight = computed(() => {
    const limit = parseFloat(this.scrollHeight() ?? '') || DEFAULT_LIST_HEIGHT;
    return Math.min(this.rows().length * this.itemSize(), limit);
  });
  readonly trackRow = (index: number, row: TxSelectRow): string => row.id;

  constructor() {
    effect((onCleanup) => {
      const viewport = this.viewport();
      if (!viewport) {
        return;
      }
      const subscription = viewport.renderedRangeStream.subscribe((range) => this.rangeChange.emit({ start: range.start, end: range.end }));
      onCleanup(() => subscription.unsubscribe());
    });
    afterRenderEffect(() => {
      this.virtualHeight();
      this.viewport()?.checkViewportSize();
    });
  }

  focus(): void {
    (this.viewport()?.elementRef.nativeElement ?? this.list()?.nativeElement)?.focus();
  }

  scrollToTop(): void {
    this.viewport()?.scrollToOffset(0);
  }

  scrollToIndex(index: number): void {
    const viewport = this.viewport();
    if (viewport) {
      const size = this.itemSize();
      const top = index * size;
      const offset = viewport.measureScrollOffset('top');
      const height = viewport.getViewportSize();
      if (top < offset) {
        viewport.scrollToOffset(top);
      } else if (top + size > offset + height) {
        viewport.scrollToOffset(top + size - height);
      }
      return;
    }
    const row = this.rows()[index];
    const id = row?.type === 'option' ? row.id : null;
    queueMicrotask(() => (id ? this.document.getElementById(id)?.scrollIntoView?.({ block: 'nearest' }) : undefined));
  }
}

import {
  CdkDrag,
  CdkDragDrop,
  CdkDragHandle,
  CdkDragPlaceholder,
  CdkDropList,
} from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChild,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';
import { TxAnnouncer, uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraKanbanTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPill } from '@tectra-ng/ui/pill';
import {
  TxKanbanCard,
  TxKanbanColumnFooter,
  TxKanbanColumnHeader,
  TxKanbanColumnTop,
  TxKanbanEmpty,
} from './kanban-templates.directive';
import {
  TxKanbanColumn,
  TxKanbanColumnDrop,
  TxKanbanColumnView,
  TxKanbanItemDrop,
  TxKanbanItemId,
  TxKanbanPart,
} from './kanban.types';
import { KANBAN_ICON_DEFAULTS } from './kanban.icons';
import { KANBAN_THEME } from './kanban.theme';

const DRAG_SCROLL_IGNORE =
  '[data-drag-ignore], button, a, input, textarea, select, [contenteditable="true"]';

@Component({
  selector: 'tx-kanban',
  imports: [
    NgTemplateOutlet,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    CdkDragPlaceholder,
    TxButton,
    TxIcon,
    TxPill,
  ],
  templateUrl: './kanban.component.html',
  styleUrl: './kanban.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-kanban',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-kanban--fixed]': '!!height()',
  },
  viewProviders: [provideTxIconDefaults(KANBAN_ICON_DEFAULTS)],
})
export class TxKanban<T> {
  private readonly kanbanTheme = injectTokens(KANBAN_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly announcer = inject(TxAnnouncer);
  private readonly locale = inject(TxLocaleService);

  readonly columns = input.required<readonly TxKanbanColumn<T>[]>();
  readonly itemId = input.required<TxKanbanItemId<T>>();
  readonly itemsDraggable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly columnsDraggable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly focusableCards = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly columnWidth = input<string | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly emptyText = input<string | undefined>(undefined);
  readonly columnDragLabel = input<string | undefined>(undefined);
  readonly pageSize = input<number, unknown>(30, { transform: numberAttribute });
  readonly height = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraKanbanTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxKanbanPart, TxKanban<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });

  readonly itemDropped = output<TxKanbanItemDrop>();
  readonly columnDropped = output<TxKanbanColumnDrop>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('kanban', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly id = uniqueId('tx-kanban');
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-kanban'),
    ...this.passThrough().root?.style,
  }));

  protected readonly cardTemplate = contentChild.required(TxKanbanCard<T>);
  protected readonly headerTemplate = contentChild(TxKanbanColumnHeader<T>);
  protected readonly topTemplate = contentChild(TxKanbanColumnTop<T>);
  protected readonly footerTemplate = contentChild(TxKanbanColumnFooter<T>);
  protected readonly emptyTemplate = contentChild(TxKanbanEmpty<T>);

  private readonly shown = signal<Record<string, number>>({});
  protected readonly views = computed<TxKanbanColumnView<T>[]>(() => {
    const pageSize = this.pageSize();
    const shown = this.shown();
    return this.columns().map((column) => {
      const limit = pageSize ? (shown[column.id] ?? pageSize) : column.items.length;
      return {
        column,
        items: column.items.slice(0, limit),
        hidden: Math.max(0, column.items.length - limit),
      };
    });
  });
  protected readonly listIds = computed(() =>
    this.columns().map((column) => `${this.id}-${column.id}`),
  );
  protected readonly boardName = computed(() => this.label() ?? this.translations().board);
  protected readonly handleName = computed(
    () => this.columnDragLabel() ?? this.translations().moveColumn,
  );

  private dragScroll: { x: number; left: number; pointer: number } | null = null;

  showMore(columnId: string): void {
    const pageSize = this.pageSize();
    const index = this.columns().findIndex((column) => column.id === columnId);
    const before = this.views()[index]?.items.length ?? 0;
    this.shown.update((shown) => ({
      ...shown,
      [columnId]: (shown[columnId] ?? pageSize) + pageSize,
    }));
    afterNextRender(() => this.revealCard(this.listIds()[index], before), {
      injector: this.injector,
    });
  }

  protected showMoreLabel(count: number): string {
    return this.locale.translate('showMore', { count });
  }

  protected dropItem(event: CdkDragDrop<TxKanbanColumnView<T>>): void {
    if (event.previousContainer === event.container && event.previousIndex === event.currentIndex) {
      return;
    }
    const idOf = this.itemId();
    const itemId = idOf(event.item.data as T);
    const rest = event.container.data.items.filter((item) => idOf(item) !== itemId);
    this.itemDropped.emit(
      this.itemDrop(
        itemId,
        event.previousContainer.data.column.id,
        event.container.data.column.id,
        rest,
        event.currentIndex,
      ),
    );
  }

  protected dropColumn(event: CdkDragDrop<readonly TxKanbanColumn<T>[]>): void {
    if (event.previousIndex === event.currentIndex) {
      return;
    }
    const moved = event.item.data as TxKanbanColumn<T>;
    this.columnDropped.emit(this.columnDrop(moved.id, event.currentIndex));
  }

  protected onCardKeydown(event: KeyboardEvent, columnIndex: number, itemIndex: number): void {
    const origin = event.target as HTMLElement | null;
    if (
      !this.itemsDraggable() ||
      !event.altKey ||
      !event.key.startsWith('Arrow') ||
      origin?.closest('input, textarea, select, [contenteditable="true"]')
    ) {
      return;
    }
    const views = this.views();
    const from = views[columnIndex];
    const idOf = this.itemId();
    const itemId = idOf(from.items[itemIndex]);
    let targetColumn = columnIndex;
    let targetIndex = itemIndex;
    if (event.key === 'ArrowUp') {
      targetIndex = itemIndex - 1;
    } else if (event.key === 'ArrowDown') {
      targetIndex = itemIndex + 1;
    } else {
      targetColumn = columnIndex + (event.key === 'ArrowLeft' ? -1 : 1);
    }
    const target = views[targetColumn];
    if (!target) {
      return;
    }
    const rest = target.items.filter((item) => idOf(item) !== itemId);
    targetIndex = Math.min(Math.max(targetIndex, 0), rest.length);
    if (targetColumn === columnIndex && targetIndex === itemIndex) {
      return;
    }
    event.preventDefault();
    this.itemDropped.emit(
      this.itemDrop(itemId, from.column.id, target.column.id, rest, targetIndex),
    );
    void this.announcer.announce(
      this.locale.translate('kanbanMoved', {
        column: target.column.title,
        position: targetIndex + 1,
      }),
    );
    this.refocus('data-kanban-card', itemId);
  }

  protected onHandleKeydown(event: KeyboardEvent, columnIndex: number): void {
    if (!event.altKey || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) {
      return;
    }
    const columns = this.columns();
    const target = columnIndex + (event.key === 'ArrowLeft' ? -1 : 1);
    if (target < 0 || target >= columns.length) {
      return;
    }
    event.preventDefault();
    const id = columns[columnIndex].id;
    this.columnDropped.emit(this.columnDrop(id, target));
    void this.announcer.announce(
      this.locale.translate('kanbanMoved', { column: this.boardName(), position: target + 1 }),
    );
    this.refocus('data-kanban-handle', id);
  }

  protected onPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement | null;
    if (
      event.button !== 0 ||
      event.pointerType !== 'mouse' ||
      target?.closest(DRAG_SCROLL_IGNORE)
    ) {
      return;
    }
    const board = event.currentTarget as HTMLElement;
    this.dragScroll = { x: event.clientX, left: board.scrollLeft, pointer: event.pointerId };
    board.setPointerCapture?.(event.pointerId);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragScroll || event.pointerId !== this.dragScroll.pointer) {
      return;
    }
    (event.currentTarget as HTMLElement).scrollLeft =
      this.dragScroll.left - (event.clientX - this.dragScroll.x);
  }

  protected onPointerUp(): void {
    this.dragScroll = null;
  }

  private itemDrop(
    itemId: string,
    fromColumnId: string,
    toColumnId: string,
    rest: readonly T[],
    index: number,
  ): TxKanbanItemDrop {
    const idOf = this.itemId();
    const before = rest[index];
    const after = rest[index - 1];
    return {
      itemId,
      fromColumnId,
      toColumnId,
      beforeId: before ? idOf(before) : null,
      afterId: after ? idOf(after) : null,
    };
  }

  private columnDrop(columnId: string, index: number): TxKanbanColumnDrop {
    const rest = this.columns().filter((column) => column.id !== columnId);
    return { columnId, beforeId: rest[index]?.id ?? null, afterId: rest[index - 1]?.id ?? null };
  }

  private revealCard(listId: string | undefined, index: number): void {
    const list = listId ? this.document.getElementById(listId) : null;
    const card = list?.querySelectorAll<HTMLElement>(':scope > .tx-kanban__card')[index];
    if (!list || !card) {
      return;
    }
    const target = card.hasAttribute('tabindex')
      ? card
      : card.querySelector<HTMLElement>('[tabindex="0"], button, a[href]');
    target?.focus({ preventScroll: true });
    const reduced = this.document.defaultView?.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    ).matches;
    const behavior: ScrollBehavior = reduced ? 'auto' : 'smooth';
    if (list.scrollHeight > list.clientHeight) {
      const top =
        list.scrollTop + card.getBoundingClientRect().top - list.getBoundingClientRect().top;
      list.scrollTo?.({
        top: top - parseFloat(this.document.defaultView?.getComputedStyle(list).paddingTop ?? '0'),
        behavior,
      });
    } else {
      card.scrollIntoView?.({ block: 'nearest', behavior });
    }
  }

  private refocus(attribute: string, value: string): void {
    afterNextRender(
      () => {
        const elements = Array.from(
          this.host.nativeElement.querySelectorAll<HTMLElement>(`[${attribute}]`),
        );
        const element = elements.find((item) => item.getAttribute(attribute) === value);
        const focusable =
          element?.hasAttribute('tabindex') || element?.tagName === 'BUTTON'
            ? element
            : element?.querySelector<HTMLElement>('[tabindex="0"], button, a[href]');
        focusable?.focus();
      },
      { injector: this.injector },
    );
  }
}

import { BreakpointObserver } from '@angular/cdk/layout';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  Injector,
  afterNextRender,
  afterRenderEffect,
  booleanAttribute,
  computed,
  contentChild,
  contentChildren,
  effect,
  inject,
  input,
  model,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraTableTokens, toStyleObject } from '@tectra-ng/themes';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxTableEditorFocus } from './table-editor-focus.directive';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxMenu, TxMenuItem } from '@tectra-ng/ui/menu';
import { TxPageState, TxRowsPerPageOption } from '@tectra-ng/ui/paginator';
import { map, of, switchMap } from 'rxjs';
import { TxTableActionsStore } from './table-actions.store';
import { filterRows, isFilterActive } from './table.filter';
import { downloadCsv, toCsv } from './table.export';
import { TxTableStyles } from './table.styles';
import { TX_TABLE_IMPORTS } from './table.imports';
import { TxStyleLoader } from '@tectra-ng/core/styles';
import { TX_TABLE, TxTableContext, TxTableRowActionsSource } from './table.context';
import {
  TxTableAction,
  TxTableActionsTemplate,
  TxTableCard,
  TxTableCell,
  TxTableEditor,
  TxTableEmpty,
  TxTableGroupFooter,
  TxTableGroupHeader,
  TxTableExpansion,
  TxTableFooterCell,
  TxTableHeaderCell,
} from './table.templates';
import {
  TxColumnFilter,
  TxSortMeta,
  TxSortOrder,
  TxTableFilterDisplay,
  TxTableFilterEvent,
  TxTableFilters,
  TxTableColumn,
  TxTableColumnReorderEvent,
  TxTableColumnResizeEvent,
  TxTableCellEditEvent,
  TxTableColumnResizeMode,
  TxTableEditMode,
  TxTableGroupContext,
  TxTableRowGroupMode,
  TxTableRowReorderEvent,
  TxTableRowEditEvent,
  TxTableLazyLoadEvent,
  TxTablePaginatorPosition,
  TxTablePart,
  TxTableRowEvent,
  TxTableSelectionMode,
  TxTableSize,
  TxTableSortEvent,
  TxTableSortMode,
  TxTableState,
  TxTableStateStorage,
} from './table.types';
import { columnLabel, mergeColumnOrder, nextSortOrder, pxOf, resolveField, rowKeyOf, sortRows, writeField } from './table.utils';

export const TX_TABLE_SELECT_FIELD = '__select';
export const TX_TABLE_EXPAND_FIELD = '__expand';
export const TX_TABLE_ACTIONS_FIELD = '__actions';
export const TX_TABLE_EDITOR_FIELD = '__editor';
export const TX_TABLE_REORDER_FIELD = '__reorder';

const DEFAULT_COLUMN_WIDTH = 100;
const MIN_COLUMN_WIDTH = 30;
const SELECT_COLUMN_WIDTH = '56px';
const EXPAND_COLUMN_WIDTH = '49px';
const EDITOR_COLUMN_WIDTH = '92px';
const EXPANSION_DURATION = 400;

interface TxTableRenderColumn {
  column: TxTableColumn;
  kind: 'data' | 'select' | 'expand' | 'actions' | 'editor' | 'reorder';
  style: Record<string, string>;
  frozen: 'start' | 'end' | null;
  lastFrozenStart: boolean;
  firstFrozenEnd: boolean;
}

export interface TxTableTreeInfo {
  level: number;
  leaf: boolean;
  expanded: boolean;
  hidden: boolean;
  loading: boolean;
  partial: boolean;
  setSize: number;
  posInSet: number;
  parentKey: unknown;
}

export interface TxTableRenderRow<T> {
  row: T;
  index: number;
  key: unknown;
  selected: boolean;
  selectable: boolean;
  expanded: boolean;
  group: TxTableRenderGroup | null;
  tree?: TxTableTreeInfo;
}

export interface TxTableRenderGroup {
  value: unknown;
  key: string;
  first: boolean;
  last: boolean;
  size: number;
  collapsed: boolean;
}

const EDITOR_FOCUS_TARGET = 'input:not(.tx-table__editor-pending), textarea, button, [tabindex]:not([tabindex="-1"])';

@Component({
  selector: 'tx-table',
  imports: [...TX_TABLE_IMPORTS, TxTableEditorFocus, TxDatePicker, TxInputNumber],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TxTableActionsStore, { provide: TX_TABLE, useExisting: TxTable }],
  host: {
    class: 'tx-table',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
    '[class.tx-table--cards]': 'cardView()',
    '[class.tx-table--gridlines]': 'showGridlines()',
    '[class.tx-table--striped]': 'stripedRows()',
    '[class.tx-table--hoverable]': 'rowHover()',
    '[class.tx-table--resizing]': 'resizing() !== null',
    '[class.tx-table--loading]': 'loading()',
  },
})
export class TxTable<T = unknown> implements TxTableContext {
  private document = inject(DOCUMENT);
  protected host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected injector = inject(Injector);
  protected localeService = inject(TxLocaleService);
  private breakpointObserver = inject(BreakpointObserver);
  readonly actionsStore = inject(TxTableActionsStore);

  readonly value = input<readonly T[] | null | undefined>(undefined);
  readonly columns = model<TxTableColumn[]>([]);
  readonly dataKey = input<string | undefined>(undefined);
  readonly size = input<TxTableSize>('medium');
  readonly showGridlines = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly stripedRows = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly rowHover = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly scrollHeight = input<string | undefined>(undefined);
  readonly loading = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly emptyMessage = input<string | undefined>(undefined);
  readonly caption = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly rowClass = input<((row: T, index: number) => string | string[] | Record<string, boolean> | null | undefined) | undefined>(undefined);

  readonly sortMode = input<TxTableSortMode>('single');
  readonly sortField = model<string | null>(null);
  readonly sortOrder = model<TxSortOrder>(null);
  readonly multiSortMeta = model<TxSortMeta[]>([]);
  readonly customSort = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly lazy = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filterDisplay = input<TxTableFilterDisplay>('menu');
  readonly filters = model<TxTableFilters>({});
  readonly globalFilter = model('');
  readonly globalFilterFields = input<string[] | undefined>(undefined);
  readonly filterDelay = input(300, { transform: numberAttribute });
  readonly lazyLoadOnInit = input<boolean, unknown>(true, { transform: booleanAttribute });

  readonly paginator = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly paginatorPosition = input<TxTablePaginatorPosition>('bottom');
  readonly first = model(0);
  readonly rows = model(10);
  readonly totalRecords = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly rowsPerPageOptions = input<TxRowsPerPageOption[] | null | undefined>(undefined);
  readonly showTotal = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showCurrentPageReport = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly currentPageReportTemplate = input<string | undefined>(undefined);
  readonly showFirstLastIcon = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showPageLinks = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showJumpToPageDropdown = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly showJumpToPageInput = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly alwaysShowPaginator = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly pageLinks = input(5, { transform: numberAttribute });

  readonly selectionMode = input<TxTableSelectionMode | null | undefined>(undefined);
  readonly selection = model<T | T[] | null>(null);
  readonly metaKeySelection = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly rowSelectable = input<((row: T, index: number) => boolean) | undefined>(undefined);
  readonly selectAll = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly editMode = input<TxTableEditMode | null | undefined>(undefined);
  readonly editingRowKeys = model<unknown[]>([]);
  readonly expandedRowKeys = model<unknown[]>([]);
  readonly virtualScroll = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly virtualScrollItemSize = input(50, { transform: numberAttribute });
  readonly virtualScrollTolerance = input(10, { transform: numberAttribute });
  readonly cellTooltip = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly csvSeparator = input(',');
  readonly exportFilename = input('download');
  readonly exportFunction = input<((row: T, column: TxTableColumn) => unknown) | undefined>(undefined);
  readonly reorderableRows = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly frozenValue = input<readonly T[] | null | undefined>(undefined);
  readonly groupRowsBy = input<string | undefined>(undefined);
  readonly rowGroupMode = input<TxTableRowGroupMode>('subheader');
  readonly expandableRowGroups = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly expandedRowGroups = model<unknown[] | null>(null);
  readonly expandableRows = input<((row: T, index: number) => boolean) | undefined>(undefined);

  readonly resizableColumns = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly columnResizeMode = input<TxTableColumnResizeMode>('expand');
  readonly reorderableColumns = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly columnSettings = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly actionsSettings = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly actionsInlineCount = input(0, { transform: numberAttribute });
  readonly actionsHeader = input<string | undefined>(undefined);
  readonly actionsFrozen = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly stateKey = input<string | undefined>(undefined);
  readonly stateStorage = input<TxTableStateStorage>('local');
  readonly toolbar = input<boolean, unknown>(false, { transform: booleanAttribute });

  readonly contextMenu = input<TxMenuItem[] | null | undefined>(undefined);
  readonly contextMenuSelection = model<T | null>(null);
  readonly rowContextMenu = input<boolean, unknown>(true, { transform: booleanAttribute });

  readonly responsive = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly breakpoint = input('64rem');

  readonly dt = input<TectraDeepPartial<TectraTableTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTablePart, TxTable<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly sortChange = output<TxTableSortEvent>();
  readonly filterChange = output<TxTableFilterEvent<T>>();
  readonly pageChange = output<TxPageState>();
  readonly lazyLoad = output<TxTableLazyLoadEvent>();
  readonly rowClick = output<TxTableRowEvent<T>>();
  readonly rowSelect = output<TxTableRowEvent<T>>();
  readonly rowUnselect = output<TxTableRowEvent<T>>();
  readonly selectAllChange = output<boolean>();
  readonly rowExpand = output<TxTableRowEvent<T>>();
  readonly rowCollapse = output<TxTableRowEvent<T>>();
  readonly columnResize = output<TxTableColumnResizeEvent>();
  readonly columnReorder = output<TxTableColumnReorderEvent>();
  readonly columnVisibilityChange = output<string[]>();
  readonly contextMenuSelect = output<TxTableRowEvent<T>>();
  readonly rowReorder = output<TxTableRowReorderEvent<T>>();
  readonly rowGroupToggle = output<{ value: unknown; expanded: boolean }>();
  readonly cellEditInit = output<TxTableCellEditEvent<T>>();
  readonly cellEditComplete = output<TxTableCellEditEvent<T>>();
  readonly cellEditCancel = output<TxTableCellEditEvent<T>>();
  readonly rowEditInit = output<TxTableRowEditEvent<T>>();
  readonly rowEditSave = output<TxTableRowEditEvent<T>>();
  readonly rowEditCancel = output<TxTableRowEditEvent<T>>();

  readonly cellTemplates = contentChildren(TxTableCell);
  readonly headerTemplates = contentChildren(TxTableHeaderCell);
  readonly footerTemplates = contentChildren(TxTableFooterCell);
  readonly cardTemplate = contentChild(TxTableCard);
  readonly expansionTemplate = contentChild(TxTableExpansion);
  readonly actionsTemplate = contentChild(TxTableActionsTemplate);
  readonly emptyTemplate = contentChild(TxTableEmpty);
  readonly editorTemplates = contentChildren(TxTableEditor);
  readonly groupHeaderTemplate = contentChild(TxTableGroupHeader);
  readonly groupFooterTemplate = contentChild(TxTableGroupFooter);

  private readonly headerRow = viewChild<ElementRef<HTMLTableRowElement>>('headerRow');
  private readonly rowMenu = viewChild<TxMenu>('rowMenu');

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('table', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-table'), ...this.passThrough().root?.style }));

  readonly hidden = signal<ReadonlySet<string>>(new Set());
  readonly widths = signal<Record<string, number>>({});
  readonly resizing = signal<string | null>(null);
  readonly frozenOffsets = signal<Record<string, number>>({});
  readonly focusedRow = signal(0);
  readonly menuRowKey = signal<unknown>(undefined);
  readonly menuItems = signal<TxMenuItem[]>([]);
  readonly closingKeys = signal<unknown[]>([]);
  readonly cellEdit = signal<{ key: unknown; field: string; value: unknown } | null>(null);
  readonly rowDrafts = signal<ReadonlyMap<unknown, Record<string, unknown>>>(new Map());
  readonly editVersion = signal(0);
  readonly reordered = signal<{ source: readonly T[]; rows: T[] } | null>(null);
  readonly headerHeight = signal(0);
  readonly scrollTop = signal(0);
  readonly viewportHeight = signal(0);
  private lastRange = '';
  private readonly rowActionSources = new Map<Element, TxTableRowActionsSource>();
  private restored = false;
  private anchor: HTMLElement | null = null;
  private selectionAnchor: number | null = null;

  private readonly narrow = toSignal(
    toObservable(this.breakpoint).pipe(
      switchMap((breakpoint) => (breakpoint ? this.breakpointObserver.observe(`(width < ${breakpoint})`).pipe(map(({ matches }) => matches)) : of(false))),
    ),
    { initialValue: false },
  );
  readonly cardView = computed(() => this.responsive() && this.narrow());

  readonly templatesByField = computed(() => new Map(this.cellTemplates().map((template) => [template.txTableCell(), template])));
  readonly headerTemplatesByField = computed(() => new Map(this.headerTemplates().map((template) => [template.txTableHeaderCell(), template])));
  readonly footerTemplatesByField = computed(() => new Map(this.footerTemplates().map((template) => [template.txTableFooterCell(), template])));
  readonly hasFooter = computed(() => this.columns().some((column) => column.footer !== undefined) || this.footerTemplates().length > 0);

  readonly visibleColumns = computed(() => this.columns().filter((column) => !this.hidden().has(column.field)));

  readonly sortMeta = computed<TxSortMeta[]>(() => {
    if (this.sortMode() === 'multiple') return this.multiSortMeta();
    const field = this.sortField();
    const order = this.sortOrder();
    return field && order ? [{ field, order }] : [];
  });

  readonly allRows = computed<readonly T[]>(() => {
    const value = this.value() ?? [];
    const reordered = this.reordered();
    return reordered && reordered.source === value ? reordered.rows : value;
  });
  readonly hasFilters = computed(() => this.columns().some((column) => column.filter));
  readonly filterRow = computed(() => this.filterDisplay() === 'row' && this.hasFilters());
  readonly filteredRows = computed(() => {
    if (this.lazy()) return [...this.allRows()];
    const fields = this.globalFilterFields() ?? this.visibleColumns().map((column) => column.filterField ?? column.field);
    return filterRows(this.allRows(), this.filters(), this.columns(), this.globalFilter(), fields, this.localeService.locale().intl);
  });
  readonly sortedRows = computed(() => {
    const group = this.groupRowsBy();
    const meta = this.sortMeta();
    if (this.lazy() || this.customSort()) return [...this.filteredRows()];
    const groupMeta = group ? [{ field: group, order: meta.find((item) => item.field === group)?.order ?? ('asc' as const) }] : [];
    return sortRows(this.filteredRows(), [...groupMeta, ...meta.filter((item) => item.field !== group)], this.localeService.locale().intl);
  });
  readonly total = computed(() => this.totalRecords() ?? (this.lazy() ? this.allRows().length : this.sortedRows().length));
  readonly pageRows = computed(() => {
    const rows = this.sortedRows();
    if (!this.paginator() || this.lazy() || this.totalRecords() !== undefined) return rows;
    return rows.slice(this.first(), this.first() + this.rows());
  });

  readonly editorTemplatesByField = computed(() => new Map(this.editorTemplates().map((template) => [template.txTableEditor(), template])));
  readonly hasEditorColumn = computed(() => this.editMode() === 'row' && this.columns().some((column) => column.editable));

  readonly renderRows = computed<TxTableRenderRow<T>[]>(() => {
    this.editVersion();
    const dataKey = this.dataKey();
    const selectable = this.rowSelectable();
    const expandable = this.expandableRows();
    const expanded = new Set(this.expandedRowKeys());
    const offset = this.paginator() && !this.lazy() && this.totalRecords() === undefined ? this.first() : 0;
    const groupBy = this.groupRowsBy();
    const rows = this.pageRows();
    const groupValues = groupBy ? rows.map((row) => resolveField(row, groupBy)) : [];
    const collapsedGroups = this.collapsedGroupKeys();
    const sizes = new Map<string, number>();
    groupValues.forEach((value) => sizes.set(String(value), (sizes.get(String(value)) ?? 0) + 1));
    return rows.map((row, position) => {
      const index = offset + position;
      const key = rowKeyOf(row, dataKey, index);
      const groupKey = groupBy ? String(groupValues[position]) : '';
      return {
        row,
        index,
        key,
        selected: this.isSelected(row),
        selectable: selectable ? selectable(row, index) : true,
        expanded: expanded.has(key) && (!expandable || expandable(row, index)),
        group: groupBy
          ? {
              value: groupValues[position],
              key: groupKey,
              first: position === 0 || String(groupValues[position - 1]) !== groupKey,
              last: position === rows.length - 1 || String(groupValues[position + 1]) !== groupKey,
              size: sizes.get(groupKey) ?? 1,
              collapsed: collapsedGroups.has(groupKey),
            }
          : null,
      };
    });
  });

  readonly windowRange = computed(() => {
    const count = this.renderRows().length;
    if (!this.virtualScroll()) return { start: 0, end: count };
    const size = this.virtualScrollItemSize();
    const tolerance = this.virtualScrollTolerance();
    const viewport = this.viewportHeight() || size * 10;
    const start = Math.max(0, Math.floor(this.scrollTop() / size) - tolerance);
    const end = Math.min(count, Math.ceil((this.scrollTop() + viewport) / size) + tolerance);
    return { start, end };
  });
  readonly visibleRows = computed(() => {
    const { start, end } = this.windowRange();
    return this.virtualScroll() ? this.renderRows().slice(start, end) : this.renderRows();
  });
  readonly spacerBefore = computed(() => (this.virtualScroll() ? this.windowRange().start * this.virtualScrollItemSize() : 0));
  readonly spacerAfter = computed(() => (this.virtualScroll() ? (this.renderRows().length - this.windowRange().end) * this.virtualScrollItemSize() : 0));

  readonly collapsedGroupKeys = computed<ReadonlySet<string>>(() => {
    const groupBy = this.groupRowsBy();
    const open = this.expandedRowGroups();
    if (!groupBy || !this.expandableRowGroups() || open === null) return new Set();
    const openKeys = new Set(open.map((value) => String(value)));
    return new Set(this.pageRows().map((row) => String(resolveField(row, groupBy))).filter((key) => !openKeys.has(key)));
  });

  readonly frozenRows = computed<TxTableRenderRow<T>[]>(() => {
    this.editVersion();
    const dataKey = this.dataKey();
    return (this.frozenValue() ?? []).map((row, index) => ({
      row,
      index: -1 - index,
      key: `frozen-${String(rowKeyOf(row, dataKey, index))}`,
      selected: false,
      selectable: false,
      expanded: false,
      group: null,
    }));
  });

  readonly animatedGroups = computed(() => !!this.groupRowsBy() && this.expandableRowGroups() && this.rowGroupMode() === 'subheader');
  readonly animatedRows = computed(() => this.animatedGroups() || (this.isTree && !this.virtualScroll()));
  readonly isTree: boolean = false;
  readonly treeCheckbox = computed(() => this.isTree && this.selectionMode() === 'checkbox');
  readonly treeField = computed(() => (this.isTree ? (this.visibleColumns()[0]?.field ?? null) : null));
  readonly hasSelectColumn = computed(() => (this.selectionMode() === 'checkbox' && !this.treeCheckbox()) || this.selectionMode() === 'radio');
  readonly hasExpandColumn = computed(() => !!this.expansionTemplate());
  readonly hasActionsColumn = computed(() => !!this.actionsTemplate());

  readonly renderColumns = computed<TxTableRenderColumn[]>(() => {
    const data = this.visibleColumns();
    const firstFrozen = data[0]?.frozen === 'start';
    const result: TxTableRenderColumn[] = [];
    const special = (field: string, width: string, kind: TxTableRenderColumn['kind'], frozen: 'start' | 'end' | null, header = ''): TxTableRenderColumn => ({
      column: { field, header, sortable: false, reorderable: false, resizable: false, hideable: false },
      kind,
      style: { width, minWidth: width, maxWidth: width },
      frozen,
      lastFrozenStart: false,
      firstFrozenEnd: false,
    });
    if (this.reorderableRows()) result.push(special(TX_TABLE_REORDER_FIELD, EXPAND_COLUMN_WIDTH, 'reorder', firstFrozen ? 'start' : null));
    if (this.hasSelectColumn()) result.push(special(TX_TABLE_SELECT_FIELD, SELECT_COLUMN_WIDTH, 'select', firstFrozen ? 'start' : null));
    if (this.hasExpandColumn()) result.push(special(TX_TABLE_EXPAND_FIELD, EXPAND_COLUMN_WIDTH, 'expand', firstFrozen ? 'start' : null));
    data.forEach((column) => result.push({ column, kind: 'data', style: this.columnStyle(column), frozen: column.frozen ?? null, lastFrozenStart: false, firstFrozenEnd: false }));
    if (this.hasEditorColumn()) result.push(special(TX_TABLE_EDITOR_FIELD, EDITOR_COLUMN_WIDTH, 'editor', this.actionsFrozen() && !this.hasActionsColumn() ? 'end' : null));
    if (this.hasActionsColumn()) {
      const width = this.actionsStore.columnWidth();
      result.push(special(TX_TABLE_ACTIONS_FIELD, width, 'actions', this.actionsFrozen() ? 'end' : null, this.actionsHeader() ?? this.translations().tableActions));
    }
    const lastStart = result.map((item) => item.frozen).lastIndexOf('start');
    const firstEnd = result.findIndex((item) => item.frozen === 'end');
    if (lastStart >= 0) result[lastStart] = { ...result[lastStart], lastFrozenStart: true };
    if (firstEnd >= 0) result[firstEnd] = { ...result[firstEnd], firstFrozenEnd: true };
    return result;
  });

  readonly selectableRows = computed(() => this.renderRows().filter((row) => row.selectable));
  readonly allSelected = computed(() => {
    const own = this.selectAll();
    if (own !== undefined) return own;
    const rows = this.selectableRows();
    return rows.length > 0 && rows.every((row) => row.selected);
  });
  readonly someSelected = computed(() => !this.allSelected() && this.selectableRows().some((row) => row.selected));
  readonly radioValue = computed(() => {
    const selected = this.renderRows().find((row) => row.selected);
    return selected ? selected.key : null;
  });
  readonly rowSelection = computed(() => this.selectionMode() === 'single' || this.selectionMode() === 'multiple');
  readonly showSettings = computed(() => this.columnSettings() || (this.actionsSettings() && this.actionsStore.registeredActions().length > 0));
  readonly showToolbar = computed(() => this.toolbar() || this.showSettings());
  readonly showPaginatorTop = computed(() => this.paginator() && this.paginatorPosition() !== 'bottom');
  readonly showPaginatorBottom = computed(() => this.paginator() && this.paginatorPosition() !== 'top');
  readonly empty = computed(() => this.renderRows().length === 0);
  readonly dataColumnCount = computed(() => this.renderColumns().length);

  readonly cardTitleField = computed(() => {
    const data = this.visibleColumns().filter((column) => !column.hideInCard);
    return (data.find((column) => column.cardTitle) ?? data[0])?.field ?? null;
  });
  readonly cardFields = computed(() => this.visibleColumns().filter((column) => !column.hideInCard && column.field !== this.cardTitleField()));
  readonly cardTitleColumn = computed(() => this.visibleColumns().find((column) => column.field === this.cardTitleField()) ?? null);

  constructor() {
    inject(TxStyleLoader).load(TxTableStyles);
    this.actionsStore.onChange(() => this.saveState());
    effect(() => this.actionsStore.inlineCount.set(this.actionsInlineCount()));

    effect(() => {
      const columns = this.columns();
      if (this.restored || !columns.length) return;
      this.restored = true;
      untracked(() => {
        this.restoreState(columns);
        if (this.lazyLoadOnInit()) this.emitLazyLoad();
      });
    });

    effect(() => {
      const total = this.total();
      const first = untracked(this.first);
      const rows = untracked(this.rows);
      if (this.paginator() && total > 0 && first >= total && rows > 0) {
        untracked(() => this.first.set(Math.max(0, Math.floor((total - 1) / rows) * rows)));
      }
    });

    effect(() => {
      const keys = this.editingRowKeys();
      const rows = this.renderRows();
      untracked(() => {
        if (this.editMode() !== 'row') return;
        const drafts = this.rowDrafts();
        const missing = rows.filter((row) => keys.includes(row.key) && !drafts.has(row.key));
        const stale = [...drafts.keys()].filter((key) => !keys.includes(key));
        if (!missing.length && !stale.length) return;
        const next = new Map(drafts);
        stale.forEach((key) => next.delete(key));
        missing.forEach((row) => {
          const draft: Record<string, unknown> = {};
          this.columns().filter((column) => column.editable).forEach((column) => (draft[column.field] = this.cellValue(row.row, column)));
          next.set(row.key, draft);
        });
        this.rowDrafts.set(next);
      });
    });

    let lastGlobal: string | null = null;
    let globalTimer: ReturnType<typeof setTimeout> | undefined;
    effect(() => {
      const query = this.globalFilter();
      if (lastGlobal === null) {
        lastGlobal = query;
        return;
      }
      if (query === lastGlobal) return;
      lastGlobal = query;
      clearTimeout(globalTimer);
      globalTimer = setTimeout(() => untracked(() => this.afterFilter()), this.lazy() ? this.filterDelay() : 0);
    });
    inject(DestroyRef).onDestroy(() => clearTimeout(globalTimer));

    afterRenderEffect((onCleanup) => {
      this.renderColumns();
      this.cardView();
      const row = this.headerRow()?.nativeElement;
      if (!row) return;
      const measure = () => {
        this.measureFrozen(row);
        const head = row.parentElement as HTMLElement | null;
        if (head && head.offsetHeight !== this.headerHeight()) this.headerHeight.set(head.offsetHeight);
      };
      measure();
      const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(measure);
      observer?.observe(row);
      onCleanup(() => observer?.disconnect());
    });

    inject(DestroyRef).onDestroy(() => this.anchor?.remove());
  }

  columnStyle(column: TxTableColumn): Record<string, string> {
    const saved = this.widths()[column.field];
    const width = column.width ?? (saved !== undefined ? `${saved}px` : (column.initialWidth ?? `${DEFAULT_COLUMN_WIDTH}px`));
    return { width, minWidth: column.minWidth ?? `${MIN_COLUMN_WIDTH}px`, maxWidth: column.maxWidth ?? 'none' };
  }

  frozenStyle(item: TxTableRenderColumn): Record<string, string> {
    if (!item.frozen || this.cardView()) return {};
    const offset = this.frozenOffsets()[item.column.field] ?? 0;
    return item.frozen === 'start' ? { insetInlineStart: `${offset}px` } : { insetInlineEnd: `${offset}px` };
  }

  dataOf(row: T): unknown {
    return row;
  }

  cellValue(row: T, column: TxTableColumn): unknown {
    return resolveField(this.dataOf(row), column.field);
  }

  displayValue(row: T, column: TxTableColumn): string {
    const value = this.cellValue(row, column);
    return value === null || value === undefined ? '' : String(value);
  }

  label(column: TxTableColumn): string {
    return columnLabel(column);
  }

  isSortable(column: TxTableColumn): boolean {
    return column.sortable !== false;
  }

  sortFieldOf(column: TxTableColumn): string {
    return column.sortField ?? column.field;
  }

  sortOrderOf(column: TxTableColumn): TxSortOrder {
    return this.sortMeta().find((meta) => meta.field === this.sortFieldOf(column))?.order ?? null;
  }

  sortIndexOf(column: TxTableColumn): number {
    return this.sortMeta().findIndex((meta) => meta.field === this.sortFieldOf(column));
  }

  ariaSort(column: TxTableColumn): string | null {
    if (!this.isSortable(column)) return null;
    const order = this.sortOrderOf(column);
    return order === 'asc' ? 'ascending' : order === 'desc' ? 'descending' : 'none';
  }

  sort(column: TxTableColumn, event: MouseEvent | KeyboardEvent): void {
    if (!this.isSortable(column) || this.resizing()) return;
    const field = this.sortFieldOf(column);
    if (this.sortMode() === 'multiple') {
      const additive = this.metaKeySelection() ? event.ctrlKey || event.metaKey : true;
      const current = this.multiSortMeta();
      const existing = current.find((meta) => meta.field === field);
      const order = nextSortOrder(existing?.order ?? null);
      const rest = additive ? current.filter((meta) => meta.field !== field) : [];
      const next = order ? (additive && existing ? current.map((meta) => (meta.field === field ? { field, order } : meta)) : [...rest, { field, order }]) : rest;
      this.multiSortMeta.set(next);
      this.sortChange.emit({ field: order ? field : null, order, multiSortMeta: next });
    } else {
      const order = nextSortOrder(this.sortField() === field ? this.sortOrder() : null);
      this.sortField.set(order ? field : null);
      this.sortOrder.set(order);
      this.sortChange.emit({ field: order ? field : null, order, multiSortMeta: this.sortMeta() });
    }
    if (this.paginator() && !this.lazy()) this.first.set(0);
    this.emitLazyLoad();
    this.saveState();
  }

  onPage(state: TxPageState): void {
    this.first.set(state.first);
    this.rows.set(state.rows);
    this.pageChange.emit(state);
    this.emitLazyLoad();
    this.saveState();
  }

  emitLazyLoad(): void {
    if (!this.lazy()) return;
    this.lastRange = '';
    this.lazyLoad.emit(this.lazyEvent());
  }

  private lazyEvent(): TxTableLazyLoadEvent {
    return {
      first: this.first(),
      rows: this.rows(),
      sortField: this.sortMode() === 'single' ? this.sortField() : (this.multiSortMeta()[0]?.field ?? null),
      sortOrder: this.sortMode() === 'single' ? this.sortOrder() : (this.multiSortMeta()[0]?.order ?? null),
      multiSortMeta: this.sortMeta(),
      filters: this.filters(),
      globalFilter: this.globalFilter(),
    };
  }

  applyFilter(field: string, filter: TxColumnFilter | null): void {
    const next = { ...this.filters() };
    if (filter && isFilterActive(filter)) next[field] = filter;
    else delete next[field];
    this.filters.set(next);
    this.afterFilter();
  }

  clearFilters(): void {
    this.filters.set({});
    this.globalFilter.set('');
    this.afterFilter();
  }

  isFiltered(field: string): boolean {
    return isFilterActive(this.filters()[field]);
  }

  protected afterFilter(): void {
    if (this.paginator()) this.first.set(0);
    this.filterChange.emit({ filters: this.filters(), globalFilter: this.globalFilter(), filteredValue: this.sortedRows() });
    this.emitLazyLoad();
    this.saveState();
  }

  identityOf(row: T): unknown {
    const dataKey = this.dataKey();
    return dataKey ? resolveField(row, dataKey) : row;
  }

  isSelected(row: T): boolean {
    const selection = this.selection();
    if (selection === null || selection === undefined) return false;
    const identity = this.identityOf(row);
    const same = (other: T) => this.identityOf(other) === identity;
    return Array.isArray(selection) ? selection.some(same) : same(selection as T);
  }

  protected multiple(): boolean {
    return this.selectionMode() === 'multiple' || this.selectionMode() === 'checkbox';
  }

  toggleRow(item: TxTableRenderRow<T>, event?: Event): void {
    if (!item.selectable) return;
    if (this.multiple()) {
      const current = (Array.isArray(this.selection()) ? this.selection() : []) as T[];
      const next = item.selected ? current.filter((row) => !this.sameRow(row, item.row)) : [...current, item.row];
      this.selection.set(next);
    } else {
      this.selection.set(item.selected ? null : item.row);
    }
    (item.selected ? this.rowUnselect : this.rowSelect).emit({ row: item.row, index: item.index, originalEvent: event });
  }

  selectRadio(item: TxTableRenderRow<T>, event?: Event): void {
    if (!item.selectable || item.selected) return;
    this.selection.set(item.row);
    this.rowSelect.emit({ row: item.row, index: item.index, originalEvent: event });
  }

  toggleAll(checked: boolean): void {
    this.selectAllChange.emit(checked);
    if (this.selectAll() !== undefined) return;
    const page = this.selectableRows().map((row) => row.row);
    const current = (Array.isArray(this.selection()) ? this.selection() : []) as T[];
    const rest = current.filter((row) => !page.some((other) => this.sameRow(other, row)));
    this.selection.set(checked ? [...rest, ...page] : rest);
  }

  protected sameRow(a: T, b: T): boolean {
    return this.identityOf(a) === this.identityOf(b);
  }

  onRowClick(item: TxTableRenderRow<T>, position: number, event: MouseEvent): void {
    this.rowClick.emit({ row: item.row, index: item.index, originalEvent: event });
    if (!this.rowSelection() || !item.selectable) return;
    const target = event.target as Element | null;
    if (target?.closest('a, button, input, textarea, select, label, [contenteditable], .tx-table__resizer')) return;
    this.focusedRow.set(position);
    if (this.selectionMode() === 'multiple' && event.shiftKey && this.selectionAnchor !== null) {
      this.selectRange(this.selectionAnchor, position);
      return;
    }
    const meta = event.ctrlKey || event.metaKey;
    if (this.selectionMode() === 'multiple' && this.metaKeySelection() && !meta) {
      const onlyThis = item.selected && this.selectionCount() === 1;
      this.selection.set(onlyThis ? [] : [item.row]);
      (onlyThis ? this.rowUnselect : this.rowSelect).emit({ row: item.row, index: item.index, originalEvent: event });
    } else if (this.selectionMode() === 'single' && this.metaKeySelection() && !meta && item.selected) {
      return;
    } else {
      this.toggleRow(item, event);
    }
    this.selectionAnchor = position;
  }

  private selectionCount(): number {
    const selection = this.selection();
    return Array.isArray(selection) ? selection.length : selection ? 1 : 0;
  }

  private selectRange(from: number, to: number): void {
    const rows = this.renderRows();
    const [start, end] = from < to ? [from, to] : [to, from];
    this.selection.set(rows.slice(start, end + 1).filter((row) => row.selectable).map((row) => row.row));
  }

  rowsFocusable(): boolean {
    return this.rowSelection();
  }

  protected treeRowKey?: (item: TxTableRenderRow<T>, position: number, event: KeyboardEvent) => boolean;

  onRowKeydown(item: TxTableRenderRow<T>, position: number, event: KeyboardEvent): void {
    if (!this.rowsFocusable() || event.target !== event.currentTarget) return;
    if (this.treeRowKey?.(item, position, event)) return;
    const count = this.renderRows().length;
    const focus = (next: number) => {
      const index = Math.max(0, Math.min(count - 1, next));
      this.focusRowAt(index);
      if (event.shiftKey && this.selectionMode() === 'multiple') this.selectRange(this.selectionAnchor ?? position, index);
    };
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focus(position + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focus(position - 1);
        break;
      case 'Home':
        event.preventDefault();
        focus(0);
        break;
      case 'End':
        event.preventDefault();
        focus(count - 1);
        break;
      case ' ':
      case 'Enter':
        if (!this.selectionMode()) break;
        event.preventDefault();
        this.toggleRow(item, event);
        this.selectionAnchor = position;
        break;
      case 'a':
        if ((event.ctrlKey || event.metaKey) && this.selectionMode() === 'multiple') {
          event.preventDefault();
          this.toggleAll(!this.allSelected());
        }
        break;
    }
  }

  protected focusRowAt(index: number): void {
    const target = this.renderRows()[index];
    if (!target) return;
    this.focusedRow.set(index);
    const { start, end } = this.windowRange();
    if (this.virtualScroll() && (index < start || index >= end)) {
      const scroller = this.host.nativeElement.querySelector<HTMLElement>('.tx-table__scroller');
      if (scroller) {
        scroller.scrollTop = index * this.virtualScrollItemSize();
        this.scrollTop.set(scroller.scrollTop);
      }
    }
    afterNextRender(
      () => [...this.host.nativeElement.querySelectorAll<HTMLElement>('.tx-table__tbody > .tx-table__row')].find((row) => row.dataset['key'] === String(target.key))?.focus(),
      { injector: this.injector },
    );
  }

  toggleExpansion(item: TxTableRenderRow<T>, event?: Event): void {
    const keys = this.expandedRowKeys();
    if (item.expanded) {
      this.expandedRowKeys.set(keys.filter((key) => key !== item.key));
      this.closingKeys.set([...this.closingKeys(), item.key]);
      setTimeout(() => this.finishClosing(item.key), EXPANSION_DURATION);
      this.rowCollapse.emit({ row: item.row, index: item.index, originalEvent: event });
    } else {
      this.closingKeys.set(this.closingKeys().filter((key) => key !== item.key));
      this.expandedRowKeys.set([...keys, item.key]);
      this.rowExpand.emit({ row: item.row, index: item.index, originalEvent: event });
    }
  }

  isCollapsedRow(item: TxTableRenderRow<T>): boolean {
    return !!item.group?.collapsed || !!item.tree?.hidden;
  }

  toggleNode(item: TxTableRenderRow<T>, event: Event): void {
    this.toggleExpansion(item, event);
  }

  isClosing(key: unknown): boolean {
    return this.closingKeys().includes(key);
  }

  finishClosing(key: unknown, event?: TransitionEvent): void {
    if (event && (event.target !== event.currentTarget || event.propertyName !== 'grid-template-rows')) return;
    if (this.isClosing(key)) this.closingKeys.set(this.closingKeys().filter((other) => other !== key));
  }

  isEditable(column: TxTableColumn): boolean {
    return !!this.editMode() && !!column.editable;
  }

  isEditing(item: TxTableRenderRow<T>, column: TxTableColumn): boolean {
    if (!this.isEditable(column)) return false;
    if (this.editMode() === 'row') return this.rowDrafts().has(item.key);
    const edit = this.cellEdit();
    return !!edit && edit.key === item.key && edit.field === column.field;
  }

  isRowEditing(item: TxTableRenderRow<T>): boolean {
    return this.rowDrafts().has(item.key);
  }

  draftValue(item: TxTableRenderRow<T>, column: TxTableColumn): unknown {
    if (this.editMode() === 'row') {
      const draft = this.rowDrafts().get(item.key);
      return draft && column.field in draft ? draft[column.field] : this.cellValue(item.row, column);
    }
    return this.cellEdit()?.value;
  }

  setDraft(item: TxTableRenderRow<T>, column: TxTableColumn, value: unknown): void {
    if (this.editMode() === 'row') {
      const drafts = new Map(this.rowDrafts());
      drafts.set(item.key, { ...(drafts.get(item.key) ?? {}), [column.field]: value });
      this.rowDrafts.set(drafts);
      return;
    }
    const edit = this.cellEdit();
    if (edit) this.cellEdit.set({ ...edit, value });
  }

  editorContext(item: TxTableRenderRow<T>, column: TxTableColumn) {
    return {
      $implicit: this.dataOf(item.row),
      row: this.dataOf(item.row),
      index: item.index,
      column,
      value: this.draftValue(item, column),
      set: (value: unknown) => this.setDraft(item, column, value),
      commit: () => (this.editMode() === 'row' ? this.saveRow(item) : this.commitCell()),
      cancel: () => (this.editMode() === 'row' ? this.cancelRow(item) : this.cancelCell()),
    };
  }

  startCellEdit(item: TxTableRenderRow<T>, column: TxTableColumn, event?: Event): void {
    if (this.editMode() !== 'cell' || !column.editable || this.isEditing(item, column)) return;
    if ((event?.target as Element | null)?.closest('a, button, input, select, textarea')) return;
    this.commitCell();
    const value = this.cellValue(item.row, column);
    this.cellEdit.set({ key: item.key, field: column.field, value });
    this.cellEditInit.emit({ row: item.row, index: item.index, field: column.field, value, previousValue: value });
    this.focusEditor();
  }

  commitCell(): void {
    const edit = this.cellEdit();
    if (!edit) return;
    this.cellEdit.set(null);
    const item = this.renderRows().find((row) => row.key === edit.key);
    if (!item) return;
    const previousValue = resolveField(this.dataOf(item.row), edit.field);
    if (previousValue !== edit.value) {
      writeField(this.dataOf(item.row), edit.field, edit.value);
      this.editVersion.update((version) => version + 1);
    }
    this.cellEditComplete.emit({ row: item.row, index: item.index, field: edit.field, value: edit.value, previousValue });
  }

  cancelCell(): void {
    const edit = this.cellEdit();
    if (!edit) return;
    this.cellEdit.set(null);
    const item = this.renderRows().find((row) => row.key === edit.key);
    if (item) {
      const value = resolveField(this.dataOf(item.row), edit.field);
      this.cellEditCancel.emit({ row: item.row, index: item.index, field: edit.field, value, previousValue: value });
    }
  }

  onEditorKeydown(item: TxTableRenderRow<T>, column: TxTableColumn, event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      const cell = (event.currentTarget as HTMLElement).closest('td');
      if (this.editMode() === 'row') this.cancelRow(item);
      else this.cancelCell();
      cell?.focus();
    } else if (event.key === 'Enter' && !(event.target as Element).closest('textarea, tx-select, tx-multiselect')) {
      event.preventDefault();
      const cell = (event.currentTarget as HTMLElement).closest('td');
      if (this.editMode() === 'row') this.saveRow(item);
      else this.commitCell();
      cell?.focus();
    } else if (event.key === 'Tab' && this.editMode() === 'cell') {
      event.preventDefault();
      this.moveCellEdit(item, column, event.shiftKey ? -1 : 1);
    }
  }

  onCellFocusOut(item: TxTableRenderRow<T>, column: TxTableRenderColumn, event: FocusEvent): void {
    if (column.kind !== 'data' || this.editMode() !== 'cell' || !this.isEditing(item, column.column)) return;
    const next = event.relatedTarget as Element | null;
    const cell = event.currentTarget as HTMLElement;
    if (next && (cell?.contains(next) || next.closest('.cdk-overlay-container'))) return;
    this.commitCell();
  }

  onCellClick(item: TxTableRenderRow<T>, column: TxTableRenderColumn, event: MouseEvent): void {
    if (column.kind === 'data') this.startCellEdit(item, column.column, event);
  }

  onCellKeydown(item: TxTableRenderRow<T>, column: TxTableRenderColumn, event: KeyboardEvent): void {
    if (column.kind !== 'data') return;
    if (this.isEditing(item, column.column) && (event.target as Element).closest('.tx-table__editor')) {
      this.onEditorKeydown(item, column.column, event);
      return;
    }
    if (event.target !== event.currentTarget || !this.isEditable(column.column) || this.editMode() !== 'cell') return;
    if (event.key === 'Enter' || event.key === 'F2') {
      event.preventDefault();
      this.startCellEdit(item, column.column);
    }
  }

  private moveCellEdit(item: TxTableRenderRow<T>, column: TxTableColumn, step: number): void {
    const editable = this.visibleColumns().filter((candidate) => candidate.editable);
    const rows = this.renderRows();
    let rowIndex = rows.findIndex((row) => row.key === item.key);
    let columnIndex = editable.indexOf(column) + step;
    if (columnIndex >= editable.length) {
      columnIndex = 0;
      rowIndex += 1;
    } else if (columnIndex < 0) {
      columnIndex = editable.length - 1;
      rowIndex -= 1;
    }
    this.commitCell();
    const nextRow = rows[rowIndex];
    if (nextRow && editable[columnIndex]) this.startCellEdit(nextRow, editable[columnIndex]);
  }

  startRowEdit(item: TxTableRenderRow<T>): void {
    if (this.isRowEditing(item)) return;
    const drafts = new Map(this.rowDrafts());
    const draft: Record<string, unknown> = {};
    this.columns()
      .filter((column) => column.editable)
      .forEach((column) => (draft[column.field] = this.cellValue(item.row, column)));
    drafts.set(item.key, draft);
    this.rowDrafts.set(drafts);
    this.editingRowKeys.set([...this.editingRowKeys().filter((key) => key !== item.key), item.key]);
    this.rowEditInit.emit({ row: item.row, index: item.index, changes: {}, previous: { ...draft } });
    this.focusEditor(item.key);
  }

  saveRow(item: TxTableRenderRow<T>): void {
    const draft = this.rowDrafts().get(item.key);
    if (!draft) return;
    const previous: Record<string, unknown> = {};
    const changes: Record<string, unknown> = {};
    Object.entries(draft).forEach(([field, value]) => {
      const old = resolveField(this.dataOf(item.row), field);
      previous[field] = old;
      if (old !== value) {
        changes[field] = value;
        writeField(this.dataOf(item.row), field, value);
      }
    });
    this.closeRowEdit(item.key);
    this.editVersion.update((version) => version + 1);
    this.rowEditSave.emit({ row: item.row, index: item.index, changes, previous });
  }

  cancelRow(item: TxTableRenderRow<T>): void {
    const draft = this.rowDrafts().get(item.key);
    if (!draft) return;
    this.closeRowEdit(item.key);
    const previous: Record<string, unknown> = {};
    Object.keys(draft).forEach((field) => (previous[field] = resolveField(this.dataOf(item.row), field)));
    this.rowEditCancel.emit({ row: item.row, index: item.index, changes: {}, previous });
  }

  private closeRowEdit(key: unknown): void {
    const drafts = new Map(this.rowDrafts());
    drafts.delete(key);
    this.rowDrafts.set(drafts);
    this.editingRowKeys.set(this.editingRowKeys().filter((other) => other !== key));
  }

  private pendingEditorFocus: HTMLElement | null = null;

  private focusEditor(rowKey?: unknown): void {
    afterNextRender(
      () => {
        const editors = [...this.host.nativeElement.querySelectorAll<HTMLElement>('.tx-table__editor')];
        const editor = rowKey === undefined ? editors[0] : editors.find((element) => element.closest('tr')?.dataset['key'] === String(rowKey));
        const target = editor?.querySelector<HTMLElement>(EDITOR_FOCUS_TARGET);
        this.pendingEditorFocus = !target && editor?.querySelector('.tx-table__editor-pending') ? editor : null;
        target?.focus();
      },
      { injector: this.injector },
    );
  }

  editorLoaded(control: HTMLElement): void {
    if (this.pendingEditorFocus?.contains(control)) {
      this.pendingEditorFocus = null;
      control.querySelector<HTMLElement>(EDITOR_FOCUS_TARGET)?.focus();
    }
  }

  dateDraft(value: unknown): Date | null {
    if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
    if (typeof value !== 'string') return null;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
  }

  groupContext(item: TxTableRenderRow<T>): TxTableGroupContext<T> {
    const group = item.group as TxTableRenderGroup;
    const rows = this.renderRows()
      .filter((other) => other.group?.key === group.key)
      .map((other) => other.row);
    return { $implicit: item.row, value: group.value, count: group.size, rows, collapsed: group.collapsed, toggle: () => this.toggleGroup(item) };
  }

  toggleGroup(item: TxTableRenderRow<T>): void {
    const group = item.group;
    const groupBy = this.groupRowsBy();
    if (!group || !groupBy) return;
    const all = [...new Set(this.pageRows().map((row) => resolveField(row, groupBy)))];
    const open = this.expandedRowGroups() ?? all;
    const expanded = group.collapsed;
    const next = expanded ? [...open, group.value] : open.filter((value) => String(value) !== group.key);
    this.expandedRowGroups.set(next);
    this.rowGroupToggle.emit({ value: group.value, expanded });
  }

  isGroupedCellHidden(item: TxTableRenderRow<T>, column: TxTableRenderColumn): boolean {
    return this.rowGroupMode() === 'rowspan' && column.kind === 'data' && column.column.field === this.groupRowsBy() && !!item.group && !item.group.first;
  }

  groupRowspan(item: TxTableRenderRow<T>, column: TxTableRenderColumn): number | null {
    return this.rowGroupMode() === 'rowspan' && column.kind === 'data' && column.column.field === this.groupRowsBy() && item.group?.first ? item.group.size : null;
  }

  dropRow(event: CdkDragDrop<unknown>): void {
    this.moveRow(event.previousIndex, event.currentIndex);
  }

  moveRowBy(position: number, step: number, event: Event): void {
    event.preventDefault();
    const target = position + step;
    if (target < 0 || target >= this.renderRows().length) return;
    this.moveRow(position, target);
    afterNextRender(
      () => this.host.nativeElement.querySelectorAll<HTMLElement>('.tx-table__tbody > .tx-table__row .tx-table__row-handle')[target]?.focus(),
      { injector: this.injector },
    );
  }

  private moveRow(fromPosition: number, toPosition: number): void {
    if (fromPosition === toPosition) return;
    const rows = this.renderRows();
    const moved = rows[fromPosition];
    const target = rows[toPosition];
    if (!moved || !target) return;
    const source = this.value() ?? [];
    const list = [...this.allRows()];
    const from = list.indexOf(moved.row);
    const to = list.indexOf(target.row);
    if (from < 0 || to < 0) return;
    moveItemInArray(list, from, to);
    this.reordered.set({ source, rows: list });
    this.rowReorder.emit({ from, to, value: list });
  }

  isLoadingRow(item: TxTableRenderRow<T>): boolean {
    return item.row === null || item.row === undefined;
  }

  onScroll(event: Event): void {
    if (!this.virtualScroll()) return;
    const scroller = event.target as HTMLElement;
    this.scrollTop.set(scroller.scrollTop);
    this.viewportHeight.set(scroller.clientHeight);
    this.requestVirtualRange();
  }

  private requestVirtualRange(): void {
    if (!this.lazy() || !this.virtualScroll()) return;
    const { start, end } = this.windowRange();
    const missing = this.renderRows()
      .slice(start, end)
      .some((item) => this.isLoadingRow(item));
    const range = `${start}:${end}`;
    if (!missing || range === this.lastRange) return;
    this.lastRange = range;
    this.lazyLoad.emit({ ...this.lazyEvent(), first: start, rows: end - start });
  }

  exportCSV(options: { selectionOnly?: boolean; filename?: string } = {}): string {
    const selection = this.selection();
    const rows = options.selectionOnly ? (Array.isArray(selection) ? selection : selection ? [selection] : []) : this.exportRows();
    const columns = this.visibleColumns();
    const own = this.exportFunction();
    const csv = toCsv(rows, columns, { separator: this.csvSeparator(), value: own ? (row, column) => own(row, column) : (row, column) => this.cellValue(row, column) });
    downloadCsv(this.document, csv, options.filename ?? this.exportFilename());
    return csv;
  }

  protected exportRows(): T[] {
    return this.sortedRows().filter((row) => row !== null && row !== undefined);
  }

  canExpand(item: TxTableRenderRow<T>): boolean {
    const expandable = this.expandableRows();
    return !expandable || expandable(item.row, item.index);
  }

  rowClassOf(item: TxTableRenderRow<T>): string | string[] | Record<string, boolean> | null | undefined {
    return this.rowClass()?.(item.row, item.index);
  }

  toggleColumn(field: string, visible: boolean): void {
    const next = new Set(this.hidden());
    if (visible) next.delete(field);
    else next.add(field);
    this.hidden.set(next);
    this.columnVisibilityChange.emit([...next]);
    this.saveState();
  }

  dropColumn(event: CdkDragDrop<unknown>): void {
    const items = this.renderColumns();
    const dragged = items[event.previousIndex];
    const target = items[event.currentIndex];
    if (!dragged || !target || dragged.kind !== 'data' || target.kind !== 'data') return;
    this.moveColumn(dragged.column.field, target.column.field);
  }

  moveColumnBy(column: TxTableColumn, step: number, event: Event): void {
    if (!this.reorderableColumns() || column.reorderable === false) return;
    event.preventDefault();
    const visible = this.visibleColumns();
    const target = visible[visible.indexOf(column) + step];
    if (!target || target.reorderable === false) return;
    this.moveColumn(column.field, target.field);
    afterNextRender(
      () => {
        const th = [...this.host.nativeElement.querySelectorAll<HTMLElement>('th[data-field]')].find((cell) => cell.dataset['field'] === column.field);
        (th?.querySelector<HTMLElement>('.tx-table__sort') ?? th)?.focus();
      },
      { injector: this.injector },
    );
  }

  reorderColumn(field: string, targetField: string): void {
    this.moveColumn(field, targetField);
  }

  private moveColumn(field: string, targetField: string): void {
    const columns = [...this.columns()];
    const from = columns.findIndex((column) => column.field === field);
    const to = columns.findIndex((column) => column.field === targetField);
    if (from < 0 || to < 0 || from === to) return;
    moveItemInArray(columns, from, to);
    this.columns.set(columns);
    this.columnReorder.emit({ columns, from, to });
    this.saveState();
  }

  startResize(item: TxTableRenderColumn, event: PointerEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const handle = event.currentTarget as HTMLElement;
    const th = handle.closest('th') as HTMLElement;
    const next = th.nextElementSibling as HTMLElement | null;
    const column = item.column;
    const nextItem = this.renderColumns()[this.renderColumns().indexOf(item) + 1];
    const startX = event.clientX;
    const startWidth = th.offsetWidth;
    const startNext = next?.offsetWidth ?? 0;
    const rtl = getComputedStyle(th).direction === 'rtl';
    this.resizing.set(column.field);
    handle.setPointerCapture?.(event.pointerId);
    const clamp = (width: number, target: TxTableColumn) =>
      Math.min(pxOf(target.maxWidth) ?? Number.MAX_SAFE_INTEGER, Math.max(pxOf(target.minWidth) ?? MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH, width));
    const move = (moveEvent: PointerEvent) => {
      const delta = (moveEvent.clientX - startX) * (rtl ? -1 : 1);
      const width = clamp(startWidth + delta, column);
      const widths = { ...this.widths(), [column.field]: Math.round(width) };
      if (this.columnResizeMode() === 'fit' && nextItem?.kind === 'data') {
        widths[nextItem.column.field] = Math.round(clamp(startNext - (width - startWidth), nextItem.column));
      }
      this.widths.set(widths);
    };
    const end = () => {
      handle.removeEventListener('pointermove', move);
      handle.removeEventListener('pointerup', end);
      handle.removeEventListener('pointercancel', end);
      this.resizing.set(null);
      this.columnResize.emit({ field: column.field, width: this.widths()[column.field] ?? startWidth });
      this.saveState();
    };
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', end);
    handle.addEventListener('pointercancel', end);
  }

  resizeValue(column: TxTableColumn): number {
    return this.widths()[column.field] ?? pxOf(column.initialWidth) ?? DEFAULT_COLUMN_WIDTH;
  }

  resizeMin(column: TxTableColumn): number {
    return Math.max(pxOf(column.minWidth) ?? MIN_COLUMN_WIDTH, MIN_COLUMN_WIDTH);
  }

  resizeMax(column: TxTableColumn): number | null {
    return pxOf(column.maxWidth);
  }

  resizeByKey(item: TxTableRenderColumn, step: number, event: Event): void {
    event.preventDefault();
    const th = (event.currentTarget as HTMLElement).closest('th') as HTMLElement;
    const current = this.widths()[item.column.field] ?? th.offsetWidth;
    const width = Math.max(pxOf(item.column.minWidth) ?? MIN_COLUMN_WIDTH, Math.min(pxOf(item.column.maxWidth) ?? Number.MAX_SAFE_INTEGER, current + step));
    this.widths.set({ ...this.widths(), [item.column.field]: width });
    this.columnResize.emit({ field: item.column.field, width });
    this.saveState();
  }

  registerRowActions(row: Element, source: TxTableRowActionsSource): void {
    this.rowActionSources.set(row, source);
  }

  unregisterRowActions(row: Element, source: TxTableRowActionsSource): void {
    if (this.rowActionSources.get(row) === source) this.rowActionSources.delete(row);
  }

  onRowContextMenu(item: TxTableRenderRow<T>, event: MouseEvent | KeyboardEvent): void {
    const own = this.contextMenu();
    if (event instanceof MouseEvent && (event.shiftKey || this.document.getSelection()?.toString())) return;
    const target = event.target as Element | null;
    if (target?.closest('a[href], input, textarea, select, [contenteditable]')) return;
    let items: TxMenuItem[] = [];
    if (own?.length) {
      items = own;
      this.contextMenuSelection.set(item.row);
      this.contextMenuSelect.emit({ row: item.row, index: item.index, originalEvent: event });
    } else if (this.rowContextMenu()) {
      const row = (event.currentTarget as Element) ?? target?.closest('tr');
      const actions = row ? this.rowActionSources.get(row)?.menuActions() : undefined;
      if (!actions?.length) return;
      items = actions.map((action) => ({ id: action.id(), label: action.label(), data: action, command: () => this.triggerAction(action.id()) }));
    }
    if (!items.length) return;
    event.preventDefault();
    this.menuItems.set(items);
    this.menuRowKey.set(item.key);
    this.openMenuAt(event);
  }

  private openMenuAt(event: MouseEvent | KeyboardEvent): void {
    const menu = this.rowMenu();
    if (!menu) return;
    const point =
      event instanceof MouseEvent && (event.clientX || event.clientY)
        ? { x: event.clientX, y: event.clientY }
        : (() => {
            const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
            return { x: rect.left + 16, y: rect.bottom };
          })();
    menu.hide();
    this.anchor?.remove();
    const anchor = this.document.createElement('div');
    Object.assign(anchor.style, { position: 'fixed', left: `${point.x}px`, top: `${point.y}px`, width: '0', height: '0', pointerEvents: 'none' });
    this.document.body.appendChild(anchor);
    this.anchor = anchor;
    menu.show(anchor, 'first', true);
  }

  onMenuClosed(): void {
    this.anchor?.remove();
    this.anchor = null;
    this.menuRowKey.set(undefined);
  }

  actionTemplate(item: TxMenuItem): TxTableAction | null {
    return item.data instanceof TxTableAction ? item.data : null;
  }

  private triggerAction(id: string): void {
    const wrapper = [...this.document.querySelectorAll<HTMLElement>('.tx-table__menu-action')].find((element) => element.dataset['actionId'] === id);
    wrapper?.querySelector<HTMLElement>('button, a')?.click();
  }

  saveState(): void {
    const key = this.stateKey();
    if (!key) return;
    const state: TxTableState = {
      widths: this.widths(),
      order: this.columns().map((column) => column.field),
      hidden: [...this.hidden()],
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
      multiSortMeta: this.multiSortMeta(),
      first: this.first(),
      rows: this.rows(),
      filters: this.filters(),
      globalFilter: this.globalFilter(),
      actionOrder: this.actionsStore.registeredActions().map((item) => item.id),
      pinnedActions: this.actionsStore.pinned() ? [...this.actionsStore.pinnedIds()] : undefined,
    };
    try {
      this.storage()?.setItem(key, JSON.stringify(state));
    } catch {
      return;
    }
  }

  clearState(): void {
    const key = this.stateKey();
    if (key) this.storage()?.removeItem(key);
  }

  private storage(): Storage | null {
    const view = this.document.defaultView;
    try {
      return this.stateStorage() === 'session' ? (view?.sessionStorage ?? null) : (view?.localStorage ?? null);
    } catch {
      return null;
    }
  }

  private restoreState(columns: TxTableColumn[]): void {
    const declaredHidden = new Set(columns.filter((column) => column.hidden).map((column) => column.field));
    const key = this.stateKey();
    let state: TxTableState | null = null;
    if (key) {
      try {
        const raw = this.storage()?.getItem(key);
        state = raw ? (JSON.parse(raw) as TxTableState) : null;
      } catch {
        state = null;
      }
    }
    const widths: Record<string, number> = {};
    columns.forEach((column) => {
      const initial = pxOf(column.initialWidth) ?? pxOf(column.minWidth);
      if (initial !== null) widths[column.field] = initial;
    });
    if (!state) {
      this.hidden.set(declaredHidden);
      this.widths.set(widths);
      return;
    }
    const hidden = new Set(state.hidden ?? [...declaredHidden]);
    this.hidden.set(hidden);
    this.widths.set({ ...widths, ...(state.widths ?? {}) });
    if (state.order?.length) {
      const merged = mergeColumnOrder(columns, state.order, (field) => !hidden.has(field));
      if (merged.some((column, index) => column !== columns[index])) this.columns.set(merged);
    }
    if (state.sortField !== undefined) this.sortField.set(state.sortField);
    if (state.sortOrder !== undefined) this.sortOrder.set(state.sortOrder);
    if (state.multiSortMeta) this.multiSortMeta.set(state.multiSortMeta);
    if (state.rows) this.rows.set(state.rows);
    if (state.first !== undefined) this.first.set(state.first);
    if (state.filters) this.filters.set(state.filters);
    if (state.globalFilter) this.globalFilter.set(state.globalFilter);
    this.actionsStore.restore(state.actionOrder, state.pinnedActions);
  }

  private measureFrozen(row: HTMLTableRowElement): void {
    const cells = [...row.children] as HTMLElement[];
    const items = this.renderColumns();
    const offsets: Record<string, number> = {};
    let start = 0;
    items.forEach((item, index) => {
      if (item.frozen === 'start') {
        offsets[item.column.field] = start;
        start += cells[index]?.offsetWidth ?? 0;
      }
    });
    let end = 0;
    for (let index = items.length - 1; index >= 0; index--) {
      if (items[index].frozen === 'end') {
        offsets[items[index].column.field] = end;
        end += cells[index]?.offsetWidth ?? 0;
      }
    }
    const current = this.frozenOffsets();
    const changed = Object.keys(offsets).length !== Object.keys(current).length || Object.entries(offsets).some(([field, value]) => current[field] !== value);
    if (changed) this.frozenOffsets.set(offsets);
  }
}

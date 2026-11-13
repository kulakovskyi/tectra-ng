import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { ChangeDetectionStrategy, Component, DOCUMENT, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCheckbox } from '@tectra-ng/ui/checkbox';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TX_TABLE } from './table.context';
import { TxTableColumn } from './table.types';
import { columnLabel } from './table.utils';
import { TABLE_ICON_DEFAULTS } from './table.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { TABLE_THEME } from './table.theme';

/** Tab of the table settings popover: `columns` or `actions`. */
type TxTableSettingsTab = 'columns' | 'actions';

/** The settings popover of `tx-table`: show, hide and reorder columns and actions. */
@Component({
  selector: 'tx-table-settings',
  imports: [FormsModule, CdkDropList, CdkDrag, CdkDragHandle, TxIcon, TxButton, TxCheckbox, TxPopover, TxPopoverTrigger, TxTooltip],
  template: `
    <button
      txButton
      type="button"
      size="small"
      icon="cog"
      class="tx-table-settings__button"
      [unstyled]="unstyled()"
      [txTooltip]="translations().tableSettings"
      [attr.aria-label]="translations().tableSettings"
      [txPopoverTrigger]="panel"
    ></button>
    <tx-popover #panel placement="bottom-end" [ariaLabel]="translations().tableSettings" [unstyled]="unstyled()">
      <div class="tx-table-settings__panel">
        @if (tabs().length > 1) {
          <div class="tx-table-settings__tabs" role="tablist">
            @for (tab of tabs(); track tab) {
              <button
                type="button"
                role="tab"
                class="tx-table-settings__tab"
                [id]="id + '-' + tab"
                [attr.aria-selected]="tab === currentTab()"
                [attr.aria-controls]="id + '-panel'"
                [attr.tabindex]="tab === currentTab() ? 0 : -1"
                [txTooltip]="tab === 'columns' ? translations().tableColumnsHint : translations().tableActionsHint"
                (click)="activeTab.set(tab)"
                (keydown.arrowright)="moveTab(1)"
                (keydown.arrowleft)="moveTab(-1)"
              >
                <tx-icon aria-hidden="true" [name]="tab === 'columns' ? 'table' : 'bolt'" />
                {{ tab === 'columns' ? translations().tableColumns : translations().tableActions }}
              </button>
            }
          </div>
        } @else {
          <div class="tx-table-settings__title" [id]="id + '-' + currentTab()">
            <tx-icon aria-hidden="true" [name]="currentTab() === 'columns' ? 'table' : 'bolt'" />
            <span>{{ currentTab() === 'columns' ? translations().tableColumns : translations().tableActions }}</span>
          </div>
        }
        <div
          class="tx-table-settings__list"
          [id]="id + '-panel'"
          [attr.role]="tabs().length > 1 ? 'tabpanel' : 'group'"
          [attr.aria-labelledby]="id + '-' + currentTab()"
        >
          @if (currentTab() === 'columns') {
            <div
              #columnList
              cdkDropList
              class="tx-table-settings__actions"
              [cdkDropListDisabled]="!canReorder()"
              (cdkDropListDropped)="dropColumn($event)"
            >
              @for (column of listedColumns(); track column.field) {
                <div
                  cdkDrag
                  cdkDragLockAxis="y"
                  class="tx-table-settings__action"
                  [cdkDragBoundary]="columnList"
                  [class.tx-table-settings__action--static]="!canReorder() || column.reorderable === false"
                  [cdkDragDisabled]="!canReorder() || column.reorderable === false"
                >
                  @if (canReorder()) {
                    <span
                      cdkDragHandle
                      class="tx-table-settings__handle"
                      [class.tx-table-settings__handle--hidden]="column.reorderable === false"
                      [attr.aria-hidden]="true"
                    >
                      <tx-icon name="bars" />
                    </span>
                  }
                  <tx-checkbox
                    binary
                    [label]="label(column)"
                    [disabled]="column.hideable === false"
                    [ngModel]="!hidden().has(column.field)"
                    (ngModelChange)="columnToggled.emit({ field: column.field, visible: $event })"
                    (keydown.alt.arrowup)="moveColumn(column, -1, $event)"
                    (keydown.alt.arrowdown)="moveColumn(column, 1, $event)"
                  />
                </div>
              }
            </div>
          } @else {
            <div #actionList cdkDropList class="tx-table-settings__actions" (cdkDropListDropped)="dropAction($event)">
              @for (action of store.registeredActions(); track action.id; let index = $index) {
                <div cdkDrag cdkDragLockAxis="y" class="tx-table-settings__action" [cdkDragBoundary]="actionList">
                  <span cdkDragHandle class="tx-table-settings__handle" aria-hidden="true">
                    <tx-icon aria-hidden="true" name="bars" />
                  </span>
                  <tx-checkbox
                    binary
                    [label]="action.label"
                    [ngModel]="store.isPinned(action.id)"
                    (ngModelChange)="store.setPinned(action.id, $event)"
                    (keydown.alt.arrowup)="moveAction(index, -1, $event)"
                    (keydown.alt.arrowdown)="moveAction(index, 1, $event)"
                  />
                </div>
              }
            </div>
          }
        </div>
      </div>
    </tx-popover>
  `,
  styleUrl: './table-settings.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-table-settings' },
  viewProviders: [provideTxIconDefaults(TABLE_ICON_DEFAULTS)],
})
export class TxTableSettings {
  private readonly tableTheme = injectTokens(TABLE_THEME);

  private readonly table = inject(TX_TABLE);
  private readonly document = inject(DOCUMENT);

  readonly columns = input<readonly TxTableColumn[]>([]);
  readonly hidden = input<ReadonlySet<string>>(new Set());
  readonly showColumns = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly showActions = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly unstyled = input(false);

  readonly columnToggled = output<{ field: string; visible: boolean }>();

  readonly id = uniqueId('tx-table-settings');
  readonly translations = injectTranslations();
  readonly store = this.table.actionsStore;
  readonly activeTab = signal<TxTableSettingsTab>('columns');

  readonly canReorder = this.table.reorderableColumns;
  readonly listedColumns = computed(() => this.columns().filter((column) => column.hideable !== false || (this.canReorder() && column.reorderable !== false)));
  readonly tabs = computed<TxTableSettingsTab[]>(() => {
    const tabs: TxTableSettingsTab[] = [];
    if (this.showColumns()) tabs.push('columns');
    if (this.showActions() && this.store.registeredActions().length) tabs.push('actions');
    return tabs;
  });
  readonly currentTab = computed(() => (this.tabs().includes(this.activeTab()) ? this.activeTab() : (this.tabs()[0] ?? 'columns')));

  label(column: TxTableColumn): string {
    return columnLabel(column);
  }

  moveTab(step: number): void {
    const tabs = this.tabs();
    const next = tabs[(tabs.indexOf(this.currentTab()) + step + tabs.length) % tabs.length];
    this.activeTab.set(next);
    this.document.getElementById(`${this.id}-${next}`)?.focus();
  }

  dropColumn(event: CdkDragDrop<unknown>): void {
    const columns = this.listedColumns();
    const from = columns[event.previousIndex];
    const to = columns[event.currentIndex];
    if (from && to && to.reorderable !== false) this.table.reorderColumn(from.field, to.field);
  }

  moveColumn(column: TxTableColumn, step: number, event: Event): void {
    if (!this.canReorder() || column.reorderable === false) return;
    event.preventDefault();
    const columns = this.listedColumns();
    const target = columns[columns.indexOf(column) + step];
    if (!target || target.reorderable === false) return;
    this.table.reorderColumn(column.field, target.field);
    const field = column.field;
    setTimeout(() => {
      const index = this.listedColumns().findIndex((item) => item.field === field);
      this.document.querySelectorAll<HTMLElement>(`#${this.id}-panel .tx-table-settings__action input`)[index]?.focus();
    });
  }

  moveAction(index: number, step: number, event: Event): void {
    const target = index + step;
    if (target < 0 || target >= this.store.registeredActions().length) return;
    event.preventDefault();
    this.store.reorder(index, target);
    setTimeout(() => this.document.querySelectorAll<HTMLElement>(`#${this.id}-panel .tx-table-settings__action input`)[target]?.focus());
  }

  dropAction(event: CdkDragDrop<unknown>): void {
    this.store.reorder(event.previousIndex, event.currentIndex);
  }
}

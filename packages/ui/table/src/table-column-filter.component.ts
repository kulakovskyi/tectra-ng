import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { TxTranslations } from '@tectra-ng/core/config';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDatePicker } from '@tectra-ng/ui/datepicker';
import { TxInput } from '@tectra-ng/ui/input';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxMenu, TxMenuItem, TxMenuTrigger } from '@tectra-ng/ui/menu';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxSelect } from '@tectra-ng/ui/select';
import { TX_TABLE } from './table.context';
import { TX_FILTER_MATCH_MODES, defaultMatchMode, isFilterActive } from './table.filter';
import { TxColumnFilter, TxFilterMatchMode, TxFilterOperator, TxFilterRule, TxTableColumn, TxTableFilterDisplay } from './table.types';
import { columnLabel } from './table.utils';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TABLE_ICON_DEFAULTS } from './table.icons';

const MAX_RULES = 2;

function toDate(value: unknown): Date | null {
  return value instanceof Date && !Number.isNaN(value.getTime()) ? value : null;
}

@Component({
  selector: 'tx-table-column-filter',
  imports: [NgTemplateOutlet, FormsModule, TxButton, TxDatePicker, TxInput, TxInputNumber, TxSelect, TxMultiselect, TxPopover, TxPopoverTrigger, TxMenu, TxMenuTrigger],
  template: `
    <ng-template #pending>
      <input txInput type="text" size="small" class="tx-table-filter__value" readonly tabindex="-1" aria-hidden="true" [placeholder]="column().filterPlaceholder ?? ''" />
    </ng-template>

    <ng-template #editor let-rule let-index="index" let-live="live">
      @switch (type()) {
        @case ('numeric') {
          @defer (on immediate) {
            <tx-input-number
              size="small"
              class="tx-table-filter__value"
              [ariaLabel]="valueLabel()"
              [placeholder]="column().filterPlaceholder"
              [ngModel]="rule.value"
              (ngModelChange)="setValue(index, $event, live)"
            />
          } @placeholder {
            <ng-container [ngTemplateOutlet]="pending" />
          }
        }
        @case ('date') {
          @defer (on immediate) {
            <tx-datepicker
              size="small"
              class="tx-table-filter__value"
              [ariaLabel]="valueLabel()"
              [placeholder]="column().filterPlaceholder"
              [showClear]="true"
              [ngModel]="dateValue(rule.value)"
              (ngModelChange)="setValue(index, $event, live)"
            />
          } @placeholder {
            <ng-container [ngTemplateOutlet]="pending" />
          }
        }
        @case ('boolean') {
          <tx-select
            size="small"
            class="tx-table-filter__value"
            optionLabel="label"
            optionValue="value"
            [options]="booleanOptions()"
            [ariaLabel]="valueLabel()"
            [ngModel]="rule.value"
            (ngModelChange)="setValue(index, $event, true)"
          />
        }
        @case ('options') {
          @defer (on immediate) {
            <tx-multiselect
              size="small"
              class="tx-table-filter__value"
              optionLabel="label"
              optionValue="value"
              [maxSelectedLabels]="2"
              [options]="column().filterOptions ?? []"
              [ariaLabel]="valueLabel()"
              [placeholder]="column().filterPlaceholder ?? translations().filterAny"
              [ngModel]="rule.value ?? []"
              (ngModelChange)="setValue(index, $event, live)"
            />
          } @placeholder {
            <ng-container [ngTemplateOutlet]="pending" />
          }
        }
        @default {
          <input
            txInput
            type="text"
            size="small"
            class="tx-table-filter__value"
            [attr.aria-label]="valueLabel()"
            [placeholder]="column().filterPlaceholder"
            [value]="rule.value ?? ''"
            (input)="setValue(index, $any($event.target).value, live)"
            (keydown.enter)="apply()"
          />
        }
      }
    </ng-template>

    @if (display() === 'row') {
      <div class="tx-table-filter__row">
        <ng-container [ngTemplateOutlet]="editor" [ngTemplateOutletContext]="{ $implicit: live().rules[0], index: 0, live: true }" />
        @if (modes().length > 1) {
          <button
            txButton
            type="button"
            text
            rounded
            size="small"
            severity="secondary"
            class="tx-table-filter__button"
            [class.tx-table-filter__button--active]="active()"
            [icon]="active() ? 'filter-fill' : 'filter'"
            [attr.aria-label]="buttonLabel()"
            [txMenuTrigger]="modeMenu"
          ></button>
          <tx-menu #modeMenu popup [model]="modeItems()" [ariaLabel]="translations().filterMatchMode" />
        }
      </div>
    } @else {
      <button
        txButton
        type="button"
        text
        rounded
        size="small"
        severity="secondary"
        class="tx-table-filter__button"
        [class.tx-table-filter__button--active]="active()"
        [icon]="active() ? 'filter-fill' : 'filter'"
        [attr.aria-label]="buttonLabel()"
        [txPopoverTrigger]="panel"
        (click)="$event.stopPropagation()"
      ></button>
      <tx-popover #panel placement="bottom-start" [ariaLabel]="buttonLabel()" (opened)="startDraft()">
        <div class="tx-table-filter">
          @if (type() === 'boolean' || type() === 'options') {
            <ng-container [ngTemplateOutlet]="editor" [ngTemplateOutletContext]="{ $implicit: draft().rules[0], index: 0, live: false }" />
          } @else {
            @if (draft().rules.length > 1) {
              <tx-select
                size="small"
                optionLabel="label"
                optionValue="value"
                [options]="operatorOptions()"
                [ariaLabel]="translations().filterMatchAll + ' / ' + translations().filterMatchAny"
                [ngModel]="draft().operator"
                (ngModelChange)="setOperator($event)"
              />
            }
            @for (rule of draft().rules; track $index; let index = $index) {
              <div class="tx-table-filter__rule">
                @if (modes().length > 1) {
                  <tx-select
                    size="small"
                    optionLabel="label"
                    optionValue="value"
                    [options]="modeOptions()"
                    [ariaLabel]="translations().filterMatchMode"
                    [ngModel]="rule.matchMode"
                    (ngModelChange)="setMode(index, $event)"
                  />
                }
                <ng-container [ngTemplateOutlet]="editor" [ngTemplateOutletContext]="{ $implicit: rule, index, live: false }" />
                @if (draft().rules.length > 1) {
                  <button
                    txButton
                    type="button"
                    text
                    size="small"
                    severity="danger"
                    icon="trash"
                    [label]="translations().filterRemoveRule"
                    (click)="removeRule(index)"
                  ></button>
                }
              </div>
            }
            @if (draft().rules.length < maxRules) {
              <button txButton type="button" text size="small" icon="plus" [label]="translations().filterAddRule" (click)="addRule()"></button>
            }
          }
          <div class="tx-table-filter__footer">
            <button txButton type="button" outlined size="small" severity="secondary" [label]="translations().clear" (click)="clear()"></button>
            <button txButton type="button" size="small" [label]="translations().filterApply" (click)="apply()"></button>
          </div>
        </div>
      </tx-popover>
    }
  `,
  styles: `
    :host {
      display: inline-flex;
      min-width: 0;
    }

    :host(.tx-table-column-filter--row) {
      display: flex;
      width: 100%;
    }

    .tx-table-filter__row {
      display: flex;
      flex: 1;
      align-items: center;
      gap: var(--tx-table-filter-gap, 7px);
      min-width: 0;
    }

    .tx-table-filter__row .tx-table-filter__value {
      flex: 1;
      min-width: 0;
      width: 100%;
    }

    .tx-table-filter {
      display: flex;
      flex-direction: column;
      gap: var(--tx-table-filter-gap, 7px);
      min-width: var(--tx-table-filter-min-width, 175px);
    }

    .tx-table-filter__rule {
      display: flex;
      flex-direction: column;
      gap: var(--tx-table-filter-gap, 7px);
      padding-bottom: var(--tx-table-filter-gap, 7px);
      border-bottom: 1px solid var(--tx-surface-border);
    }

    .tx-table-filter__rule:last-of-type {
      padding-bottom: 0;
      border-bottom: 0;
    }

    .tx-table-filter__footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--tx-table-filter-gap, 7px);
    }

    .tx-table-filter__value {
      width: 100%;
    }

    .tx-table-filter__button--active {
      color: var(--tx-primary-base);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-table-column-filter',
    '[class.tx-table-column-filter--row]': "display() === 'row'",
  },
  viewProviders: [provideTxIconDefaults(TABLE_ICON_DEFAULTS)],
})
export class TxTableColumnFilter {
  private readonly table = inject(TX_TABLE);
  private readonly panel = viewChild<TxPopover>('panel');
  private timer: ReturnType<typeof setTimeout> | undefined;

  readonly column = input.required<TxTableColumn>();
  readonly display = input<TxTableFilterDisplay>('menu');

  readonly maxRules = MAX_RULES;
  readonly translations = injectTranslations();
  readonly type = computed(() => (this.column().filterOptions?.length ? 'options' : (this.column().filterType ?? 'text')));
  readonly modes = computed<TxFilterMatchMode[]>(() =>
    this.type() === 'options' || this.type() === 'boolean' ? [] : (this.column().filterMatchModes ?? TX_FILTER_MATCH_MODES[this.column().filterType ?? 'text']),
  );
  readonly current = computed(() => this.table.filters()[this.column().field]);
  readonly active = computed(() => isFilterActive(this.current()));
  readonly draft = signal<TxColumnFilter>({ operator: 'and', rules: [{ value: null, matchMode: 'startsWith' }] });
  readonly live = computed(() => this.current() ?? this.empty());

  readonly modeOptions = computed(() => this.modes().map((mode) => ({ value: mode, label: this.translations()[mode as keyof TxTranslations] })));
  readonly operatorOptions = computed(() => [
    { value: 'and', label: this.translations().filterMatchAll },
    { value: 'or', label: this.translations().filterMatchAny },
  ]);
  readonly booleanOptions = computed(() => [
    { value: null, label: this.translations().filterAny },
    { value: true, label: this.translations().yes },
    { value: false, label: this.translations().no },
  ]);
  readonly modeItems = computed<TxMenuItem[]>(() => {
    const selected = this.live().rules[0]?.matchMode;
    return this.modeOptions().map((option) => ({
      id: option.value,
      label: option.label,
      icon: option.value === selected ? 'check' : undefined,
      command: () => this.setLiveMode(option.value),
    }));
  });
  readonly buttonLabel = computed(() => this.translations().filterColumn.replace('{column}', columnLabel(this.column())));
  readonly valueLabel = computed(() => `${columnLabel(this.column())}: ${this.translations().filterValue}`);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
  }

  private empty(): TxColumnFilter {
    return { operator: 'and', rules: [{ value: null, matchMode: defaultMatchMode(this.column()) }] };
  }

  startDraft(): void {
    const current = this.current();
    this.draft.set(current ? { operator: current.operator, rules: current.rules.map((rule) => ({ ...rule })) } : this.empty());
  }

  dateValue(value: unknown): Date | null {
    return toDate(value);
  }

  setValue(index: number, value: unknown, live: boolean): void {
    if (live) {
      const filter = this.live();
      const rules = filter.rules.map((rule, position) => (position === index ? { ...rule, value } : rule));
      clearTimeout(this.timer);
      const commit = () => this.table.applyFilter(this.column().field, { ...filter, rules });
      if (this.type() === 'text') this.timer = setTimeout(commit, this.table.filterDelay());
      else commit();
      return;
    }
    this.updateRules((rules) => rules.map((rule, position) => (position === index ? { ...rule, value } : rule)));
  }

  setMode(index: number, matchMode: TxFilterMatchMode): void {
    this.updateRules((rules) => rules.map((rule, position) => (position === index ? { ...rule, matchMode } : rule)));
  }

  setLiveMode(matchMode: TxFilterMatchMode): void {
    const filter = this.live();
    this.table.applyFilter(this.column().field, { ...filter, rules: filter.rules.map((rule, index) => (index === 0 ? { ...rule, matchMode } : rule)) });
  }

  setOperator(operator: TxFilterOperator): void {
    this.draft.set({ ...this.draft(), operator });
  }

  addRule(): void {
    this.updateRules((rules) => [...rules, { value: null, matchMode: defaultMatchMode(this.column()) }]);
  }

  removeRule(index: number): void {
    this.updateRules((rules) => rules.filter((_, position) => position !== index));
  }

  apply(): void {
    this.table.applyFilter(this.column().field, this.draft());
    this.panel()?.hide();
  }

  clear(): void {
    this.draft.set(this.empty());
    this.table.applyFilter(this.column().field, null);
    this.panel()?.hide();
  }

  private updateRules(change: (rules: TxFilterRule[]) => TxFilterRule[]): void {
    this.draft.set({ ...this.draft(), rules: change(this.draft().rules) });
  }
}

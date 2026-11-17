import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxFiltersReset,
  TxHasFilterValuePipe,
  provideTxFiltersPanelRelay,
} from '@tectra-ng/blocks/filters-panel';
import { TxButton } from '@tectra-ng/ui/button';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

interface FilterDefinition {
  key: string;
  label: string;
  options: string[];
}

@Component({
  selector: 'list-filters',
  imports: [TxFiltersPanel],
  providers: [provideTxFiltersPanelRelay()],
  template: `
    <tx-filters-panel [ariaLabel]="label()" [stateKey]="stateKey()" [defaultVisible]="2">
      <ng-content />
      <ng-content select="[txFiltersActions]" ngProjectAs="[txFiltersActions]" />
    </tx-filters-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFilters {
  readonly label = input('');
  readonly stateKey = input<string | undefined>(undefined);
}

@Component({
  selector: 'filters-panel-wrapper-example',
  imports: [
    FormsModule,
    ListFilters,
    TxFilterField,
    TxFiltersReset,
    TxHasFilterValuePipe,
    TxButton,
    TxLabel,
    TxSelect,
    TxTooltip,
  ],
  template: `
    <list-filters label="Server filters" stateKey="docs-filters-panel-wrapper">
      @for (filter of filters; track filter.key) {
        <div
          [txFilterField]="filter.key"
          [filterLabel]="filter.label"
          [filterActive]="values()[filter.key] | hasFilterValue"
        >
          <tx-label subtle [for]="'wrapper-' + filter.key">{{ filter.label }}</tx-label>
          <tx-select
            showClear
            placeholder="Any"
            [inputId]="'wrapper-' + filter.key"
            [options]="filter.options"
            [ngModel]="values()[filter.key]"
            (ngModelChange)="set(filter.key, $event)"
          />
        </div>
      }
      <button
        txButton
        txFiltersActions
        txFiltersReset
        icon="filter-slash"
        severity="warn"
        aria-label="Clear filters"
        txTooltip="Clear filters"
        (click)="values.set({})"
      ></button>
    </list-filters>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelWrapperExample {
  readonly filters: FilterDefinition[] = [
    { key: 'region', label: 'Region', options: ['Europe', 'North America', 'Asia'] },
    { key: 'status', label: 'Status', options: ['Running', 'Stopped', 'Failed'] },
    { key: 'size', label: 'Size', options: ['Small', 'Medium', 'Large'] },
    { key: 'image', label: 'Image', options: ['Ubuntu', 'Debian', 'Alpine'] },
  ];
  readonly values = signal<Record<string, string | null>>({});

  set(key: string, value: string | null): void {
    this.values.update((values) => ({ ...values, [key]: value }));
  }
}

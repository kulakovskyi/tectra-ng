import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TxFilterField,
  TxFiltersPanel,
  TxHasFilterValuePipe,
} from '@tectra-ng/blocks/filters-panel';
import { TxInput } from '@tectra-ng/ui/input';
import { TxLabel } from '@tectra-ng/ui/label';
import { TxSelect } from '@tectra-ng/ui/select';

@Component({
  selector: 'filters-panel-design-tokens-example',
  imports: [
    FormsModule,
    TxFiltersPanel,
    TxFilterField,
    TxHasFilterValuePipe,
    TxInput,
    TxLabel,
    TxSelect,
  ],
  template: `
    <tx-filters-panel
      ariaLabel="Article filters"
      stateKey="docs-filters-panel-tokens"
      [dt]="{
        root: {
          background: 'var(--tx-surface-ground)',
          borderColor: 'transparent',
          padding: '12px',
        },
        fields: { rowGap: '10px' },
        menu: { width: '260px', rowHoverBackground: 'var(--tx-surface-hover)' },
      }"
    >
      <div txFilterField="title" filterLabel="Title" [filterActive]="title() | hasFilterValue">
        <tx-label subtle for="tokens-title">Title</tx-label>
        <input txInput id="tokens-title" placeholder="Search titles" [(ngModel)]="title" />
      </div>
      <div txFilterField="author" filterLabel="Author" [filterActive]="author() | hasFilterValue">
        <tx-label subtle for="tokens-author">Author</tx-label>
        <tx-select
          inputId="tokens-author"
          placeholder="Anyone"
          showClear
          [options]="authors"
          [(ngModel)]="author"
        />
      </div>
      <div txFilterField="topic" filterLabel="Topic" [filterActive]="topic() | hasFilterValue">
        <tx-label subtle for="tokens-topic">Topic</tx-label>
        <tx-select
          inputId="tokens-topic"
          placeholder="Any topic"
          showClear
          [options]="topics"
          [(ngModel)]="topic"
        />
      </div>
      <div txFilterField="state" filterLabel="State" [filterActive]="state() | hasFilterValue">
        <tx-label subtle for="tokens-state">State</tx-label>
        <tx-select
          inputId="tokens-state"
          placeholder="Any state"
          showClear
          [options]="states"
          [(ngModel)]="state"
        />
      </div>
    </tx-filters-panel>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class FiltersPanelDesignTokensExample {
  readonly authors = [
    { label: 'Nina Holt', value: 'nina' },
    { label: 'Pavlo Rudenko', value: 'pavlo' },
  ];
  readonly topics = [
    { label: 'Guides', value: 'guides' },
    { label: 'News', value: 'news' },
    { label: 'Releases', value: 'releases' },
  ];
  readonly states = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ];
  readonly title = signal('');
  readonly author = signal<string | null>(null);
  readonly topic = signal<string | null>(null);
  readonly state = signal<string | null>(null);
}

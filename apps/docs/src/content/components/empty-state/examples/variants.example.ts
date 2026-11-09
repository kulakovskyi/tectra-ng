import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';

@Component({
  selector: 'empty-state-variants-example',
  imports: [TxEmptyState, TxButton, TxCard],
  template: `
    <div class="column">
      <tx-empty-state
        variant="framed"
        icon="folder"
        title="No projects"
        text="Projects group your domains, reports and people."
      >
        <button txButton icon="plus">New project</button>
      </tx-empty-state>
      <tx-card title="Recent activity">
        <tx-empty-state
          variant="inset"
          icon="history"
          tone="neutral"
          text="Activity of the last 30 days shows here."
        />
      </tx-card>
      <tx-empty-state icon="bell" tone="neutral" title="No notifications" />
    </div>
  `,
  styles: `
    .column {
      display: flex;
      width: 100%;
      flex-direction: column;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class EmptyStateVariantsExample {}

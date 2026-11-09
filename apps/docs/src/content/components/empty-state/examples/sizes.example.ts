import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxEmptyState } from '@tectra-ng/blocks/empty-state';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'empty-state-sizes-example',
  imports: [TxEmptyState, TxButton],
  template: `
    <div class="column">
      <tx-empty-state
        size="compact"
        variant="inset"
        icon="chart-bar"
        title="No data yet"
        text="The widget fills after the first visit."
      />
      <tx-empty-state
        variant="inset"
        icon="users"
        title="No members"
        text="Invite people to work together."
      />
      <tx-empty-state
        size="large"
        variant="inset"
        icon="sparkles"
        title="Welcome aboard"
        text="Connect your first source and the dashboard builds itself."
      >
        <button txButton icon="link">Connect a source</button>
      </tx-empty-state>
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
export default class EmptyStateSizesExample {}

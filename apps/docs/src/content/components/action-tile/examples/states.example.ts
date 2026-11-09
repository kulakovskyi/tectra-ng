import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxActionTile } from '@tectra-ng/blocks/action-tile';

@Component({
  selector: 'action-tile-states-example',
  imports: [TxActionTile],
  template: `
    <div class="tiles">
      <tx-action-tile icon="upload" title="Import from a file" text="CSV or XLSX, up to 10 MB" />
      <tx-action-tile
        title="Start from scratch"
        text="An empty project with the default settings"
      />
      <tx-action-tile icon="building" title="Copy a project" />
      <tx-action-tile
        icon="shield"
        title="Single sign-on"
        text="Available on the business plan"
        disabled
      />
      <tx-action-tile icon="question-circle" title="Checking access" loading />
    </div>
  `,
  styles: `
    .tiles {
      display: flex;
      flex-direction: column;
      gap: 10.5px;
      width: 100%;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionTileStatesExample {}

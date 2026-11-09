import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxActionTile } from '@tectra-ng/blocks/action-tile';

@Component({
  selector: 'action-tile-design-tokens-example',
  imports: [TxActionTile],
  template: `
    <tx-action-tile
      class="tile"
      icon="file-import"
      title="Import contacts"
      text="From a CSV file or another account"
      [dt]="{
        root: { padding: '17.5px', borderRadius: '14px' },
        icon: { size: '42px', borderRadius: '999px' },
        title: { fontSize: '15px' },
      }"
    />
  `,
  styles: `
    .tile {
      width: 100%;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionTileDesignTokensExample {}

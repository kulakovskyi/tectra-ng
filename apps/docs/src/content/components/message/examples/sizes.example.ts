import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'message-sizes-example',
  imports: [TxMessage],
  template: `
    <div class="list">
      <tx-message size="small" icon="info-circle" text="Small" />
      <tx-message icon="info-circle" text="Medium" />
      <tx-message size="large" icon="info-circle" text="Large" />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .list {
      display: grid;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageSizesExample {}

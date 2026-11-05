import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMessage } from '@tectra/ui/message';

@Component({
  selector: 'message-variants-example',
  imports: [TxMessage],
  template: `
    <div class="list">
      <tx-message severity="warn" icon="exclamation-triangle" text="Default — tinted box" />
      <tx-message severity="warn" icon="exclamation-triangle" variant="outlined" text="Outlined" />
      <tx-message severity="warn" icon="exclamation-triangle" variant="text" text="Text" />
      <tx-message severity="warn" icon="exclamation-triangle" variant="simple" text="Simple" />
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
export default class MessageVariantsExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMessage, TxMessageIconTemplate } from '@tectra/ui/message';

@Component({
  selector: 'message-icons-example',
  imports: [TxMessage, TxMessageIconTemplate],
  template: `
    <div class="list">
      <tx-message text="No icon" />
      <tx-message icon="shield" text="Tectra icon name" />
      <tx-message icon="pi-cloud-upload" text="PrimeIcons name with the pi- prefix" />
      <tx-message severity="success">
        <ng-template txMessageIcon><span class="count">3</span></ng-template>
        Own icon template — three files uploaded.
      </tx-message>
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

    .count {
      font-weight: 700;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MessageIconsExample {}

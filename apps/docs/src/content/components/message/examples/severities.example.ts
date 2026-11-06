import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMessage } from '@tectra-ng/ui/message';

@Component({
  selector: 'message-severities-example',
  imports: [TxMessage],
  template: `
    <div class="list">
      <tx-message severity="info" icon="info-circle" text="Your changes are saved as a draft." />
      <tx-message severity="success" icon="check-circle" text="The domain is connected." />
      <tx-message
        severity="warn"
        icon="exclamation-triangle"
        text="The certificate expires in 5 days."
      />
      <tx-message severity="danger" icon="times-circle" text="The payment was declined." />
      <tx-message severity="secondary" icon="lock" text="Only owners can change this setting." />
      <tx-message severity="primary" icon="star" text="New: export reports to CSV." />
      <tx-message severity="help" icon="question-circle" text="Need a hand? Open the guide." />
      <tx-message severity="contrast" icon="bell" text="Maintenance tonight from 02:00." />
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
export default class MessageSeveritiesExample {}

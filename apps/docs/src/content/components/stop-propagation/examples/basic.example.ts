import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxCard } from '@tectra-ng/ui/card';
import { TxStopPropagation } from '@tectra-ng/utils/stop-propagation';

@Component({
  selector: 'stop-propagation-basic-example',
  imports: [TxButton, TxCard, TxStopPropagation],
  template: `
    <div class="stack">
      <tx-card
        class="card"
        title="Quarterly report"
        subtitle="Updated today"
        (click)="opened.update((count) => count + 1)"
      >
        <button
          txButton
          text
          rounded
          txStopPropagation
          [icon]="starred() ? 'star-fill' : 'star'"
          [attr.aria-pressed]="starred()"
          aria-label="Star"
          (click)="starred.set(!starred())"
        ></button>
      </tx-card>
      <span class="hint"
        >Opened {{ opened() }} times · {{ starred() ? 'starred' : 'not starred' }}</span
      >
    </div>
  `,
  styles: `
    .card {
      cursor: pointer;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class StopPropagationBasicExample {
  readonly opened = signal(0);
  readonly starred = signal(false);
}

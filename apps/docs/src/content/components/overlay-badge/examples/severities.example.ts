import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxBadgeSeverity } from '@tectra-ng/ui/badge';
import { TxOverlayBadge } from '@tectra-ng/ui/overlay-badge';

@Component({
  selector: 'overlay-badge-severities-example',
  imports: [TxOverlayBadge, TxIcon],
  template: `
    <div class="row">
      @for (severity of severities; track severity) {
        <tx-overlay-badge [value]="3" [severity]="severity"
          ><tx-icon name="inbox" class="icon"
        /></tx-overlay-badge>
      }
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 32px;
    }

    .icon {
      font-size: 24px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class OverlayBadgeSeveritiesExample {
  readonly severities: TxBadgeSeverity[] = [
    'primary',
    'secondary',
    'success',
    'info',
    'warn',
    'danger',
    'help',
    'contrast',
  ];
}

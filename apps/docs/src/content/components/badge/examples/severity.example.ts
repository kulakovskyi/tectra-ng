import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBadge } from '@tectra/ui/badge';

@Component({
  selector: 'badge-severity-example',
  imports: [TxBadge],
  template: `
    <div class="flex">
      <tx-badge [value]="'primary'" />
      <tx-badge [value]="'secondary'" [severity]="'secondary'" />
      <tx-badge [value]="'success'" [severity]="'success'" />
      <tx-badge [value]="'info'" [severity]="'info'" />
      <tx-badge [value]="'warn'" [severity]="'warn'" />
      <tx-badge [value]="'danger'" [severity]="'danger'" />
      <tx-badge [value]="'help'" [severity]="'help'" />
      <tx-badge [value]="'contrast'" [severity]="'contrast'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BadgeSeverityExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'button-badge-example',
  imports: [TxButton],
  template: `
    <div class="flex">
      <button txButton [badge]="3">Inbox</button>
      <button txButton [outlined]="true" [badge]="12" [icon]="'bell'">Alerts</button>
      <button txButton [severity]="'secondary'" [badge]="2" [badgeSeverity]="'danger'">
        Errors
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonBadgeExample {}

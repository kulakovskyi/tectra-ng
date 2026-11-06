import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxButton, TxButtonIconTemplate } from '@tectra-ng/ui/button';

@Component({
  selector: 'button-template-example',
  imports: [TxButton, TxButtonIconTemplate],
  template: `
    <div class="flex">
      <button txButton [severity]="'secondary'">
        <ng-template txButtonIcon><span>🚀</span></ng-template>
        Launch
      </button>
      <button txButton [outlined]="true">
        <ng-template txButtonIcon>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <circle cx="12" cy="12" r="6" />
          </svg>
        </ng-template>
        Custom SVG
      </button>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ButtonTemplateExample {}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanel } from '@tectra/ui/panel';
import { TxButton } from '@tectra/ui/button';

@Component({
  selector: 'panel-align-example',
  imports: [TxPanel, TxButton],
  template: `
    <div class="panels">
      @for (align of aligns; track align) {
        <tx-panel
          variant="inset"
          [title]="'align ' + align"
          subtitle="A second line under the title"
          icon="sliders-h"
          [align]="align"
        >
          <button txPanelActions txButton size="small" variant="outlined">Edit</button>
        </tx-panel>
      }
    </div>
  `,
  styles: `
    .panels {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelAlignExample {
  readonly aligns = ['start', 'center', 'end'] as const;
}

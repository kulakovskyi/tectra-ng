import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPlacement } from '@tectra/core/overlay';
import { TxButton } from '@tectra/ui/button';
import { TxTooltip } from '@tectra/ui/tooltip';

@Component({
  selector: 'tooltip-placements-example',
  imports: [TxTooltip, TxButton],
  template: `
    <div class="grid">
      @for (placement of placements; track placement) {
        <button
          txButton
          size="small"
          severity="secondary"
          [outlined]="true"
          [txTooltip]="placement"
          [tooltipPlacement]="placement"
        >
          {{ placement }}
        </button>
      }
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(3, max-content);
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipPlacementsExample {
  readonly placements: TxPlacement[] = [
    'top-start',
    'top',
    'top-end',
    'bottom-start',
    'bottom',
    'bottom-end',
    'left-start',
    'left',
    'left-end',
    'right-start',
    'right',
    'right-end',
  ];
}

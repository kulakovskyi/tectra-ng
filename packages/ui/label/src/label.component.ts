import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';

@Component({
  selector: 'tx-label',
  imports: [TxIcon],
  template: `
    <label class="tx-label__text" [attr.for]="for() ?? null">
      <ng-content />@if (colon()) {:}
      @if (required()) {
        <span class="tx-label__required" aria-hidden="true">*</span>
      }
      @if (tooltip(); as tooltip) {
        <span class="tx-label__hint" role="img" tabindex="0" [title]="tooltip" [attr.aria-label]="tooltip"><tx-icon [name]="'info-circle'" /></span>
      }
    </label>
  `,
  styleUrl: './label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-label', '[class.tx-label--subtle]': 'subtle()' },
})
export class TxLabel {
  readonly for = input<string | undefined>(undefined);
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly colon = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly subtle = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltip = input<string | undefined>(undefined);
}

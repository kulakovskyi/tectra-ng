import { ChangeDetectionStrategy, Component, booleanAttribute, input } from '@angular/core';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { LABEL_ICON_DEFAULTS } from './label.icons';
import { injectTokens } from '@tectra-ng/core/config';
import { LABEL_THEME } from './label.theme';

@Component({
  selector: 'tx-label',
  imports: [TxIcon, TxTooltip],
  template: `
    <label class="tx-label__text" [attr.for]="for() ?? null">
      <ng-content />@if (colon()) {:}
      @if (required()) {
        <span class="tx-label__required" aria-hidden="true">*</span>
      }
      @if (tooltip(); as tooltip) {
        <span class="tx-label__hint" role="img" tabindex="0" [txTooltip]="tooltip" [attr.aria-label]="tooltip"><tx-icon [name]="'info-circle'" /></span>
      }
      @if (filled()) {
        <span class="tx-label__filled" aria-hidden="true"><tx-icon [name]="'check'" /></span>
      }
    </label>
  `,
  styleUrl: './label.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-label', '[class.tx-label--subtle]': 'subtle()', '[class.tx-label--filled]': 'filled()' },
  viewProviders: [provideTxIconDefaults(LABEL_ICON_DEFAULTS)],
})
export class TxLabel {
  private readonly labelTheme = injectTokens(LABEL_THEME);

  readonly for = input<string | undefined>(undefined);
  readonly required = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly colon = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly subtle = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly filled = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly tooltip = input<string | undefined>(undefined);
}

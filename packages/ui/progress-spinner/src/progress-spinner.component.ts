import { ChangeDetectionStrategy, Component, computed, input, numberAttribute } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraProgressSpinnerTokens, toStyleObject } from '@tectra-ng/themes';
import { TxProgressSpinnerPart, TxProgressSpinnerSize } from './progress-spinner.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { PROGRESS_SPINNER_ICON_DEFAULTS } from './progress-spinner.icons';
import { PROGRESS_SPINNER_THEME } from './progress-spinner.theme';

@Component({
  selector: 'tx-progress-spinner',
  template: `
    <svg class="tx-progress-spinner__svg" viewBox="0 0 50 50" aria-hidden="true" [class]="passThrough().svg?.class" [style]="passThrough().svg?.style">
      <circle class="tx-progress-spinner__track" cx="25" cy="25" [attr.r]="radius()" [attr.stroke-width]="strokeWidth()" [attr.fill]="fill()" [class]="passThrough().track?.class" />
      <circle class="tx-progress-spinner__circle" cx="25" cy="25" fill="none" [attr.r]="radius()" [attr.stroke-width]="strokeWidth()" [class]="passThrough().circle?.class" />
    </svg>
  `,
  styleUrl: './progress-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-progress-spinner',
    role: 'progressbar',
    'aria-busy': 'true',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'presetSize()',
    '[attr.aria-label]': 'ariaLabel() ?? translations().loading',
  },
  viewProviders: [provideTxIconDefaults(PROGRESS_SPINNER_ICON_DEFAULTS)],
})
export class TxProgressSpinner {
  private readonly progressSpinnerTheme = injectTokens(PROGRESS_SPINNER_THEME);

  readonly size = input<TxProgressSpinnerSize | number>('medium');
  readonly strokeWidth = input<number, unknown>(4, { transform: numberAttribute });
  readonly fill = input<string>('none');
  readonly animationDuration = input<string | undefined>(undefined);
  readonly color = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraProgressSpinnerTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxProgressSpinnerPart, TxProgressSpinner> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('progressSpinner', this, this.pt, this.ptOptions);
  readonly presetSize = computed(() => (typeof this.size() === 'number' ? null : this.size()));
  readonly radius = computed(() => 25 - this.strokeWidth() / 2);
  readonly hostStyle = computed(() => {
    const size = this.size();
    return {
      ...toStyleObject(this.dt(), '--tx-progress-spinner'),
      ...(typeof size === 'number' ? { '--tx-progress-spinner-size': `${size}px` } : {}),
      ...(this.color() ? { '--tx-progress-spinner-color': this.color() } : {}),
      ...(this.animationDuration() ? { '--tx-progress-spinner-duration': this.animationDuration() } : {}),
      ...this.passThrough().root?.style,
    };
  });
}

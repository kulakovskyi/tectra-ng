import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { TxLocaleService, injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TectraDeepPartial, TectraProgressBarTokens, toStyleObject } from '@tectra/themes';
import { TxProgressBarValueTemplate } from './progress-bar-templates.directive';
import { TxProgressBarMode, TxProgressBarPart, TxProgressBarSeverity, TxProgressBarSize } from './progress-bar.types';

@Component({
  selector: 'tx-progress-bar',
  imports: [NgTemplateOutlet],
  template: `
    <div class="tx-progress-bar__track" [class]="passThrough().track?.class" [style]="passThrough().track?.style">
      <div class="tx-progress-bar__value" [class]="passThrough().value?.class" [style]="passThrough().value?.style" [style.width.%]="mode() === 'determinate' ? percent() : null"></div>
    </div>
    @if (showValue() && mode() === 'determinate') {
      <span class="tx-progress-bar__label" aria-hidden="true" [class]="passThrough().label?.class" [style]="passThrough().label?.style">
        @if (template(); as template) {
          <ng-container [ngTemplateOutlet]="template.templateRef" [ngTemplateOutletContext]="{ $implicit: clamped(), percent: percent() }" />
        } @else {
          {{ text() }}
        }
      </span>
    }
  `,
  styleUrl: './progress-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-progress-bar',
    role: 'progressbar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-mode]': 'mode()',
    '[attr.data-severity]': 'severity()',
    '[attr.data-size]': 'resolvedSize()',
    '[attr.aria-label]': 'ariaLabel() ?? (ariaLabelledBy() ? null : translations().loading)',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-valuemin]': 'mode() === "determinate" ? min() : null',
    '[attr.aria-valuemax]': 'mode() === "determinate" ? max() : null',
    '[attr.aria-valuenow]': 'mode() === "determinate" ? clamped() : null',
    '[attr.aria-valuetext]': 'mode() === "determinate" ? text() : null',
    '[attr.aria-busy]': 'mode() === "indeterminate" || null',
  },
})
export class TxProgressBar {
  private localeService = inject(TxLocaleService);

  readonly value = input<number, unknown>(0, { transform: numberAttribute });
  readonly min = input<number, unknown>(0, { transform: numberAttribute });
  readonly max = input<number, unknown>(100, { transform: numberAttribute });
  readonly mode = input<TxProgressBarMode>('determinate');
  readonly showValue = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly unit = input<string>('%');
  readonly severity = input<TxProgressBarSeverity>('primary');
  readonly color = input<string | undefined>(undefined);
  readonly size = input<TxProgressBarSize>('medium');
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraProgressBarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxProgressBarPart, TxProgressBar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly template = contentChild(TxProgressBarValueTemplate);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('progressBar', this, this.pt, this.ptOptions);
  readonly resolvedSize = computed(() => (this.size() === 'normal' ? 'medium' : this.size()));
  readonly clamped = computed(() => Math.min(this.max(), Math.max(this.min(), Number.isFinite(this.value()) ? this.value() : this.min())));
  readonly percent = computed(() => {
    const span = this.max() - this.min();
    return span > 0 ? ((this.clamped() - this.min()) / span) * 100 : 0;
  });
  readonly text = computed(() => {
    const unit = this.unit();
    const shown = unit === '%' ? Math.round(this.percent()) : this.clamped();
    return `${this.localeService.formatNumber(shown)}${unit}`;
  });
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-progress-bar'),
    ...(this.color() ? { '--tx-progress-bar-fill': this.color() } : {}),
    ...this.passThrough().root?.style,
  }));
}

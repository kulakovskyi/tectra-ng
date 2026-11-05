import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { injectDescribedBy, uniqueId } from '@tectra/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraDeepPartial, TectraFieldMessageTokens, toStyleObject } from '@tectra/themes';
import { TxFieldHintSeverity, TxFieldMessagePart } from './message.types';

@Component({
  selector: 'tx-field-hint',
  imports: [TxIcon],
  template: `
    @if (icon(); as icon) {
      <span class="tx-field-message__icon" aria-hidden="true" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style">
        @if (iconName(); as name) {
          <tx-icon [name]="name" />
        } @else {
          <span [class]="icon"></span>
        }
      </span>
    }
    <span class="tx-field-message__text" [class]="passThrough().text?.class" [style]="passThrough().text?.style"><ng-content /></span>
  `,
  styleUrl: './field-message.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-field-message tx-field-hint',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[id]': 'resolvedId()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-severity]': 'severity()',
  },
})
export class TxFieldHint {
  private txIconRegistry = inject(TxIconRegistry);
  private generatedId = uniqueId('tx-field-hint');

  readonly for = input<string | undefined>(undefined);
  readonly id = input<string | undefined>(undefined);
  readonly severity = input<TxFieldHintSeverity>('secondary');
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraFieldMessageTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFieldMessagePart, TxFieldHint> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('fieldHint', this, this.pt, this.ptOptions);
  readonly resolvedId = computed(() => this.id() ?? this.generatedId);
  readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-field-message'), ...this.passThrough().root?.style }));

  constructor() {
    injectDescribedBy(this.for, this.resolvedId);
  }
}

import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TxIcon } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraFieldsetTokens, toStyleObject } from '@tectra-ng/themes';
import { TxFieldsetPart } from './fieldset.types';

@Component({
  selector: 'tx-fieldset',
  imports: [TxIcon],
  template: `
    <fieldset class="tx-fieldset__box">
      <legend class="tx-fieldset__legend" [class]="passThrough().legend?.class" [style]="passThrough().legend?.style">
        @if (toggleable()) {
          <button
            type="button"
            class="tx-fieldset__toggle"
            [class]="passThrough().toggle?.class"
            [style]="passThrough().toggle?.style"
            [attr.aria-expanded]="!collapsed()"
            [attr.aria-controls]="contentId"
            (click)="collapsed.set(!collapsed())"
          >
            <tx-icon [name]="'chevron-down'" />
            <span>{{ legend() }}<ng-content select="[txFieldsetLegend]" /></span>
          </button>
        } @else {
          {{ legend() }}<ng-content select="[txFieldsetLegend]" />
        }
      </legend>
      <div class="tx-fieldset__collapse" [id]="contentId" [attr.inert]="isOpen() ? null : ''">
        <div class="tx-fieldset__collapse-inner">
          <div class="tx-fieldset__content" [class]="passThrough().content?.class" [style]="passThrough().content?.style"><ng-content /></div>
        </div>
      </div>
    </fieldset>
  `,
  styleUrl: './fieldset.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-fieldset',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-fieldset--collapsed]': 'toggleable() && collapsed()',
    '[class.tx-fieldset--toggleable]': 'toggleable()',
  },
})
export class TxFieldset {
  readonly legend = input<string | undefined>(undefined);
  readonly toggleable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly collapsed = model<boolean>(false);
  readonly dt = input<TectraDeepPartial<TectraFieldsetTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxFieldsetPart, TxFieldset> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('fieldset', this, this.pt, this.ptOptions);
  readonly contentId = uniqueId('tx-fieldset-content');
  readonly isOpen = computed(() => !this.toggleable() || !this.collapsed());
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-fieldset'), ...this.passThrough().root?.style }));
}

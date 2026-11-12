import { ChangeDetectionStrategy, Component, Directive, computed, contentChild, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraToolbarTokens, toStyleObject } from '@tectra-ng/themes';
import { TxToolbarOrientation, TxToolbarPart } from './toolbar.types';
import { TOOLBAR_THEME } from './toolbar.theme';

@Directive({ selector: '[txToolbarStart]' })
export class TxToolbarStart {}

@Directive({ selector: '[txToolbarCenter]' })
export class TxToolbarCenter {}

@Directive({ selector: '[txToolbarEnd]' })
export class TxToolbarEnd {}

@Component({
  selector: 'tx-toolbar',
  template: `
    <ng-content />
    @if (start()) {
      <div class="tx-toolbar__group tx-toolbar__start" [class]="passThrough().start?.class" [style]="passThrough().start?.style">
        <ng-content select="[txToolbarStart]" />
      </div>
    }
    @if (center()) {
      <div class="tx-toolbar__group tx-toolbar__center" [class]="passThrough().center?.class" [style]="passThrough().center?.style">
        <ng-content select="[txToolbarCenter]" />
      </div>
    }
    @if (end()) {
      <div class="tx-toolbar__group tx-toolbar__end" [class]="passThrough().end?.class" [style]="passThrough().end?.style">
        <ng-content select="[txToolbarEnd]" />
      </div>
    }
  `,
  styleUrl: './toolbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-toolbar',
    role: 'toolbar',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledBy() ?? null',
    '[attr.aria-orientation]': 'orientation()',
  },
})
export class TxToolbar {
  private readonly toolbarTheme = injectTokens(TOOLBAR_THEME);

  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly orientation = input<TxToolbarOrientation>('horizontal');
  readonly dt = input<TectraDeepPartial<TectraToolbarTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxToolbarPart, TxToolbar> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('toolbar', this, this.pt, this.ptOptions);
  protected readonly start = contentChild(TxToolbarStart);
  protected readonly center = contentChild(TxToolbarCenter);
  protected readonly end = contentChild(TxToolbarEnd);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-toolbar'), ...this.passThrough().root?.style }));
}

import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraStatusIconTokens, toStyleObject } from '@tectra-ng/themes';
import { TxStatusIconPart, TxStatusIconSeverity, TxStatusIconSize } from './status-icon.types';
import { STATUS_ICON_ICON_DEFAULTS } from './status-icon.icons';
import { STATUS_ICON_THEME } from './status-icon.theme';

const SEVERITY_ICONS: Record<TxStatusIconSeverity, TxIconName> = {
  success: 'check-circle',
  info: 'info-circle',
  warn: 'exclamation-triangle',
  danger: 'times-circle',
  secondary: 'minus-circle',
};

@Component({
  selector: 'tx-status-icon',
  imports: [NgClass, TxIcon],
  template: `
    @if (iconName(); as name) {
      <tx-icon class="tx-status-icon__icon" [name]="name" [class]="passThrough().icon?.class" [style]="passThrough().icon?.style" />
    } @else {
      <span class="tx-status-icon__icon" [class]="resolvedIcon()" [ngClass]="passThrough().icon?.class ?? null" [style]="passThrough().icon?.style"></span>
    }
  `,
  styleUrl: './status-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-status-icon',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-severity]': 'resolvedSeverity()',
    '[attr.data-size]': 'size()',
    '[attr.role]': 'resolvedLabel() ? "img" : null',
    '[attr.aria-label]': 'resolvedLabel() || null',
    '[attr.aria-hidden]': 'resolvedLabel() ? null : "true"',
    '[attr.title]': 'resolvedLabel() || null',
  },
  viewProviders: [provideTxIconDefaults(STATUS_ICON_ICON_DEFAULTS)],
})
export class TxStatusIcon {
  private readonly statusIconTheme = injectTokens(STATUS_ICON_THEME);

  private txIconRegistry = injectTxIcons();

  readonly status = input<boolean | null | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly severity = input<TxStatusIconSeverity | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly label = input<string | undefined>(undefined);
  readonly toolTip = input<string | undefined>(undefined);
  readonly size = input<TxStatusIconSize>('medium');
  readonly dt = input<TectraDeepPartial<TectraStatusIconTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxStatusIconPart, TxStatusIcon> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('statusIcon', this, this.pt, this.ptOptions);
  readonly resolvedSeverity = computed<TxStatusIconSeverity>(() => this.severity() ?? (this.status() ? 'success' : 'danger'));
  readonly resolvedIcon = computed(() => this.icon() ?? SEVERITY_ICONS[this.resolvedSeverity()]);
  readonly iconName = computed(() => {
    const icon = this.resolvedIcon();
    return this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly resolvedLabel = computed(() => {
    const label = this.label() ?? this.toolTip();
    if (label !== undefined) {
      return label;
    }
    if (this.severity()) {
      return '';
    }
    return this.status() ? this.translations().yes : this.translations().no;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-status-icon'), ...this.passThrough().root?.style }));
}

import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, inject, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconName, TxIconRegistry } from '@tectra/icons';
import { TectraDeepPartial, TectraIconLinkTokens, toStyleObject } from '@tectra/themes';
import { TxIconLinkPart, TxLinkCommands } from './link.types';

@Component({
  selector: 'tx-icon-link',
  imports: [NgClass, NgTemplateOutlet, RouterLink, RouterLinkActive, TxIcon],
  templateUrl: './icon-link.component.html',
  styleUrl: './icon-link.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-icon-link',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxIconLink {
  private txIconRegistry = inject(TxIconRegistry);

  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly text = input<string>('');
  readonly routerLink = input<TxLinkCommands>(undefined);
  readonly href = input<string | null | undefined>(undefined);
  readonly target = input<string | undefined>(undefined);
  readonly exact = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraIconLinkTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxIconLinkPart, TxIconLink> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('iconLink', this, this.pt, this.ptOptions);
  readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly resolvedTarget = computed(() => this.target() ?? '_blank');
  readonly opensNewTab = computed(() => !this.routerLink() && !!this.href() && this.resolvedTarget() === '_blank');
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-icon-link'), ...this.passThrough().root?.style }));
}

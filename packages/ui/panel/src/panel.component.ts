import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, model } from '@angular/core';
import { uniqueId } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraPanelTokens, toStyleObject } from '@tectra-ng/themes';
import { TxPanelAlign, TxPanelPart, TxPanelVariant } from './panel.types';
import { PANEL_ICON_DEFAULTS } from './panel.icons';
import { PANEL_THEME } from './panel.theme';

@Component({
  selector: 'tx-panel',
  imports: [TxIcon],
  templateUrl: './panel.component.html',
  styleUrl: './panel.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-panel',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.title]': 'null',
    '[attr.data-variant]': 'variant()',
    '[attr.data-align]': 'align()',
    '[class.tx-panel--collapsed]': 'toggleable() && collapsed()',
    '[attr.role]': 'title() ? "region" : null',
    '[attr.aria-labelledby]': 'title() ? titleId : null',
  },
  viewProviders: [provideTxIconDefaults(PANEL_ICON_DEFAULTS)],
})
export class TxPanel {
  private readonly panelTheme = injectTokens(PANEL_THEME);

  private txIconRegistry = injectTxIcons();
  private id = uniqueId('tx-panel');

  readonly title = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly variant = input<TxPanelVariant>('card');
  readonly align = input<TxPanelAlign>('start');
  readonly headingLevel = input<number>(2);
  readonly toggleable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly collapsed = model<boolean>(false);
  readonly toggleLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraPanelTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPanelPart, TxPanel> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('panel', this, this.pt, this.ptOptions);
  readonly titleId = `${this.id}-title`;
  readonly bodyId = `${this.id}-body`;
  readonly isOpen = computed(() => !this.toggleable() || !this.collapsed());
  readonly iconName = computed(() => {
    const icon = this.icon();
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  });
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-panel'), ...this.passThrough().root?.style }));

  toggle(): void {
    this.collapsed.update((collapsed) => !collapsed);
  }
}

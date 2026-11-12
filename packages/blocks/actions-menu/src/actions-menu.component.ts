import { ChangeDetectionStrategy, Component, ElementRef, computed, input, output, viewChild } from '@angular/core';
import { nextListIndex } from '@tectra-ng/core/a11y';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { provideTxIconDefaults, TxIcon } from '@tectra-ng/icons';
import { TectraActionsMenuTokens, TectraDeepPartial, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxPopover, TxPopoverTrigger } from '@tectra-ng/ui/popover';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxActionsMenuItem, TxActionsMenuPart, TxActionsMenuSize } from './actions-menu.types';
import { ACTIONS_MENU_ICON_DEFAULTS } from './actions-menu.icons';
import { ACTIONS_MENU_THEME } from './actions-menu.theme';

const MENU_KEYS = new Set(['ArrowDown', 'ArrowUp', 'Home', 'End']);

@Component({
  selector: 'tx-actions-menu',
  imports: [TxButton, TxIcon, TxPopover, TxPopoverTrigger, TxTooltip],
  templateUrl: './actions-menu.component.html',
  styleUrl: './actions-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-actions-menu',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-size]': 'size()',
  },
  viewProviders: [provideTxIconDefaults(ACTIONS_MENU_ICON_DEFAULTS)],
})
export class TxActionsMenu {
  private readonly actionsMenuTheme = injectTokens(ACTIONS_MENU_THEME);

  private readonly popover = viewChild(TxPopover);
  private readonly list = viewChild<ElementRef<HTMLElement>>('list');
  private pending: TxActionsMenuItem | null = null;

  readonly items = input.required<readonly TxActionsMenuItem[]>();
  readonly tooltip = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly size = input<TxActionsMenuSize>('medium');
  readonly dt = input<TectraDeepPartial<TectraActionsMenuTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxActionsMenuPart, TxActionsMenu> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly itemSelect = output<string>();

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('actionsMenu', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  protected readonly tokenStyle = computed(() => toStyleObject(this.dt(), '--tx-actions-menu'));
  readonly hostStyle = computed(() => ({ ...this.tokenStyle(), ...this.passThrough().root?.style }));
  protected readonly popoverTokens = { content: { padding: '0' } };
  protected readonly name = computed(() => this.ariaLabel() ?? this.tooltip() ?? this.translations().moreActions);

  close(): void {
    this.popover()?.hide();
  }

  protected select(item: TxActionsMenuItem): void {
    this.pending = item;
    this.close();
  }

  protected onClosed(): void {
    const item = this.pending;
    this.pending = null;
    if (item) {
      this.itemSelect.emit(item.id);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!MENU_KEYS.has(event.key)) {
      return;
    }
    const items = Array.from(this.list()?.nativeElement.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? []);
    const current = items.indexOf(event.target as HTMLElement);
    const next = nextListIndex(event.key, { count: items.length, current });
    if (next === null) {
      return;
    }
    event.preventDefault();
    items[next]?.focus();
  }
}

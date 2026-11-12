import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, computed, inject, input, linkedSignal, model } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraPinnedTabsTokens, toStyleObject } from '@tectra-ng/themes';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialogService } from '@tectra-ng/ui/dialog';
import { TxTabItem, TxTabValue, TxTabs } from '@tectra-ng/ui/tabs';
import { TxTooltip } from '@tectra-ng/ui/tooltip';
import { TxPinnedTabsDialog } from './pinned-tabs-dialog.component';
import { TxPinnedTabOption, TxPinnedTabsDialogData, TxPinnedTabsPart } from './pinned-tabs.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { PINNED_TABS_ICON_DEFAULTS } from './pinned-tabs.icons';
import { PINNED_TABS_THEME } from './pinned-tabs.theme';

const ALL = '__all__';

@Component({
  selector: 'tx-pinned-tabs',
  imports: [TxButton, TxTabs, TxTooltip],
  template: `
    @if (tabs().length) {
      <tx-tabs
        class="tx-pinned-tabs__tabs"
        variant="pills"
        [ariaLabel]="ariaLabel()"
        [tabs]="tabs()"
        [value]="activeTab()"
        [unstyled]="isUnstyled()"
        [class]="passThrough().tabs?.class"
        [style]="passThrough().tabs?.style"
        (tabChange)="pick($event)"
      />
    }
    <button
      txButton
      type="button"
      class="tx-pinned-tabs__button"
      severity="secondary"
      outlined
      size="small"
      icon="sliders-h"
      [iconOnly]="!!tabs().length"
      [attr.aria-label]="tabs().length ? translations().customize : null"
      [txTooltip]="tabs().length ? translations().customize : undefined"
      [disabled]="!options().length"
      [unstyled]="isUnstyled()"
      [class]="passThrough().button?.class"
      [style]="passThrough().button?.style"
      (click)="openSettings()"
    >
      @if (!tabs().length) {
        {{ translations().customize }}
      }
    </button>
  `,
  styleUrl: './pinned-tabs.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-pinned-tabs',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-pinned-tabs--empty]': '!tabs().length',
  },
  viewProviders: [provideTxIconDefaults(PINNED_TABS_ICON_DEFAULTS)],
})
export class TxPinnedTabs {
  private readonly pinnedTabsTheme = injectTokens(PINNED_TABS_THEME);

  private readonly document = inject(DOCUMENT);
  private readonly dialogs = inject(TxDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly stateKey = input.required<string>();
  readonly options = input.required<readonly TxPinnedTabOption[]>();
  readonly allLabel = input<string | undefined>(undefined);
  readonly selected = model<readonly string[]>([]);
  readonly dialogTitle = input<string | undefined>(undefined);
  readonly dialogText = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraPinnedTabsTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxPinnedTabsPart, TxPinnedTabs> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('pinnedTabs', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-pinned-tabs'), ...this.passThrough().root?.style }));

  readonly pinned = linkedSignal<readonly string[]>(() => this.readPinned(this.stateKey()));

  readonly tabs = computed<TxTabItem[]>(() => {
    const pinned = this.pinned();
    const tabs = this.options()
      .filter((option) => pinned.includes(option.value))
      .map(({ value, label }) => ({ value, label }));
    return tabs.length ? [{ value: ALL, label: this.allLabel() ?? this.translations().all }, ...tabs] : [];
  });

  protected readonly activeTab = computed<TxTabValue | undefined>(() => {
    const selected = this.selected();
    if (!selected.length) {
      return ALL;
    }
    return selected.length === 1 ? selected[0] : undefined;
  });

  protected pick(value: TxTabValue): void {
    this.selected.set(value === ALL ? [] : [String(value)]);
  }

  openSettings(): void {
    const data: TxPinnedTabsDialogData = {
      options: this.options(),
      pinned: this.pinned(),
      title: this.dialogTitle(),
      text: this.dialogText(),
    };
    this.dialogs
      .open<TxPinnedTabsDialog, TxPinnedTabsDialogData, string[]>(TxPinnedTabsDialog, { data, size: 'medium' })
      .closed.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((pinned) => {
        if (!pinned) {
          return;
        }
        this.pinned.set(pinned);
        this.writePinned(pinned);
      });
  }

  private storage(): Storage | null {
    try {
      return this.document.defaultView?.localStorage ?? null;
    } catch {
      return null;
    }
  }

  private readPinned(key: string): string[] {
    try {
      const parsed: unknown = JSON.parse(this.storage()?.getItem(key) ?? '[]');
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }

  private writePinned(pinned: readonly string[]): void {
    try {
      this.storage()?.setItem(this.stateKey(), JSON.stringify(pinned));
    } catch {
      return;
    }
  }
}

import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { TxIcon } from '@tectra-ng/icons';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialogContent, TxDialogFooter, TxDialogHeader, injectDialogData, injectDialogRef } from '@tectra-ng/ui/dialog';
import { TxMessage } from '@tectra-ng/ui/message';
import { TxPinnedTabsDialogData } from './pinned-tabs.types';

@Component({
  selector: 'tx-pinned-tabs-dialog',
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxButton, TxIcon, TxMessage],
  template: `
    <tx-dialog-header [title]="data.title || translations().pinnedTabs" />
    <tx-dialog-content>
      <div class="tx-pinned-tabs-dialog">
        <tx-message severity="secondary" variant="simple" [text]="data.text || translations().pinnedTabsHint" />
        <div class="tx-pinned-tabs-dialog__section">
          <span class="tx-pinned-tabs-dialog__counter" aria-live="polite">{{ counter() }}</span>
          <div class="tx-pinned-tabs-dialog__options" role="group" [attr.aria-label]="data.title || translations().pinnedTabs">
            @for (option of data.options; track option.value) {
              <button
                type="button"
                role="checkbox"
                class="tx-pinned-tabs-dialog__option"
                [class.tx-pinned-tabs-dialog__option--selected]="draft().includes(option.value)"
                [attr.aria-checked]="draft().includes(option.value)"
                [title]="option.label"
                (click)="toggle(option.value)"
              >
                <span class="tx-pinned-tabs-dialog__label">{{ option.label }}</span>
                <span class="tx-pinned-tabs-dialog__check" aria-hidden="true"><tx-icon name="check" /></span>
              </button>
            }
          </div>
        </div>
      </div>
    </tx-dialog-content>
    <tx-dialog-footer>
      <div class="tx-pinned-tabs-dialog__actions">
        <button txButton type="button" severity="secondary" fluid (click)="ref.close()">{{ translations().cancel }}</button>
        <button txButton type="button" icon="check" fluid (click)="save()">{{ translations().save }}</button>
      </div>
    </tx-dialog-footer>
  `,
  styleUrl: './pinned-tabs-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxPinnedTabsDialog {
  private readonly locale = inject(TxLocaleService);
  protected readonly data = injectDialogData<TxPinnedTabsDialogData>();
  protected readonly ref = injectDialogRef<string[]>();
  protected readonly translations = injectTranslations();
  protected readonly draft = signal<readonly string[]>(this.data.pinned);
  protected readonly chosen = computed(() => {
    const draft = this.draft();
    return this.data.options.map((option) => option.value).filter((value) => draft.includes(value));
  });
  protected readonly counter = computed(() =>
    this.locale.translate('pinnedSelected', { count: this.chosen().length, total: this.data.options.length }),
  );

  protected toggle(value: string): void {
    this.draft.update((draft) => (draft.includes(value) ? draft.filter((item) => item !== value) : [...draft, value]));
  }

  protected save(): void {
    this.ref.close(this.chosen());
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxSwitchLanguage } from '@tectra-ng/blocks/switch-language';
import { TxLocaleService } from '@tectra-ng/core/i18n';

@Component({
  selector: 'switch-language-basic-example',
  imports: [TxSwitchLanguage],
  template: `
    <div class="row">
      <tx-switch-language />
      <span class="hint">{{ locale.formatDate(today, { dateStyle: 'full' }) }}</span>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
    }

    .hint {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SwitchLanguageBasicExample {
  readonly locale = inject(TxLocaleService);
  readonly today = new Date();
}

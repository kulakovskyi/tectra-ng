import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxLanguageOption, TxSwitchLanguage } from '@tectra-ng/blocks/switch-language';

@Component({
  selector: 'switch-language-own-languages-example',
  imports: [TxSwitchLanguage],
  template: `
    <div class="row">
      <tx-switch-language
        ariaLabel="Language of the report"
        [languages]="languages"
        [syncLocale]="false"
        [(value)]="language"
      />
      <span class="hint">The report is in {{ name(language()) }}</span>
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
export default class SwitchLanguageOwnLanguagesExample {
  readonly language = signal<string | undefined>('en');
  readonly languages: TxLanguageOption[] = [
    { code: 'en', name: 'English', short: 'EN' },
    { code: 'de', name: 'Deutsch', short: 'DE' },
    { code: 'pl', name: 'Polski', short: 'PL' },
  ];

  name(code: string | undefined): string {
    return this.languages.find((language) => language.code === code)?.name ?? '';
  }
}

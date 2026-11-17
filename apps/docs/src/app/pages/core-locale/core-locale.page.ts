import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxSelect } from '@tectra-ng/ui/select';
import { CodeBlock } from '../../doc-ui/code-block/code-block';

@Component({
  selector: 'docs-core-locale-page',
  imports: [TxSelect, ReactiveFormsModule, CodeBlock],
  templateUrl: './core-locale.page.html',
  styleUrls: ['../page.scss', './core-locale.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CoreLocalePage {
  private txLocaleService = inject(TxLocaleService);

  readonly locales = [
    { label: 'English (us)', value: 'us' },
    { label: 'Українська (ua)', value: 'ua' },
  ];
  readonly empty: object[] = [];
  readonly rememberExample = `provideTectra({ preset: Tectra, locale: 'us', localeStorageKey: 'locale' }),
provideTxLocaleSync((code) => inject(AppTranslations).use(code)),`;
  localeControl = new FormControl(this.txLocaleService.locale().code, { nonNullable: true });

  translations = computed(() => Object.entries(this.txLocaleService.translations()));
  months = computed(() => this.txLocaleService.monthNames('long'));
  weekdays = computed(() => this.txLocaleService.weekdayNames('short'));
  samples = computed(() => [
    { label: 'Number', value: this.txLocaleService.formatNumber(1234567.89) },
    { label: 'Currency', value: this.txLocaleService.formatNumber(1999, { style: 'currency', currency: 'USD' }) },
    { label: 'Date', value: this.txLocaleService.formatDate(new Date(2026, 10, 5), { dateStyle: 'full' }) },
    { label: 'Page report', value: this.txLocaleService.translate('currentPageReport', { currentPage: 1, totalPages: 5 }) },
  ]);

  constructor() {
    this.localeControl.valueChanges.subscribe((code) => this.txLocaleService.setLocale(code));
  }
}

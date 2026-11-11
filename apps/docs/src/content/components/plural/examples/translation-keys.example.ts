import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxInputNumber } from '@tectra-ng/ui/input-number';
import { TxSelect } from '@tectra-ng/ui/select';
import { TxPluralForm, TxPluralFormPipe, pluralForm } from '@tectra-ng/utils/plural';

const FILES: Record<string, Record<TxPluralForm, string>> = {
  'en-US': { one: '{count} file', few: '{count} files', many: '{count} files' },
  'uk-UA': { one: '{count} файл', few: '{count} файли', many: '{count} файлів' },
};

@Component({
  selector: 'plural-translation-keys-example',
  imports: [FormsModule, TxInputNumber, TxSelect, TxPluralFormPipe],
  template: `
    <div class="stack">
      <tx-select ariaLabel="Language" [options]="languages" [(ngModel)]="language" />
      <tx-input-number ariaLabel="Count" [showButtons]="true" [min]="0" [(ngModel)]="count" />
      <span class="hint"
        >key <code>files.{{ count() | txPluralForm: language() }}</code> →
        <strong>{{ text() }}</strong></span
      >
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PluralTranslationKeysExample {
  readonly languages = [
    { label: 'English', value: 'en-US' },
    { label: 'Українська', value: 'uk-UA' },
  ];
  readonly language = signal('uk-UA');
  readonly count = signal<number | null>(3);

  text(): string {
    const count = this.count() ?? 0;
    return FILES[this.language()][pluralForm(count, this.language())].replace(
      '{count}',
      String(count),
    );
  }
}

import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, computed, inject, input, model, viewChild } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { TxLocaleService, injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSwitchLanguageTokens, toStyleObject } from '@tectra-ng/themes';
import { TX_LANGUAGES, TxLanguageOption, TxSwitchLanguagePart } from './switch-language.types';
import { SWITCH_LANGUAGE_THEME } from './switch-language.theme';

const NEXT_KEYS = new Set(['ArrowRight', 'ArrowDown']);
const PREVIOUS_KEYS = new Set(['ArrowLeft', 'ArrowUp']);

@Component({
  selector: 'tx-switch-language',
  template: `
    <div
      #group
      class="tx-switch-language__group"
      role="radiogroup"
      tabindex="-1"
      [attr.aria-label]="name()"
      [style.--tx-switch-language-count]="languages().length"
      [style.--tx-switch-language-index]="activeIndex()"
      [class]="passThrough().group?.class"
      [style]="passThrough().group?.style"
      (keydown)="onKeydown($event)"
    >
      <span class="tx-switch-language__thumb" aria-hidden="true" [class]="passThrough().thumb?.class" [style]="passThrough().thumb?.style"></span>
      @for (language of languages(); track language.code; let index = $index) {
        <button
          type="button"
          role="radio"
          class="tx-switch-language__option"
          [class.tx-switch-language__option--active]="index === activeIndex()"
          [attr.aria-checked]="index === activeIndex()"
          [attr.aria-label]="language.name"
          [attr.tabindex]="index === activeIndex() ? 0 : -1"
          [title]="language.name"
          [class]="passThrough().option?.class"
          [style]="passThrough().option?.style"
          (click)="select(language.code)"
        >
          {{ language.short }}
        </button>
      }
    </div>
  `,
  styleUrl: './switch-language.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-switch-language',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxSwitchLanguage {
  private readonly switchLanguageTheme = injectTokens(SWITCH_LANGUAGE_THEME);

  private readonly locale = inject(TxLocaleService);
  private readonly group = viewChild.required<ElementRef<HTMLElement>>('group');

  readonly languages = input<readonly TxLanguageOption[]>(TX_LANGUAGES);
  readonly value = model<string | undefined>(undefined);
  readonly syncLocale = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraSwitchLanguageTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSwitchLanguagePart, TxSwitchLanguage> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('switchLanguage', this, this.pt, this.ptOptions);
  protected readonly translations = injectTranslations();
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-switch-language'), ...this.passThrough().root?.style }));
  protected readonly name = computed(() => this.ariaLabel() ?? this.translations().language);
  readonly current = computed(() => this.value() ?? this.locale.locale().code);
  protected readonly activeIndex = computed(() => Math.max(this.languages().findIndex((language) => language.code === this.current()), 0));

  select(code: string): void {
    this.value.set(code);
    if (this.syncLocale()) {
      this.locale.setLocale(code);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const languages = this.languages();
    const count = languages.length;
    let index: number;
    if (NEXT_KEYS.has(event.key)) {
      index = (this.activeIndex() + 1) % count;
    } else if (PREVIOUS_KEYS.has(event.key)) {
      index = (this.activeIndex() - 1 + count) % count;
    } else if (event.key === 'Home' || event.key === 'End') {
      index = event.key === 'Home' ? 0 : count - 1;
    } else {
      return;
    }
    event.preventDefault();
    this.select(languages[index].code);
    this.group().nativeElement.querySelectorAll<HTMLElement>('[role="radio"]')[index]?.focus();
  }
}

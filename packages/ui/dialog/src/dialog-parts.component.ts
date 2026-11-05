import { ChangeDetectionStrategy, Component, Directive, ElementRef, computed, effect, inject, input, signal } from '@angular/core';
import { uniqueId } from '@tectra/core/a11y';
import { injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon } from '@tectra/icons';
import { injectCurrentDialog } from './dialog-ref';
import { TxDialogPart } from './dialog.types';

function injectPartStyling() {
  const ref = injectCurrentDialog();
  return injectUnstyled(computed(() => ref()?.config.unstyled));
}

@Directive({
  selector: '[txDialogTitle]',
  host: { class: 'tx-dialog-header__title', '[id]': 'id' },
})
export class TxDialogTitle {
  private ref = injectCurrentDialog();
  readonly id = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement.id || uniqueId('tx-dialog-title');

  constructor() {
    effect((onCleanup) => {
      const ref = this.ref();
      if (ref) {
        onCleanup(ref.registerTitle(this.id));
      }
    });
  }
}

@Component({
  selector: 'tx-dialog-header',
  imports: [TxIcon],
  template: `
    <div class="tx-dialog-header__text">
      @if (title()) {
        <h2 class="tx-dialog-header__title" [id]="titleId" [class]="passThrough().title?.class" [style]="passThrough().title?.style">{{ title() }}</h2>
      }
      <ng-content select="[txDialogTitle]" />
      @if (subtitle()) {
        <p class="tx-dialog-header__subtitle" [class]="passThrough().subtitle?.class" [style]="passThrough().subtitle?.style">{{ subtitle() }}</p>
      }
      <ng-content />
    </div>
    @if (showMaximize() || showClose()) {
      <div class="tx-dialog-header__buttons">
        @if (showMaximize()) {
          <button
            type="button"
            class="tx-dialog-header__button"
            [class]="passThrough().headerButton?.class"
            [style]="passThrough().headerButton?.style"
            [attr.aria-label]="ref()?.maximized() ? translations().restore : translations().maximize"
            (click)="ref()?.toggleMaximize()"
          >
            <tx-icon [name]="ref()?.maximized() ? 'window-minimize' : 'window-maximize'" />
          </button>
        }
        @if (showClose()) {
          <button
            type="button"
            class="tx-dialog-header__button"
            [class]="passThrough().headerButton?.class"
            [style]="passThrough().headerButton?.style"
            [attr.aria-label]="translations().close"
            (click)="ref()?.close()"
          >
            <tx-icon name="times" />
          </button>
        }
      </div>
    }
  `,
  styleUrl: './dialog-parts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-dialog-header',
    '[class]': 'passThrough().header?.class',
    '[style]': 'passThrough().header?.style',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[class.tx-dialog-header--draggable]': 'draggable()',
    '(pointerdown)': 'ref()?.dragFrom($event)',
  },
})
export class TxDialogHeader {
  readonly ref = injectCurrentDialog();

  readonly title = input<string | undefined>(undefined);
  readonly subtitle = input<string | undefined>(undefined);
  readonly closeButton = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });
  readonly maximizeButton = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly translations = injectTranslations();
  readonly isUnstyled = injectPartStyling();
  readonly passThrough = injectPassThrough<TxDialogPart, TxDialogHeader>('dialog', this, signal(undefined), signal(undefined));
  readonly titleId = uniqueId('tx-dialog-title');
  readonly draggable = computed(() => Boolean(this.ref()?.config.draggable));
  readonly showClose = computed(() => this.closeButton() ?? this.ref()?.config.closable ?? true);
  readonly showMaximize = computed(() => this.maximizeButton() ?? this.ref()?.config.maximizable ?? false);

  constructor() {
    effect((onCleanup) => {
      const ref = this.ref();
      if (this.title() && ref) {
        onCleanup(ref.registerTitle(this.titleId));
      }
    });
  }
}

@Component({
  selector: 'tx-dialog-content',
  template: '<ng-content />',
  styleUrl: './dialog-parts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-dialog-content',
    '[class]': 'passThrough().content?.class',
    '[style]': 'passThrough().content?.style',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxDialogContent {
  readonly isUnstyled = injectPartStyling();
  readonly passThrough = injectPassThrough<TxDialogPart, TxDialogContent>('dialog', this, signal(undefined), signal(undefined));
}

@Component({
  selector: 'tx-dialog-footer',
  template: '<ng-content />',
  styleUrl: './dialog-parts.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-dialog-footer',
    '[class]': 'passThrough().footer?.class',
    '[style]': 'passThrough().footer?.style',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
})
export class TxDialogFooter {
  readonly isUnstyled = injectPartStyling();
  readonly passThrough = injectPassThrough<TxDialogPart, TxDialogFooter>('dialog', this, signal(undefined), signal(undefined));
}

@Directive({
  selector: '[txDialogClose]',
  host: { '(click)': 'close()' },
})
export class TxDialogClose {
  private ref = injectCurrentDialog();

  readonly txDialogClose = input<unknown>(undefined);

  close(): void {
    void this.ref()?.close(this.txDialogClose());
  }
}

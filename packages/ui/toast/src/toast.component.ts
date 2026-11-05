import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, ElementRef, afterNextRender, booleanAttribute, computed, contentChild, inject, input, numberAttribute } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra/core/config';
import { injectTranslations } from '@tectra/core/i18n';
import { optionalBoolean } from '@tectra/core/utils';
import { TxIcon, TxIconRegistry } from '@tectra/icons';
import { TectraDeepPartial, TectraToastTokens, toStyleObject } from '@tectra/themes';
import { TxButton } from '@tectra/ui/button';
import { TxProgressSpinner } from '@tectra/ui/progress-spinner';
import { TxToastTemplate } from './toast-template.directive';
import { TxToastService } from './toast.service';
import { TxToastAction, TxToastContext, TxToastMessage, TxToastPart, TxToastPosition, TxToastSeverity } from './toast.types';

const ICONS: Record<TxToastSeverity, string> = {
  success: 'check-circle',
  info: 'info-circle',
  warn: 'exclamation-triangle',
  danger: 'times-circle',
  secondary: 'info-circle',
  contrast: 'info-circle',
};

@Component({
  selector: 'tx-toast',
  imports: [NgTemplateOutlet, TxIcon, TxButton, TxProgressSpinner],
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-toast',
    role: 'region',
    '[attr.aria-label]': 'translations().notifications',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-position]': 'position()',
    '[class.tx-toast--empty]': '!visible().length',
  },
})
export class TxToast {
  private service = inject(TxToastService);
  private iconRegistry = inject(TxIconRegistry);
  private host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private document = inject(DOCUMENT);

  readonly position = input<TxToastPosition>('top-right');
  readonly key = input<string | undefined>(undefined);
  readonly max = input<number, unknown>(5, { transform: numberAttribute });
  readonly inPlace = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly dt = input<TectraDeepPartial<TectraToastTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxToastPart, TxToast> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly customTemplate = contentChild(TxToastTemplate);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('toast', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-toast'), ...this.passThrough().root?.style }));
  readonly visible = computed(() => {
    const own = this.service.toasts().filter((toast) => toast.key === this.key());
    const latest = own.slice(Math.max(0, own.length - this.max()));
    return this.position().startsWith('top') ? latest.reverse() : latest;
  });

  constructor() {
    afterNextRender(() => {
      if (!this.inPlace()) {
        this.document.body.appendChild(this.host);
      }
    });
    inject(DestroyRef).onDestroy(() => this.host.remove());
  }

  iconOf(toast: TxToastMessage): string | null {
    if (toast.icon === false) {
      return null;
    }
    const name = toast.icon ?? ICONS[toast.severity];
    return this.iconRegistry.has(name) ? name : null;
  }

  contextOf(toast: TxToastMessage): TxToastContext {
    return { $implicit: toast, close: () => this.service.close(toast.id, 'close') };
  }

  close(toast: TxToastMessage): void {
    this.service.close(toast.id, 'close');
  }

  run(toast: TxToastMessage, action: TxToastAction): void {
    this.service.run(toast.id, action);
  }

  pause(toast: TxToastMessage): void {
    this.service.pause(toast.id);
  }

  resume(toast: TxToastMessage): void {
    this.service.resume(toast.id);
  }

  onFocusOut(toast: TxToastMessage, event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.resume(toast);
    }
  }

  onFocusIn(toast: TxToastMessage, event: FocusEvent): void {
    if (!(event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null)) {
      this.pause(toast);
    }
  }
}

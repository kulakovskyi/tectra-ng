import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, booleanAttribute, computed, contentChild, effect, input, output, signal } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { optionalBoolean, optionalNumber } from '@tectra-ng/core/utils';
import { injectTxIcons, provideTxIconDefaults, TxIcon, TxIconName } from '@tectra-ng/icons';
import { TectraDeepPartial, TectraMessageTokens, toStyleObject } from '@tectra-ng/themes';
import { TxMessageActions, TxMessageCloseIconTemplate, TxMessageIconTemplate } from './message-templates.directive';
import { TxMessagePart, TxMessageSeverity, TxMessageSize, TxMessageVariant } from './message.types';
import { MESSAGE_ICON_DEFAULTS } from './message.icons';
import { MESSAGE_THEME } from './message.theme';

@Component({
  selector: 'tx-message',
  imports: [NgTemplateOutlet, TxIcon],
  templateUrl: './message.component.html',
  styleUrl: './message.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-message',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-severity]': 'severity()',
    '[attr.data-size]': 'size()',
    '[attr.data-variant]': 'variant() ?? null',
    '[attr.role]': 'role()',
    '[class.tx-message--closing]': 'isClosing()',
    '(animationend)': 'onAnimationEnd($event)',
  },
  viewProviders: [provideTxIconDefaults(MESSAGE_ICON_DEFAULTS)],
})
export class TxMessage {
  private readonly messageTheme = injectTokens(MESSAGE_THEME);

  private txIconRegistry = injectTxIcons();

  readonly severity = input<TxMessageSeverity>('info');
  readonly text = input<string | undefined>(undefined);
  readonly icon = input<TxIconName | (string & {}) | undefined>(undefined);
  readonly size = input<TxMessageSize>('medium');
  readonly variant = input<TxMessageVariant | undefined>(undefined);
  readonly closable = input<boolean, unknown>(false, { transform: booleanAttribute });
  readonly closeIcon = input<TxIconName | (string & {})>('times');
  readonly life = input<number | undefined, unknown>(undefined, { transform: optionalNumber });
  readonly dt = input<TectraDeepPartial<TectraMessageTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxMessagePart, TxMessage> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly closed = output<void>();

  readonly iconTemplate = contentChild(TxMessageIconTemplate);
  readonly closeIconTemplate = contentChild(TxMessageCloseIconTemplate);
  readonly actions = contentChild(TxMessageActions);

  readonly translations = injectTranslations();
  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('message', this, this.pt, this.ptOptions);

  readonly isClosing = signal(false);
  readonly isClosed = signal(false);

  readonly role = computed(() => (this.severity() === 'danger' || this.severity() === 'warn' ? 'alert' : 'status'));
  readonly hasIcon = computed(() => !!this.icon() || !!this.iconTemplate());
  readonly iconName = computed(() => this.registered(this.icon()));
  readonly closeIconName = computed(() => this.registered(this.closeIcon()));
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-message'),
    ...this.passThrough().root?.style,
    ...(this.isClosed() ? { display: 'none' } : {}),
  }));

  constructor() {
    effect((onCleanup) => {
      const life = this.life();
      if (life && life > 0) {
        const timer = setTimeout(() => this.close(), life);
        onCleanup(() => clearTimeout(timer));
      }
    });
  }

  close(): void {
    if (this.isClosing() || this.isClosed()) {
      return;
    }
    if (this.isUnstyled()) {
      this.finishClose();
      return;
    }
    this.isClosing.set(true);
  }

  onAnimationEnd(event: AnimationEvent): void {
    if (this.isClosing() && event.animationName.includes('tx-message-out')) {
      this.finishClose();
    }
  }

  private finishClose(): void {
    this.isClosing.set(false);
    this.isClosed.set(true);
    this.closed.emit();
  }

  private registered(icon: string | undefined): string | null {
    return icon && this.txIconRegistry.has(icon) ? icon : null;
  }
}

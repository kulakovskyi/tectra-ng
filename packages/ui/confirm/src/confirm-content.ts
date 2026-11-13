import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { injectTranslations } from '@tectra-ng/core/i18n';
import { toStyleObject } from '@tectra-ng/themes';
import { TxConfirmSeverity, TxConfirmState } from './confirm.types';

const ICONS: Record<TxConfirmSeverity, string> = {
  primary: 'info-circle',
  info: 'info-circle',
  success: 'check-circle',
  warn: 'exclamation-triangle',
  danger: 'trash',
};

/** What the dialog and the popup render for a question: resolved texts, icon and the accept handler. */
export interface TxConfirmView {
  /** Severity of the question. */
  severity: TxConfirmSeverity;
  /** Icon name, or `null` for no icon. */
  icon: string | null;
  /** Title text, translated when not set in the options. */
  title: Signal<string>;
  /** Details text, if any. */
  message: string | undefined;
  /** Text of the accept button. */
  acceptLabel: Signal<string>;
  /** Text of the reject button. */
  rejectLabel: Signal<string>;
  /** Icon on the accept button, if any. */
  acceptIcon: string | undefined;
  /** Inline CSS variables from the `dt` option. */
  style: Record<string, string>;
  /** Whether `accept` is running. */
  busy: WritableSignal<boolean>;
  /** Runs the `accept` option, then calls `finish(true)`; stays open and idle again when it rejects. */
  accept(finish: (accepted: boolean) => void): Promise<void>;
}

export function confirmView(state: TxConfirmState): TxConfirmView {
  const translations = injectTranslations();
  const { options } = state;
  const severity = options.severity ?? 'primary';
  const busy = signal(false);
  return {
    severity,
    icon: options.icon === false ? null : (options.icon ?? ICONS[severity]),
    title: computed(() => options.title ?? translations().confirmQuestion),
    message: options.message,
    acceptLabel: computed(() => options.acceptLabel ?? (severity === 'danger' ? translations().delete : translations().confirm)),
    rejectLabel: computed(() => options.rejectLabel ?? translations().cancel),
    acceptIcon: options.acceptIcon ?? (severity === 'danger' ? 'trash' : undefined),
    style: toStyleObject(options.dt, '--tx-confirm'),
    busy,
    async accept(finish) {
      if (busy()) {
        return;
      }
      if (!options.accept) {
        finish(true);
        return;
      }
      busy.set(true);
      state.busy = true;
      try {
        await options.accept();
        state.busy = false;
        finish(true);
      } catch {
        state.busy = false;
        busy.set(false);
      }
    },
  };
}

import { Signal, WritableSignal, computed, signal } from '@angular/core';
import { injectTranslations } from '@tectra/core/i18n';
import { toStyleObject } from '@tectra/themes';
import { TxConfirmSeverity, TxConfirmState } from './confirm.types';

const ICONS: Record<TxConfirmSeverity, string> = {
  primary: 'info-circle',
  info: 'info-circle',
  success: 'check-circle',
  warn: 'exclamation-triangle',
  danger: 'trash',
};

export interface TxConfirmView {
  severity: TxConfirmSeverity;
  icon: string | null;
  title: Signal<string>;
  message: string | undefined;
  acceptLabel: Signal<string>;
  rejectLabel: Signal<string>;
  acceptIcon: string | undefined;
  style: Record<string, string>;
  busy: WritableSignal<boolean>;
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

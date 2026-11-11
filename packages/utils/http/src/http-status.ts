import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxTranslations } from '@tectra-ng/core/config';
import { TxLocaleService } from '@tectra-ng/core/i18n';
import { TxHttpStatusGroup, TxHttpStatusTone } from './http.types';

const GROUP_TONES: Record<TxHttpStatusGroup, TxHttpStatusTone> = {
  ok: 'success',
  redirect: 'info',
  clientError: 'danger',
  serverError: 'danger',
  warning: 'warn',
  noResponse: 'secondary',
  unknown: 'secondary',
};

const GROUP_LABELS: Record<TxHttpStatusGroup, keyof TxTranslations> = {
  ok: 'httpStatusOk',
  redirect: 'httpStatusRedirect',
  clientError: 'httpStatusClientError',
  serverError: 'httpStatusServerError',
  warning: 'httpStatusWarning',
  noResponse: 'httpStatusNoResponse',
  unknown: 'httpStatusUnknown',
};

export function httpStatusGroup(status: number | null | undefined, warnCodes: readonly number[] = []): TxHttpStatusGroup {
  if (!status) {
    return 'noResponse';
  }
  if (warnCodes.includes(status)) {
    return 'warning';
  }
  if (status >= 500) {
    return 'serverError';
  }
  if (status >= 400) {
    return 'clientError';
  }
  if (status >= 300) {
    return 'redirect';
  }
  return status >= 200 ? 'ok' : 'unknown';
}

export function httpStatusTone(status: number | null | undefined, warnCodes: readonly number[] = []): TxHttpStatusTone {
  return GROUP_TONES[httpStatusGroup(status, warnCodes)];
}

@Pipe({ name: 'txHttpStatusTone' })
export class TxHttpStatusTonePipe implements PipeTransform {
  transform(status: number | null | undefined, warnCodes: readonly number[] = []): TxHttpStatusTone {
    return httpStatusTone(status, warnCodes);
  }
}

@Pipe({ name: 'txHttpStatusGroup' })
export class TxHttpStatusGroupPipe implements PipeTransform {
  transform(status: number | null | undefined, warnCodes: readonly number[] = []): TxHttpStatusGroup {
    return httpStatusGroup(status, warnCodes);
  }
}

@Pipe({ name: 'txHttpStatusLabel', pure: false })
export class TxHttpStatusLabelPipe implements PipeTransform {
  private readonly locale = inject(TxLocaleService);

  transform(status: number | null | undefined, warnCodes: readonly number[] = []): string {
    return this.locale.translate(GROUP_LABELS[httpStatusGroup(status, warnCodes)]);
  }
}

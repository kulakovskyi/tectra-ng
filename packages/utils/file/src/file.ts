import { Pipe, PipeTransform, inject } from '@angular/core';
import { TxLocaleService } from '@tectra-ng/core/i18n';

export interface TxFileSizeOptions {
  decimals?: number;
  base?: 1000 | 1024;
  locale?: string;
  empty?: string;
}

const UNITS = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];

export function formatFileSize(bytes: number | null | undefined, options: TxFileSizeOptions = {}): string {
  const { decimals = 1, base = 1024, locale = 'en-US', empty = '-' } = options;
  if (bytes === null || bytes === undefined || !Number.isFinite(bytes) || bytes < 0) {
    return empty;
  }
  const exponent = bytes < base ? 0 : Math.min(UNITS.length - 1, Math.floor(Math.log(bytes) / Math.log(base)));
  const value = bytes / base ** exponent;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: exponent === 0 ? 0 : decimals }).format(value);
  return `${number} ${UNITS[exponent]}`;
}

export function downloadBlob(blob: Blob, filename = 'file', document: Document | undefined = globalThis.document): void {
  const view = document?.defaultView;
  if (!document || !view) {
    return;
  }
  const url = view.URL.createObjectURL(blob);
  downloadFile(url, filename, document);
  view.setTimeout(() => view.URL.revokeObjectURL(url));
}

export function downloadFile(url: string, filename?: string, document: Document | undefined = globalThis.document): void {
  if (!document?.body) {
    return;
  }
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename ?? url.split(/[?#]/)[0].split('/').pop() ?? 'file';
  anchor.rel = 'noopener';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

@Pipe({ name: 'txFileSize', pure: false })
export class TxFileSizePipe implements PipeTransform {
  private readonly localeService = inject(TxLocaleService);

  transform(bytes: number | null | undefined, options: TxFileSizeOptions = {}): string {
    return formatFileSize(bytes, { ...options, locale: options.locale ?? this.localeService.locale().intl });
  }
}

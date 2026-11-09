export type TxAppFooterVariant = 'page' | 'app' | 'console';

export type TxAppFooterPart = 'root' | 'inner' | 'copy' | 'nav' | 'link';

export interface TxAppFooterLink {
  label: string;
  routerLink?: string | readonly unknown[];
  queryParams?: Record<string, unknown>;
  url?: string;
  target?: string;
}

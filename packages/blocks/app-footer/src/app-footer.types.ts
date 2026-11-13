/**
 * Place of `tx-app-footer`: `page` for public pages, `app` inside the signed-in layout, `console`
 * inside a console layout.
 */
export type TxAppFooterVariant = 'page' | 'app' | 'console';

/** Names of the parts of `tx-app-footer` that its `pt` input can style. */
export type TxAppFooterPart = 'root' | 'inner' | 'copy' | 'nav' | 'link';

/** One link in `tx-app-footer`: a router link or a plain URL. */
export interface TxAppFooterLink {
  /** Text of the link. */
  label: string;
  /** Router link; takes the place of `url`. */
  routerLink?: string | readonly unknown[];
  /** Query parameters of the router link. */
  queryParams?: Record<string, unknown>;
  /** Plain address of an outside link. */
  url?: string;
  /** Link target, such as `_blank`. */
  target?: string;
}

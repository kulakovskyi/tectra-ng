/** Parts of `tx-link` that `pt` can style. */
export type TxLinkPart = 'root' | 'anchor' | 'text' | 'external' | 'copy';

/** Parts of `tx-icon-link` that `pt` can style. */
export type TxIconLinkPart = 'root' | 'anchor' | 'icon' | 'text';

/** Kind of address a link opens: a web URL, an email or a phone number. */
export type TxLinkType = 'url' | 'email' | 'phone';

/** Router commands of a link: a path string, a commands array or nothing. */
export type TxLinkCommands = string | readonly unknown[] | null | undefined;

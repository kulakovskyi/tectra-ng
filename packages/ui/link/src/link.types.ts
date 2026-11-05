export type TxLinkPart = 'root' | 'anchor' | 'text' | 'external' | 'copy';

export type TxIconLinkPart = 'root' | 'anchor' | 'icon' | 'text';

export type TxLinkType = 'url' | 'email' | 'phone';

export type TxLinkCommands = string | readonly unknown[] | null | undefined;

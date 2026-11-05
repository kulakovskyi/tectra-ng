export type TxIconPath = string | { d: string; fill?: true; stroke?: false; transform?: string };

export type TxIconSet = Record<string, TxIconPath[]>;

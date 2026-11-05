export interface TxPassThroughPart {
  class?: string;
  style?: Record<string, string>;
}

export interface TxPassThroughContext<TInstance> {
  instance: TInstance;
}

export type TxPassThroughValue<TInstance> =
  | TxPassThroughPart
  | ((context: TxPassThroughContext<TInstance>) => TxPassThroughPart | undefined);

export type TxPassThrough<TPart extends string, TInstance = never> = Partial<Record<TPart, TxPassThroughValue<TInstance>>>;

export type TxResolvedPassThrough<TPart extends string> = Partial<Record<TPart, TxPassThroughPart>>;

export interface TxPassThroughOptions {
  mergeSections?: boolean;
  mergeProps?: boolean;
}

export type TxGlobalPassThrough = Record<string, Record<string, TxPassThroughValue<never>>>;

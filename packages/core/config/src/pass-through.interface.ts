/** Extra class and inline styles for one part of a component. */
export interface TxPassThroughPart {
  /** CSS classes added to the part. */
  class?: string;
  /** Inline styles added to the part, as property names and values. */
  style?: Record<string, string>;
}

/** Context a pass-through function receives. */
export interface TxPassThroughContext<TInstance> {
  /** The component instance the part belongs to. */
  instance: TInstance;
}

/** Pass-through of one part: an object, or a function of the component instance that returns it. */
export type TxPassThroughValue<TInstance> =
  | TxPassThroughPart
  | ((context: TxPassThroughContext<TInstance>) => TxPassThroughPart | undefined);

/** Pass-through of a component: classes and styles by part name. */
export type TxPassThrough<TPart extends string, TInstance = never> = Partial<Record<TPart, TxPassThroughValue<TInstance>>>;

/** Pass-through of a component after global and local values are merged, by part name. */
export type TxResolvedPassThrough<TPart extends string> = Partial<Record<TPart, TxPassThroughPart>>;

/** How global and local pass-through are merged. */
export interface TxPassThroughOptions {
  /** Whether local parts are added to the global parts instead of replacing them (default `true`). */
  mergeSections?: boolean;
  /**
   * Whether the class and style of a part present in both are merged instead of the local one winning
   * (default `false`).
   */
  mergeProps?: boolean;
}

/** Global pass-through of the app: by component name, then by part name. */
export type TxGlobalPassThrough = Record<string, Record<string, TxPassThroughValue<never>>>;

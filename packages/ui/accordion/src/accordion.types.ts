import { TxIconName } from '@tectra-ng/icons';

/** Value that identifies one panel: a string or a number. */
export type TxAccordionPanelValue = string | number;
/**
 * Open panel value of `tx-accordion`: one value, a list of values in multiple mode, or `null` when nothing is open.
 */
export type TxAccordionValue = TxAccordionPanelValue | TxAccordionPanelValue[] | null;
/** Severity tint of a panel: `info`, `success`, `warn` or `danger`. */
export type TxAccordionTone = 'info' | 'success' | 'warn' | 'danger';
/** Icon of the toggle: a registered icon name or any custom icon name string. */
export type TxAccordionIcon = TxIconName | (string & {});
/** Names of the parts of `tx-accordion` that `pt` can style. */
export type TxAccordionPart = 'root' | 'panel' | 'header' | 'headerContent' | 'toggleIcon' | 'content' | 'contentInner';

/**
 * One panel of a data-driven `tx-accordion`: header, text content and state; extra keys stay available in templates.
 */
export interface TxAccordionItem {
  /** Header text of the panel. */
  header: string;
  /** Text shown when the panel is open; use a content template for rich content. */
  content?: string;
  /** Value that identifies the panel; the index is used when it is not set. */
  value?: TxAccordionPanelValue;
  /** Severity tint of the panel. */
  tone?: TxAccordionTone;
  /** Stops the panel from being toggled. */
  disabled?: boolean;
  [key: string]: unknown;
}

/** Payload of the panel toggle events: which panel opened or closed. */
export interface TxAccordionToggleEvent {
  /** Value of the toggled panel. */
  value: TxAccordionPanelValue;
  /** Position of the toggled panel in the accordion. */
  index: number;
  /** Data item of the toggled panel; missing for panels written in the template. */
  item?: TxAccordionItem;
}

/** Context of the header and content templates of a data-driven accordion. */
export interface TxAccordionItemContext {
  /** The item of the panel, so `let-item` works. */
  $implicit: TxAccordionItem;
  /** The item of the panel. */
  item: TxAccordionItem;
  /** Position of the panel. */
  index: number;
  /** Whether the panel is open. */
  active: boolean;
}

/** Context of the custom toggle icon template. */
export interface TxAccordionToggleIconContext {
  /** Whether the panel is open. */
  $implicit: boolean;
  /** Whether the panel is open. */
  active: boolean;
}

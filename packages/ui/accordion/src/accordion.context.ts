import { InjectionToken, Signal, TemplateRef } from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxAccordionIcon, TxAccordionItem, TxAccordionPanelValue, TxAccordionPart, TxAccordionToggleIconContext } from './accordion.types';

/** What panels need from their `tx-accordion`; provided through `TX_ACCORDION`. */
export interface TxAccordionContext {
  /** Host element of the accordion. */
  readonly element: HTMLElement;
  /** Set while a focus move is about to select the focused panel. */
  focusSelectPending: boolean;
  /** Whether the accordion drops the default styles. */
  readonly isUnstyled: Signal<boolean>;
  /** Resolved `pt` attributes of the accordion parts. */
  readonly passThrough: Signal<TxResolvedPassThrough<TxAccordionPart>>;
  /** Icon of a closed panel's toggle. */
  readonly expandIcon: Signal<TxAccordionIcon | undefined>;
  /** Icon of an open panel's toggle. */
  readonly collapseIcon: Signal<TxAccordionIcon | undefined>;
  /** Whether moving focus with the arrow keys also opens the panel. */
  readonly selectOnFocus: Signal<boolean>;
  /** Custom toggle icon template, when one is given. */
  readonly toggleIconTemplate: Signal<TemplateRef<TxAccordionToggleIconContext> | undefined>;
  /** Tells whether the panel with this value is open. */
  isActive(value: TxAccordionPanelValue): boolean;
  /** Opens a closed panel or closes an open one. */
  toggle(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void;
  /** Opens the panel and keeps it open if it already is. */
  open(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void;
}

/**
 * What the header and the content of a panel need from their `tx-accordion-panel`; provided through `TX_ACCORDION_PANEL`.
 */
export interface TxAccordionPanelContext {
  /** Value that identifies the panel. */
  readonly value: Signal<TxAccordionPanelValue>;
  /** Whether the panel is open. */
  readonly active: Signal<boolean>;
  /** Whether the panel cannot be toggled. */
  readonly disabled: Signal<boolean>;
  /** Data item of the panel, when it comes from `items`. */
  readonly item: Signal<TxAccordionItem | undefined>;
  /** Element id of the header button. */
  readonly headerId: string;
  /** Element id of the content region. */
  readonly contentId: string;
  /** Opens or closes the panel. */
  toggle(): void;
  /** Opens the panel. */
  open(): void;
}

export const TX_ACCORDION = new InjectionToken<TxAccordionContext>('TX_ACCORDION');
export const TX_ACCORDION_PANEL = new InjectionToken<TxAccordionPanelContext>('TX_ACCORDION_PANEL');

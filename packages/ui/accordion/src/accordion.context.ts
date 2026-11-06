import { InjectionToken, Signal, TemplateRef } from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxAccordionIcon, TxAccordionItem, TxAccordionPanelValue, TxAccordionPart, TxAccordionToggleIconContext } from './accordion.types';

export interface TxAccordionContext {
  readonly element: HTMLElement;
  focusSelectPending: boolean;
  readonly isUnstyled: Signal<boolean>;
  readonly passThrough: Signal<TxResolvedPassThrough<TxAccordionPart>>;
  readonly expandIcon: Signal<TxAccordionIcon | undefined>;
  readonly collapseIcon: Signal<TxAccordionIcon | undefined>;
  readonly selectOnFocus: Signal<boolean>;
  readonly toggleIconTemplate: Signal<TemplateRef<TxAccordionToggleIconContext> | undefined>;
  isActive(value: TxAccordionPanelValue): boolean;
  toggle(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void;
  open(value: TxAccordionPanelValue, panel: HTMLElement, item?: TxAccordionItem): void;
}

export interface TxAccordionPanelContext {
  readonly value: Signal<TxAccordionPanelValue>;
  readonly active: Signal<boolean>;
  readonly disabled: Signal<boolean>;
  readonly item: Signal<TxAccordionItem | undefined>;
  readonly headerId: string;
  readonly contentId: string;
  toggle(): void;
  open(): void;
}

export const TX_ACCORDION = new InjectionToken<TxAccordionContext>('TX_ACCORDION');
export const TX_ACCORDION_PANEL = new InjectionToken<TxAccordionPanelContext>('TX_ACCORDION_PANEL');

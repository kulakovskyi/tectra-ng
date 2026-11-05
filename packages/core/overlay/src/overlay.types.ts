import { Observable } from 'rxjs';
import { Injector, Signal, ViewContainerRef } from '@angular/core';

export type TxPlacementSide = 'top' | 'bottom' | 'left' | 'right';
export type TxPlacementAlign = 'start' | 'center' | 'end';
export type TxPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

export type TxOverlayLayer = 'dropdown' | 'popover' | 'tooltip' | 'modal' | 'toast';
export type TxOverlayScroll = 'reposition' | 'close' | 'block' | 'none';
export type TxOverlayCloseReason = 'escape' | 'outside' | 'scroll' | 'api' | 'detached';
export type TxOverlayMotion = 'slide' | 'pop';

export interface TxOverlayOptions<TContext = unknown> {
  origin: Element;
  viewContainerRef?: ViewContainerRef;
  injector?: Injector;
  context?: TContext;
  placement?: TxPlacement;
  offset?: number;
  viewportMargin?: number;
  layer?: TxOverlayLayer;
  scroll?: TxOverlayScroll;
  matchWidth?: boolean;
  closeOnEscape?: boolean;
  closeOnOutsideClick?: boolean;
  restoreFocus?: boolean;
  animate?: boolean;
  motion?: TxOverlayMotion;
  panelClass?: string | string[];
}

export interface TxOverlayRef<TInstance = unknown> {
  readonly placement: Signal<TxPlacement>;
  readonly closed: Observable<TxOverlayCloseReason>;
  readonly instance: TInstance | null;
  readonly element: HTMLElement;
  close(reason?: TxOverlayCloseReason): void;
  updatePosition(): void;
}

export interface TxOverlayBounds {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface TxOverlaySize {
  width: number;
  height: number;
}

export interface TxOverlayInsetValues {
  top: number;
  bottom: number;
}

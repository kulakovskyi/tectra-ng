import { Observable } from 'rxjs';
import { Injector, Signal, ViewContainerRef } from '@angular/core';

/** Side of the origin element an overlay opens on. */
export type TxPlacementSide = 'top' | 'bottom' | 'left' | 'right';
/** How an overlay lines up with the origin element along that side. */
export type TxPlacementAlign = 'start' | 'center' | 'end';
/** Where an overlay opens relative to its origin: a side, optionally with `-start` or `-end` alignment. */
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

/** Stacking layer of an overlay, from the lowest (`dropdown`) to the highest (`toast`). */
export type TxOverlayLayer = 'dropdown' | 'popover' | 'tooltip' | 'modal' | 'toast';
/** What an open overlay does when the page scrolls: follow its origin, close, block scrolling or stay. */
export type TxOverlayScroll = 'reposition' | 'close' | 'block' | 'none';
/** Why an overlay closed. */
export type TxOverlayCloseReason = 'escape' | 'outside' | 'scroll' | 'api' | 'detached';
/** Open and close animation of an overlay: slide in from its side or pop out of its origin. */
export type TxOverlayMotion = 'slide' | 'pop';

/** Options of `TxOverlay.open`: the origin element, placement, scroll and close behavior. */
export interface TxOverlayOptions<TContext = unknown> {
  /** Element the overlay is attached to. */
  origin: Element;
  /** Container the content is created in; required when the content is a template. */
  viewContainerRef?: ViewContainerRef;
  /** Injector for a component content (default: the root injector of the service). */
  injector?: Injector;
  /** Context of a template content. */
  context?: TContext;
  /** Where the overlay opens (default `bottom-start`); it flips when there is no room. */
  placement?: TxPlacement;
  /** Gap between the origin and the overlay, in px (default 4). */
  offset?: number;
  /** Free space kept between the overlay and the viewport edges, in px (default 8). */
  viewportMargin?: number;
  /** Stacking layer (default `dropdown`). */
  layer?: TxOverlayLayer;
  /** What happens on scroll (default `reposition`). */
  scroll?: TxOverlayScroll;
  /** Gives the overlay the width the origin has when it opens. */
  matchWidth?: boolean;
  /** Closes on `Escape` (default `true`). */
  closeOnEscape?: boolean;
  /** Closes on a click outside the overlay and its origin (default `true`). */
  closeOnOutsideClick?: boolean;
  /** Returns focus to the previously focused element on close, except after an outside click (default `true`). */
  restoreFocus?: boolean;
  /** Animates opening and closing (default `true`). */
  animate?: boolean;
  /** Kind of open and close animation (default `slide`). */
  motion?: TxOverlayMotion;
  /** CSS class or classes added to the overlay pane. */
  panelClass?: string | string[];
  /**
   * Smallest distance in px from the overlay edge to its arrow centre, or a function that measures it on the
   * pane (see `txArrowInset`); a `-start` / `-end` overlay moves outward so that the arrow still points at the
   * origin centre.
   */
  arrowInset?: number | ((pane: HTMLElement) => number);
}

/** Handle of an open overlay. */
export interface TxOverlayRef<TInstance = unknown> {
  /** Placement the overlay currently has, after flipping. */
  readonly placement: Signal<TxPlacement>;
  /** Emits the reason once when the overlay closes. */
  readonly closed: Observable<TxOverlayCloseReason>;
  /** Instance of the content component; `null` for a template. */
  readonly instance: TInstance | null;
  /** Pane element of the overlay. */
  readonly element: HTMLElement;
  /** Closes the overlay (default reason `api`). */
  close(reason?: TxOverlayCloseReason): void;
  /** Recomputes the position, for example after the content changed size. */
  updatePosition(): void;
}

/** Edges of a rectangle in px: distances from the viewport top and left. */
export interface TxOverlayBounds {
  /** Top edge, in px. */
  top: number;
  /** Right edge, in px. */
  right: number;
  /** Bottom edge, in px. */
  bottom: number;
  /** Left edge, in px. */
  left: number;
}

/** Width and height of an element in px. */
export interface TxOverlaySize {
  /** Width, in px. */
  width: number;
  /** Height, in px. */
  height: number;
}

/** Space in px taken by fixed bars at the top and bottom of the viewport. */
export interface TxOverlayInsetValues {
  /** Space taken at the top, in px. */
  top: number;
  /** Space taken at the bottom, in px. */
  bottom: number;
}

/** Offset in px along both axes. */
export interface TxOverlayShift {
  /** Horizontal offset, in px. */
  x: number;
  /** Vertical offset, in px. */
  y: number;
}

/** Position and size of an element in px. */
export interface TxOverlayBox {
  /** Distance from the top, in px. */
  top: number;
  /** Distance from the left, in px. */
  left: number;
  /** Width, in px. */
  width: number;
  /** Height, in px. */
  height: number;
}

import { Signal } from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxStepperPart, TxStepValue } from './stepper.types';

/** What the parts of a stepper (`tx-step`, `tx-step-panel`, ...) use to reach their `tx-stepper`. */
export abstract class TxStepperRef {
  /** Value of the active step. */
  abstract readonly value: Signal<TxStepValue | undefined>;
  /** Whether steps can only be changed through the panels. */
  abstract readonly linear: Signal<boolean>;
  /** Whether the tectra styles are removed. */
  abstract readonly isUnstyled: Signal<boolean>;
  /** Resolved `pt` classes and styles of the parts. */
  abstract readonly passThrough: Signal<TxResolvedPassThrough<TxStepperPart>>;
  /** Position of the active step; `-1` when none is active. */
  abstract readonly activeIndex: Signal<number>;
  /** Position of the step with the given value, or `-1`. */
  abstract indexOf(value: TxStepValue | undefined): number;
  /** Whether the step with the given value is the active one. */
  abstract isActive(value: TxStepValue | undefined): boolean;
  /** Whether the step with the given value comes before the active one. */
  abstract isCompleted(value: TxStepValue | undefined): boolean;
  /** Whether the step with the given value is the last one. */
  abstract isLast(value: TxStepValue | undefined): boolean;
  /** Whether a panel exists for the given step value. */
  abstract hasPanel(value: TxStepValue | undefined): boolean;
  /** Value of the first step that is not disabled. */
  abstract firstEnabled(): TxStepValue | undefined;
  /** Makes the step with the given value active. */
  abstract activate(value: TxStepValue): void;
  /** DOM id of the step with the given value. */
  abstract stepId(value: TxStepValue | undefined): string;
  /** DOM id of the panel of the given step value. */
  abstract panelId(value: TxStepValue | undefined): string;
  /**
   * Moves focus to the next or previous enabled step for an arrow, Home or End key; returns whether
   * focus moved.
   */
  abstract focusSibling(from: TxStepValue | undefined, key: string): boolean;
}

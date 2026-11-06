import { Signal } from '@angular/core';
import { TxResolvedPassThrough } from '@tectra-ng/core/config';
import { TxStepperPart, TxStepValue } from './stepper.types';

export abstract class TxStepperRef {
  abstract readonly value: Signal<TxStepValue | undefined>;
  abstract readonly linear: Signal<boolean>;
  abstract readonly isUnstyled: Signal<boolean>;
  abstract readonly passThrough: Signal<TxResolvedPassThrough<TxStepperPart>>;
  abstract readonly activeIndex: Signal<number>;
  abstract indexOf(value: TxStepValue | undefined): number;
  abstract isActive(value: TxStepValue | undefined): boolean;
  abstract isCompleted(value: TxStepValue | undefined): boolean;
  abstract isLast(value: TxStepValue | undefined): boolean;
  abstract hasPanel(value: TxStepValue | undefined): boolean;
  abstract firstEnabled(): TxStepValue | undefined;
  abstract activate(value: TxStepValue): void;
  abstract stepId(value: TxStepValue | undefined): string;
  abstract panelId(value: TxStepValue | undefined): string;
  abstract focusSibling(from: TxStepValue | undefined, key: string): boolean;
}

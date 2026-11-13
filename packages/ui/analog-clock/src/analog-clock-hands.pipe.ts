import { Pipe, PipeTransform } from '@angular/core';
import { TxAnalogClockHands } from './analog-clock.types';
import { clockHands } from './analog-clock.utils';

/** Turns a time into the hand angles of an analog clock in an optional time zone, for custom clock faces. */
@Pipe({ name: 'txAnalogClockHands' })
export class TxAnalogClockHandsPipe implements PipeTransform {
  transform(now: number | Date, timezone: string | null = null): TxAnalogClockHands {
    return clockHands(now, timezone);
  }
}

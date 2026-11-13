import { Pipe, PipeTransform } from '@angular/core';
import { formatRemaining } from './countdown.utils';

/** Formats remaining milliseconds as `mm:ss` or `h:mm:ss`, like `tx-countdown` with the `clock` format. */
@Pipe({ name: 'txRemainingTime' })
export class TxRemainingTimePipe implements PipeTransform {
  transform(ms: number | null | undefined): string {
    return formatRemaining(ms);
  }
}

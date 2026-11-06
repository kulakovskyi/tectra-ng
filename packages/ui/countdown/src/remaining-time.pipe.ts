import { Pipe, PipeTransform } from '@angular/core';
import { formatRemaining } from './countdown.utils';

@Pipe({ name: 'txRemainingTime' })
export class TxRemainingTimePipe implements PipeTransform {
  transform(ms: number | null | undefined): string {
    return formatRemaining(ms);
  }
}

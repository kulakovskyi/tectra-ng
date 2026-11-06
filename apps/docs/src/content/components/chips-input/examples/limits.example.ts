import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TxChipsInput, TxChipsInputEvent } from '@tectra-ng/ui/chips-input';
import { TxToastService } from '@tectra-ng/ui/toast';

@Component({
  selector: 'chips-input-limits-example',
  imports: [TxChipsInput],
  template: `
    <tx-chips-input
      [max]="3"
      [maxLength]="12"
      [placeholder]="'Up to 3 tags'"
      (rejected)="reject($event)"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputLimitsExample {
  private readonly toast = inject(TxToastService);

  reject(event: TxChipsInputEvent): void {
    this.toast.warn(`“${event.value}” was not added`);
  }
}

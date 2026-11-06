import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';

@Component({
  selector: 'chips-input-design-tokens-example',
  imports: [TxChipsInput, ReactiveFormsModule],
  template: `<tx-chips-input
    [formControl]="tags"
    [ariaLabel]="'Tags'"
    [dt]="{ root: { chipBorderRadius: '999px', chipPaddingX: '12px', gap: '6px' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputDesignTokensExample {
  readonly tags = new FormControl(['rounded', 'chips']);
}

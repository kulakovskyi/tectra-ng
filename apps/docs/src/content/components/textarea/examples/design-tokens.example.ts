import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'textarea-design-tokens-example',
  imports: [TxTextarea],
  template: `<textarea
    txTextarea
    placeholder="Taller, rounder, teal focus"
    aria-label="Custom tokens"
    [dt]="{ root: { minHeight: '120px' } }"
    [fieldDt]="{ root: { borderRadius: '14px', focusBorderColor: '#0f766e' } }"
  ></textarea>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaDesignTokensExample {}

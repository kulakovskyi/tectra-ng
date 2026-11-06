import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'textarea-variants-example',
  imports: [TxTextarea],
  template: `
    <div class="grid">
      <textarea txTextarea rows="3" placeholder="Outlined" aria-label="Outlined"></textarea>
      <textarea
        txTextarea
        rows="3"
        variant="filled"
        placeholder="Filled"
        aria-label="Filled"
      ></textarea>
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaVariantsExample {}

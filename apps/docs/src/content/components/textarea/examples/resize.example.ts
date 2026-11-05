import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra/ui/textarea';

@Component({
  selector: 'textarea-resize-example',
  imports: [TxTextarea],
  template: `
    <div class="grid">
      <textarea
        txTextarea
        rows="3"
        resize="none"
        placeholder="resize none"
        aria-label="No resize"
      ></textarea>
      <textarea
        txTextarea
        rows="3"
        resize="vertical"
        placeholder="resize vertical"
        aria-label="Vertical resize"
      ></textarea>
      <textarea
        txTextarea
        rows="3"
        resize="both"
        placeholder="resize both"
        aria-label="Free resize"
      ></textarea>
    </div>
  `,
  styles: `
    .grid {
      display: flex;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: 12px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaResizeExample {}

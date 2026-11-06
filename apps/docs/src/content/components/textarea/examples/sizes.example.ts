import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'textarea-sizes-example',
  imports: [TxTextarea],
  template: `
    <div class="grid">
      <textarea txTextarea rows="2" size="small" placeholder="Small" aria-label="Small"></textarea>
      <textarea txTextarea rows="2" placeholder="Medium" aria-label="Medium"></textarea>
      <textarea txTextarea rows="2" size="large" placeholder="Large" aria-label="Large"></textarea>
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
export default class TextareaSizesExample {}

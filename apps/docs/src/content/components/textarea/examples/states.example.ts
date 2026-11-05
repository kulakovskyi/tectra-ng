import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra/ui/textarea';

@Component({
  selector: 'textarea-states-example',
  imports: [TxTextarea],
  template: `
    <div class="grid">
      <textarea txTextarea rows="3" readonly aria-label="Read only">Read only text</textarea>
      <textarea txTextarea rows="3" disabled aria-label="Disabled">Disabled</textarea>
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
export default class TextareaStatesExample {}

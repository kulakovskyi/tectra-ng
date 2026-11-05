import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra/ui/textarea';

@Component({
  selector: 'textarea-borderless-example',
  imports: [TxTextarea],
  template: `
    <div class="card">
      <strong>Release notes</strong>
      <textarea
        txTextarea
        [borderless]="true"
        [autoResize]="true"
        rows="2"
        placeholder="What changed in this release?"
        aria-label="Release notes"
        [fluid]="true"
      ></textarea>
    </div>
  `,
  styles: `
    .card {
      display: grid;
      gap: 4px;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaBorderlessExample {}

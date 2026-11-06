import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'textarea-max-rows-example',
  imports: [TxTextarea],
  template: `
    <textarea
      txTextarea
      rows="1"
      [autoResize]="true"
      [maxRows]="5"
      placeholder="Reply…"
      aria-label="Reply"
      [fluid]="true"
      (heightChange)="height.set($event)"
    ></textarea>
    <p class="hint">Height: {{ height() ?? '—' }}px</p>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaMaxRowsExample {
  readonly height = signal<number | null>(null);
}

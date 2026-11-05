import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra/ui/textarea';

@Component({
  selector: 'textarea-auto-resize-example',
  imports: [TxTextarea],
  template: `<textarea
    txTextarea
    rows="2"
    [autoResize]="true"
    [maxHeight]="220"
    placeholder="Type a few lines — the field grows up to 220px"
    aria-label="Message"
    [fluid]="true"
  ></textarea>`,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaAutoResizeExample {}

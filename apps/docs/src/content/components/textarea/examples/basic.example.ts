import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTextarea } from '@tectra-ng/ui/textarea';

@Component({
  selector: 'textarea-basic-example',
  imports: [TxTextarea],
  template: `<textarea
    txTextarea
    rows="4"
    placeholder="Leave a note for the team"
    aria-label="Note"
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
export default class TextareaBasicExample {}

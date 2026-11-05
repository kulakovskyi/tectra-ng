import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxField } from '@tectra/ui/field';
import { TxTextarea, TxTextareaCounter } from '@tectra/ui/textarea';

@Component({
  selector: 'textarea-counter-example',
  imports: [TxField, TxTextarea, TxTextareaCounter],
  template: `
    <tx-field label="Short bio">
      <textarea
        txTextarea
        rows="3"
        maxlength="160"
        [autoResize]="true"
        [fluid]="true"
        #bio="txTextarea"
      ></textarea>
      <tx-textarea-counter [for]="bio" />
    </tx-field>
  `,
  styles: `
    :host {
      display: block;
      max-width: 420px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TextareaCounterExample {}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxChipsInput } from '@tectra-ng/ui/chips-input';

@Component({
  selector: 'chips-input-methods-example',
  imports: [TxChipsInput, TxButton, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-chips-input
        #chips
        ariaLabel="Skills"
        placeholder="Skills"
        [addOnBlur]="false"
        [formControl]="skills"
        [(text)]="draft"
      />
      <div class="row">
        @for (suggestion of suggestions; track suggestion) {
          <button
            txButton
            type="button"
            size="small"
            severity="secondary"
            outlined
            icon="plus"
            [label]="suggestion"
            (click)="chips.add(suggestion)"
          ></button>
        }
        <button
          txButton
          type="button"
          size="small"
          text
          label="Clear text"
          [disabled]="!draft()"
          (click)="chips.clearText()"
        ></button>
      </div>
      <span class="hint">Typed: {{ draft() || '—' }}</span>
    </div>
  `,
  styles: `
    .stack {
      display: grid;
      gap: 12px;
    }
    .row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputMethodsExample {
  readonly skills = new FormControl<string[]>(['Research']);
  readonly draft = signal('');
  readonly suggestions = ['Writing', 'Interviews', 'Prototyping'];
}

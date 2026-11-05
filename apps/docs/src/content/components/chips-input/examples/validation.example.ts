import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxChipsInput } from '@tectra/ui/chips-input';

@Component({
  selector: 'chips-input-validation-example',
  imports: [TxChipsInput],
  template: `
    <div class="stack">
      <tx-chips-input
        [itemPattern]="email"
        [separator]="separator"
        [invalid]="!!rejected()"
        [placeholder]="'Invite by email'"
        (rejected)="rejected.set($event.value)"
        (added)="rejected.set('')"
      />
      @if (rejected()) {
        <span class="hint">“{{ rejected() }}” is not an email address.</span>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputValidationExample {
  readonly email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  readonly separator = /[\s,;]+/;
  readonly rejected = signal('');
}

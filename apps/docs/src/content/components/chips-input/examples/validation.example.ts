import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  TxChipsInput,
  TxChipsInputCommitEvent,
  TxChipsInputRejectReason,
} from '@tectra-ng/ui/chips-input';

const MESSAGES: Record<TxChipsInputRejectReason, string> = {
  duplicate: 'is already invited',
  max: 'does not fit, five people at most',
  pattern: 'is not an email address',
  length: 'is longer than 40 characters',
};

@Component({
  selector: 'chips-input-validation-example',
  imports: [TxChipsInput],
  template: `
    <div class="stack">
      <tx-chips-input
        ariaLabel="Invite by email"
        placeholder="Invite by email"
        maxLengthMode="reject"
        [maxLength]="40"
        [max]="5"
        [itemPattern]="email"
        [separator]="separator"
        [normalize]="lowercase"
        [invalid]="problems().length > 0"
        [(value)]="emails"
        (committed)="report($event)"
      />
      @for (problem of problems(); track $index) {
        <span class="hint">{{ problem }}</span>
      }
      <span class="hint">{{ emails()?.length ?? 0 }} of 5 invited</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ChipsInputValidationExample {
  readonly email = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
  readonly separator = /[\s,;]+/;
  readonly emails = signal<string[] | null>(['ana@example.com']);
  readonly problems = signal<string[]>([]);

  readonly lowercase = (value: string) => value.toLowerCase();

  report(event: TxChipsInputCommitEvent): void {
    this.problems.set(event.rejected.map(({ value, reason }) => `“${value}” ${MESSAGES[reason]}.`));
  }
}

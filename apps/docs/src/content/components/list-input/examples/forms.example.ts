import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TxButton } from '@tectra-ng/ui/button';
import { TxField } from '@tectra-ng/ui/field';
import { TxListInput } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-forms-example',
  imports: [TxListInput, TxField, TxButton, ReactiveFormsModule],
  template: `
    <tx-field label="Invite by email" hint="We send one invitation to each address">
      <tx-list-input type="email" [rows]="4" [formControl]="emails" />
    </tx-field>
    <div class="actions">
      <button txButton label="Add the team" severity="secondary" (click)="addTeam()"></button>
      <button txButton label="Send invitations" (click)="send()"></button>
    </div>
    <p class="result">{{ status() }}</p>
  `,
  styles: `
    .actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .result {
      margin: 12px 0 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputFormsExample {
  readonly emails = new FormControl<string[]>([], {
    nonNullable: true,
    validators: Validators.required,
  });
  readonly status = signal('Nothing sent yet');

  addTeam(): void {
    this.emails.setValue(['olena@example.com', 'taras@example.com', 'iryna@example.com']);
  }

  send(): void {
    this.emails.markAsTouched();
    this.status.set(
      this.emails.valid ? `Sent to ${this.emails.value.length} people` : 'Add at least one email',
    );
  }
}

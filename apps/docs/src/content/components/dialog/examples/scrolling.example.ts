import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxDialog, TxDialogClose, TxDialogFooter } from '@tectra-ng/ui/dialog';

@Component({
  selector: 'dialog-scrolling-example',
  imports: [TxDialog, TxDialogFooter, TxDialogClose, TxButton],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="visible.set(true)">
      Terms of service
    </button>
    <tx-dialog
      header="Terms of service"
      subtitle="Last updated on 1 November"
      [(visible)]="visible"
    >
      @for (section of sections; track section) {
        <h3 class="title">{{ $index + 1 }}. {{ section }}</h3>
        <p>
          These terms describe how the service may be used, what you can expect from us and what we
          expect from you. Read them in full before you accept; you can always find them again in
          the account settings.
        </p>
      }
      <tx-dialog-footer>
        <button txButton severity="secondary" txDialogClose>Decline</button>
        <button txButton txDialogClose>Accept</button>
      </tx-dialog-footer>
    </tx-dialog>
  `,
  styles: `
    .title {
      margin: 16px 0 4px;
      font-size: var(--tx-font-size-md);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogScrollingExample {
  readonly visible = signal(false);
  readonly sections = [
    'Accounts',
    'Payments',
    'Content',
    'Privacy',
    'Termination',
    'Liability',
    'Changes',
    'Contact',
  ];
}

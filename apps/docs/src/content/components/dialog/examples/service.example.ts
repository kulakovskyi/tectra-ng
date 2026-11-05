import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TxButton } from '@tectra/ui/button';
import {
  TxDialogClose,
  TxDialogContent,
  TxDialogFooter,
  TxDialogHeader,
  TxDialogService,
  injectDialogData,
} from '@tectra/ui/dialog';
import { TxField } from '@tectra/ui/field';
import { TxInput } from '@tectra/ui/input';

@Component({
  selector: 'dialog-rename-project',
  imports: [
    TxDialogHeader,
    TxDialogContent,
    TxDialogFooter,
    TxDialogClose,
    TxButton,
    TxField,
    TxInput,
    FormsModule,
  ],
  template: `
    <tx-dialog-header
      title="Rename project"
      subtitle="The new name is shown to everyone on the team."
    />
    <tx-dialog-content>
      <tx-field label="Project name">
        <input txInput [fluid]="true" [(ngModel)]="name" />
      </tx-field>
    </tx-dialog-content>
    <tx-dialog-footer>
      <button txButton severity="secondary" [text]="true" txDialogClose>Cancel</button>
      <button txButton [txDialogClose]="name.trim()" [disabled]="!name.trim()">Rename</button>
    </tx-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RenameProjectDialog {
  name = injectDialogData<{ name: string }>().name;
}

@Component({
  selector: 'dialog-service-example',
  imports: [TxButton],
  template: `
    <div class="row">
      <span
        >Project: <strong>{{ project() }}</strong></span
      >
      <button txButton icon="pencil" severity="secondary" [outlined]="true" (click)="rename()">
        Rename
      </button>
    </div>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 16px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogServiceExample {
  private dialogs = inject(TxDialogService);
  readonly project = signal('Atlas');

  rename(): void {
    this.dialogs
      .open<RenameProjectDialog, { name: string }, string>(RenameProjectDialog, {
        data: { name: this.project() },
        size: 'small',
      })
      .closed.subscribe((name) => {
        if (name) {
          this.project.set(name);
        }
      });
  }
}

import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { TxButton } from '@tectra/ui/button';
import {
  TxDialogClose,
  TxDialogContent,
  TxDialogFooter,
  TxDialogHeader,
  TxDialogRef,
  TxDialogService,
  injectDialogRef,
} from '@tectra/ui/dialog';
import { TxField } from '@tectra/ui/field';
import { TxTextarea } from '@tectra/ui/textarea';

@Component({
  selector: 'dialog-discard-changes',
  imports: [TxDialogHeader, TxDialogContent, TxDialogFooter, TxDialogClose, TxButton],
  template: `
    <tx-dialog-header title="Discard changes?" [closeButton]="false" />
    <tx-dialog-content>Your note has not been saved.</tx-dialog-content>
    <tx-dialog-footer>
      <button txButton severity="secondary" [text]="true" [txDialogClose]="false">
        Keep editing
      </button>
      <button txButton severity="danger" [txDialogClose]="true">Discard</button>
    </tx-dialog-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DiscardChangesDialog {}

@Component({
  selector: 'dialog-note-editor',
  imports: [
    TxDialogHeader,
    TxDialogContent,
    TxDialogFooter,
    TxDialogClose,
    TxButton,
    TxField,
    TxTextarea,
    FormsModule,
  ],
  template: `
    <tx-dialog-header title="New note" />
    <tx-dialog-content>
      <tx-field label="Note">
        <textarea
          txTextarea
          rows="4"
          class="note"
          [(ngModel)]="text"
          (ngModelChange)="dirty = true"
        ></textarea>
      </tx-field>
    </tx-dialog-content>
    <tx-dialog-footer>
      <button txButton severity="secondary" [text]="true" txDialogClose>Cancel</button>
      <button txButton (click)="save()">Save</button>
    </tx-dialog-footer>
  `,
  styles: `
    .note {
      box-sizing: border-box;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NoteEditorDialog {
  private ref = injectDialogRef<string>();
  text = '';
  dirty = false;

  save(): void {
    this.dirty = false;
    void this.ref.close(this.text);
  }
}

@Component({
  selector: 'dialog-guard-example',
  imports: [TxButton],
  template: `<button txButton icon="plus" (click)="write()">Write a note</button>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DialogGuardExample {
  private dialogs = inject(TxDialogService);

  write(): void {
    const editor: TxDialogRef<string, NoteEditorDialog> = this.dialogs.open<
      NoteEditorDialog,
      unknown,
      string
    >(NoteEditorDialog, {
      size: 'small',
      canClose: () =>
        !editor.componentInstance?.dirty ||
        this.dialogs
          .open<DiscardChangesDialog, unknown, boolean>(DiscardChangesDialog, {
            size: 'small',
            role: 'alertdialog',
          })
          .closed.pipe(map(Boolean)),
    });
  }
}

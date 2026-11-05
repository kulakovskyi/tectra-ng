import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxConfirmService } from '@tectra/ui/confirm';

@Component({
  selector: 'confirm-delete-example',
  imports: [TxButton],
  template: `
    <ul class="files">
      @for (file of files(); track file) {
        <li>
          {{ file }}
          <button
            txButton
            icon="trash"
            size="small"
            severity="danger"
            [text]="true"
            [attr.aria-label]="'Delete ' + file"
            (click)="remove(file)"
          ></button>
        </li>
      } @empty {
        <li class="empty">No files left.</li>
      }
    </ul>
  `,
  styles: `
    .files {
      display: grid;
      gap: 4px;
      max-width: 300px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .files li {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .empty {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ConfirmDeleteExample {
  private confirm = inject(TxConfirmService);
  readonly files = signal(['Q3 report.pdf', 'Roadmap.xlsx', 'Logo.svg']);

  async remove(file: string): Promise<void> {
    const ok = await this.confirm.dialog({
      title: `Delete “${file}”?`,
      message: 'The file and its version history will be gone for everyone.',
      severity: 'danger',
    });
    if (ok) {
      this.files.update((files) => files.filter((other) => other !== file));
    }
  }
}

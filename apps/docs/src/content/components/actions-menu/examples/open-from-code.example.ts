import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { TxActionsMenu, TxActionsMenuItem } from '@tectra-ng/blocks/actions-menu';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'actions-menu-open-from-code-example',
  imports: [TxActionsMenu, TxButton],
  template: `
    <div class="files">
      @for (file of files; track file) {
        <button
          txButton
          severity="secondary"
          outlined
          icon="file"
          aria-haspopup="menu"
          (click)="openFor(file, $event)"
          (contextmenu)="openFor(file, $event)"
        >
          {{ file }}
        </button>
      }
      <tx-actions-menu
        [tooltip]="'Actions of ' + file()"
        [items]="actions"
        (itemSelect)="last.set($event + ' ' + file())"
      />
    </div>
    <p class="result">Last action: {{ last() }}</p>
  `,
  styles: `
    .files {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 7px;
    }

    .result {
      margin: 14px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ActionsMenuOpenFromCodeExample {
  readonly files = ['report.pdf', 'budget.xlsx', 'notes.md'];
  readonly file = signal(this.files[0]);
  readonly last = signal('none');
  readonly menu = viewChild.required(TxActionsMenu);
  readonly actions: TxActionsMenuItem[] = [
    { id: 'rename', label: 'Rename', icon: 'pencil' },
    { id: 'download', label: 'Download', icon: 'download' },
    { id: 'delete', label: 'Delete', icon: 'trash', danger: true },
  ];

  openFor(file: string, event: MouseEvent): void {
    event.preventDefault();
    this.file.set(file);
    if (event.type === 'contextmenu') {
      this.menu().open(event);
    } else {
      this.menu().toggle(event);
    }
  }
}

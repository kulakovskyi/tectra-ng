import { ChangeDetectionStrategy, Component, TemplateRef, inject, viewChild } from '@angular/core';
import { TxAvatar } from '@tectra/ui/avatar';
import { TxButton } from '@tectra/ui/button';
import { TxToastContext, TxToastService } from '@tectra/ui/toast';

interface Mention {
  author: string;
  task: string;
}

@Component({
  selector: 'toast-template-example',
  imports: [TxButton, TxAvatar],
  template: `
    <button txButton severity="secondary" [outlined]="true" (click)="mention()">
      Simulate a mention
    </button>
    <ng-template #mentionToast let-toast let-close="close">
      <tx-avatar size="small" [name]="toast.data.author" />
      <div class="body">
        <strong>{{ toast.data.author }}</strong> mentioned you in
        <span class="task">{{ toast.data.task }}</span>
        <div class="actions">
          <button txButton size="small" (click)="close()">Reply</button>
          <button txButton size="small" severity="secondary" [text]="true" (click)="close()">
            Later
          </button>
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    .body {
      flex: 1;
      min-width: 0;
    }
    .task {
      color: var(--tx-primary-soft-text);
    }
    .actions {
      display: flex;
      gap: 6px;
      margin-top: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastTemplateExample {
  private toast = inject(TxToastService);
  private readonly mentionToast = viewChild.required<TemplateRef<TxToastContext>>('mentionToast');

  mention(): void {
    const data: Mention = { author: 'Olena Koval', task: 'Q4 launch checklist' };
    this.toast.show({ template: this.mentionToast(), data, closable: false, life: 8000 });
  }
}

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxToastService } from '@tectra/ui/toast';

@Component({
  selector: 'toast-actions-example',
  imports: [TxButton],
  template: `
    <ul class="list">
      @for (item of items(); track item) {
        <li>
          {{ item }}
          <button
            txButton
            icon="inbox"
            size="small"
            severity="secondary"
            [text]="true"
            [attr.aria-label]="'Archive ' + item"
            (click)="archive(item)"
          ></button>
        </li>
      }
    </ul>
  `,
  styles: `
    .list {
      display: grid;
      gap: 4px;
      max-width: 280px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .list li {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToastActionsExample {
  private toast = inject(TxToastService);
  readonly items = signal(['Weekly sync notes', 'Budget draft', 'Onboarding checklist']);

  archive(item: string): void {
    const index = this.items().indexOf(item);
    this.items.update((items) => items.filter((other) => other !== item));
    this.toast.info(`“${item}” archived`, {
      life: 8000,
      actions: [
        {
          label: 'Undo',
          run: () =>
            this.items.update((items) => [...items.slice(0, index), item, ...items.slice(index)]),
        },
      ],
    });
  }
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra/ui/button';
import { TxPaginator, TxPaginatorEnd, TxPaginatorStart } from '@tectra/ui/paginator';

@Component({
  selector: 'paginator-template-example',
  imports: [TxPaginator, TxPaginatorStart, TxPaginatorEnd, TxButton],
  template: `
    <tx-paginator [(first)]="first" [rows]="10" [totalRecords]="120">
      <ng-template txPaginatorStart let-state>
        <button
          txButton
          text
          severity="secondary"
          icon="refresh"
          aria-label="Reload"
          (click)="reloads.set(reloads() + 1)"
        ></button>
      </ng-template>
      <ng-template txPaginatorEnd let-state>
        <span class="muted">Page {{ state.page + 1 }} · reloaded {{ reloads() }}×</span>
      </ng-template>
    </tx-paginator>
  `,
  styles: `
    .muted {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PaginatorTemplateExample {
  readonly first = signal(0);
  readonly reloads = signal(0);
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxPageHeader } from '@tectra-ng/blocks/page-header';
import { TxButton } from '@tectra-ng/ui/button';

@Component({
  selector: 'page-header-basic-example',
  imports: [TxPageHeader, TxButton],
  template: `
    <div class="ground">
      <tx-page-header title="Payments" [subtitle]="count() + ' payments this month'">
        <button txButton icon="plus" (click)="count.set(count() + 1)">Create payment</button>
      </tx-page-header>
    </div>
  `,
  styles: `
    .ground {
      padding: 20px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PageHeaderBasicExample {
  readonly count = signal(24);
}

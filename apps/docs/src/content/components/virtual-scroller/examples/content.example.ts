import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxVirtualScroller, TxVirtualScrollerContent } from '@tectra-ng/ui/virtual-scroller';

@Component({
  selector: 'virtual-scroller-content-example',
  imports: [TxVirtualScroller, TxVirtualScrollerContent],
  template: `
    <tx-virtual-scroller
      ariaLabel="Contacts"
      scrollHeight="240px"
      [items]="contacts"
      [itemSize]="48"
    >
      <ng-template txVirtualScrollerContent let-items let-first="first">
        <ul class="list">
          @for (contact of items; track $index) {
            <li
              class="contact"
              [attr.aria-posinset]="first + $index + 1"
              [attr.aria-setsize]="contacts.length"
            >
              <strong>{{ contact.name }}</strong>
              <span>{{ contact.email }}</span>
            </li>
          }
        </ul>
      </ng-template>
    </tx-virtual-scroller>
  `,
  styles: `
    tx-virtual-scroller {
      max-width: 420px;
      border: 1px solid var(--tx-surface-border);
      border-radius: var(--tx-radius-md);
    }
    .list {
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .contact {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      height: 48px;
      padding: 0 12px;
      box-sizing: border-box;
      border-bottom: 1px solid var(--tx-surface-border);
    }
    .contact span {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class VirtualScrollerContentExample {
  readonly contacts = Array.from({ length: 5000 }, (_, index) => ({
    name: `Contact ${index + 1}`,
    email: `contact${index + 1}@example.com`,
  }));
}

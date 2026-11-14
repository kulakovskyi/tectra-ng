import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMenu, TxMenuItem, TxMenuItemEvent, TxMenuTrigger } from '@tectra-ng/ui/menu';

@Component({
  selector: 'menu-arrow-example',
  imports: [TxMenu, TxMenuTrigger, TxButton],
  template: `
    <div class="row">
      <button
        txButton
        icon="ellipsis-v"
        severity="secondary"
        aria-label="Note actions"
        [rounded]="true"
        [text]="true"
        [txMenuTrigger]="note"
      ></button>
      <tx-menu
        #note
        popup
        arrow
        placement="bottom-start"
        ariaLabel="Note actions"
        [model]="noteActions"
        (itemSelected)="pick($event)"
      />
      <button
        txButton
        icon="th-large"
        label="Layout"
        severity="secondary"
        [outlined]="true"
        [txMenuTrigger]="layout"
      ></button>
      <tx-menu
        #layout
        popup
        arrow
        placement="bottom"
        ariaLabel="Layout"
        [model]="layouts"
        (itemSelected)="pick($event)"
      />
    </div>
    <p class="note">Last choice: {{ last() }}</p>
  `,
  styles: `
    .row {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .note {
      margin: 16px 0 0;
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuArrowExample {
  readonly last = signal('none');
  readonly noteActions: TxMenuItem[] = [
    { label: 'Pin', icon: 'bookmark' },
    { label: 'Share', icon: 'share-alt' },
    { separator: true },
    { label: 'Delete', icon: 'trash', severity: 'danger' },
  ];
  readonly layouts: TxMenuItem[] = [
    { label: 'Grid', icon: 'th-large' },
    { label: 'List', icon: 'list' },
    { label: 'Table', icon: 'table' },
  ];

  pick({ item }: TxMenuItemEvent): void {
    this.last.set(item.label ?? 'none');
  }
}

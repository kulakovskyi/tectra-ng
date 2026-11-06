import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxMenu, TxMenuItem, TxMenuItemTemplate, TxMenuTrigger } from '@tectra-ng/ui/menu';

@Component({
  selector: 'menu-template-example',
  imports: [TxMenu, TxMenuItemTemplate, TxMenuTrigger, TxButton, TxAvatar],
  template: `
    <button txButton severity="secondary" [outlined]="true" [txMenuTrigger]="assign">
      Assign to
    </button>
    <tx-menu #assign popup ariaLabel="Assign to" [model]="people">
      <ng-template txMenuItem let-item>
        <tx-avatar size="small" [name]="item.label" />
        <span class="person">
          {{ item.label }}
          <small>{{ item.data }}</small>
        </span>
      </ng-template>
    </tx-menu>
  `,
  styles: `
    .person {
      display: grid;
    }
    .person small {
      color: var(--tx-text-muted);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenuTemplateExample {
  readonly people: TxMenuItem[] = [
    { label: 'Olena Koval', data: 'Design' },
    { label: 'Marek Nowak', data: 'Engineering' },
    { label: 'Sara Lind', data: 'Marketing' },
  ];
}

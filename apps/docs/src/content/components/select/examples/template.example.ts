import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect, TxSelectOptionTemplate } from '@tectra-ng/ui/select';

@Component({
  selector: 'select-template-example',
  imports: [TxSelect, TxSelectOptionTemplate],
  template: `
    <tx-select
      [options]="users"
      [optionLabel]="'name'"
      [optionValue]="'id'"
      [placeholder]="'Assignee'"
    >
      <ng-template txSelectOption let-user>
        <span class="user">
          <span class="user__avatar">{{ user.name[0] }}</span>
          <span>{{ user.name }}</span>
          <span class="hint">{{ user.role }}</span>
        </span>
      </ng-template>
    </tx-select>
  `,
  styles: `
    .user {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .user__avatar {
      display: inline-grid;
      place-items: center;
      width: 22px;
      height: 22px;
      border-radius: 50%;
      background: var(--tx-primary-soft);
      color: var(--tx-primary-base);
      font-size: 12px;
      font-weight: 600;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectTemplateExample {
  users = [
    { id: 1, name: 'Olena', role: 'Designer' },
    { id: 2, name: 'Taras', role: 'Developer' },
    { id: 3, name: 'Iryna', role: 'Manager' },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

interface Member {
  name: string;
  roles: string[];
}

@Component({
  selector: 'tooltip-template-example',
  imports: [TxTooltip, TxIcon],
  template: `
    <ul class="members">
      @for (member of members; track member.name) {
        <li>
          <span>{{ member.name }}</span>
          <button
            type="button"
            class="roles"
            [txTooltip]="roles"
            [tooltipContext]="member.roles"
            tooltipPlacement="right"
          >
            <tx-icon name="users" />
            {{ member.roles[0] }}
            @if (member.roles.length > 1) {
              +{{ member.roles.length - 1 }}
            }
          </button>
        </li>
      }
    </ul>
    <ng-template #roles let-roles>
      <strong>All roles</strong>
      <ul class="role-list">
        @for (role of roles; track role) {
          <li>{{ role }}</li>
        }
      </ul>
    </ng-template>
  `,
  styles: `
    .members {
      display: grid;
      gap: 8px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    .members li {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .members li > span {
      min-width: 120px;
    }
    .roles {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 2px 6px;
      border: 0;
      border-radius: var(--tx-radius-sm);
      background: none;
      color: var(--tx-text-muted);
      font: inherit;
      cursor: default;
    }
    .role-list {
      margin: 4px 0 0;
      padding-inline-start: 18px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TooltipTemplateExample {
  readonly members: Member[] = [
    { name: 'Olena Koval', roles: ['Owner', 'Billing', 'Editor'] },
    { name: 'Marek Nowak', roles: ['Editor', 'Reviewer'] },
    { name: 'Sara Lind', roles: ['Viewer'] },
  ];
}

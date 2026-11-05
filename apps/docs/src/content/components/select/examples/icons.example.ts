import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxSelect, TxSelectOptionTemplate, TxSelectValueTemplate } from '@tectra/ui/select';

@Component({
  selector: 'select-icons-example',
  imports: [TxSelect, TxSelectOptionTemplate, TxSelectValueTemplate, TxIcon],
  template: `
    <tx-select [options]="channels" [placeholder]="'Notify by'">
      <ng-template txSelectOption let-channel>
        <span class="option">
          <tx-icon [name]="channel.icon" />
          <span>{{ channel.label }}</span>
          <span class="hint">{{ channel.hint }}</span>
        </span>
      </ng-template>
      <ng-template txSelectValue let-channel>
        <span class="option"><tx-icon [name]="channel.icon" />{{ channel.label }}</span>
      </ng-template>
    </tx-select>
  `,
  styles: `
    .option {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectIconsExample {
  readonly channels = [
    { label: 'Email', value: 'email', icon: 'envelope', hint: 'daily digest' },
    { label: 'Phone', value: 'phone', icon: 'phone', hint: 'urgent only' },
    { label: 'Chat', value: 'chat', icon: 'comments', hint: 'instant' },
    { label: 'Calendar', value: 'calendar', icon: 'calendar', hint: 'events' },
  ];
}

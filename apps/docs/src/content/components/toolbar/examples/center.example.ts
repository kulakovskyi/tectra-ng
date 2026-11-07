import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxButton } from '@tectra-ng/ui/button';
import { TxIconField, TxInputIcon } from '@tectra-ng/ui/icon-field';
import { TxInput } from '@tectra-ng/ui/input';
import { TxToolbar, TxToolbarCenter, TxToolbarEnd, TxToolbarStart } from '@tectra-ng/ui/toolbar';

@Component({
  selector: 'toolbar-center-example',
  imports: [
    TxToolbar,
    TxToolbarStart,
    TxToolbarCenter,
    TxToolbarEnd,
    TxButton,
    TxIconField,
    TxInputIcon,
    TxInput,
  ],
  template: `
    <tx-toolbar ariaLabel="Projects">
      @for (view of views; track view.value) {
        <button
          txButton
          txToolbarStart
          [text]="active() !== view.value"
          [severity]="active() === view.value ? 'primary' : 'secondary'"
          [icon]="view.icon"
          [attr.aria-label]="view.label"
          [attr.aria-pressed]="active() === view.value"
          (click)="active.set(view.value)"
        ></button>
      }
      <tx-icon-field txToolbarCenter>
        <tx-input-icon [icon]="'search'" />
        <input txInput placeholder="Search projects" aria-label="Search projects" />
      </tx-icon-field>
      <button
        txButton
        txToolbarEnd
        severity="secondary"
        text
        icon="cog"
        aria-label="Settings"
      ></button>
      <button txButton txToolbarEnd icon="plus">Project</button>
    </tx-toolbar>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ToolbarCenterExample {
  readonly views = [
    { value: 'list', label: 'List view', icon: 'bars' },
    { value: 'grid', label: 'Grid view', icon: 'th-large' },
    { value: 'calendar', label: 'Calendar view', icon: 'calendar' },
  ];
  readonly active = signal('list');
}

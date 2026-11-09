import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCommandPalette, TxCommandPaletteItem } from '@tectra-ng/blocks/command-palette';
import { TxAvatar } from '@tectra-ng/ui/avatar';
import { TxButton } from '@tectra-ng/ui/button';
import { TxTooltip } from '@tectra-ng/ui/tooltip';

@Component({
  selector: 'command-palette-compact-example',
  imports: [TxCommandPalette, TxAvatar, TxButton, TxTooltip],
  template: `
    <div class="topbar">
      <tx-command-palette compact shortcutKey="j" localFilter [items]="items" />
      <button
        txButton
        text
        severity="secondary"
        icon="bell"
        aria-label="Notifications"
        txTooltip="Notifications"
      ></button>
      <tx-avatar name="Anna Koval" size="small" />
    </div>
  `,
  styles: `
    .topbar {
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 16px;
      border-radius: 12px;
      background: var(--tx-surface-ground);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommandPaletteCompactExample {
  readonly items: TxCommandPaletteItem[] = [
    { id: 'inbox', group: 'pages', label: 'Inbox', icon: 'inbox' },
    { id: 'calendar', group: 'pages', label: 'Calendar', icon: 'calendar' },
  ];
}

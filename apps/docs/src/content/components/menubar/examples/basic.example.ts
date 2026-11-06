import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxMenuItem } from '@tectra-ng/ui/menu';
import { TxMenubar } from '@tectra-ng/ui/menubar';

@Component({
  selector: 'menubar-basic-example',
  imports: [TxMenubar],
  template: `
    <tx-menubar ariaLabel="Editor" [model]="items" />
    <p class="status">Last command: {{ last() }}</p>
  `,
  styles: `
    .status {
      margin: 12px 0 0;
      font-size: 13px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MenubarBasicExample {
  readonly last = signal('none');
  private readonly run = (label: string) => () => this.last.set(label);
  readonly items: TxMenuItem[] = [
    {
      label: 'File',
      icon: 'file',
      items: [
        { label: 'New', icon: 'plus', command: this.run('New') },
        { label: 'Open', icon: 'folder-open', command: this.run('Open') },
        { separator: true },
        {
          label: 'Export',
          icon: 'upload',
          items: [
            { label: 'PDF', command: this.run('Export PDF') },
            { label: 'CSV', command: this.run('Export CSV') },
          ],
        },
      ],
    },
    {
      label: 'Edit',
      icon: 'pencil',
      items: [
        { label: 'Undo', icon: 'undo', command: this.run('Undo') },
        { label: 'Redo', icon: 'refresh', command: this.run('Redo') },
      ],
    },
    { label: 'Search', icon: 'search', command: this.run('Search') },
    {
      label: 'Help',
      icon: 'question-circle',
      items: [{ label: 'Shortcuts', command: this.run('Shortcuts') }],
    },
  ];
}

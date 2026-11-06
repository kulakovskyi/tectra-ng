import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxPanelMenu, TxPanelMenuItem } from '@tectra-ng/ui/panel-menu';

@Component({
  selector: 'panel-menu-basic-example',
  imports: [TxPanelMenu],
  template: `<tx-panel-menu class="menu" [model]="items" />`,
  styles: `
    .menu {
      width: 100%;
      max-width: 320px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PanelMenuBasicExample {
  readonly items: TxPanelMenuItem[] = [
    {
      label: 'Files',
      icon: 'file',
      items: [
        {
          label: 'Documents',
          icon: 'folder',
          items: [
            { label: 'Invoices', icon: 'file-pdf' },
            { label: 'Contracts', icon: 'file-edit' },
          ],
        },
        { label: 'Images', icon: 'image' },
        { label: 'Archive', icon: 'box', disabled: true },
      ],
    },
    {
      label: 'Cloud',
      icon: 'cloud',
      items: [
        { label: 'Upload', icon: 'cloud-upload' },
        { label: 'Download', icon: 'cloud-download' },
        { label: 'Sync', icon: 'refresh' },
      ],
    },
    {
      label: 'Devices',
      icon: 'desktop',
      items: [
        { label: 'Phone', icon: 'mobile' },
        { label: 'Desktop', icon: 'desktop' },
      ],
    },
  ];
}

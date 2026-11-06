import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { TxListbox } from '@tectra-ng/ui/listbox';
import { TxSelectOptionTemplate } from '@tectra-ng/ui/select';

@Component({
  selector: 'listbox-template-example',
  imports: [TxListbox, TxSelectOptionTemplate, TxIcon],
  template: `
    <tx-listbox
      [options]="files"
      [optionLabel]="'name'"
      [optionValue]="'name'"
      [ariaLabel]="'Attachment'"
    >
      <ng-template txSelectOption let-file>
        <span class="file">
          <tx-icon [name]="file.icon" />
          <span class="file__name">{{ file.name }}</span>
          <span class="hint">{{ file.size }}</span>
        </span>
      </ng-template>
    </tx-listbox>
  `,
  styles: `
    .file {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .file__name {
      flex: 1;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListboxTemplateExample {
  readonly files = [
    { name: 'report.pdf', size: '1.2 MB', icon: 'file-pdf' },
    { name: 'budget.xlsx', size: '84 KB', icon: 'file-excel' },
    { name: 'photo.png', size: '3.4 MB', icon: 'image' },
    { name: 'archive.zip', size: '120 MB', icon: 'file', disabled: true },
  ];
}

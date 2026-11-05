import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxIcon } from '@tectra/icons';
import { TxAutocomplete } from '@tectra/ui/autocomplete';
import { TxSelectOptionTemplate } from '@tectra/ui/select';

@Component({
  selector: 'autocomplete-template-example',
  imports: [TxAutocomplete, TxSelectOptionTemplate, TxIcon],
  template: `
    <tx-autocomplete
      [suggestions]="commands"
      [optionLabel]="'label'"
      [optionValue]="'id'"
      [localSearch]="true"
      [delay]="0"
      [placeholder]="'Command'"
    >
      <ng-template txSelectOption let-command>
        <span class="command">
          <tx-icon [name]="command.icon" />
          {{ command.label }}
        </span>
      </ng-template>
    </tx-autocomplete>
  `,
  styles: `
    .command {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteTemplateExample {
  readonly commands = [
    { id: 'new', label: 'New file', icon: 'file' },
    { id: 'open', label: 'Open folder', icon: 'folder-open' },
    { id: 'search', label: 'Search everywhere', icon: 'search' },
    { id: 'settings', label: 'Open settings', icon: 'cog' },
    { id: 'share', label: 'Share link', icon: 'share-alt' },
  ];
}

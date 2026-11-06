import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAutocomplete } from '@tectra-ng/ui/autocomplete';

@Component({
  selector: 'autocomplete-design-tokens-example',
  imports: [TxAutocomplete],
  template: `<tx-autocomplete
    [suggestions]="tags"
    [multiple]="true"
    [localSearch]="true"
    [delay]="0"
    [placeholder]="'Tags'"
    [dt]="{ chip: { borderRadius: '999px' }, option: { borderRadius: '999px' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompleteDesignTokensExample {
  readonly tags = ['urgent', 'review', 'design', 'backend', 'frontend'];
}

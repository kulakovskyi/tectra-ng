import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxAutocomplete } from '@tectra-ng/ui/autocomplete';

@Component({
  selector: 'autocomplete-pass-through-example',
  imports: [TxAutocomplete],
  template: `<tx-autocomplete
    [suggestions]="tags"
    [localSearch]="true"
    [delay]="0"
    [pt]="pt"
    [placeholder]="'Tag'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AutocompletePassThroughExample {
  readonly tags = ['urgent', 'review', 'design', 'backend', 'frontend'];
  readonly pt = {
    input: { style: { fontFamily: 'var(--tx-font-mono, monospace)' } },
    option: { style: { fontFamily: 'var(--tx-font-mono, monospace)' } },
  };
}

import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-accessibility-example',
  imports: [TxSelectButton],
  template: `
    <div class="stack">
      <span id="accessibility-sort-label" class="hint">Sort by</span>
      <tx-select-button
        ariaLabelledBy="accessibility-sort-label"
        [options]="sorts"
        [(value)]="sort"
      />
      <tx-select-button
        ariaLabel="Text style"
        [multiple]="true"
        [iconOnly]="true"
        [options]="styles"
        [(value)]="style"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonAccessibilityExample {
  readonly sorts = [
    { label: 'Newest', value: 'new' },
    { label: 'Oldest', value: 'old' },
    { label: 'Archived', value: 'archived', disabled: true },
    { label: 'Popular', value: 'popular' },
  ];
  readonly styles = [
    { label: 'Bold', value: 'bold', icon: 'bold' },
    { label: 'Italic', value: 'italic', icon: 'italic' },
    { label: 'Underline', value: 'underline', icon: 'underline' },
  ];
  readonly sort = signal<unknown>('new');
  readonly style = signal<unknown>(['bold']);
}

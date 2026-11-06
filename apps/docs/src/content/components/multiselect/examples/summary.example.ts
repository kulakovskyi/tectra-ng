import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';

@Component({
  selector: 'multiselect-summary-example',
  imports: [TxMultiselect],
  template: `
    <div class="stack">
      <tx-multiselect
        [options]="skills"
        [maxSelectedLabels]="2"
        [placeholder]="'Default summary'"
      />
      <tx-multiselect
        [options]="skills"
        [maxSelectedLabels]="1"
        [selectedItemsLabel]="'{count} skills'"
        [placeholder]="'Own summary'"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectSummaryExample {
  readonly skills = [
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'node' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
    { label: 'Figma', value: 'figma' },
  ];
}

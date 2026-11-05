import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra/ui/multiselect';

@Component({
  selector: 'multiselect-sizes-example',
  imports: [TxMultiselect],
  template: `
    <div class="stack">
      <tx-multiselect [options]="skills" [size]="'small'" [placeholder]="'Small'" />
      <tx-multiselect [options]="skills" [placeholder]="'Medium'" />
      <tx-multiselect [options]="skills" [size]="'large'" [placeholder]="'Large'" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectSizesExample {
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

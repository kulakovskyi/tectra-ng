import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxMultiselect } from '@tectra/ui/multiselect';

@Component({
  selector: 'multiselect-design-tokens-example',
  imports: [TxMultiselect],
  template: `<tx-multiselect
    [options]="skills"
    [display]="'chip'"
    [maxSelectedLabels]="10"
    [placeholder]="'Skills'"
    [dt]="{
      chip: { borderRadius: '999px', paddingStart: '10px' },
      checkbox: { borderRadius: '50%' },
    }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectDesignTokensExample {
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

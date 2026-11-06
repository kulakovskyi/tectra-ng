import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TxMultiselect } from '@tectra-ng/ui/multiselect';

@Component({
  selector: 'multiselect-basic-example',
  imports: [TxMultiselect, ReactiveFormsModule],
  template: `
    <div class="stack">
      <tx-multiselect [options]="skills" [formControl]="selected" [placeholder]="'Skills'" />
      <span class="hint">Value: {{ selected.value?.join(', ') || '—' }}</span>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class MultiselectBasicExample {
  readonly skills = [
    { label: 'Angular', value: 'angular' },
    { label: 'TypeScript', value: 'typescript' },
    { label: 'RxJS', value: 'rxjs' },
    { label: 'Node.js', value: 'node' },
    { label: 'PostgreSQL', value: 'postgres' },
    { label: 'Docker', value: 'docker' },
    { label: 'Figma', value: 'figma' },
  ];
  readonly selected = new FormControl<string[]>(['angular', 'typescript']);
}

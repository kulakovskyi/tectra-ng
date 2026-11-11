import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxRadialBar, TxRadialBarItem } from '@tectra-ng/charts/radial-bar';

@Component({
  selector: 'radial-bar-accessibility-example',
  imports: [TxRadialBar],
  template: `<tx-radial-bar [items]="items" totalLabel="Average" ariaLabel="Course completion" />`,
  styles: `
    tx-radial-bar {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RadialBarAccessibilityExample {
  readonly items: TxRadialBarItem[] = [
    { label: 'Videos', value: 80 },
    { label: 'Quizzes', value: 55 },
    { label: 'Project', value: 30 },
  ];
}

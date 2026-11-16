import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { TxSelectButton } from '@tectra-ng/ui/select-button';

@Component({
  selector: 'select-button-icons-example',
  imports: [TxSelectButton],
  template: `
    <div class="flex">
      <tx-select-button
        ariaLabel="Text alignment"
        [iconOnly]="true"
        [options]="alignments"
        [(value)]="alignment"
      />
      <tx-select-button ariaLabel="Layout" [options]="layouts" [(value)]="layout" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectButtonIconsExample {
  readonly alignments = [
    { label: 'Align left', value: 'left', icon: 'align-left' },
    { label: 'Align center', value: 'center', icon: 'align-center' },
    { label: 'Align right', value: 'right', icon: 'align-right' },
    { label: 'Justify', value: 'justify', icon: 'align-justify' },
  ];
  readonly layouts = [
    { label: 'List', value: 'list', icon: 'list' },
    { label: 'Grid', value: 'grid', icon: 'th-large' },
    { label: 'Table', value: 'table', icon: 'table' },
  ];
  readonly alignment = signal<unknown>('left');
  readonly layout = signal<unknown>('grid');
}

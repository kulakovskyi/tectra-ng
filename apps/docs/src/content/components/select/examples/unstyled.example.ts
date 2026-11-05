import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxSelect } from '@tectra/ui/select';

@Component({
  selector: 'select-unstyled-example',
  imports: [TxSelect],
  template: `<tx-select
    [options]="colors"
    [unstyled]="true"
    [pt]="pt"
    [ariaLabel]="'Colour'"
    [placeholder]="'Colour'"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class SelectUnstyledExample {
  readonly colors = ['Red', 'Green', 'Blue'];
  readonly pt = {
    box: { style: { gap: '8px', padding: '8px 0', borderBottom: '2px solid currentColor' } },
    trigger: {
      style: { font: 'inherit', textAlign: 'left', background: 'none', border: '0', padding: '0' },
    },
    panel: {
      style: {
        background: 'var(--tx-surface-overlay)',
        border: '1px solid currentColor',
        padding: '4px',
      },
    },
    option: { style: { padding: '6px 8px' } },
  };
}

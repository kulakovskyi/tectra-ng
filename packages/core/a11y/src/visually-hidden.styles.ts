import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'tx-visually-hidden-styles',
  template: '',
  styles: `
    .cdk-visually-hidden {
      position: absolute;
      left: 0;
      width: 1px;
      height: 1px;
      margin: -1px;
      padding: 0;
      overflow: hidden;
      clip: rect(0 0 0 0);
      border: 0;
      outline: 0;
      white-space: nowrap;
      appearance: none;
    }

    [dir='rtl'] .cdk-visually-hidden {
      right: 0;
      left: auto;
    }
  `,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TxVisuallyHiddenStyles {}

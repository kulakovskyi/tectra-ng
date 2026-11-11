import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxCodeDiff } from '@tectra-ng/code-editor';

@Component({
  selector: 'code-diff-basic-example',
  imports: [TxCodeDiff],
  template: `
    <tx-code-diff
      language="typescript"
      [original]="before"
      [value]="after"
      readOnly
      height="300px"
    />
  `,
  styles: `
    :host {
      display: block;
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CodeDiffBasicExample {
  readonly before = `export function price(amount: number): string {
  const rounded = Math.round(amount);
  return '$' + rounded;
}

export function discount(amount: number) {
  return amount * 0.9;
}`;
  readonly after = `export function price(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function discount(amount: number, rate = 0.1): number {
  return amount * (1 - rate);
}

export const FREE_SHIPPING_FROM = 50;`;
}

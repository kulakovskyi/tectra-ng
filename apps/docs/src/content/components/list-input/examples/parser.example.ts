import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxListInput, TxListInputParser } from '@tectra-ng/ui/list-input';

@Component({
  selector: 'list-input-parser-example',
  imports: [TxListInput],
  template: `
    <tx-list-input
      ariaLabel="Order numbers"
      placeholder="#1024, #1025 or one order per line"
      hint="Paste order numbers with or without #"
      countLabel="{count, plural, one {# order} other {# orders}}"
      splitByLines
      [rows]="4"
      [parser]="orderNumber"
      text="#1024&#10;1025, #1024&#10;order 77&#10;#abc"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ListInputParserExample {
  readonly orderNumber: TxListInputParser = (token) => {
    const digits = token.replace(/^#/, '');
    return /^\d{3,}$/.test(digits) ? digits : null;
  };
}

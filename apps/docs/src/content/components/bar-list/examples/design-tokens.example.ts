import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxBarList, TxBarListItem } from '@tectra-ng/charts/bar-list';

@Component({
  selector: 'bar-list-design-tokens-example',
  imports: [TxBarList],
  template: `
    <tx-bar-list
      [items]="languages"
      [dt]="{
        barList: {
          rowHeight: '34px',
          barBackground: 'color-mix(in srgb, var(--tx-green-500) 24%, transparent)',
          barRadius: '999px',
          valueFontWeight: '700',
        },
      }"
      ariaLabel="Readers by language"
    />
  `,
  styles: `
    :host {
      display: block;
      max-width: 480px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class BarListDesignTokensExample {
  readonly languages: TxBarListItem[] = [
    { label: 'English', value: 6400 },
    { label: 'Spanish', value: 2100 },
    { label: 'German', value: 1750 },
    { label: 'Japanese', value: 980 },
  ];
}

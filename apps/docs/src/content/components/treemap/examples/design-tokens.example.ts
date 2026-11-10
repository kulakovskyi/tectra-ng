import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTreemap, TxTreemapItem } from '@tectra-ng/charts/treemap';

@Component({
  selector: 'treemap-design-tokens-example',
  imports: [TxTreemap],
  template: `
    <tx-treemap
      [items]="languages"
      [height]="280"
      [dt]="{
        treemap: { radius: '12px', gap: '4px', labelFontSize: '14px' },
        series: {
          color1: 'var(--tx-primary-700)',
          color2: 'var(--tx-primary-500)',
          color3: 'var(--tx-primary-400)',
          color4: 'var(--tx-primary-300)',
        },
      }"
      ariaLabel="Code by language"
    />
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TreemapDesignTokensExample {
  readonly languages: TxTreemapItem[] = [
    { label: 'TypeScript', value: 62 },
    { label: 'SCSS', value: 18 },
    { label: 'HTML', value: 14 },
    { label: 'JSON', value: 6 },
  ];
}

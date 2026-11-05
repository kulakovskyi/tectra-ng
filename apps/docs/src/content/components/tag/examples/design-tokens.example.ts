import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TxTag } from '@tectra/ui/tag';

@Component({
  selector: 'tag-design-tokens-example',
  imports: [TxTag],
  template: `<tx-tag
    icon="star"
    value="Featured"
    [dt]="{ root: { tint: '24%', borderRadius: '2px', fontWeight: '700' } }"
  />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TagDesignTokensExample {}

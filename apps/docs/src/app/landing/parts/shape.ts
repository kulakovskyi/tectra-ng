import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { TxIcon } from '@tectra-ng/icons';
import { LandingShapeKind, LandingTone } from '../landing.types';

@Component({
  selector: 'docs-landing-shape',
  imports: [TxIcon],
  template: `
    <span class="shape__body"></span>
    @if (icon(); as icon) {
      <tx-icon class="shape__icon" [name]="icon" />
    }
  `,
  styleUrl: './shape.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'aria-hidden': 'true',
    '[attr.data-kind]': 'kind()',
    '[attr.data-tone]': 'tone()',
  },
})
export class LandingShape {
  readonly kind = input<LandingShapeKind>('square');
  readonly tone = input<LandingTone>('sky');
  readonly icon = input<string>();
}

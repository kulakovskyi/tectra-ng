import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LandingGlyphKind } from '../landing.types';

@Component({
  selector: 'docs-landing-glyph',
  template: `<span class="glyph" [attr.data-kind]="kind()"><i></i><i></i><i></i><i></i></span>`,
  styleUrl: './glyph.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true' },
})
export class LandingGlyph {
  readonly kind = input.required<LandingGlyphKind>();
}

import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { injectTokens, TxPassThroughPart } from '@tectra-ng/core/config';
import { TxChartAnnotationShape } from './chart-annotations';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CORE_ICON_DEFAULTS } from './core.icons';
import { CORE_THEME } from './core.theme';

/** Draws lines, bands, points and their labels over the plot of a cartesian chart. */
@Component({
  selector: 'g[tx-chart-annotations]',
  template: `
    @for (shape of shown(); track shape.key) {
      <svg:g class="tx-chart-annotation" [class]="part()?.class" [style]="part()?.style" [attr.data-kind]="shape.kind" [style.--tx-chart-annotation-color]="shape.color">
        @if (shape.kind === 'band') {
          @if (layer() !== 'front') {
            <svg:rect class="tx-chart-annotation__band" [attr.x]="shape.x1" [attr.y]="shape.y1" [attr.width]="shape.x2 - shape.x1" [attr.height]="shape.y2 - shape.y1" />
          }
        } @else if (layer() !== 'back') {
          @if (shape.kind === 'line') {
            <svg:line class="tx-chart-annotation__line" [attr.x1]="shape.x1" [attr.y1]="shape.y1" [attr.x2]="shape.x2" [attr.y2]="shape.y2" />
          } @else {
            <svg:circle class="tx-chart-annotation__point" [attr.cx]="shape.x1" [attr.cy]="shape.y1" />
          }
        }
        @if (layer() !== 'back' && shape.label; as label) {
          <svg:rect class="tx-chart-annotation__pill" [attr.x]="label.x" [attr.y]="label.y" [attr.width]="label.width" [attr.height]="label.height" />
          <svg:text class="tx-chart-annotation__label" [attr.x]="label.x + label.width / 2" [attr.y]="label.y + label.height / 2" text-anchor="middle" dominant-baseline="central">
            {{ label.text }}
          </svg:text>
        }
      </svg:g>
    }
  `,
  styleUrl: './chart-annotations.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-chart-annotations', 'aria-hidden': 'true' },
  viewProviders: [provideTxIconDefaults(CORE_ICON_DEFAULTS)],
})
export class TxChartAnnotations {
  private readonly coreTheme = injectTokens(CORE_THEME);

  readonly shapes = input.required<readonly TxChartAnnotationShape[]>({ alias: 'tx-chart-annotations' });
  readonly part = input<TxPassThroughPart | undefined>(undefined);
  readonly layer = input<'back' | 'front' | 'all'>('all');

  readonly shown = computed(() => {
    const layer = this.layer();
    return layer === 'back' ? this.shapes().filter((shape) => shape.kind === 'band') : layer === 'front' ? this.shapes().filter((shape) => shape.kind !== 'band' || shape.label) : this.shapes();
  });
}

import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { injectTokens, TxPassThroughPart } from '@tectra-ng/core/config';
import { TxChartAxesModel } from './chart.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { CORE_ICON_DEFAULTS } from './core.icons';
import { CORE_THEME } from './core.theme';

/** Draws the grid, zero line, tick labels and titles of a cartesian chart from `cartesianLayout().axes`. */
@Component({
  selector: 'g[tx-chart-axes]',
  template: `
    <svg:g class="tx-chart-axes__grid" [class]="gridPart()?.class" [style]="gridPart()?.style">
      @for (line of model().grid; track $index) {
        <svg:line class="tx-chart-axes__grid-line" [attr.x1]="line.x1" [attr.y1]="line.y1" [attr.x2]="line.x2" [attr.y2]="line.y2" />
      }
    </svg:g>
    @if (model().zero; as zero) {
      <svg:line class="tx-chart-axes__zero" [attr.x1]="zero.x1" [attr.y1]="zero.y1" [attr.x2]="zero.x2" [attr.y2]="zero.y2" />
    }
    @for (axis of model().axes; track axis.position) {
      <svg:g class="tx-chart-axes__axis" [attr.data-position]="axis.position" [class]="axisPart()?.class" [style]="axisPart()?.style">
        @for (label of axis.labels; track $index) {
          <svg:text
            class="tx-chart-axes__label"
            [attr.x]="label.x"
            [attr.y]="label.y"
            [attr.text-anchor]="label.anchor"
            [attr.dominant-baseline]="label.baseline"
            [attr.transform]="label.rotate ? 'rotate(' + label.rotate + ' ' + label.x + ' ' + label.y + ')' : null"
          >
            {{ label.text }}
            @if (label.title) {
              <svg:title>{{ label.title }}</svg:title>
            }
          </svg:text>
        }
        @if (axis.title; as title) {
          <svg:text
            class="tx-chart-axes__title"
            text-anchor="middle"
            [attr.x]="title.x"
            [attr.y]="title.y"
            [attr.transform]="title.rotate ? 'rotate(' + title.rotate + ' ' + title.x + ' ' + title.y + ')' : null"
          >
            {{ title.text }}
          </svg:text>
        }
      </svg:g>
    }
  `,
  styleUrl: './chart-axes.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'tx-chart-axes', 'aria-hidden': 'true' },
  viewProviders: [provideTxIconDefaults(CORE_ICON_DEFAULTS)],
})
export class TxChartAxes {
  private readonly coreTheme = injectTokens(CORE_THEME);

  readonly model = input.required<TxChartAxesModel>({ alias: 'tx-chart-axes' });
  readonly gridPart = input<TxPassThroughPart | undefined>(undefined);
  readonly axisPart = input<TxPassThroughPart | undefined>(undefined);
}

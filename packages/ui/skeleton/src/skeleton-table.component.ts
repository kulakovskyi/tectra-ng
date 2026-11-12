import { ChangeDetectionStrategy, Component, booleanAttribute, computed, input, numberAttribute } from '@angular/core';
import { injectPassThrough, injectTokens, injectUnstyled, TxPassThrough, TxPassThroughOptions } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraSkeletonTokens, toStyleObject } from '@tectra-ng/themes';
import { TxSkeleton } from './skeleton.component';
import { TxSkeletonAnimation, TxSkeletonTablePart } from './skeleton.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { SKELETON_ICON_DEFAULTS } from './skeleton.icons';
import { SKELETON_THEME } from './skeleton.theme';

const WIDTHS = ['72%', '48%', '86%', '60%', '38%', '66%'];

@Component({
  selector: 'tx-skeleton-table',
  imports: [TxSkeleton],
  template: `
    @if (header()) {
      <div class="tx-skeleton-table__row tx-skeleton-table__header" [class]="passThrough().header?.class" [style]="passThrough().header?.style">
        @for (column of columnList(); track column) {
          <span class="tx-skeleton-table__cell" [class]="passThrough().cell?.class"><tx-skeleton width="45%" [animation]="animation()" [unstyled]="isUnstyled()" /></span>
        }
      </div>
    }
    @for (row of rowList(); track row) {
      <div class="tx-skeleton-table__row" [class]="passThrough().row?.class" [style]="passThrough().row?.style">
        @for (column of columnList(); track column) {
          <span class="tx-skeleton-table__cell" [class]="passThrough().cell?.class"
            ><tx-skeleton [width]="width(row, column)" [animation]="animation()" [unstyled]="isUnstyled()"
          /></span>
        }
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }

    .tx-skeleton-table__row {
      display: grid;
      grid-template-columns: repeat(var(--_columns), minmax(0, 1fr));
      align-items: center;
    }

    :host([data-styled]) .tx-skeleton-table__row {
      gap: var(--tx-skeleton-table-cell-gap);
      height: var(--tx-skeleton-table-row-height);
      padding-inline: var(--tx-skeleton-table-cell-gap);
      border-bottom: 1px solid var(--tx-skeleton-table-border-color);
    }

    :host([data-styled]) .tx-skeleton-table__header {
      background: var(--tx-skeleton-table-header-background);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-skeleton-table',
    'aria-hidden': 'true',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
  },
  viewProviders: [provideTxIconDefaults(SKELETON_ICON_DEFAULTS)],
})
export class TxSkeletonTable {
  private readonly skeletonTheme = injectTokens(SKELETON_THEME);

  readonly rows = input<number, unknown>(5, { transform: numberAttribute });
  readonly columns = input<number, unknown>(4, { transform: numberAttribute });
  readonly header = input<boolean, unknown>(true, { transform: booleanAttribute });
  readonly animation = input<TxSkeletonAnimation>('wave');
  readonly dt = input<TectraDeepPartial<TectraSkeletonTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxSkeletonTablePart, TxSkeletonTable> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('skeletonTable', this, this.pt, this.ptOptions);
  readonly rowList = computed(() => Array.from({ length: Math.max(0, this.rows()) }, (_, index) => index));
  readonly columnList = computed(() => Array.from({ length: Math.max(1, this.columns()) }, (_, index) => index));
  readonly hostStyle = computed(() => ({
    ...toStyleObject(this.dt(), '--tx-skeleton'),
    '--_columns': String(this.columnList().length),
    ...this.passThrough().root?.style,
  }));

  width(row: number, column: number): string {
    return WIDTHS[(row * 3 + column * 5) % WIDTHS.length];
  }
}

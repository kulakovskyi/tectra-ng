import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, contentChild, input } from '@angular/core';
import { TxPassThrough, TxPassThroughOptions, injectPassThrough, injectUnstyled } from '@tectra-ng/core/config';
import { optionalBoolean } from '@tectra-ng/core/utils';
import { TectraDeepPartial, TectraTimelineTokens, toStyleObject } from '@tectra-ng/themes';
import { TxTimelineConnector, TxTimelineContent, TxTimelineMarker, TxTimelineOpposite } from './timeline.templates';
import { TxTimelineAlign, TxTimelineEventContext, TxTimelineLayout, TxTimelinePart } from './timeline.types';
import { provideTxIconDefaults } from '@tectra-ng/icons';
import { TIMELINE_ICON_DEFAULTS } from './timeline.icons';

@Component({
  selector: 'tx-timeline',
  imports: [NgTemplateOutlet],
  templateUrl: './timeline.component.html',
  styleUrl: './timeline.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'tx-timeline',
    '[class]': 'passThrough().root?.class',
    '[style]': 'hostStyle()',
    '[attr.data-styled]': '!isUnstyled() || null',
    '[attr.data-layout]': 'layout()',
    '[attr.data-align]': 'resolvedAlign()',
  },
  viewProviders: [provideTxIconDefaults(TIMELINE_ICON_DEFAULTS)],
})
export class TxTimeline<T = unknown> {
  readonly value = input<readonly T[] | null | undefined>([]);
  readonly layout = input<TxTimelineLayout>('vertical');
  readonly align = input<TxTimelineAlign | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  readonly ariaLabelledBy = input<string | undefined>(undefined);
  readonly dt = input<TectraDeepPartial<TectraTimelineTokens> | undefined>(undefined);
  readonly pt = input<TxPassThrough<TxTimelinePart, TxTimeline<T>> | undefined>(undefined);
  readonly ptOptions = input<TxPassThroughOptions | undefined>(undefined);
  readonly unstyled = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  protected readonly contentTemplate = contentChild(TxTimelineContent);
  protected readonly oppositeTemplate = contentChild(TxTimelineOpposite);
  protected readonly markerTemplate = contentChild(TxTimelineMarker);
  protected readonly connectorTemplate = contentChild(TxTimelineConnector);

  readonly isUnstyled = injectUnstyled(this.unstyled);
  readonly passThrough = injectPassThrough('timeline', this, this.pt, this.ptOptions);
  readonly hostStyle = computed(() => ({ ...toStyleObject(this.dt(), '--tx-timeline'), ...this.passThrough().root?.style }));
  readonly resolvedAlign = computed<TxTimelineAlign>(() => this.align() ?? (this.layout() === 'horizontal' ? 'top' : 'left'));

  protected readonly events = computed(() => {
    const items = this.value() ?? [];
    return items.map<TxTimelineEventContext<T>>((item, index) => ({
      $implicit: item,
      index,
      first: index === 0,
      last: index === items.length - 1,
    }));
  });
}

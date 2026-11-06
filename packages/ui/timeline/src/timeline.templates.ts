import { Directive, TemplateRef, inject } from '@angular/core';
import { TxTimelineEventContext } from './timeline.types';

@Directive({ selector: 'ng-template[txTimelineContent]' })
export class TxTimelineContent<T = unknown> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTimelineOpposite]' })
export class TxTimelineOpposite<T = unknown> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTimelineMarker]' })
export class TxTimelineMarker<T = unknown> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
}

@Directive({ selector: 'ng-template[txTimelineConnector]' })
export class TxTimelineConnector<T = unknown> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
}

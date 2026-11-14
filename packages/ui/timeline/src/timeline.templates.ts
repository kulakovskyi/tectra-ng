import { Directive, TemplateRef, inject, input } from '@angular/core';
import { TxTimelineEventContext } from './timeline.types';

@Directive({ selector: 'ng-template[txTimelineContent]' })
export class TxTimelineContent<T> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
  readonly txTimelineContentOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTimelineContent<T>, context: unknown): context is TxTimelineEventContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTimelineOpposite]' })
export class TxTimelineOpposite<T> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
  readonly txTimelineOppositeOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTimelineOpposite<T>, context: unknown): context is TxTimelineEventContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTimelineMarker]' })
export class TxTimelineMarker<T> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
  readonly txTimelineMarkerOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTimelineMarker<T>, context: unknown): context is TxTimelineEventContext<T> {
    return !!context;
  }
}

@Directive({ selector: 'ng-template[txTimelineConnector]' })
export class TxTimelineConnector<T> {
  readonly templateRef = inject<TemplateRef<TxTimelineEventContext<T>>>(TemplateRef);
  readonly txTimelineConnectorOf = input<readonly T[] | null | undefined>(undefined);

  static ngTemplateContextGuard<T>(_directive: TxTimelineConnector<T>, context: unknown): context is TxTimelineEventContext<T> {
    return !!context;
  }
}

/** Direction of the timeline: events in a column or in a row. */
export type TxTimelineLayout = 'vertical' | 'horizontal';
/** Side of the line where the content sits; `alternate` switches sides event by event. */
export type TxTimelineAlign = 'left' | 'right' | 'alternate' | 'top' | 'bottom';
/** Parts of `tx-timeline` that `pt` can style. */
export type TxTimelinePart = 'root' | 'list' | 'event' | 'eventOpposite' | 'eventSeparator' | 'eventMarker' | 'eventConnector' | 'eventContent';

/** Context of the event templates of `tx-timeline`. */
export interface TxTimelineEventContext<T = unknown> {
  /** The event data. */
  $implicit: T;
  /** Position of the event in the list, from 0. */
  index: number;
  /** Whether this is the first event. */
  first: boolean;
  /** Whether this is the last event. */
  last: boolean;
}

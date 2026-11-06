export type TxTimelineLayout = 'vertical' | 'horizontal';
export type TxTimelineAlign = 'left' | 'right' | 'alternate' | 'top' | 'bottom';
export type TxTimelinePart = 'root' | 'list' | 'event' | 'eventOpposite' | 'eventSeparator' | 'eventMarker' | 'eventConnector' | 'eventContent';

export interface TxTimelineEventContext<T = unknown> {
  $implicit: T;
  index: number;
  first: boolean;
  last: boolean;
}

/** Names of the parts of `tx-analog-clock` that `pt` can style. */
export type TxAnalogClockPart = 'root' | 'face' | 'tick' | 'hourHand' | 'minuteHand' | 'secondHand' | 'pin';

/** Time text and hand angles of a clock at one moment. */
export interface TxAnalogClockHands {
  /** Time as `HH:mm`. */
  time: string;
  /** Angle of the hour hand in degrees, 0 at 12 o'clock. */
  hourAngle: number;
  /** Angle of the minute hand in degrees. */
  minuteAngle: number;
  /** Angle of the second hand in degrees. */
  secondAngle: number;
}

/** A fixed time for `tx-analog-clock`: a `Date`, milliseconds or an ISO string; empty means the running clock. */
export type TxAnalogClockTime = Date | number | string | null | undefined;

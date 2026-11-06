export type TxAnalogClockPart = 'root' | 'face' | 'tick' | 'hourHand' | 'minuteHand' | 'secondHand' | 'pin';

export interface TxAnalogClockHands {
  time: string;
  hourAngle: number;
  minuteAngle: number;
  secondAngle: number;
}

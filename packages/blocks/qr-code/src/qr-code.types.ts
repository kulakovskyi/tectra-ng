export type {
  TxQrDotStyle,
  TxQrErrorCorrection,
  TxQrEyeBallStyle,
  TxQrEyeFrameStyle,
  TxQrGradient,
  TxQrImageFormat,
  TxQrMatrix,
} from '@tectra-ng/qr';

/** Names of the parts of `tx-qr-code` that its `pt` input can style. */
export type TxQrCodePart = 'root' | 'svg' | 'error';

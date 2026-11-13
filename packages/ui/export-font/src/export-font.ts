import { TX_EXPORT_FONT_BOLD, TX_EXPORT_FONT_REGULAR } from './generated/onest.font';

/** Onest Regular and SemiBold as base64 strings, used to embed real text in PDF exports. */
export const TX_EXPORT_FONT = { regular: TX_EXPORT_FONT_REGULAR, bold: TX_EXPORT_FONT_BOLD } as const;

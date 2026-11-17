import { TxExportFont } from '../export.types';

/**
 * Loads the Onest font from `@tectra-ng/ui/export-font` for PDF files; it is fetched on the first PDF export.
 */
export function loadDefaultExportFont(): Promise<TxExportFont> {
  return import('@tectra-ng/ui/export-font').then((module) => module.TX_EXPORT_FONT);
}

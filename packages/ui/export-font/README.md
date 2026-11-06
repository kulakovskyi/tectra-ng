# Export font

Onest Regular and SemiBold (Latin and Cyrillic) for `tx-export` PDF files, as base64 strings: `TX_EXPORT_FONT`. The PDF writer loads this entry point only on the first PDF export, keeps only the glyphs a file uses and embeds them, so the text in the PDF is real, selectable and searchable.

Onest is © The Onest Project Authors, licensed under the SIL Open Font License 1.1 — see `OFL.txt` next to this file. Regenerate with `npm run export-font -- <folder of an Onest release>`.

To use another font (another script, a brand font), give the PDF options a loader: `{ pdf: { font: () => fetch('/fonts/brand.ttf').then((response) => response.arrayBuffer()).then((regular) => ({ regular })) } }`. TrueType outlines (`.ttf`) only.

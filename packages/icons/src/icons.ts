export const TX_ICONS = {
  bell: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10.3 21a1.9 1.9 0 0 0 3.4 0',
  check: 'M20 6 9 17l-5-5',
  chevronDown: 'm6 9 6 6 6-6',
  close: 'M18 6 6 18M6 6l12 12',
  download: 'M12 3v12m0 0 5-5m-5 5-5-5M5 21h14',
  edit: 'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z',
  externalLink: 'M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
  filter: 'M3 4h18l-7 8.5V19l-4 2v-8.5Z',
  loader: 'M21 12a9 9 0 1 1-6.2-8.6',
  moon: 'M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8Z',
  plus: 'M12 5v14M5 12h14',
  refresh: 'M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5',
  search: 'm21 21-4.3-4.3M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z',
  sun: 'M12 3v2m0 14v2M5.6 5.6 7 7m10 10 1.4 1.4M3 12h2m14 0h2M5.6 18.4 7 17M17 7l1.4-1.4M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  trash: 'M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6',
  upload: 'M12 21V9m0 0 5 5m-5-5-5 5M5 3h14',
} as const;

export type TxIconName = keyof typeof TX_ICONS;

export function isTxIconName(name: string | undefined): name is TxIconName {
  return !!name && name in TX_ICONS;
}

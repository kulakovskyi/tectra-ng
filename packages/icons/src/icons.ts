import { TxIconPath } from './icon.types';

export type TxIconName =
  | 'address-book'
  | 'align-center'
  | 'align-justify'
  | 'align-left'
  | 'align-right'
  | 'angle-double-down'
  | 'angle-double-left'
  | 'angle-double-right'
  | 'angle-double-up'
  | 'angle-down'
  | 'angle-left'
  | 'angle-right'
  | 'angle-up'
  | 'arrow-circle-down'
  | 'arrow-circle-left'
  | 'arrow-circle-right'
  | 'arrow-circle-up'
  | 'arrow-down-left-and-arrow-up-right-to-center'
  | 'arrow-down-left'
  | 'arrow-down-right'
  | 'arrow-down'
  | 'arrow-left'
  | 'arrow-right-arrow-left'
  | 'arrow-right'
  | 'arrow-u-turn-up-left'
  | 'arrow-u-turn-up-right'
  | 'arrow-up-left'
  | 'arrow-up-right-and-arrow-down-left-from-center'
  | 'arrow-up-right'
  | 'arrow-up'
  | 'arrows-alt'
  | 'arrows-h'
  | 'arrows-v'
  | 'asterisk'
  | 'at'
  | 'backward'
  | 'ban'
  | 'barcode'
  | 'bars'
  | 'bell-slash'
  | 'bell'
  | 'bitcoin'
  | 'block-quote'
  | 'bold'
  | 'bolt'
  | 'book'
  | 'bookmark-fill'
  | 'bookmark'
  | 'box'
  | 'briefcase'
  | 'building-columns'
  | 'building'
  | 'bullseye'
  | 'calculator'
  | 'calendar-clock'
  | 'calendar-minus'
  | 'calendar-plus'
  | 'calendar-times'
  | 'calendar'
  | 'camera'
  | 'car'
  | 'caret-down'
  | 'caret-left'
  | 'caret-right'
  | 'caret-up'
  | 'cart-arrow-down'
  | 'cart-minus'
  | 'cart-plus'
  | 'case-sensitive'
  | 'chart-bar'
  | 'chart-line'
  | 'chart-pie'
  | 'chart-scatter'
  | 'check-circle'
  | 'check-square'
  | 'check'
  | 'chevron-circle-down'
  | 'chevron-circle-left'
  | 'chevron-circle-right'
  | 'chevron-circle-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'chevron-right'
  | 'chevron-up'
  | 'circle-fill'
  | 'circle'
  | 'clipboard'
  | 'clock'
  | 'clone'
  | 'cloud-download'
  | 'cloud-upload'
  | 'cloud'
  | 'code-branch'
  | 'code'
  | 'cog'
  | 'columns-2'
  | 'comment'
  | 'comments'
  | 'compass'
  | 'compress'
  | 'copy'
  | 'credit-card'
  | 'crown'
  | 'database'
  | 'delete-left'
  | 'desktop'
  | 'directions-alt'
  | 'directions'
  | 'dollar'
  | 'dot'
  | 'download'
  | 'eject'
  | 'ellipsis-h'
  | 'ellipsis-v'
  | 'envelope'
  | 'equals'
  | 'eraser'
  | 'euro'
  | 'exclamation-circle'
  | 'exclamation-triangle'
  | 'expand'
  | 'external-link'
  | 'eye-dropper'
  | 'eye-slash'
  | 'eye'
  | 'face-smile'
  | 'fast-backward'
  | 'fast-forward'
  | 'file-arrow-up'
  | 'file-check'
  | 'file-edit'
  | 'file-excel'
  | 'file-export'
  | 'file-import'
  | 'file-o'
  | 'file-pdf'
  | 'file-plus'
  | 'file-word'
  | 'file'
  | 'filter-fill'
  | 'filter-slash'
  | 'filter'
  | 'flag-fill'
  | 'flag'
  | 'folder-open'
  | 'folder-plus'
  | 'folder'
  | 'forward'
  | 'gauge'
  | 'gift'
  | 'globe'
  | 'graduation-cap'
  | 'grid-2'
  | 'grip-horizontal'
  | 'grip-vertical'
  | 'grip'
  | 'hammer'
  | 'hashtag'
  | 'heading-1'
  | 'heading-2'
  | 'heading-3'
  | 'heading-4'
  | 'heading-5'
  | 'heading-6'
  | 'heading'
  | 'headphones'
  | 'heart-fill'
  | 'heart'
  | 'highlighter'
  | 'history'
  | 'home'
  | 'horizontal-rule'
  | 'hourglass'
  | 'id-card'
  | 'image'
  | 'images'
  | 'inbox'
  | 'indent'
  | 'indian-rupee'
  | 'info-circle'
  | 'info'
  | 'italic'
  | 'key'
  | 'language'
  | 'lightbulb'
  | 'link'
  | 'list-check'
  | 'list-ol'
  | 'list-tree'
  | 'list'
  | 'lock-open'
  | 'lock'
  | 'map-marker'
  | 'map'
  | 'mars'
  | 'megaphone'
  | 'microchip-ai'
  | 'microchip'
  | 'microphone'
  | 'minus-circle'
  | 'minus'
  | 'mobile'
  | 'money-bill'
  | 'moon'
  | 'note-sticky'
  | 'objects-column'
  | 'outdent'
  | 'palette'
  | 'paperclip'
  | 'paragraph-left'
  | 'paragraph-right'
  | 'pause-circle'
  | 'pause'
  | 'pen-line'
  | 'pen-to-square'
  | 'pencil'
  | 'percentage'
  | 'phone'
  | 'play-circle'
  | 'play'
  | 'plus-circle'
  | 'plus'
  | 'pound'
  | 'power-off'
  | 'print'
  | 'qrcode'
  | 'question-circle'
  | 'question'
  | 'receipt'
  | 'rectangle-xmark'
  | 'refresh'
  | 'replay'
  | 'reply'
  | 'rows-2'
  | 'save'
  | 'search-minus'
  | 'search-plus'
  | 'search'
  | 'send'
  | 'server'
  | 'share-alt'
  | 'shield'
  | 'shop'
  | 'shopping-bag'
  | 'shopping-cart'
  | 'sidebar'
  | 'sign-in'
  | 'sign-out'
  | 'signature'
  | 'sitemap'
  | 'slash'
  | 'sliders-h'
  | 'sliders-v'
  | 'sort-alpha-down-alt'
  | 'sort-alpha-down'
  | 'sort-alpha-up-alt'
  | 'sort-alpha-up'
  | 'sort-alt-slash'
  | 'sort-alt'
  | 'sort-amount-down-alt'
  | 'sort-amount-down'
  | 'sort-amount-up-alt'
  | 'sort-amount-up'
  | 'sort-down-fill'
  | 'sort-down'
  | 'sort-numeric-down-alt'
  | 'sort-numeric-down'
  | 'sort-numeric-up-alt'
  | 'sort-numeric-up'
  | 'sort-up-fill'
  | 'sort-up'
  | 'sort'
  | 'sparkles'
  | 'spinner-dotted'
  | 'spinner'
  | 'square'
  | 'stamp'
  | 'star-fill'
  | 'star-half-fill'
  | 'star-half'
  | 'star'
  | 'step-backward-alt'
  | 'step-backward'
  | 'step-forward-alt'
  | 'step-forward'
  | 'stop-circle'
  | 'stop'
  | 'stopwatch'
  | 'strikethrough'
  | 'subscript'
  | 'sun'
  | 'superscript'
  | 'sync'
  | 'table'
  | 'tablet'
  | 'tag'
  | 'tags'
  | 'text-color'
  | 'text'
  | 'th-large'
  | 'thumbs-down-fill'
  | 'thumbs-down'
  | 'thumbs-up-fill'
  | 'thumbs-up'
  | 'thumbtack'
  | 'ticket'
  | 'times-circle'
  | 'times'
  | 'trash'
  | 'trophy'
  | 'truck'
  | 'turkish-lira'
  | 'underline'
  | 'undo'
  | 'unlock'
  | 'upload'
  | 'user-edit'
  | 'user-minus'
  | 'user-plus'
  | 'user'
  | 'users'
  | 'venus'
  | 'verified'
  | 'video'
  | 'volume-down'
  | 'volume-off'
  | 'volume-up'
  | 'wallet'
  | 'warehouse'
  | 'wave-pulse'
  | 'wifi'
  | 'window-maximize'
  | 'window-minimize'
  | 'wrench';

export const txIconAddressBook: TxIconPath[] = ["M7 3H16A2 2 0 0 1 18 5V19A2 2 0 0 1 16 21H7A2 2 0 0 1 5 19V5A2 2 0 0 1 7 3Z", "M18 7.5L20 7.5", "M18 12L20 12", "M18 16.5L20 16.5", "M9.5 10A2 2 0 1 0 13.5 10A2 2 0 1 0 9.5 10Z", "M8 16.5A3.5 3.5 0 0 1 15 16.5"];
export const txIconAlignCenter: TxIconPath[] = ["M4 6L20 6", "M7 10L17 10", "M4 14L20 14", "M7 18L17 18"];
export const txIconAlignJustify: TxIconPath[] = ["M4 6L20 6", "M4 10L20 10", "M4 14L20 14", "M4 18L20 18"];
export const txIconAlignLeft: TxIconPath[] = ["M4 6L20 6", "M4 10L14 10", "M4 14L20 14", "M4 18L14 18"];
export const txIconAlignRight: TxIconPath[] = ["M4 6L20 6", "M10 10L20 10", "M4 14L20 14", "M10 18L20 18"];
export const txIconAngleDoubleDown: TxIconPath[] = ["M7.5 6.5L12 11L16.5 6.5", "M7.5 13L12 17.5L16.5 13"];
export const txIconAngleDoubleLeft: TxIconPath[] = ["M17.5 7.5L13 12L17.5 16.5", "M11 7.5L6.5 12L11 16.5"];
export const txIconAngleDoubleRight: TxIconPath[] = ["M6.5 16.5L11 12L6.5 7.5", "M13 16.5L17.5 12L13 7.5"];
export const txIconAngleDoubleUp: TxIconPath[] = ["M16.5 17.5L12 13L7.5 17.5", "M16.5 11L12 6.5L7.5 11"];
export const txIconAngleDown: TxIconPath[] = ["M8 10L12 14L16 10"];
export const txIconAngleLeft: TxIconPath[] = ["M14 8L10 12L14 16"];
export const txIconAngleRight: TxIconPath[] = ["M10 16L14 12L10 8"];
export const txIconAngleUp: TxIconPath[] = ["M16 14L12 10L8 14"];
export const txIconArrowCircleDown: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M12 7.5L12 16.5", "M8.5 13L12 16.5L15.5 13"];
export const txIconArrowCircleLeft: TxIconPath[] = ["M12 2.75A9.25 9.25 90 1 0 12 21.25A9.25 9.25 90 1 0 12 2.75Z", "M16.5 12L7.5 12", "M11 8.5L7.5 12L11 15.5"];
export const txIconArrowCircleRight: TxIconPath[] = ["M12 21.25A9.25 9.25 -90 1 0 12 2.75A9.25 9.25 -90 1 0 12 21.25Z", "M7.5 12L16.5 12", "M13 15.5L16.5 12L13 8.5"];
export const txIconArrowCircleUp: TxIconPath[] = ["M21.25 12A9.25 9.25 180 1 0 2.75 12A9.25 9.25 180 1 0 21.25 12Z", "M12 16.5L12 7.5", "M15.5 11L12 7.5L8.5 11"];
export const txIconArrowDownLeftAndArrowUpRightToCenter: TxIconPath[] = ["M20 4L14 10", "M14 5.5L14 10L18.5 10", "M4 20L10 14", "M5.5 14L10 14L10 18.5"];
export const txIconArrowDownLeft: TxIconPath[] = ["M18 6L6 18", "M15.5 18L6 18L6 8.5"];
export const txIconArrowDownRight: TxIconPath[] = ["M6 6L18 18", "M18 8.5L18 18L8.5 18"];
export const txIconArrowDown: TxIconPath[] = ["M12 4.5L12 19.5", "M18 13.5L12 19.5L6 13.5"];
export const txIconArrowLeft: TxIconPath[] = ["M19.5 12L4.5 12", "M10.5 18L4.5 12L10.5 6"];
export const txIconArrowRightArrowLeft: TxIconPath[] = ["M4 8L20 8", "M16.5 4.5L20 8L16.5 11.5", "M20 16L4 16", "M7.5 12.5L4 16L7.5 19.5"];
export const txIconArrowRight: TxIconPath[] = ["M4.5 12L19.5 12", "M13.5 6L19.5 12L13.5 18"];
export const txIconArrowUTurnUpLeft: TxIconPath[] = ["M9 4.5L4.5 9L9 13.5", "M4.5 9H14.25A5.25 5.25 0 0 1 14.25 19.5H8"];
export const txIconArrowUTurnUpRight: TxIconPath[] = ["M15 4.5L19.5 9L15 13.5", "M19.5 9L9.75 9A5.25 5.25 180 0 0 9.75 19.5L16 19.5"];
export const txIconArrowUpLeft: TxIconPath[] = ["M18 18L6 6", "M6 15.5L6 6L15.5 6"];
export const txIconArrowUpRightAndArrowDownLeftFromCenter: TxIconPath[] = ["M14 10L20 4", "M15.5 4L20 4L20 8.5", "M10 14L4 20", "M4 15.5L4 20L8.5 20"];
export const txIconArrowUpRight: TxIconPath[] = ["M6 18L18 6", "M8.5 6L18 6L18 15.5"];
export const txIconArrowUp: TxIconPath[] = ["M12 19.5L12 4.5", "M6 10.5L12 4.5L18 10.5"];
export const txIconArrowsAlt: TxIconPath[] = ["M12 3L12 21", "M3 12L21 12", "M9.5 5.5L12 3L14.5 5.5", "M18.5 9.5L21 12L18.5 14.5", "M14.5 18.5L12 21L9.5 18.5", "M5.5 14.5L3 12L5.5 9.5"];
export const txIconArrowsH: TxIconPath[] = ["M3 12L21 12", "M6.5 8.5L3 12L6.5 15.5", "M17.5 8.5L21 12L17.5 15.5"];
export const txIconArrowsV: TxIconPath[] = ["M12 3L12 21", "M15.5 6.5L12 3L8.5 6.5", "M15.5 17.5L12 21L8.5 17.5"];
export const txIconAsterisk: TxIconPath[] = ["M12 4L12 20", "M18.93 8L5.07 16", "M18.93 16L5.07 8"];
export const txIconAt: TxIconPath[] = ["M8.5 12A3.5 3.5 0 1 0 15.5 12A3.5 3.5 0 1 0 8.5 12Z", "M15.5 8.5V13.25A2.25 2.25 0 0 0 20 13.25V12A8 8 0 1 0 16.6 18.55"];
export const txIconBackward: TxIconPath[] = ["M20.5 6L12.5 12L20.5 18Z", "M12 6L4 12L12 18Z"];
export const txIconBan: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M5.5 5.5L18.5 18.5"];
export const txIconBarcode: TxIconPath[] = ["M4 5L4 19", "M7 5L7 19", "M9.5 5L9.5 19", "M13 5L13 19", "M15.5 5L15.5 19", "M18 5L18 19", "M20.5 5L20.5 19"];
export const txIconBars: TxIconPath[] = ["M4 6L20 6", "M4 12L20 12", "M4 18L20 18"];
export const txIconBellSlash: TxIconPath[] = ["M6 16.5V11A6 6 0 0 1 18 11V16.5L19.5 18H4.5Z", "M10 20.5A2 2 0 0 0 14 20.5", "M4 4L20 20"];
export const txIconBell: TxIconPath[] = ["M6 16.5V11A6 6 0 0 1 18 11V16.5L19.5 18H4.5Z", "M10 20.5A2 2 0 0 0 14 20.5"];
export const txIconBitcoin: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M10 7.5H13.25A2 2 0 0 1 13.25 11.5H10Z", "M10 11.5H13.75A2.5 2.5 0 0 1 13.75 16.5H10Z", "M8.5 7.5L10 7.5", "M8.5 16.5L10 16.5", "M11 5.75L11 7.5", "M11 16.5L11 18.25", "M13 5.75L13 7.5", "M13 16.5L13 18.25"];
export const txIconBlockQuote: TxIconPath[] = ["M4 5L4 19", "M8.5 6L20 6", "M8.5 12L20 12", "M8.5 18L16 18"];
export const txIconBold: TxIconPath[] = ["M7 4.5H12.75A3.75 3.75 0 0 1 12.75 12H7Z", "M7 12H13.75A3.75 3.75 0 0 1 13.75 19.5H7Z"];
export const txIconBolt: TxIconPath[] = ["M13.5 2.5L5 13.5L11.5 13.5L10.5 21.5L19 10.5L12.5 10.5Z"];
export const txIconBook: TxIconPath[] = ["M4.5 18.5V5A1.5 1.5 0 0 1 6 3.5H19.5V17H6A1.5 1.5 0 0 0 4.5 18.5A1.5 1.5 0 0 0 6 20H19.5V17"];
export const txIconBookmarkFill: TxIconPath[] = [{ d: "M6.5 3.5H17.5A1 1 0 0 1 18.5 4.5V20.5L12 16L5.5 20.5V4.5A1 1 0 0 1 6.5 3.5Z", fill: true }];
export const txIconBookmark: TxIconPath[] = ["M6.5 3.5H17.5A1 1 0 0 1 18.5 4.5V20.5L12 16L5.5 20.5V4.5A1 1 0 0 1 6.5 3.5Z"];
export const txIconBox: TxIconPath[] = ["M12 3L20.5 7.5L20.5 16.5L12 21L3.5 16.5L3.5 7.5Z", "M3.5 7.5L12 12L20.5 7.5", "M12 12L12 21"];
export const txIconBriefcase: TxIconPath[] = ["M5 7H19A2 2 0 0 1 21 9V18A2 2 0 0 1 19 20H5A2 2 0 0 1 3 18V9A2 2 0 0 1 5 7Z", "M8.5 7V5A1.5 1.5 0 0 1 10 3.5H14A1.5 1.5 0 0 1 15.5 5V7", "M3 12.5L21 12.5"];
export const txIconBuildingColumns: TxIconPath[] = ["M12 3L21 8L3 8Z", "M5.5 10.5L5.5 17.5", "M9.8 10.5L9.8 17.5", "M14.2 10.5L14.2 17.5", "M18.5 10.5L18.5 17.5", "M3 20.5L21 20.5"];
export const txIconBuilding: TxIconPath[] = ["M6.5 3H17.5A1.5 1.5 0 0 1 19 4.5V19.5A1.5 1.5 0 0 1 17.5 21H6.5A1.5 1.5 0 0 1 5 19.5V4.5A1.5 1.5 0 0 1 6.5 3Z", "M9 7L10 7", "M14 7L15 7", "M9 11L10 11", "M14 11L15 11", "M9 15L10 15", "M14 15L15 15", "M10.5 21L10.5 18L13.5 18L13.5 21"];
export const txIconBullseye: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M6.5 12A5.5 5.5 0 1 0 17.5 12A5.5 5.5 0 1 0 6.5 12Z", "M10.25 12A1.75 1.75 0 1 0 13.75 12A1.75 1.75 0 1 0 10.25 12Z"];
export const txIconCalculator: TxIconPath[] = ["M7.5 3H16.5A2.5 2.5 0 0 1 19 5.5V18.5A2.5 2.5 0 0 1 16.5 21H7.5A2.5 2.5 0 0 1 5 18.5V5.5A2.5 2.5 0 0 1 7.5 3Z", "M8.75 6H15.25A0.75 0.75 0 0 1 16 6.75V8.75A0.75 0.75 0 0 1 15.25 9.5H8.75A0.75 0.75 0 0 1 8 8.75V6.75A0.75 0.75 0 0 1 8.75 6Z", { d: "M8.15 13A0.6 0.6 0 1 0 9.35 13A0.6 0.6 0 1 0 8.15 13Z", fill: true }, { d: "M11.4 13A0.6 0.6 0 1 0 12.6 13A0.6 0.6 0 1 0 11.4 13Z", fill: true }, { d: "M14.65 13A0.6 0.6 0 1 0 15.85 13A0.6 0.6 0 1 0 14.65 13Z", fill: true }, { d: "M8.15 16.75A0.6 0.6 0 1 0 9.35 16.75A0.6 0.6 0 1 0 8.15 16.75Z", fill: true }, { d: "M11.4 16.75A0.6 0.6 0 1 0 12.6 16.75A0.6 0.6 0 1 0 11.4 16.75Z", fill: true }, { d: "M14.65 16.75A0.6 0.6 0 1 0 15.85 16.75A0.6 0.6 0 1 0 14.65 16.75Z", fill: true }];
export const txIconCalendarClock: TxIconPath[] = ["M20.5 11V7.5A2.5 2.5 0 0 0 18 5H6A2.5 2.5 0 0 0 3.5 7.5V18A2.5 2.5 0 0 0 6 20.5H11", "M3.5 10L20.5 10", "M8 3L8 7", "M16 3L16 7", "M13 17A4 4 0 1 0 21 17A4 4 0 1 0 13 17Z", "M17 15.25L17 17L18.25 18"];
export const txIconCalendarMinus: TxIconPath[] = ["M6 5H18A2.5 2.5 0 0 1 20.5 7.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5Z", "M3.5 10L20.5 10", "M8 3L8 7", "M16 3L16 7", "M9.5 15L14.5 15"];
export const txIconCalendarPlus: TxIconPath[] = ["M6 5H18A2.5 2.5 0 0 1 20.5 7.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5Z", "M3.5 10L20.5 10", "M8 3L8 7", "M16 3L16 7", "M12 12.5L12 17.5", "M9.5 15L14.5 15"];
export const txIconCalendarTimes: TxIconPath[] = ["M6 5H18A2.5 2.5 0 0 1 20.5 7.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5Z", "M3.5 10L20.5 10", "M8 3L8 7", "M16 3L16 7", "M10 13L14 17", "M14 13L10 17"];
export const txIconCalendar: TxIconPath[] = ["M6 5H18A2.5 2.5 0 0 1 20.5 7.5V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V7.5A2.5 2.5 0 0 1 6 5Z", "M3.5 10L20.5 10", "M8 3L8 7", "M16 3L16 7"];
export const txIconCamera: TxIconPath[] = ["M4.5 7.5H7.5L9 5H15L16.5 7.5H19.5A1.5 1.5 0 0 1 21 9V18A1.5 1.5 0 0 1 19.5 19.5H4.5A1.5 1.5 0 0 1 3 18V9A1.5 1.5 0 0 1 4.5 7.5Z", "M8.5 13A3.5 3.5 0 1 0 15.5 13A3.5 3.5 0 1 0 8.5 13Z"];
export const txIconCar: TxIconPath[] = ["M5 11L6.6 6.2A2 2 0 0 1 8.5 4.8H15.5A2 2 0 0 1 17.4 6.2L19 11", "M5 11H19A2 2 0 0 1 21 13V15A2 2 0 0 1 19 17H5A2 2 0 0 1 3 15V13A2 2 0 0 1 5 11Z", "M5.5 17L5.5 19.5L8 19.5L8 17", "M16 17L16 19.5L18.5 19.5L18.5 17", { d: "M6.4 14A0.6 0.6 0 1 0 7.6 14A0.6 0.6 0 1 0 6.4 14Z", fill: true }, { d: "M16.4 14A0.6 0.6 0 1 0 17.6 14A0.6 0.6 0 1 0 16.4 14Z", fill: true }];
export const txIconCaretDown: TxIconPath[] = [{ d: "M6.5 9.5L17.5 9.5L12 15.5Z", fill: true }];
export const txIconCaretLeft: TxIconPath[] = [{ d: "M14.5 6.5L14.5 17.5L8.5 12Z", fill: true }];
export const txIconCaretRight: TxIconPath[] = [{ d: "M9.5 17.5L9.5 6.5L15.5 12Z", fill: true }];
export const txIconCaretUp: TxIconPath[] = [{ d: "M17.5 14.5L6.5 14.5L12 8.5Z", fill: true }];
export const txIconCartArrowDown: TxIconPath[] = ["M2.5 3.5H5L7.5 15.5H18.5L20.5 7H6", "M7.75 19.5A1.25 1.25 0 1 0 10.25 19.5A1.25 1.25 0 1 0 7.75 19.5Z", "M15.75 19.5A1.25 1.25 0 1 0 18.25 19.5A1.25 1.25 0 1 0 15.75 19.5Z", "M13.25 8.5L13.25 13", "M11.25 11L13.25 13L15.25 11"];
export const txIconCartMinus: TxIconPath[] = ["M2.5 3.5H5L7.5 15.5H18.5L20.5 7H6", "M7.75 19.5A1.25 1.25 0 1 0 10.25 19.5A1.25 1.25 0 1 0 7.75 19.5Z", "M15.75 19.5A1.25 1.25 0 1 0 18.25 19.5A1.25 1.25 0 1 0 15.75 19.5Z", "M11 11L15.5 11"];
export const txIconCartPlus: TxIconPath[] = ["M2.5 3.5H5L7.5 15.5H18.5L20.5 7H6", "M7.75 19.5A1.25 1.25 0 1 0 10.25 19.5A1.25 1.25 0 1 0 7.75 19.5Z", "M15.75 19.5A1.25 1.25 0 1 0 18.25 19.5A1.25 1.25 0 1 0 15.75 19.5Z", "M13.25 8.75L13.25 13.25", "M11 11L15.5 11"];
export const txIconCaseSensitive: TxIconPath[] = ["M2.5 18L7 6L11.5 18", "M4.25 14L9.75 14", "M13.5 14.75A3.25 3.25 0 1 0 20 14.75A3.25 3.25 0 1 0 13.5 14.75Z", "M20 11L20 18"];
export const txIconChartBar: TxIconPath[] = ["M3.5 3.5V20.5H20.5", "M8 16.5L8 12", "M12 16.5L12 8", "M16 16.5L16 10.5", "M20 16.5L20 6"];
export const txIconChartLine: TxIconPath[] = ["M3.5 3.5V20.5H20.5", "M7 15.5L11 11L14 13.5L19.5 7.5", "M16 7.5L19.5 7.5L19.5 11"];
export const txIconChartPie: TxIconPath[] = ["M11 4A8.5 8.5 0 1 0 20 13H11Z", "M14 2.5A7.5 7.5 0 0 1 21.5 10H14Z"];
export const txIconChartScatter: TxIconPath[] = ["M3.5 3.5V20.5H20.5", { d: "M7.25 15A0.75 0.75 0 1 0 8.75 15A0.75 0.75 0 1 0 7.25 15Z", fill: true }, { d: "M10.25 10.5A0.75 0.75 0 1 0 11.75 10.5A0.75 0.75 0 1 0 10.25 10.5Z", fill: true }, { d: "M13.75 13A0.75 0.75 0 1 0 15.25 13A0.75 0.75 0 1 0 13.75 13Z", fill: true }, { d: "M16.25 7.5A0.75 0.75 0 1 0 17.75 7.5A0.75 0.75 0 1 0 16.25 7.5Z", fill: true }, { d: "M18 12.25A0.75 0.75 0 1 0 19.5 12.25A0.75 0.75 0 1 0 18 12.25Z", fill: true }];
export const txIconCheckCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M8 12.25L10.75 15L16 9.5"];
export const txIconCheckSquare: TxIconPath[] = ["M7 4H17A3 3 0 0 1 20 7V17A3 3 0 0 1 17 20H7A3 3 0 0 1 4 17V7A3 3 0 0 1 7 4Z", "M8 12.25L10.75 15L16 9.5"];
export const txIconCheck: TxIconPath[] = ["M4.5 12.5L9.5 17.5L19.5 7"];
export const txIconChevronCircleDown: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M8 10.5L12 14.5L16 10.5"];
export const txIconChevronCircleLeft: TxIconPath[] = ["M12 2.75A9.25 9.25 90 1 0 12 21.25A9.25 9.25 90 1 0 12 2.75Z", "M13.5 8L9.5 12L13.5 16"];
export const txIconChevronCircleRight: TxIconPath[] = ["M12 21.25A9.25 9.25 -90 1 0 12 2.75A9.25 9.25 -90 1 0 12 21.25Z", "M10.5 16L14.5 12L10.5 8"];
export const txIconChevronCircleUp: TxIconPath[] = ["M21.25 12A9.25 9.25 180 1 0 2.75 12A9.25 9.25 180 1 0 21.25 12Z", "M16 13.5L12 9.5L8 13.5"];
export const txIconChevronDown: TxIconPath[] = ["M6 9L12 15L18 9"];
export const txIconChevronLeft: TxIconPath[] = ["M15 6L9 12L15 18"];
export const txIconChevronRight: TxIconPath[] = ["M9 18L15 12L9 6"];
export const txIconChevronUp: TxIconPath[] = ["M18 15L12 9L6 15"];
export const txIconCircleFill: TxIconPath[] = [{ d: "M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", fill: true }];
export const txIconCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z"];
export const txIconClipboard: TxIconPath[] = ["M7 4.5H17A2 2 0 0 1 19 6.5V19A2 2 0 0 1 17 21H7A2 2 0 0 1 5 19V6.5A2 2 0 0 1 7 4.5Z", "M9.5 3H14.5A1 1 0 0 1 15.5 4V5.5A1 1 0 0 1 14.5 6.5H9.5A1 1 0 0 1 8.5 5.5V4A1 1 0 0 1 9.5 3Z"];
export const txIconClock: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M12 7L12 12L15.5 14"];
export const txIconClone: TxIconPath[] = ["M10.5 8.5H18.5A2 2 0 0 1 20.5 10.5V18.5A2 2 0 0 1 18.5 20.5H10.5A2 2 0 0 1 8.5 18.5V10.5A2 2 0 0 1 10.5 8.5Z", "M15.5 8.5V5.5A2 2 0 0 0 13.5 3.5H5.5A2 2 0 0 0 3.5 5.5V13.5A2 2 0 0 0 5.5 15.5H8.5"];
export const txIconCloudDownload: TxIconPath[] = ["M7 18.5A4.5 4.5 0 0 1 6.4 9.55A6 6 0 0 1 17.9 10.05A4.25 4.25 0 0 1 17.25 18.5Z", "M12 10.5L12 16", "M9.75 13.75L12 16L14.25 13.75"];
export const txIconCloudUpload: TxIconPath[] = ["M7 18.5A4.5 4.5 0 0 1 6.4 9.55A6 6 0 0 1 17.9 10.05A4.25 4.25 0 0 1 17.25 18.5Z", "M12 16L12 10.5", "M9.75 12.75L12 10.5L14.25 12.75"];
export const txIconCloud: TxIconPath[] = ["M7 18.5A4.5 4.5 0 0 1 6.4 9.55A6 6 0 0 1 17.9 10.05A4.25 4.25 0 0 1 17.25 18.5Z"];
export const txIconCodeBranch: TxIconPath[] = ["M4 5.5A2 2 0 1 0 8 5.5A2 2 0 1 0 4 5.5Z", "M4 18.5A2 2 0 1 0 8 18.5A2 2 0 1 0 4 18.5Z", "M16 5.5A2 2 0 1 0 20 5.5A2 2 0 1 0 16 5.5Z", "M6 7.5L6 16.5", "M18 7.5V9A3 3 0 0 1 15 12H9A3 3 0 0 0 6 15"];
export const txIconCode: TxIconPath[] = ["M8 7L3 12L8 17", "M16 7L21 12L16 17"];
export const txIconCog: TxIconPath[] = ["M10.12 5L10.68 2.59L13.32 2.59L13.88 5L15.63 5.72L17.72 4.41L19.59 6.28L18.28 8.38L19 10.12L21.41 10.68L21.41 13.32L19 13.88L18.28 15.63L19.59 17.72L17.72 19.59L15.63 18.28L13.88 19L13.32 21.41L10.68 21.41L10.12 19L8.38 18.28L6.28 19.59L4.41 17.72L5.72 15.63L5 13.88L2.59 13.32L2.59 10.68L5 10.12L5.72 8.38L4.41 6.28L6.28 4.41L8.37 5.72Z", "M9 12A3 3 0 1 0 15 12A3 3 0 1 0 9 12Z"];
export const txIconColumns2: TxIconPath[] = ["M6 3.5H18A2.5 2.5 0 0 1 20.5 6V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z", "M12 3.5L12 20.5"];
export const txIconComment: TxIconPath[] = ["M12 4C16.7 4 20.5 7.1 20.5 11C20.5 14.9 16.7 18 12 18C10.9 18 9.85 17.85 8.9 17.55L4.5 19.5L5.6 15.8C4.3 14.55 3.5 12.85 3.5 11C3.5 7.1 7.3 4 12 4Z"];
export const txIconComments: TxIconPath[] = ["M15.25 7.25C14.25 5.05 11.85 3.5 9 3.5C5.4 3.5 2.5 5.95 2.5 9C2.5 10.4 3.1 11.65 4.1 12.6L3.25 15.25L6.25 14.1", "M15 8.5C18.6 8.5 21.5 10.85 21.5 13.75C21.5 15.1 20.9 16.3 19.9 17.25L20.75 19.75L17.65 18.6C16.85 18.9 15.95 19 15 19C11.4 19 8.5 16.65 8.5 13.75C8.5 10.85 11.4 8.5 15 8.5Z"];
export const txIconCompass: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M15.5 8.5L13.25 13.25L8.5 15.5L10.75 10.75Z"];
export const txIconCompress: TxIconPath[] = ["M3.5 8.5L8.5 8.5L8.5 3.5", "M15.5 3.5L15.5 8.5L20.5 8.5", "M20.5 15.5L15.5 15.5L15.5 20.5", "M8.5 20.5L8.5 15.5L3.5 15.5"];
export const txIconCopy: TxIconPath[] = ["M15 7.5V5A1.5 1.5 0 0 0 13.5 3.5H5.5A1.5 1.5 0 0 0 4 5V16A1.5 1.5 0 0 0 5.5 17.5H9", "M15 7.5H10.5A1.5 1.5 0 0 0 9 9V19A1.5 1.5 0 0 0 10.5 20.5H18.5A1.5 1.5 0 0 0 20 19V12.5Z", "M15 7.5V12.5H20"];
export const txIconCreditCard: TxIconPath[] = ["M4.5 5H19.5A2 2 0 0 1 21.5 7V17A2 2 0 0 1 19.5 19H4.5A2 2 0 0 1 2.5 17V7A2 2 0 0 1 4.5 5Z", "M2.5 10L21.5 10", "M6 15L10 15"];
export const txIconCrown: TxIconPath[] = ["M4 18L3 7.5L8 11.5L12 5L16 11.5L21 7.5L20 18Z", "M4.5 21L19.5 21"];
export const txIconDatabase: TxIconPath[] = ["M4.5 5.5A7.5 2.5 0 1 0 19.5 5.5A7.5 2.5 0 1 0 4.5 5.5Z", "M4.5 5.5V18.5C4.5 19.9 7.9 21 12 21C16.1 21 19.5 19.9 19.5 18.5V5.5", "M4.5 12C4.5 13.4 7.9 14.5 12 14.5C16.1 14.5 19.5 13.4 19.5 12"];
export const txIconDeleteLeft: TxIconPath[] = ["M8.5 5H19.5A1.5 1.5 0 0 1 21 6.5V17.5A1.5 1.5 0 0 1 19.5 19H8.5L2.5 12Z", "M11.5 9.5L16.5 14.5", "M16.5 9.5L11.5 14.5"];
export const txIconDesktop: TxIconPath[] = ["M5 4H19A2 2 0 0 1 21 6V14A2 2 0 0 1 19 16H5A2 2 0 0 1 3 14V6A2 2 0 0 1 5 4Z", "M12 16L12 20", "M8 20L16 20"];
export const txIconDirectionsAlt: TxIconPath[] = ["M10.6 2.9L2.9 10.6A2 2 0 0 0 2.9 13.4L10.6 21.1A2 2 0 0 0 13.4 21.1L21.1 13.4A2 2 0 0 0 21.1 10.6L13.4 2.9A2 2 0 0 0 10.6 2.9Z", "M15 15.5L15 12.5A1.5 1.5 180 0 0 13.5 11L9 11", "M11 9L9 11L11 13"];
export const txIconDirections: TxIconPath[] = ["M10.6 2.9L2.9 10.6A2 2 0 0 0 2.9 13.4L10.6 21.1A2 2 0 0 0 13.4 21.1L21.1 13.4A2 2 0 0 0 21.1 10.6L13.4 2.9A2 2 0 0 0 10.6 2.9Z", "M9 15.5V12.5A1.5 1.5 0 0 1 10.5 11H15", "M13 9L15 11L13 13"];
export const txIconDollar: TxIconPath[] = ["M16.5 7.5C16 6.1 14.5 5 12 5C9.25 5 7.5 6.25 7.5 8.25C7.5 12.5 16.75 10.5 16.75 15.25C16.75 17.5 14.75 19 12 19C9.5 19 7.75 17.75 7.25 16.25", "M12 3L12 5", "M12 19L12 21"];
export const txIconDot: TxIconPath[] = [{ d: "M10.25 12A1.75 1.75 0 1 0 13.75 12A1.75 1.75 0 1 0 10.25 12Z", fill: true }];
export const txIconDownload: TxIconPath[] = ["M12 3.5L12 14.5", "M7.5 10L12 14.5L16.5 10", "M4 14.5V18.5A2 2 0 0 0 6 20.5H18A2 2 0 0 0 20 18.5V14.5"];
export const txIconEject: TxIconPath[] = ["M12 5L19 12.5L5 12.5Z", "M5 18L19 18"];
export const txIconEllipsisH: TxIconPath[] = [{ d: "M4.75 12A0.75 0.75 0 1 0 6.25 12A0.75 0.75 0 1 0 4.75 12Z", fill: true }, { d: "M11.25 12A0.75 0.75 0 1 0 12.75 12A0.75 0.75 0 1 0 11.25 12Z", fill: true }, { d: "M17.75 12A0.75 0.75 0 1 0 19.25 12A0.75 0.75 0 1 0 17.75 12Z", fill: true }];
export const txIconEllipsisV: TxIconPath[] = [{ d: "M11.25 5.5A0.75 0.75 0 1 0 12.75 5.5A0.75 0.75 0 1 0 11.25 5.5Z", fill: true }, { d: "M11.25 12A0.75 0.75 0 1 0 12.75 12A0.75 0.75 0 1 0 11.25 12Z", fill: true }, { d: "M11.25 18.5A0.75 0.75 0 1 0 12.75 18.5A0.75 0.75 0 1 0 11.25 18.5Z", fill: true }];
export const txIconEnvelope: TxIconPath[] = ["M5 5H19A2 2 0 0 1 21 7V17A2 2 0 0 1 19 19H5A2 2 0 0 1 3 17V7A2 2 0 0 1 5 5Z", "M3.5 6.5L12 12.5L20.5 6.5"];
export const txIconEquals: TxIconPath[] = ["M5 9L19 9", "M5 15L19 15"];
export const txIconEraser: TxIconPath[] = ["M8.5 19.5L4.1 15.1A1.5 1.5 0 0 1 4.1 13L13 4.1A1.5 1.5 0 0 1 15.1 4.1L19.9 8.9A1.5 1.5 0 0 1 19.9 11L11.4 19.5Z", "M9 8.2L15.8 15", "M11.4 19.5L20 19.5"];
export const txIconEuro: TxIconPath[] = ["M18.45 16.95A7 7 0 1 1 18.45 7.05", "M4.5 10L13 10", "M4.5 14L13 14"];
export const txIconExclamationCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M12 7.5L12 13", { d: "M11.4 16.5A0.6 0.6 0 1 0 12.6 16.5A0.6 0.6 0 1 0 11.4 16.5Z", fill: true }];
export const txIconExclamationTriangle: TxIconPath[] = ["M10.3 4.3L3.1 17A2 2 0 0 0 4.8 20H19.2A2 2 0 0 0 20.9 17L13.7 4.3A2 2 0 0 0 10.3 4.3Z", "M12 9.5L12 13.5", { d: "M11.4 16.75A0.6 0.6 0 1 0 12.6 16.75A0.6 0.6 0 1 0 11.4 16.75Z", fill: true }];
export const txIconExpand: TxIconPath[] = ["M3.5 8.5L3.5 3.5L8.5 3.5", "M15.5 3.5L20.5 3.5L20.5 8.5", "M20.5 15.5L20.5 20.5L15.5 20.5", "M8.5 20.5L3.5 20.5L3.5 15.5"];
export const txIconExternalLink: TxIconPath[] = ["M18.5 13.5V18.5A2 2 0 0 1 16.5 20.5H5.5A2 2 0 0 1 3.5 18.5V7.5A2 2 0 0 1 5.5 5.5H10.5", "M14.5 3.5L20.5 3.5L20.5 9.5", "M20.5 3.5L11 13"];
export const txIconEyeDropper: TxIconPath[] = ["M19.6 4.4A2.1 2.1 0 0 0 16.6 4.4L14 7L12.9 5.9L11.5 7.3L16.7 12.5L18.1 11.1L17 10L19.6 7.4A2.1 2.1 0 0 0 19.6 4.4Z", "M12.75 8.75L5.5 16V18.5H8L15.25 11.25"];
export const txIconEyeSlash: TxIconPath[] = ["M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z", "M9 12A3 3 0 1 0 15 12A3 3 0 1 0 9 12Z", "M4 4L20 20"];
export const txIconEye: TxIconPath[] = ["M2.5 12C4.5 7.5 8 5 12 5C16 5 19.5 7.5 21.5 12C19.5 16.5 16 19 12 19C8 19 4.5 16.5 2.5 12Z", "M9 12A3 3 0 1 0 15 12A3 3 0 1 0 9 12Z"];
export const txIconFaceSmile: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M8.5 14A4.25 4.25 0 0 0 15.5 14", { d: "M8.4 9.75A0.6 0.6 0 1 0 9.6 9.75A0.6 0.6 0 1 0 8.4 9.75Z", fill: true }, { d: "M14.4 9.75A0.6 0.6 0 1 0 15.6 9.75A0.6 0.6 0 1 0 14.4 9.75Z", fill: true }];
export const txIconFastBackward: TxIconPath[] = ["M21 6L13.5 12L21 18Z", "M13.5 6L6 12L13.5 18Z", "M3.5 6L3.5 18"];
export const txIconFastForward: TxIconPath[] = ["M3 6L10.5 12L3 18Z", "M10.5 6L18 12L10.5 18Z", "M20.5 6L20.5 18"];
export const txIconFileArrowUp: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19", "M12 17L12 11", "M9.5 13.5L12 11L14.5 13.5"];
export const txIconFileCheck: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19", "M9 14.25L11 16.25L15 12.25"];
export const txIconFileEdit: TxIconPath[] = ["M19 11V8.5L14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H10.5", "M14 3.5V8.5H19", "M18.5 12.75A1.6 1.6 0 0 1 20.75 15L15.75 20H13.5V17.75Z"];
export const txIconFileExcel: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19", "M9.5 11.5L14.5 17.5", "M14.5 11.5L9.5 17.5"];
export const txIconFileExport: TxIconPath[] = ["M15 9V8.5L10 3.5H6A2 2 0 0 0 4 5.5V18.5A2 2 0 0 0 6 20.5H13A2 2 0 0 0 15 18.5V15", "M10 3.5V8.5H15", "M10 12L21 12", "M18 9L21 12L18 15"];
export const txIconFileImport: TxIconPath[] = ["M9 9V5.5A2 2 0 0 1 11 3.5H15L20 8.5V18.5A2 2 0 0 1 18 20.5H11A2 2 0 0 1 9 18.5V15", "M15 3.5V8.5H20", "M3 12L13 12", "M10 9L13 12L10 15"];
export const txIconFileO: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19", "M8.5 12.5L15.5 12.5", "M8.5 16L13 16"];
export const txIconFilePdf: TxIconPath[] = ["M5 12V5.5A2 2 0 0 1 7 3.5H14L19 8.5V12", "M14 3.5V8.5H19", "M4.5 20.5V15H6.25A1.5 1.5 0 0 1 6.25 18H4.5", "M10.25 15V20.5H11.5A2 2 0 0 0 13.5 18.5V17A2 2 0 0 0 11.5 15Z", "M16 20.5V15H19.5", "M16 17.75L18.5 17.75"];
export const txIconFilePlus: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19", "M12 11.5L12 17", "M9.25 14.25L14.75 14.25"];
export const txIconFileWord: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19", "M8.5 11.5L10 17.5L12 13L14 17.5L15.5 11.5"];
export const txIconFile: TxIconPath[] = ["M14 3.5H7A2 2 0 0 0 5 5.5V18.5A2 2 0 0 0 7 20.5H17A2 2 0 0 0 19 18.5V8.5Z", "M14 3.5V8.5H19"];
export const txIconFilterFill: TxIconPath[] = [{ d: "M3.5 4.5H20.5L14 12.5V19L10 21V12.5Z", fill: true }];
export const txIconFilterSlash: TxIconPath[] = ["M12.5 4.5H3.5L10 12.5V21L14 19V12.5L15.42 10.75", "M15.75 3L21 8.25", "M21 3L15.75 8.25"];
export const txIconFilter: TxIconPath[] = ["M3.5 4.5H20.5L14 12.5V19L10 21V12.5Z"];
export const txIconFlagFill: TxIconPath[] = ["M5 21L5 3.5", { d: "M5 4.5C9 2.5 11 6.5 15 4.5C16.5 3.75 18 3.75 19 4.5V14C18 13.25 16.5 13.25 15 14C11 16 9 12 5 14Z", fill: true }];
export const txIconFlag: TxIconPath[] = ["M5 21L5 3.5", "M5 4.5C9 2.5 11 6.5 15 4.5C16.5 3.75 18 3.75 19 4.5V14C18 13.25 16.5 13.25 15 14C11 16 9 12 5 14Z"];
export const txIconFolderOpen: TxIconPath[] = ["M3.5 17.5V7.5A2 2 0 0 1 5.5 5.5H9.5L11.5 7.5H17A2 2 0 0 1 19 9.5V10.5", "M3.5 17.5L6 11.8A2 2 0 0 1 7.85 10.5H20A1 1 0 0 1 20.9 11.9L18.4 18.3A2 2 0 0 1 16.55 19.5H5.5A2 2 0 0 1 3.5 17.5Z"];
export const txIconFolderPlus: TxIconPath[] = ["M3.5 7.5A2 2 0 0 1 5.5 5.5H9.5L11.5 7.5H18.5A2 2 0 0 1 20.5 9.5V17.5A2 2 0 0 1 18.5 19.5H5.5A2 2 0 0 1 3.5 17.5Z", "M12 10.5L12 16.5", "M9 13.5L15 13.5"];
export const txIconFolder: TxIconPath[] = ["M3.5 7.5A2 2 0 0 1 5.5 5.5H9.5L11.5 7.5H18.5A2 2 0 0 1 20.5 9.5V17.5A2 2 0 0 1 18.5 19.5H5.5A2 2 0 0 1 3.5 17.5Z"];
export const txIconForward: TxIconPath[] = ["M3.5 6L11.5 12L3.5 18Z", "M12 6L20 12L12 18Z"];
export const txIconGauge: TxIconPath[] = ["M4.2 17.5A8.5 8.5 0 1 1 19.8 17.5", "M12 14L15.75 9.75", { d: "M11.25 14A0.75 0.75 0 1 0 12.75 14A0.75 0.75 0 1 0 11.25 14Z", fill: true }, "M6.25 12.5L7.25 12.75", "M17.75 12.5L16.75 12.75", "M12 6L12 7"];
export const txIconGift: TxIconPath[] = ["M4.5 8H19.5A1 1 0 0 1 20.5 9V11A1 1 0 0 1 19.5 12H4.5A1 1 0 0 1 3.5 11V9A1 1 0 0 1 4.5 8Z", "M5 12V19A1.5 1.5 0 0 0 6.5 20.5H17.5A1.5 1.5 0 0 0 19 19V12", "M12 8L12 20.5", "M12 8C10.5 8 7.5 7.5 7.5 5.5A2 2 0 0 1 9.5 3.5C11 3.5 12 6 12 8C12 6 13 3.5 14.5 3.5A2 2 0 0 1 16.5 5.5C16.5 7.5 13.5 8 12 8"];
export const txIconGlobe: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M8 12A4 9.25 0 1 0 16 12A4 9.25 0 1 0 8 12Z", "M2.75 12L21.25 12"];
export const txIconGraduationCap: TxIconPath[] = ["M12 4.5L22 9.5L12 14.5L2 9.5Z", "M6 11.5V16C7.5 17.75 9.5 18.5 12 18.5C14.5 18.5 16.5 17.75 18 16V11.5", "M22 9.5L22 15"];
export const txIconGrid2: TxIconPath[] = ["M6 3.5H18A2.5 2.5 0 0 1 20.5 6V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z", "M12 3.5L12 20.5", "M3.5 12L20.5 12"];
export const txIconGripHorizontal: TxIconPath[] = [{ d: "M5.25 9A0.75 0.75 0 1 0 6.75 9A0.75 0.75 0 1 0 5.25 9Z", fill: true }, { d: "M11.25 9A0.75 0.75 0 1 0 12.75 9A0.75 0.75 0 1 0 11.25 9Z", fill: true }, { d: "M17.25 9A0.75 0.75 0 1 0 18.75 9A0.75 0.75 0 1 0 17.25 9Z", fill: true }, { d: "M5.25 15A0.75 0.75 0 1 0 6.75 15A0.75 0.75 0 1 0 5.25 15Z", fill: true }, { d: "M11.25 15A0.75 0.75 0 1 0 12.75 15A0.75 0.75 0 1 0 11.25 15Z", fill: true }, { d: "M17.25 15A0.75 0.75 0 1 0 18.75 15A0.75 0.75 0 1 0 17.25 15Z", fill: true }];
export const txIconGripVertical: TxIconPath[] = [{ d: "M8.25 6A0.75 0.75 0 1 0 9.75 6A0.75 0.75 0 1 0 8.25 6Z", fill: true }, { d: "M14.25 6A0.75 0.75 0 1 0 15.75 6A0.75 0.75 0 1 0 14.25 6Z", fill: true }, { d: "M8.25 12A0.75 0.75 0 1 0 9.75 12A0.75 0.75 0 1 0 8.25 12Z", fill: true }, { d: "M14.25 12A0.75 0.75 0 1 0 15.75 12A0.75 0.75 0 1 0 14.25 12Z", fill: true }, { d: "M8.25 18A0.75 0.75 0 1 0 9.75 18A0.75 0.75 0 1 0 8.25 18Z", fill: true }, { d: "M14.25 18A0.75 0.75 0 1 0 15.75 18A0.75 0.75 0 1 0 14.25 18Z", fill: true }];
export const txIconGrip: TxIconPath[] = [{ d: "M5.25 6A0.75 0.75 0 1 0 6.75 6A0.75 0.75 0 1 0 5.25 6Z", fill: true }, { d: "M11.25 6A0.75 0.75 0 1 0 12.75 6A0.75 0.75 0 1 0 11.25 6Z", fill: true }, { d: "M17.25 6A0.75 0.75 0 1 0 18.75 6A0.75 0.75 0 1 0 17.25 6Z", fill: true }, { d: "M5.25 12A0.75 0.75 0 1 0 6.75 12A0.75 0.75 0 1 0 5.25 12Z", fill: true }, { d: "M11.25 12A0.75 0.75 0 1 0 12.75 12A0.75 0.75 0 1 0 11.25 12Z", fill: true }, { d: "M17.25 12A0.75 0.75 0 1 0 18.75 12A0.75 0.75 0 1 0 17.25 12Z", fill: true }, { d: "M5.25 18A0.75 0.75 0 1 0 6.75 18A0.75 0.75 0 1 0 5.25 18Z", fill: true }, { d: "M11.25 18A0.75 0.75 0 1 0 12.75 18A0.75 0.75 0 1 0 11.25 18Z", fill: true }, { d: "M17.25 18A0.75 0.75 0 1 0 18.75 18A0.75 0.75 0 1 0 17.25 18Z", fill: true }];
export const txIconHammer: TxIconPath[] = ["M10.5 6.5L14.5 2.5L21 9L17 13Z", "M13.25 10.25L4.25 19.25A1.75 1.75 0 0 0 6.75 21.75L15.75 12.75"];
export const txIconHashtag: TxIconPath[] = ["M9.5 4L8 20", "M16 4L14.5 20", "M4.5 9L20 9", "M4 15L19.5 15"];
export const txIconHeading1: TxIconPath[] = ["M4 5L4 19", "M13 5L13 19", "M4 12L13 12", "M16.25 13.25L18.5 11.5L18.5 19"];
export const txIconHeading2: TxIconPath[] = ["M4 5L4 19", "M13 5L13 19", "M4 12L13 12", "M16.25 13.75A2.25 2.25 0 1 1 20 15.4L16.25 19H20.5"];
export const txIconHeading3: TxIconPath[] = ["M4 5L4 19", "M13 5L13 19", "M4 12L13 12", "M16.5 11.75H20.25L17.75 14.75", "M17.75 14.75A2.25 2.25 0 1 1 16.25 18.4"];
export const txIconHeading4: TxIconPath[] = ["M4 5L4 19", "M13 5L13 19", "M4 12L13 12", "M19.5 19L19.5 11.5L15.75 16.5L21 16.5"];
export const txIconHeading5: TxIconPath[] = ["M4 5L4 19", "M13 5L13 19", "M4 12L13 12", "M20.25 11.75H16.9L16.5 14.9A2.25 2.25 0 1 1 16.4 18.5"];
export const txIconHeading6: TxIconPath[] = ["M4 5L4 19", "M13 5L13 19", "M4 12L13 12", "M16 16.75A2.25 2.25 0 1 0 20.5 16.75A2.25 2.25 0 1 0 16 16.75Z", "M19.75 11.75A3.75 3.75 0 0 0 16 16.75"];
export const txIconHeading: TxIconPath[] = ["M6 4.5L6 19.5", "M18 4.5L18 19.5", "M6 12L18 12"];
export const txIconHeadphones: TxIconPath[] = ["M4 15V12A8 8 0 0 1 20 12V15", "M5 14H6A1.5 1.5 0 0 1 7.5 15.5V19A1.5 1.5 0 0 1 6 20.5H5A1.5 1.5 0 0 1 3.5 19V15.5A1.5 1.5 0 0 1 5 14Z", "M18 14H19A1.5 1.5 0 0 1 20.5 15.5V19A1.5 1.5 0 0 1 19 20.5H18A1.5 1.5 0 0 1 16.5 19V15.5A1.5 1.5 0 0 1 18 14Z"];
export const txIconHeartFill: TxIconPath[] = [{ d: "M12 20C12 20 3 14.5 3 8.75A4.75 4.75 0 0 1 12 6.6A4.75 4.75 0 0 1 21 8.75C21 14.5 12 20 12 20Z", fill: true }];
export const txIconHeart: TxIconPath[] = ["M12 20C12 20 3 14.5 3 8.75A4.75 4.75 0 0 1 12 6.6A4.75 4.75 0 0 1 21 8.75C21 14.5 12 20 12 20Z"];
export const txIconHighlighter: TxIconPath[] = ["M15.2 3.6L20.4 8.8A1 1 0 0 1 20.4 10.2L12.3 18.3L5.7 11.7L13.8 3.6A1 1 0 0 1 15.2 3.6Z", "M5.7 11.7L4.2 16.4L7.6 19.8L12.3 18.3", "M3 21L8.5 21"];
export const txIconHistory: TxIconPath[] = ["M6.34 6.34A8 8 180 1 0 12 4", "M14.5 1.5L12 4L14.5 6.5", "M12 8L12 12L14.75 13.75"];
export const txIconHome: TxIconPath[] = ["M3.5 11L12 4L20.5 11", "M5.5 9.5V19A1.5 1.5 0 0 0 7 20.5H17A1.5 1.5 0 0 0 18.5 19V9.5", "M10 20.5L10 15L14 15L14 20.5"];
export const txIconHorizontalRule: TxIconPath[] = ["M3 12L21 12"];
export const txIconHourglass: TxIconPath[] = ["M6 3.5L18 3.5", "M6 20.5L18 20.5", "M7.5 3.5V6.5C7.5 9 12 10.5 12 12C12 13.5 7.5 15 7.5 17.5V20.5", "M16.5 3.5V6.5C16.5 9 12 10.5 12 12C12 13.5 16.5 15 16.5 17.5V20.5"];
export const txIconIdCard: TxIconPath[] = ["M4.5 5H19.5A2 2 0 0 1 21.5 7V17A2 2 0 0 1 19.5 19H4.5A2 2 0 0 1 2.5 17V7A2 2 0 0 1 4.5 5Z", "M6.5 11A2 2 0 1 0 10.5 11A2 2 0 1 0 6.5 11Z", "M5.5 16.5A3 3 0 0 1 11.5 16.5", "M14 10L18.5 10", "M14 14L17 14"];
export const txIconImage: TxIconPath[] = ["M5.5 4.5H18.5A2 2 0 0 1 20.5 6.5V17.5A2 2 0 0 1 18.5 19.5H5.5A2 2 0 0 1 3.5 17.5V6.5A2 2 0 0 1 5.5 4.5Z", "M7.25 9.5A1.75 1.75 0 1 0 10.75 9.5A1.75 1.75 0 1 0 7.25 9.5Z", "M4 18.5L15 10.5L20.5 15.5"];
export const txIconImages: TxIconPath[] = ["M8.5 7.5H19.5A2 2 0 0 1 21.5 9.5V18A2 2 0 0 1 19.5 20H8.5A2 2 0 0 1 6.5 18V9.5A2 2 0 0 1 8.5 7.5Z", "M9.5 11.5A1.5 1.5 0 1 0 12.5 11.5A1.5 1.5 0 1 0 9.5 11.5Z", "M7 19L15.5 12.5L21.5 17", "M17.5 4.5H4.5A2 2 0 0 0 2.5 6.5V16.5"];
export const txIconInbox: TxIconPath[] = ["M3.5 13H8L9.5 15.5H14.5L16 13H20.5", "M5.8 5.9A2 2 0 0 1 7.6 4.5H16.4A2 2 0 0 1 18.2 5.9L20.5 13V17.5A2 2 0 0 1 18.5 19.5H5.5A2 2 0 0 1 3.5 17.5V13Z"];
export const txIconIndent: TxIconPath[] = ["M4 5L20 5", "M11 10L20 10", "M11 14L20 14", "M4 19L20 19", "M4 9L7 12L4 15"];
export const txIconIndianRupee: TxIconPath[] = ["M6 4.5L18 4.5", "M6 8.5L18 8.5", "M9 4.5H10.5A4 4 0 0 1 10.5 12.5H6.5L14.5 20"];
export const txIconInfoCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M12 11L12 16.5", { d: "M11.4 7.75A0.6 0.6 0 1 0 12.6 7.75A0.6 0.6 0 1 0 11.4 7.75Z", fill: true }];
export const txIconInfo: TxIconPath[] = ["M12 10.5L12 18.5", { d: "M11.3 6.25A0.7 0.7 0 1 0 12.7 6.25A0.7 0.7 0 1 0 11.3 6.25Z", fill: true }, "M10 10.5L12 10.5", "M10 18.5L14 18.5"];
export const txIconItalic: TxIconPath[] = ["M10 4.5L17 4.5", "M7 19.5L14 19.5", "M13.5 4.5L10.5 19.5"];
export const txIconKey: TxIconPath[] = ["M3.75 15.5A4.25 4.25 0 1 0 12.25 15.5A4.25 4.25 0 1 0 3.75 15.5Z", "M11 12.5L19.5 4", "M16.5 7L18.75 9.25", "M14.25 9.25L16 11"];
export const txIconLanguage: TxIconPath[] = ["M3 6L12 6", "M7.5 3.75L7.5 6", "M10.25 6C9.25 9.75 6.75 12.75 3.5 14.5", "M5.5 9C7 11.25 8.75 12.75 11 13.75", "M12 20.5L16 10.5L20 20.5", "M13.4 17L18.6 17"];
export const txIconLightbulb: TxIconPath[] = ["M9 17.5V15.8C7.2 14.6 6 12.6 6 10.5A6 6 0 0 1 18 10.5C18 12.6 16.8 14.6 15 15.8V17.5Z", "M9.5 20.5L14.5 20.5"];
export const txIconLink: TxIconPath[] = ["M10 14A4 4 0 0 0 15.66 14L18.5 11.16A4 4 0 0 0 12.84 5.5L11.5 6.84", "M14 10A4 4 0 0 0 8.34 10L5.5 12.84A4 4 0 0 0 11.16 18.5L12.5 17.16"];
export const txIconListCheck: TxIconPath[] = ["M3.5 6L4.75 7.25L7 4.75", "M3.5 12L4.75 13.25L7 10.75", { d: "M4.15 18A0.6 0.6 0 1 0 5.35 18A0.6 0.6 0 1 0 4.15 18Z", fill: true }, "M10 6L20 6", "M10 12L20 12", "M10 18L20 18"];
export const txIconListOl: TxIconPath[] = ["M3.5 5L5.25 3.75L5.25 9", "M3.5 15A1.6 1.6 0 1 1 6.2 16.2L3.5 19.5H6.75", "M10 6.5L20 6.5", "M10 12L20 12", "M10 17.5L20 17.5"];
export const txIconListTree: TxIconPath[] = ["M4.5 3.5H6.5A1 1 0 0 1 7.5 4.5V6.5A1 1 0 0 1 6.5 7.5H4.5A1 1 0 0 1 3.5 6.5V4.5A1 1 0 0 1 4.5 3.5Z", "M10.5 5.5L20 5.5", "M5.5 7.5V17.5H9", "M5.5 12.5L9 12.5", "M10 10.5H12A1 1 0 0 1 13 11.5V13.5A1 1 0 0 1 12 14.5H10A1 1 0 0 1 9 13.5V11.5A1 1 0 0 1 10 10.5Z", "M10 15.5H12A1 1 0 0 1 13 16.5V18.5A1 1 0 0 1 12 19.5H10A1 1 0 0 1 9 18.5V16.5A1 1 0 0 1 10 15.5Z", "M15.5 12.5L20 12.5", "M15.5 17.5L20 17.5"];
export const txIconList: TxIconPath[] = [{ d: "M3.9 6A0.6 0.6 0 1 0 5.1 6A0.6 0.6 0 1 0 3.9 6Z", fill: true }, { d: "M3.9 12A0.6 0.6 0 1 0 5.1 12A0.6 0.6 0 1 0 3.9 12Z", fill: true }, { d: "M3.9 18A0.6 0.6 0 1 0 5.1 18A0.6 0.6 0 1 0 3.9 18Z", fill: true }, "M9 6L20 6", "M9 12L20 12", "M9 18L20 18"];
export const txIconLockOpen: TxIconPath[] = ["M7.5 10.5H16.5A2.5 2.5 0 0 1 19 13V18A2.5 2.5 0 0 1 16.5 20.5H7.5A2.5 2.5 0 0 1 5 18V13A2.5 2.5 0 0 1 7.5 10.5Z", "M12 14.5L12 16.5", "M8 10.5V7.5A4 4 0 0 1 15.75 6.1"];
export const txIconLock: TxIconPath[] = ["M7.5 10.5H16.5A2.5 2.5 0 0 1 19 13V18A2.5 2.5 0 0 1 16.5 20.5H7.5A2.5 2.5 0 0 1 5 18V13A2.5 2.5 0 0 1 7.5 10.5Z", "M12 14.5L12 16.5", "M8 10.5V7.5A4 4 0 0 1 16 7.5V10.5"];
export const txIconMapMarker: TxIconPath[] = ["M12 21C12 21 5 15 5 9.5A7 7 0 0 1 19 9.5C19 15 12 21 12 21Z", "M9.5 9.5A2.5 2.5 0 1 0 14.5 9.5A2.5 2.5 0 1 0 9.5 9.5Z"];
export const txIconMap: TxIconPath[] = ["M3 6L9 3.5L15 6L21 3.5L21 18L15 20.5L9 18L3 20.5Z", "M9 3.5L9 18", "M15 6L15 20.5"];
export const txIconMars: TxIconPath[] = ["M4.5 14A5.5 5.5 0 1 0 15.5 14A5.5 5.5 0 1 0 4.5 14Z", "M14 10L20 4", "M15 4L20 4L20 9"];
export const txIconMegaphone: TxIconPath[] = ["M3.5 10A1 1 0 0 1 4.5 9H7.5L17 4.5V19.5L7.5 15H4.5A1 1 0 0 1 3.5 14Z", "M7.5 15L9 20.5H11.5L10.25 15.6", "M20 10L20 14"];
export const txIconMicrochipAi: TxIconPath[] = ["M8 6H16A2 2 0 0 1 18 8V16A2 2 0 0 1 16 18H8A2 2 0 0 1 6 16V8A2 2 0 0 1 8 6Z", "M9 3L9 6", "M9 18L9 21", "M3 9L6 9", "M18 9L21 9", "M12 3L12 6", "M12 18L12 21", "M3 12L6 12", "M18 12L21 12", "M15 3L15 6", "M15 18L15 21", "M3 15L6 15", "M18 15L21 15", "M8.75 15L10.5 9L12.25 15", "M9.3 13L11.7 13", "M14.75 9L14.75 15"];
export const txIconMicrochip: TxIconPath[] = ["M8 6H16A2 2 0 0 1 18 8V16A2 2 0 0 1 16 18H8A2 2 0 0 1 6 16V8A2 2 0 0 1 8 6Z", "M9 3L9 6", "M9 18L9 21", "M3 9L6 9", "M18 9L21 9", "M12 3L12 6", "M12 18L12 21", "M3 12L6 12", "M18 12L21 12", "M15 3L15 6", "M15 18L15 21", "M3 15L6 15", "M18 15L21 15", "M10.5 9.5H13.5A1 1 0 0 1 14.5 10.5V13.5A1 1 0 0 1 13.5 14.5H10.5A1 1 0 0 1 9.5 13.5V10.5A1 1 0 0 1 10.5 9.5Z"];
export const txIconMicrophone: TxIconPath[] = ["M12 3H12A3 3 0 0 1 15 6V11A3 3 0 0 1 12 14H12A3 3 0 0 1 9 11V6A3 3 0 0 1 12 3Z", "M5.5 11A6.5 6.5 0 0 0 18.5 11", "M12 17.5L12 21"];
export const txIconMinusCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M8 12L16 12"];
export const txIconMinus: TxIconPath[] = ["M5 12L19 12"];
export const txIconMobile: TxIconPath[] = ["M9 3H15A2.5 2.5 0 0 1 17.5 5.5V18.5A2.5 2.5 0 0 1 15 21H9A2.5 2.5 0 0 1 6.5 18.5V5.5A2.5 2.5 0 0 1 9 3Z", "M10.5 18L13.5 18"];
export const txIconMoneyBill: TxIconPath[] = ["M4.5 6H19.5A2 2 0 0 1 21.5 8V16A2 2 0 0 1 19.5 18H4.5A2 2 0 0 1 2.5 16V8A2 2 0 0 1 4.5 6Z", "M9.25 12A2.75 2.75 0 1 0 14.75 12A2.75 2.75 0 1 0 9.25 12Z", { d: "M5.5 12A0.5 0.5 0 1 0 6.5 12A0.5 0.5 0 1 0 5.5 12Z", fill: true }, { d: "M17.5 12A0.5 0.5 0 1 0 18.5 12A0.5 0.5 0 1 0 17.5 12Z", fill: true }];
export const txIconMoon: TxIconPath[] = ["M20 14.5A8 8 0 1 1 9.5 4A6.5 6.5 0 0 0 20 14.5Z"];
export const txIconNoteSticky: TxIconPath[] = ["M4.5 3.5H19.5A1 1 0 0 1 20.5 4.5V14.5L14.5 20.5H4.5A1 1 0 0 1 3.5 19.5V4.5A1 1 0 0 1 4.5 3.5Z", "M20.5 14.5H15.5A1 1 0 0 0 14.5 15.5V20.5"];
export const txIconObjectsColumn: TxIconPath[] = ["M5 3.5H9.5A1.5 1.5 0 0 1 11 5V12A1.5 1.5 0 0 1 9.5 13.5H5A1.5 1.5 0 0 1 3.5 12V5A1.5 1.5 0 0 1 5 3.5Z", "M5 16H9.5A1.5 1.5 0 0 1 11 17.5V19A1.5 1.5 0 0 1 9.5 20.5H5A1.5 1.5 0 0 1 3.5 19V17.5A1.5 1.5 0 0 1 5 16Z", "M14.5 3.5H19A1.5 1.5 0 0 1 20.5 5V6.5A1.5 1.5 0 0 1 19 8H14.5A1.5 1.5 0 0 1 13 6.5V5A1.5 1.5 0 0 1 14.5 3.5Z", "M14.5 10.5H19A1.5 1.5 0 0 1 20.5 12V19A1.5 1.5 0 0 1 19 20.5H14.5A1.5 1.5 0 0 1 13 19V12A1.5 1.5 0 0 1 14.5 10.5Z"];
export const txIconOutdent: TxIconPath[] = ["M4 5L20 5", "M11 10L20 10", "M11 14L20 14", "M4 19L20 19", "M7 9L4 12L7 15"];
export const txIconPalette: TxIconPath[] = ["M12 3.5A8.5 8.5 0 0 0 12 20.5C13.4 20.5 14 19.6 14 18.6C14 17.4 13 16.9 13 15.8C13 14.8 13.8 14 14.8 14H17A3.5 3.5 0 0 0 20.5 10.5C20.5 6.6 16.7 3.5 12 3.5Z", { d: "M6.75 11.5A0.75 0.75 0 1 0 8.25 11.5A0.75 0.75 0 1 0 6.75 11.5Z", fill: true }, { d: "M8.75 7.5A0.75 0.75 0 1 0 10.25 7.5A0.75 0.75 0 1 0 8.75 7.5Z", fill: true }, { d: "M13.75 7.25A0.75 0.75 0 1 0 15.25 7.25A0.75 0.75 0 1 0 13.75 7.25Z", fill: true }];
export const txIconPaperclip: TxIconPath[] = ["M20 11.5L12.1 19.4A5 5 0 0 1 5 12.3L12.9 4.4A3.3 3.3 0 0 1 17.6 9.1L9.8 16.9A1.7 1.7 0 0 1 7.4 14.5L14.5 7.4"];
export const txIconParagraphLeft: TxIconPath[] = ["M12 4.5L12 14", "M16 4.5L16 14", "M12 4.5L18 4.5", "M12 4.5H9.5A3.5 3.5 0 0 0 9.5 11.5H12", "M5 19L19 19", "M7.5 16.5L5 19L7.5 21.5"];
export const txIconParagraphRight: TxIconPath[] = ["M12 4.5L12 14", "M16 4.5L16 14", "M12 4.5L18 4.5", "M12 4.5H9.5A3.5 3.5 0 0 0 9.5 11.5H12", "M19 19L5 19", "M16.5 16.5L19 19L16.5 21.5"];
export const txIconPauseCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M10 9L10 15", "M14 9L14 15"];
export const txIconPause: TxIconPath[] = ["M7 5H9A1 1 0 0 1 10 6V18A1 1 0 0 1 9 19H7A1 1 0 0 1 6 18V6A1 1 0 0 1 7 5Z", "M15 5H17A1 1 0 0 1 18 6V18A1 1 0 0 1 17 19H15A1 1 0 0 1 14 18V6A1 1 0 0 1 15 5Z"];
export const txIconPenLine: TxIconPath[] = ["M14.5 3.5A2.1 2.1 0 0 1 18.5 7.5L8.5 17.5H4.5V13.5Z", "M12.5 5.5L16.5 9.5", "M12 20.5L20 20.5"];
export const txIconPenToSquare: TxIconPath[] = ["M11 4.5H6.5A2 2 0 0 0 4.5 6.5V17.5A2 2 0 0 0 6.5 19.5H17.5A2 2 0 0 0 19.5 17.5V13", "M17.25 3.75A2.1 2.1 0 0 1 20.25 6.75L12.5 14.5L9 15.25L9.75 11.75Z"];
export const txIconPencil: TxIconPath[] = ["M15.5 4.5A2.1 2.1 0 0 1 19.5 8.5L8 20H4V16Z", "M13.5 6.5L17.5 10.5"];
export const txIconPercentage: TxIconPath[] = ["M18.5 5.5L5.5 18.5", "M4.75 7A2.25 2.25 0 1 0 9.25 7A2.25 2.25 0 1 0 4.75 7Z", "M14.75 17A2.25 2.25 0 1 0 19.25 17A2.25 2.25 0 1 0 14.75 17Z"];
export const txIconPhone: TxIconPath[] = ["M8.6 3.5H5.75A1.75 1.75 0 0 0 4 5.25C4 13.4 10.6 20 18.75 20A1.75 1.75 0 0 0 20.5 18.25V15.4L16.5 13.75L14.5 15.75C11.7 14.5 9.5 12.3 8.25 9.5L10.25 7.5Z"];
export const txIconPlayCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M10 8.5L15.5 12L10 15.5Z"];
export const txIconPlay: TxIconPath[] = ["M7 4.5L19 12L7 19.5Z"];
export const txIconPlusCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M12 8L12 16", "M8 12L16 12"];
export const txIconPlus: TxIconPath[] = ["M12 5L12 19", "M5 12L19 12"];
export const txIconPound: TxIconPath[] = ["M16.75 6.75A3.75 3.75 0 0 0 9.75 8.5V15.5C9.75 17.5 8.75 19 7 19.5H17.5", "M6.5 12.5L14.5 12.5"];
export const txIconPowerOff: TxIconPath[] = ["M7.05 6.55A8 8 0 1 0 16.95 6.55", "M12 3L12 11"];
export const txIconPrint: TxIconPath[] = ["M7 9L7 3.5L17 3.5L17 9", "M7 17.5H5A2 2 0 0 1 3 15.5V11A2 2 0 0 1 5 9H19A2 2 0 0 1 21 11V15.5A2 2 0 0 1 19 17.5H17", "M8 14H16A1 1 0 0 1 17 15V19.5A1 1 0 0 1 16 20.5H8A1 1 0 0 1 7 19.5V15A1 1 0 0 1 8 14Z"];
export const txIconQrcode: TxIconPath[] = ["M4.5 3.5H9A1 1 0 0 1 10 4.5V9A1 1 0 0 1 9 10H4.5A1 1 0 0 1 3.5 9V4.5A1 1 0 0 1 4.5 3.5Z", "M15 3.5H19.5A1 1 0 0 1 20.5 4.5V9A1 1 0 0 1 19.5 10H15A1 1 0 0 1 14 9V4.5A1 1 0 0 1 15 3.5Z", "M4.5 14H9A1 1 0 0 1 10 15V19.5A1 1 0 0 1 9 20.5H4.5A1 1 0 0 1 3.5 19.5V15A1 1 0 0 1 4.5 14Z", { d: "M6.25 6.75A0.5 0.5 0 1 0 7.25 6.75A0.5 0.5 0 1 0 6.25 6.75Z", fill: true }, { d: "M16.75 6.75A0.5 0.5 0 1 0 17.75 6.75A0.5 0.5 0 1 0 16.75 6.75Z", fill: true }, { d: "M6.25 17.25A0.5 0.5 0 1 0 7.25 17.25A0.5 0.5 0 1 0 6.25 17.25Z", fill: true }, "M14.5 14H16A0.5 0.5 0 0 1 16.5 14.5V16A0.5 0.5 0 0 1 16 16.5H14.5A0.5 0.5 0 0 1 14 16V14.5A0.5 0.5 0 0 1 14.5 14Z", "M18.5 18H20A0.5 0.5 0 0 1 20.5 18.5V20A0.5 0.5 0 0 1 20 20.5H18.5A0.5 0.5 0 0 1 18 20V18.5A0.5 0.5 0 0 1 18.5 18Z", { d: "M18.75 15.25A0.5 0.5 0 1 0 19.75 15.25A0.5 0.5 0 1 0 18.75 15.25Z", fill: true }, { d: "M14.75 19.25A0.5 0.5 0 1 0 15.75 19.25A0.5 0.5 0 1 0 14.75 19.25Z", fill: true }];
export const txIconQuestionCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M9.75 9.75A2.25 2.25 0 1 1 13.1 11.7C12.45 12.1 12 12.6 12 13.4V13.75", { d: "M11.4 16.75A0.6 0.6 0 1 0 12.6 16.75A0.6 0.6 0 1 0 11.4 16.75Z", fill: true }];
export const txIconQuestion: TxIconPath[] = ["M8.5 8.75A3.5 3.5 0 1 1 13.6 11.9C12.65 12.4 12 13.25 12 14.4V15", { d: "M11.3 19A0.7 0.7 0 1 0 12.7 19A0.7 0.7 0 1 0 11.3 19Z", fill: true }];
export const txIconReceipt: TxIconPath[] = ["M5 3.5V20.5L7.33 19L9.67 20.5L12 19L14.33 20.5L16.67 19L19 20.5V3.5L16.67 5L14.33 3.5L12 5L9.67 3.5L7.33 5Z", "M8.5 9L15.5 9", "M8.5 12.25L15.5 12.25", "M8.5 15.5L12.5 15.5"];
export const txIconRectangleXmark: TxIconPath[] = ["M4.5 5H19.5A2 2 0 0 1 21.5 7V17A2 2 0 0 1 19.5 19H4.5A2 2 0 0 1 2.5 17V7A2 2 0 0 1 4.5 5Z", "M9.5 9.5L14.5 14.5", "M14.5 9.5L9.5 14.5"];
export const txIconRefresh: TxIconPath[] = ["M17.66 6.34A8 8 0 1 1 12 4", "M9.5 1.5L12 4L9.5 6.5"];
export const txIconReplay: TxIconPath[] = ["M6.34 6.34A8 8 180 1 0 12 4", "M14.5 1.5L12 4L14.5 6.5"];
export const txIconReply: TxIconPath[] = ["M4 19.5V16A6.5 6.5 0 0 1 10.5 9.5H20", "M15.5 5L20 9.5L15.5 14"];
export const txIconRows2: TxIconPath[] = ["M6 3.5H18A2.5 2.5 0 0 1 20.5 6V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z", "M3.5 12L20.5 12"];
export const txIconSave: TxIconPath[] = ["M5.5 3.5H15.5L20.5 8.5V18.5A2 2 0 0 1 18.5 20.5H5.5A2 2 0 0 1 3.5 18.5V5.5A2 2 0 0 1 5.5 3.5Z", "M7.5 3.5L7.5 8L14.5 8L14.5 3.5", "M7.5 20.5V14.5A1 1 0 0 1 8.5 13.5H15.5A1 1 0 0 1 16.5 14.5V20.5"];
export const txIconSearchMinus: TxIconPath[] = ["M4 10.5A6.5 6.5 0 1 0 17 10.5A6.5 6.5 0 1 0 4 10.5Z", "M15.25 15.25L20 20", "M8 10.5L13 10.5"];
export const txIconSearchPlus: TxIconPath[] = ["M4 10.5A6.5 6.5 0 1 0 17 10.5A6.5 6.5 0 1 0 4 10.5Z", "M15.25 15.25L20 20", "M10.5 8L10.5 13", "M8 10.5L13 10.5"];
export const txIconSearch: TxIconPath[] = ["M4 10.5A6.5 6.5 0 1 0 17 10.5A6.5 6.5 0 1 0 4 10.5Z", "M15.25 15.25L20 20"];
export const txIconSend: TxIconPath[] = ["M20.5 3.5L3.5 10.5L10.5 13.5L13.5 20.5Z", "M20.5 3.5L10.5 13.5"];
export const txIconServer: TxIconPath[] = ["M5 3.5H19A2 2 0 0 1 21 5.5V8.5A2 2 0 0 1 19 10.5H5A2 2 0 0 1 3 8.5V5.5A2 2 0 0 1 5 3.5Z", "M5 13.5H19A2 2 0 0 1 21 15.5V18.5A2 2 0 0 1 19 20.5H5A2 2 0 0 1 3 18.5V15.5A2 2 0 0 1 5 13.5Z", { d: "M6.4 7A0.6 0.6 0 1 0 7.6 7A0.6 0.6 0 1 0 6.4 7Z", fill: true }, { d: "M6.4 17A0.6 0.6 0 1 0 7.6 17A0.6 0.6 0 1 0 6.4 17Z", fill: true }, "M11 7L17 7", "M11 17L17 17"];
export const txIconShareAlt: TxIconPath[] = ["M15.5 5.5A2.5 2.5 0 1 0 20.5 5.5A2.5 2.5 0 1 0 15.5 5.5Z", "M3.5 12A2.5 2.5 0 1 0 8.5 12A2.5 2.5 0 1 0 3.5 12Z", "M15.5 18.5A2.5 2.5 0 1 0 20.5 18.5A2.5 2.5 0 1 0 15.5 18.5Z", "M8.25 10.85L15.75 6.65", "M8.25 13.15L15.75 17.35"];
export const txIconShield: TxIconPath[] = ["M12 3L19.5 6V11.5C19.5 16 16.3 19.6 12 21C7.7 19.6 4.5 16 4.5 11.5V6Z"];
export const txIconShop: TxIconPath[] = ["M4 9.5L5 4.5L19 4.5L20 9.5", "M4 9.5A2.67 2.67 0 0 0 9.33 9.5A2.67 2.67 0 0 0 14.67 9.5A2.67 2.67 0 0 0 20 9.5", "M5 12L5 20.5L19 20.5L19 12", "M10 20.5L10 15.5L14 15.5L14 20.5"];
export const txIconShoppingBag: TxIconPath[] = ["M5.5 7.5L18.5 7.5L19.5 20.5L4.5 20.5Z", "M9 10V6A3 3 0 0 1 15 6V10"];
export const txIconShoppingCart: TxIconPath[] = ["M2.5 3.5H5L7.5 15.5H18.5L20.5 7H6", "M7.75 19.5A1.25 1.25 0 1 0 10.25 19.5A1.25 1.25 0 1 0 7.75 19.5Z", "M15.75 19.5A1.25 1.25 0 1 0 18.25 19.5A1.25 1.25 0 1 0 15.75 19.5Z"];
export const txIconSidebar: TxIconPath[] = ["M5 4H19A2 2 0 0 1 21 6V18A2 2 0 0 1 19 20H5A2 2 0 0 1 3 18V6A2 2 0 0 1 5 4Z", "M9 4L9 20"];
export const txIconSignIn: TxIconPath[] = ["M14.5 3.5H18.5A2 2 0 0 1 20.5 5.5V18.5A2 2 0 0 1 18.5 20.5H14.5", "M3.5 12L14.5 12", "M10.5 8L14.5 12L10.5 16"];
export const txIconSignOut: TxIconPath[] = ["M9.5 3.5H5.5A2 2 0 0 0 3.5 5.5V18.5A2 2 0 0 0 5.5 20.5H9.5", "M9.5 12L20.5 12", "M16.5 8L20.5 12L16.5 16"];
export const txIconSignature: TxIconPath[] = ["M3.5 15.5C5.5 10 7.5 5 9.25 5C11 5 9.75 12 8 17C9.75 13.5 12 11.25 13.25 12.1C14.5 13 12.8 15.25 14.75 15.25C16.25 15.25 17.25 13.5 20.5 13.5", "M3.5 20L20.5 20"];
export const txIconSitemap: TxIconPath[] = ["M10 3H14A1 1 0 0 1 15 4V6.5A1 1 0 0 1 14 7.5H10A1 1 0 0 1 9 6.5V4A1 1 0 0 1 10 3Z", "M4 16.5H8A1 1 0 0 1 9 17.5V20A1 1 0 0 1 8 21H4A1 1 0 0 1 3 20V17.5A1 1 0 0 1 4 16.5Z", "M16 16.5H20A1 1 0 0 1 21 17.5V20A1 1 0 0 1 20 21H16A1 1 0 0 1 15 20V17.5A1 1 0 0 1 16 16.5Z", "M12 7.5L12 12", "M6 16.5V13.5A1.5 1.5 0 0 1 7.5 12H16.5A1.5 1.5 0 0 1 18 13.5V16.5"];
export const txIconSlash: TxIconPath[] = ["M18 4.5L6 19.5"];
export const txIconSlidersH: TxIconPath[] = ["M3 6L13 6", "M13 6A2 2 0 1 0 17 6A2 2 0 1 0 13 6Z", "M17 6L21 6", "M3 12L6 12", "M6 12A2 2 0 1 0 10 12A2 2 0 1 0 6 12Z", "M10 12L21 12", "M3 18L11 18", "M11 18A2 2 0 1 0 15 18A2 2 0 1 0 11 18Z", "M15 18L21 18"];
export const txIconSlidersV: TxIconPath[] = ["M18 3L18 13", "M18 13A2 2 90 1 0 18 17A2 2 90 1 0 18 13Z", "M18 17L18 21", "M12 3L12 6", "M12 6A2 2 90 1 0 12 10A2 2 90 1 0 12 6Z", "M12 10L12 21", "M6 3L6 11", "M6 11A2 2 90 1 0 6 15A2 2 90 1 0 6 11Z", "M6 15L6 21"];
export const txIconSortAlphaDownAlt: TxIconPath[] = ["M6.5 4L6.5 20", "M3 16.5L6.5 20L10 16.5", "M14 3.5L19 3.5L14 10.5L19 10.5", "M14 20.5L16.5 13.5L19 20.5", "M14.9 18L18.1 18"];
export const txIconSortAlphaDown: TxIconPath[] = ["M6.5 4L6.5 20", "M3 16.5L6.5 20L10 16.5", "M14 10.5L16.5 3.5L19 10.5", "M14.9 8L18.1 8", "M14 13.5L19 13.5L14 20.5L19 20.5"];
export const txIconSortAlphaUpAlt: TxIconPath[] = ["M6.5 20L6.5 4", "M3 7.5L6.5 4L10 7.5", "M14 3.5L19 3.5L14 10.5L19 10.5", "M14 20.5L16.5 13.5L19 20.5", "M14.9 18L18.1 18"];
export const txIconSortAlphaUp: TxIconPath[] = ["M6.5 20L6.5 4", "M3 7.5L6.5 4L10 7.5", "M14 10.5L16.5 3.5L19 10.5", "M14.9 8L18.1 8", "M14 13.5L19 13.5L14 20.5L19 20.5"];
export const txIconSortAltSlash: TxIconPath[] = ["M8 4L8 20", "M4.5 7.5L8 4L11.5 7.5", "M16 4L16 20", "M12.5 16.5L16 20L19.5 16.5", "M3.5 3.5L20.5 20.5"];
export const txIconSortAlt: TxIconPath[] = ["M8 4L8 20", "M4.5 7.5L8 4L11.5 7.5", "M16 4L16 20", "M12.5 16.5L16 20L19.5 16.5"];
export const txIconSortAmountDownAlt: TxIconPath[] = ["M6.5 4L6.5 20", "M3 16.5L6.5 20L10 16.5", "M11.5 6L15 6", "M11.5 10.5L18 10.5", "M11.5 15L21 15"];
export const txIconSortAmountDown: TxIconPath[] = ["M6.5 4L6.5 20", "M3 16.5L6.5 20L10 16.5", "M11.5 6L21 6", "M11.5 10.5L18 10.5", "M11.5 15L15 15"];
export const txIconSortAmountUpAlt: TxIconPath[] = ["M6.5 20L6.5 4", "M3 7.5L6.5 4L10 7.5", "M11.5 6L15 6", "M11.5 10.5L18 10.5", "M11.5 15L21 15"];
export const txIconSortAmountUp: TxIconPath[] = ["M6.5 20L6.5 4", "M3 7.5L6.5 4L10 7.5", "M11.5 6L21 6", "M11.5 10.5L18 10.5", "M11.5 15L15 15"];
export const txIconSortDownFill: TxIconPath[] = [{ d: "M6.5 9.5L17.5 9.5L12 15.5Z", fill: true }];
export const txIconSortDown: TxIconPath[] = ["M6.5 9.5L17.5 9.5L12 15.5Z"];
export const txIconSortNumericDownAlt: TxIconPath[] = ["M6.5 4L6.5 20", "M3 16.5L6.5 20L10 16.5", "M14.5 6.25A2.25 2.25 0 1 0 19 6.25A2.25 2.25 0 1 0 14.5 6.25Z", "M19 6.25V8A2.75 2.75 0 0 1 16.25 10.75H15", "M15 15.5L17.25 13.5L17.25 20.5"];
export const txIconSortNumericDown: TxIconPath[] = ["M6.5 4L6.5 20", "M3 16.5L6.5 20L10 16.5", "M15 5.5L17.25 3.5L17.25 10.5", "M14.5 16.25A2.25 2.25 0 1 0 19 16.25A2.25 2.25 0 1 0 14.5 16.25Z", "M19 16.25L19 18A2.75 2.75 0 0 1 16.25 20.75L15 20.75"];
export const txIconSortNumericUpAlt: TxIconPath[] = ["M6.5 20L6.5 4", "M3 7.5L6.5 4L10 7.5", "M14.5 6.25A2.25 2.25 0 1 0 19 6.25A2.25 2.25 0 1 0 14.5 6.25Z", "M19 6.25V8A2.75 2.75 0 0 1 16.25 10.75H15", "M15 15.5L17.25 13.5L17.25 20.5"];
export const txIconSortNumericUp: TxIconPath[] = ["M6.5 20L6.5 4", "M3 7.5L6.5 4L10 7.5", "M15 5.5L17.25 3.5L17.25 10.5", "M14.5 16.25A2.25 2.25 0 1 0 19 16.25A2.25 2.25 0 1 0 14.5 16.25Z", "M19 16.25L19 18A2.75 2.75 0 0 1 16.25 20.75L15 20.75"];
export const txIconSortUpFill: TxIconPath[] = [{ d: "M6.5 14.5L12 8.5L17.5 14.5Z", fill: true }];
export const txIconSortUp: TxIconPath[] = ["M6.5 14.5L12 8.5L17.5 14.5Z"];
export const txIconSort: TxIconPath[] = [{ d: "M7.5 9.5L12 4.5L16.5 9.5Z", fill: true }, { d: "M7.5 14.5L12 19.5L16.5 14.5Z", fill: true }];
export const txIconSparkles: TxIconPath[] = ["M10 4L11.6 8.9L16.5 10.5L11.6 12.1L10 17L8.4 12.1L3.5 10.5L8.4 8.9Z", "M18 3L18.7 4.8L20.5 5.5L18.7 6.2L18 8L17.3 6.2L15.5 5.5L17.3 4.8Z", "M17.5 15L18.2 16.8L20 17.5L18.2 18.2L17.5 20L16.8 18.2L15 17.5L16.8 16.8Z"];
export const txIconSpinnerDotted: TxIconPath[] = [{ d: "M11.15 3.75A0.85 0.85 0 1 0 12.85 3.75A0.85 0.85 0 1 0 11.15 3.75Z", fill: true }, { d: "M17.23 5.57A0.85 0.85 45 1 0 18.43 6.77A0.85 0.85 45 1 0 17.23 5.57Z", fill: true }, { d: "M20.25 11.15A0.85 0.85 90 1 0 20.25 12.85A0.85 0.85 90 1 0 20.25 11.15Z", fill: true }, { d: "M18.43 17.23A0.85 0.85 135 1 0 17.23 18.43A0.85 0.85 135 1 0 18.43 17.23Z", fill: true }, { d: "M12.85 20.25A0.85 0.85 180 1 0 11.15 20.25A0.85 0.85 180 1 0 12.85 20.25Z", fill: true }, { d: "M6.77 18.43A0.85 0.85 -135 1 0 5.57 17.23A0.85 0.85 -135 1 0 6.77 18.43Z", fill: true }, { d: "M3.75 12.85A0.85 0.85 -90 1 0 3.75 11.15A0.85 0.85 -90 1 0 3.75 12.85Z", fill: true }, { d: "M5.57 6.77A0.85 0.85 -45 1 0 6.77 5.57A0.85 0.85 -45 1 0 5.57 6.77Z", fill: true }];
export const txIconSpinner: TxIconPath[] = ["M12 3.5A8.5 8.5 0 1 1 3.63 10.52"];
export const txIconSquare: TxIconPath[] = ["M7 4H17A3 3 0 0 1 20 7V17A3 3 0 0 1 17 20H7A3 3 0 0 1 4 17V7A3 3 0 0 1 7 4Z"];
export const txIconStamp: TxIconPath[] = ["M10 12V9.75A3 3 0 1 1 14 9.75V12", "M5.5 12H18.5A1.5 1.5 0 0 1 20 13.5V15A1.5 1.5 0 0 1 18.5 16.5H5.5A1.5 1.5 0 0 1 4 15V13.5A1.5 1.5 0 0 1 5.5 12Z", "M5 19.5L19 19.5"];
export const txIconStarFill: TxIconPath[] = [{ d: "M12 3.25L14.5 9.31L21.04 9.81L16.04 14.06L17.58 20.44L12 17L6.42 20.44L7.96 14.06L2.96 9.81L9.5 9.31Z", fill: true }];
export const txIconStarHalfFill: TxIconPath[] = [{ d: "M12 3.25L9.5 9.31L2.96 9.81L7.96 14.06L6.42 20.44L12 17Z", fill: true }];
export const txIconStarHalf: TxIconPath[] = ["M12 3.25L9.5 9.31L2.96 9.81L7.96 14.06L6.42 20.44L12 17Z"];
export const txIconStar: TxIconPath[] = ["M12 3.25L14.5 9.31L21.04 9.81L16.04 14.06L17.58 20.44L12 17L6.42 20.44L7.96 14.06L2.96 9.81L9.5 9.31Z"];
export const txIconStepBackwardAlt: TxIconPath[] = ["M18.5 5.5L18.5 18.5", "M15.5 5.5L5.5 12L15.5 18.5Z"];
export const txIconStepBackward: TxIconPath[] = ["M18 5.5L8 12L18 18.5Z", "M5.5 5.5L5.5 18.5"];
export const txIconStepForwardAlt: TxIconPath[] = ["M5.5 5.5L5.5 18.5", "M8.5 5.5L18.5 12L8.5 18.5Z"];
export const txIconStepForward: TxIconPath[] = ["M6 5.5L16 12L6 18.5Z", "M18.5 5.5L18.5 18.5"];
export const txIconStopCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M10 9H14A1 1 0 0 1 15 10V14A1 1 0 0 1 14 15H10A1 1 0 0 1 9 14V10A1 1 0 0 1 10 9Z"];
export const txIconStop: TxIconPath[] = ["M7.5 5.5H16.5A2 2 0 0 1 18.5 7.5V16.5A2 2 0 0 1 16.5 18.5H7.5A2 2 0 0 1 5.5 16.5V7.5A2 2 0 0 1 7.5 5.5Z"];
export const txIconStopwatch: TxIconPath[] = ["M4.5 13.5A7.5 7.5 0 1 0 19.5 13.5A7.5 7.5 0 1 0 4.5 13.5Z", "M10 2.5L14 2.5", "M12 2.5L12 6", "M12 10L12 13.5", "M17.5 7L19 5.5"];
export const txIconStrikethrough: TxIconPath[] = ["M16.75 7.25C16.25 5.6 14.5 4.5 12 4.5C9.1 4.5 7.25 5.9 7.25 8C7.25 9.4 8.1 10.4 9.75 11.1", "M4 12L20 12", "M15.75 13.6C16.45 14.25 16.75 15.05 16.75 16C16.75 18.1 14.75 19.5 12 19.5C9.35 19.5 7.5 18.4 7 16.75"];
export const txIconSubscript: TxIconPath[] = ["M4 6L13 15", "M13 6L4 15", "M15.25 14.25A2.1 2.1 0 1 1 18.75 15.75L15.25 19.5H19.5"];
export const txIconSun: TxIconPath[] = ["M8 12A4 4 0 1 0 16 12A4 4 0 1 0 8 12Z", "M12 2.75L12 4.75", "M18.54 5.46L17.13 6.87", "M21.25 12L19.25 12", "M18.54 18.54L17.13 17.13", "M12 21.25L12 19.25", "M5.46 18.54L6.87 17.13", "M2.75 12L4.75 12", "M5.46 5.46L6.87 6.87"];
export const txIconSuperscript: TxIconPath[] = ["M4 9L13 18", "M13 9L4 18", "M15.25 5.25A2.1 2.1 0 1 1 18.75 6.75L15.25 10.5H19.5"];
export const txIconSync: TxIconPath[] = ["M4.27 9.93A8 8 0 0 1 20 12", "M22.5 9.5L20 12L17.5 9.5", "M19.73 14.07A8 8 0 0 1 4 12", "M1.5 14.5L4 12L6.5 14.5"];
export const txIconTable: TxIconPath[] = ["M5 4H19A2 2 0 0 1 21 6V18A2 2 0 0 1 19 20H5A2 2 0 0 1 3 18V6A2 2 0 0 1 5 4Z", "M3 9.5L21 9.5", "M3 14.75L21 14.75", "M9 9.5L9 20"];
export const txIconTablet: TxIconPath[] = ["M7 3H17A2.5 2.5 0 0 1 19.5 5.5V18.5A2.5 2.5 0 0 1 17 21H7A2.5 2.5 0 0 1 4.5 18.5V5.5A2.5 2.5 0 0 1 7 3Z", "M10.5 18L13.5 18"];
export const txIconTag: TxIconPath[] = ["M3.5 4.5V11.1A2 2 0 0 0 4.1 12.5L11.5 19.9A2 2 0 0 0 14.3 19.9L19.9 14.3A2 2 0 0 0 19.9 11.5L12.5 4.1A2 2 0 0 0 11.1 3.5H4.5A1 1 0 0 0 3.5 4.5Z", { d: "M7.25 8A0.75 0.75 0 1 0 8.75 8A0.75 0.75 0 1 0 7.25 8Z", fill: true }];
export const txIconTags: TxIconPath[] = ["M2.5 4.5V10.6A2 2 0 0 0 3.1 12L10 18.9A2 2 0 0 0 12.8 18.9L17.9 13.8A2 2 0 0 0 17.9 11L11 4.1A2 2 0 0 0 9.6 3.5H3.5A1 1 0 0 0 2.5 4.5Z", { d: "M6 7.75A0.75 0.75 0 1 0 7.5 7.75A0.75 0.75 0 1 0 6 7.75Z", fill: true }, "M14 3.5L20.9 10.4A2 2 0 0 1 20.9 13.2L15.5 18.6"];
export const txIconTextColor: TxIconPath[] = ["M6.5 15.5L12 3.5L17.5 15.5", "M8.5 11.25L15.5 11.25", { d: "M5 18.75H19A1 1 0 0 1 20 19.75V19.75A1 1 0 0 1 19 20.75H5A1 1 0 0 1 4 19.75V19.75A1 1 0 0 1 5 18.75Z", fill: true }];
export const txIconText: TxIconPath[] = ["M5 5L19 5", "M12 5L12 19.5", "M9.5 19.5L14.5 19.5"];
export const txIconThLarge: TxIconPath[] = ["M5 3.5H9.5A1.5 1.5 0 0 1 11 5V9.5A1.5 1.5 0 0 1 9.5 11H5A1.5 1.5 0 0 1 3.5 9.5V5A1.5 1.5 0 0 1 5 3.5Z", "M14.5 3.5H19A1.5 1.5 0 0 1 20.5 5V9.5A1.5 1.5 0 0 1 19 11H14.5A1.5 1.5 0 0 1 13 9.5V5A1.5 1.5 0 0 1 14.5 3.5Z", "M5 13H9.5A1.5 1.5 0 0 1 11 14.5V19A1.5 1.5 0 0 1 9.5 20.5H5A1.5 1.5 0 0 1 3.5 19V14.5A1.5 1.5 0 0 1 5 13Z", "M14.5 13H19A1.5 1.5 0 0 1 20.5 14.5V19A1.5 1.5 0 0 1 19 20.5H14.5A1.5 1.5 0 0 1 13 19V14.5A1.5 1.5 0 0 1 14.5 13Z"];
export const txIconThumbsDownFill: TxIconPath[] = ["M7.5 13.5L7.5 4L4.5 4A1 1 0 0 0 3.5 5L3.5 12.5A1 1 0 0 0 4.5 13.5Z", { d: "M7.5 13.5L11 20.5A2.5 2.5 0 0 0 13.75 17.75L13.25 15L18.6 15A2 2 0 0 0 20.55 12.55L19.1 5.55A2 2 0 0 0 17.15 4L7.5 4Z", fill: true }];
export const txIconThumbsDown: TxIconPath[] = ["M7.5 13.5L7.5 4L4.5 4A1 1 0 0 0 3.5 5L3.5 12.5A1 1 0 0 0 4.5 13.5Z", "M7.5 13.5L11 20.5A2.5 2.5 0 0 0 13.75 17.75L13.25 15L18.6 15A2 2 0 0 0 20.55 12.55L19.1 5.55A2 2 0 0 0 17.15 4L7.5 4Z"];
export const txIconThumbsUpFill: TxIconPath[] = ["M7.5 10.5V20H4.5A1 1 0 0 1 3.5 19V11.5A1 1 0 0 1 4.5 10.5Z", { d: "M7.5 10.5L11 3.5A2.5 2.5 0 0 1 13.75 6.25L13.25 9H18.6A2 2 0 0 1 20.55 11.45L19.1 18.45A2 2 0 0 1 17.15 20H7.5Z", fill: true }];
export const txIconThumbsUp: TxIconPath[] = ["M7.5 10.5V20H4.5A1 1 0 0 1 3.5 19V11.5A1 1 0 0 1 4.5 10.5Z", "M7.5 10.5L11 3.5A2.5 2.5 0 0 1 13.75 6.25L13.25 9H18.6A2 2 0 0 1 20.55 11.45L19.1 18.45A2 2 0 0 1 17.15 20H7.5Z"];
export const txIconThumbtack: TxIconPath[] = ["M9 3.5L15 3.5", "M10 3.5V9L7 13V14.5H17V13L14 9V3.5", "M12 14.5L12 21"];
export const txIconTicket: TxIconPath[] = ["M3.5 7A1.5 1.5 0 0 1 5 5.5H19A1.5 1.5 0 0 1 20.5 7V9.5A2.5 2.5 0 0 0 20.5 14.5V17A1.5 1.5 0 0 1 19 18.5H5A1.5 1.5 0 0 1 3.5 17V14.5A2.5 2.5 0 0 0 3.5 9.5Z", "M14 7.75L14 9", "M14 11.4L14 12.6", "M14 15L14 16.25"];
export const txIconTimesCircle: TxIconPath[] = ["M2.75 12A9.25 9.25 0 1 0 21.25 12A9.25 9.25 0 1 0 2.75 12Z", "M9.25 9.25L14.75 14.75", "M14.75 9.25L9.25 14.75"];
export const txIconTimes: TxIconPath[] = ["M6 6L18 18", "M18 6L6 18"];
export const txIconTrash: TxIconPath[] = ["M3.5 6.5L20.5 6.5", "M9 6.5V4.5A1 1 0 0 1 10 3.5H14A1 1 0 0 1 15 4.5V6.5", "M5.5 6.5L6.5 19.1A1.5 1.5 0 0 0 8 20.5H16A1.5 1.5 0 0 0 17.5 19.1L18.5 6.5", "M10 10.5L10 16.5", "M14 10.5L14 16.5"];
export const txIconTrophy: TxIconPath[] = ["M7 3.5H17V9A5 5 0 0 1 7 9Z", "M7 5.5H4.5V7A3 3 0 0 0 7.2 10", "M17 5.5H19.5V7A3 3 0 0 1 16.8 10", "M12 14L12 17.5", "M8 20.5L16 20.5", "M9.5 20.5L9.5 17.5L14.5 17.5L14.5 20.5"];
export const txIconTruck: TxIconPath[] = ["M3.5 5H13A1 1 0 0 1 14 6V14.5A1 1 0 0 1 13 15.5H3.5A1 1 0 0 1 2.5 14.5V6A1 1 0 0 1 3.5 5Z", "M14 8.5L17.75 8.5L21.5 12.25L21.5 15.5L14 15.5", "M4.5 17.25A2 2 0 1 0 8.5 17.25A2 2 0 1 0 4.5 17.25Z", "M15.5 17.25A2 2 0 1 0 19.5 17.25A2 2 0 1 0 15.5 17.25Z"];
export const txIconTurkishLira: TxIconPath[] = ["M9.5 3.5V18.5A1 1 0 0 0 10.5 19.5C15 19.5 18.5 16 18.5 11.5", "M6 10.5L14 7.5", "M6 14.5L14 11.5"];
export const txIconUnderline: TxIconPath[] = ["M7 4.5V11A5 5 0 0 0 17 11V4.5", "M5 20L19 20"];
export const txIconUndo: TxIconPath[] = ["M8.5 14L4 9.5L8.5 5", "M4 9.5H15A5 5 0 0 1 15 19.5H11.5"];
export const txIconUnlock: TxIconPath[] = ["M7.5 10.5H16.5A2.5 2.5 0 0 1 19 13V18A2.5 2.5 0 0 1 16.5 20.5H7.5A2.5 2.5 0 0 1 5 18V13A2.5 2.5 0 0 1 7.5 10.5Z", "M12 14.5L12 16.5", "M16 10.5V7.5A4 4 0 0 0 8.25 6.1"];
export const txIconUpload: TxIconPath[] = ["M12 14.5L12 3.5", "M7.5 8L12 3.5L16.5 8", "M4 14.5V18.5A2 2 0 0 0 6 20.5H18A2 2 0 0 0 20 18.5V14.5"];
export const txIconUserEdit: TxIconPath[] = ["M6 8A4 4 0 1 0 14 8A4 4 0 1 0 6 8Z", "M3 20.5A7 7 0 0 1 14.8 15.4", "M18.75 12.25A1.6 1.6 0 0 1 21 14.5L16 19.5H13.75V17.25Z"];
export const txIconUserMinus: TxIconPath[] = ["M6 8A4 4 0 1 0 14 8A4 4 0 1 0 6 8Z", "M3 20.5A7 7 0 0 1 14.8 15.4", "M15.5 15L21.5 15"];
export const txIconUserPlus: TxIconPath[] = ["M6 8A4 4 0 1 0 14 8A4 4 0 1 0 6 8Z", "M3 20.5A7 7 0 0 1 14.8 15.4", "M18.5 12L18.5 18", "M15.5 15L21.5 15"];
export const txIconUser: TxIconPath[] = ["M8 8A4 4 0 1 0 16 8A4 4 0 1 0 8 8Z", "M4.5 20.5A7.5 7.5 0 0 1 19.5 20.5"];
export const txIconUsers: TxIconPath[] = ["M5.5 8A3.5 3.5 0 1 0 12.5 8A3.5 3.5 0 1 0 5.5 8Z", "M2.5 20A6.5 6.5 0 0 1 15.5 20", "M15.5 4.8A3.5 3.5 0 0 1 15.5 11.6", "M17.5 13.6A6.5 6.5 0 0 1 21.5 20"];
export const txIconVenus: TxIconPath[] = ["M6.5 9A5.5 5.5 0 1 0 17.5 9A5.5 5.5 0 1 0 6.5 9Z", "M12 14.5L12 21", "M9 18L15 18"];
export const txIconVerified: TxIconPath[] = ["M12 2.5L14.01 4.51L16.75 3.77L17.48 6.52L20.23 7.25L19.49 9.99L21.5 12L19.49 14.01L20.23 16.75L17.48 17.48L16.75 20.23L14.01 19.49L12 21.5L9.99 19.49L7.25 20.23L6.52 17.48L3.77 16.75L4.51 14.01L2.5 12L4.51 9.99L3.77 7.25L6.52 6.52L7.25 3.77L9.99 4.51Z", "M8.5 12.25L11 14.75L15.75 9.75"];
export const txIconVideo: TxIconPath[] = ["M4.5 6.5H13.5A2 2 0 0 1 15.5 8.5V15.5A2 2 0 0 1 13.5 17.5H4.5A2 2 0 0 1 2.5 15.5V8.5A2 2 0 0 1 4.5 6.5Z", "M15.5 10.5L21.5 7V17L15.5 13.5"];
export const txIconVolumeDown: TxIconPath[] = ["M3.5 9.5H7L11.5 5.5V18.5L7 14.5H3.5Z", "M15 9.25A3.75 3.75 0 0 1 15 14.75"];
export const txIconVolumeOff: TxIconPath[] = ["M3.5 9.5H7L11.5 5.5V18.5L7 14.5H3.5Z", "M15.5 9.5L20.5 14.5", "M20.5 9.5L15.5 14.5"];
export const txIconVolumeUp: TxIconPath[] = ["M3.5 9.5H7L11.5 5.5V18.5L7 14.5H3.5Z", "M15 9.25A3.75 3.75 0 0 1 15 14.75", "M17.75 6.25A8 8 0 0 1 17.75 17.75"];
export const txIconWallet: TxIconPath[] = ["M17.5 7.5V5.5A1.5 1.5 0 0 0 16 4H5A2 2 0 0 0 3 6V18A2 2 0 0 0 5 20H19A2 2 0 0 0 21 18V9.5A2 2 0 0 0 19 7.5H5A2 2 0 0 1 3 5.5", "M16.5 11.75H19.5A1.5 1.5 0 0 1 21 13.25V14.75A1.5 1.5 0 0 1 19.5 16.25H16.5A1.5 1.5 0 0 1 15 14.75V13.25A1.5 1.5 0 0 1 16.5 11.75Z", { d: "M17 14A0.5 0.5 0 1 0 18 14A0.5 0.5 0 1 0 17 14Z", fill: true }];
export const txIconWarehouse: TxIconPath[] = ["M3 20.5V9L12 4L21 9V20.5", "M7 20.5L7 12.5L17 12.5L17 20.5", "M7 16.5L17 16.5"];
export const txIconWavePulse: TxIconPath[] = ["M2.5 12L6.5 12L9 6L13 18L15.5 12L21.5 12"];
export const txIconWifi: TxIconPath[] = [{ d: "M11.25 18.75A0.75 0.75 0 1 0 12.75 18.75A0.75 0.75 0 1 0 11.25 18.75Z", fill: true }, "M8.9 15.4A4.4 4.4 0 0 1 15.1 15.4", "M5.9 12.4A8.6 8.6 0 0 1 18.1 12.4", "M2.9 9.4A12.9 12.9 0 0 1 21.1 9.4"];
export const txIconWindowMaximize: TxIconPath[] = ["M6 3.5H18A2.5 2.5 0 0 1 20.5 6V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z", "M12.5 7.5L16.5 7.5L16.5 11.5", "M16.5 7.5L10.5 13.5"];
export const txIconWindowMinimize: TxIconPath[] = ["M6 3.5H18A2.5 2.5 0 0 1 20.5 6V18A2.5 2.5 0 0 1 18 20.5H6A2.5 2.5 0 0 1 3.5 18V6A2.5 2.5 0 0 1 6 3.5Z", "M7.5 12.5L11.5 12.5L11.5 16.5", "M11.5 12.5L17 7"];
export const txIconWrench: TxIconPath[] = ["M15.5 3.75A5 5 0 0 0 10 10.6L4 16.6A2.1 2.1 0 0 0 7 19.6L13 13.6A5 5 0 0 0 19.9 8L16.75 11.1L13.25 10.75L12.9 7.25Z"];

export const TX_ICONS: Record<TxIconName, TxIconPath[]> = {
  'address-book': txIconAddressBook,
  'align-center': txIconAlignCenter,
  'align-justify': txIconAlignJustify,
  'align-left': txIconAlignLeft,
  'align-right': txIconAlignRight,
  'angle-double-down': txIconAngleDoubleDown,
  'angle-double-left': txIconAngleDoubleLeft,
  'angle-double-right': txIconAngleDoubleRight,
  'angle-double-up': txIconAngleDoubleUp,
  'angle-down': txIconAngleDown,
  'angle-left': txIconAngleLeft,
  'angle-right': txIconAngleRight,
  'angle-up': txIconAngleUp,
  'arrow-circle-down': txIconArrowCircleDown,
  'arrow-circle-left': txIconArrowCircleLeft,
  'arrow-circle-right': txIconArrowCircleRight,
  'arrow-circle-up': txIconArrowCircleUp,
  'arrow-down-left-and-arrow-up-right-to-center': txIconArrowDownLeftAndArrowUpRightToCenter,
  'arrow-down-left': txIconArrowDownLeft,
  'arrow-down-right': txIconArrowDownRight,
  'arrow-down': txIconArrowDown,
  'arrow-left': txIconArrowLeft,
  'arrow-right-arrow-left': txIconArrowRightArrowLeft,
  'arrow-right': txIconArrowRight,
  'arrow-u-turn-up-left': txIconArrowUTurnUpLeft,
  'arrow-u-turn-up-right': txIconArrowUTurnUpRight,
  'arrow-up-left': txIconArrowUpLeft,
  'arrow-up-right-and-arrow-down-left-from-center': txIconArrowUpRightAndArrowDownLeftFromCenter,
  'arrow-up-right': txIconArrowUpRight,
  'arrow-up': txIconArrowUp,
  'arrows-alt': txIconArrowsAlt,
  'arrows-h': txIconArrowsH,
  'arrows-v': txIconArrowsV,
  'asterisk': txIconAsterisk,
  'at': txIconAt,
  'backward': txIconBackward,
  'ban': txIconBan,
  'barcode': txIconBarcode,
  'bars': txIconBars,
  'bell-slash': txIconBellSlash,
  'bell': txIconBell,
  'bitcoin': txIconBitcoin,
  'block-quote': txIconBlockQuote,
  'bold': txIconBold,
  'bolt': txIconBolt,
  'book': txIconBook,
  'bookmark-fill': txIconBookmarkFill,
  'bookmark': txIconBookmark,
  'box': txIconBox,
  'briefcase': txIconBriefcase,
  'building-columns': txIconBuildingColumns,
  'building': txIconBuilding,
  'bullseye': txIconBullseye,
  'calculator': txIconCalculator,
  'calendar-clock': txIconCalendarClock,
  'calendar-minus': txIconCalendarMinus,
  'calendar-plus': txIconCalendarPlus,
  'calendar-times': txIconCalendarTimes,
  'calendar': txIconCalendar,
  'camera': txIconCamera,
  'car': txIconCar,
  'caret-down': txIconCaretDown,
  'caret-left': txIconCaretLeft,
  'caret-right': txIconCaretRight,
  'caret-up': txIconCaretUp,
  'cart-arrow-down': txIconCartArrowDown,
  'cart-minus': txIconCartMinus,
  'cart-plus': txIconCartPlus,
  'case-sensitive': txIconCaseSensitive,
  'chart-bar': txIconChartBar,
  'chart-line': txIconChartLine,
  'chart-pie': txIconChartPie,
  'chart-scatter': txIconChartScatter,
  'check-circle': txIconCheckCircle,
  'check-square': txIconCheckSquare,
  'check': txIconCheck,
  'chevron-circle-down': txIconChevronCircleDown,
  'chevron-circle-left': txIconChevronCircleLeft,
  'chevron-circle-right': txIconChevronCircleRight,
  'chevron-circle-up': txIconChevronCircleUp,
  'chevron-down': txIconChevronDown,
  'chevron-left': txIconChevronLeft,
  'chevron-right': txIconChevronRight,
  'chevron-up': txIconChevronUp,
  'circle-fill': txIconCircleFill,
  'circle': txIconCircle,
  'clipboard': txIconClipboard,
  'clock': txIconClock,
  'clone': txIconClone,
  'cloud-download': txIconCloudDownload,
  'cloud-upload': txIconCloudUpload,
  'cloud': txIconCloud,
  'code-branch': txIconCodeBranch,
  'code': txIconCode,
  'cog': txIconCog,
  'columns-2': txIconColumns2,
  'comment': txIconComment,
  'comments': txIconComments,
  'compass': txIconCompass,
  'compress': txIconCompress,
  'copy': txIconCopy,
  'credit-card': txIconCreditCard,
  'crown': txIconCrown,
  'database': txIconDatabase,
  'delete-left': txIconDeleteLeft,
  'desktop': txIconDesktop,
  'directions-alt': txIconDirectionsAlt,
  'directions': txIconDirections,
  'dollar': txIconDollar,
  'dot': txIconDot,
  'download': txIconDownload,
  'eject': txIconEject,
  'ellipsis-h': txIconEllipsisH,
  'ellipsis-v': txIconEllipsisV,
  'envelope': txIconEnvelope,
  'equals': txIconEquals,
  'eraser': txIconEraser,
  'euro': txIconEuro,
  'exclamation-circle': txIconExclamationCircle,
  'exclamation-triangle': txIconExclamationTriangle,
  'expand': txIconExpand,
  'external-link': txIconExternalLink,
  'eye-dropper': txIconEyeDropper,
  'eye-slash': txIconEyeSlash,
  'eye': txIconEye,
  'face-smile': txIconFaceSmile,
  'fast-backward': txIconFastBackward,
  'fast-forward': txIconFastForward,
  'file-arrow-up': txIconFileArrowUp,
  'file-check': txIconFileCheck,
  'file-edit': txIconFileEdit,
  'file-excel': txIconFileExcel,
  'file-export': txIconFileExport,
  'file-import': txIconFileImport,
  'file-o': txIconFileO,
  'file-pdf': txIconFilePdf,
  'file-plus': txIconFilePlus,
  'file-word': txIconFileWord,
  'file': txIconFile,
  'filter-fill': txIconFilterFill,
  'filter-slash': txIconFilterSlash,
  'filter': txIconFilter,
  'flag-fill': txIconFlagFill,
  'flag': txIconFlag,
  'folder-open': txIconFolderOpen,
  'folder-plus': txIconFolderPlus,
  'folder': txIconFolder,
  'forward': txIconForward,
  'gauge': txIconGauge,
  'gift': txIconGift,
  'globe': txIconGlobe,
  'graduation-cap': txIconGraduationCap,
  'grid-2': txIconGrid2,
  'grip-horizontal': txIconGripHorizontal,
  'grip-vertical': txIconGripVertical,
  'grip': txIconGrip,
  'hammer': txIconHammer,
  'hashtag': txIconHashtag,
  'heading-1': txIconHeading1,
  'heading-2': txIconHeading2,
  'heading-3': txIconHeading3,
  'heading-4': txIconHeading4,
  'heading-5': txIconHeading5,
  'heading-6': txIconHeading6,
  'heading': txIconHeading,
  'headphones': txIconHeadphones,
  'heart-fill': txIconHeartFill,
  'heart': txIconHeart,
  'highlighter': txIconHighlighter,
  'history': txIconHistory,
  'home': txIconHome,
  'horizontal-rule': txIconHorizontalRule,
  'hourglass': txIconHourglass,
  'id-card': txIconIdCard,
  'image': txIconImage,
  'images': txIconImages,
  'inbox': txIconInbox,
  'indent': txIconIndent,
  'indian-rupee': txIconIndianRupee,
  'info-circle': txIconInfoCircle,
  'info': txIconInfo,
  'italic': txIconItalic,
  'key': txIconKey,
  'language': txIconLanguage,
  'lightbulb': txIconLightbulb,
  'link': txIconLink,
  'list-check': txIconListCheck,
  'list-ol': txIconListOl,
  'list-tree': txIconListTree,
  'list': txIconList,
  'lock-open': txIconLockOpen,
  'lock': txIconLock,
  'map-marker': txIconMapMarker,
  'map': txIconMap,
  'mars': txIconMars,
  'megaphone': txIconMegaphone,
  'microchip-ai': txIconMicrochipAi,
  'microchip': txIconMicrochip,
  'microphone': txIconMicrophone,
  'minus-circle': txIconMinusCircle,
  'minus': txIconMinus,
  'mobile': txIconMobile,
  'money-bill': txIconMoneyBill,
  'moon': txIconMoon,
  'note-sticky': txIconNoteSticky,
  'objects-column': txIconObjectsColumn,
  'outdent': txIconOutdent,
  'palette': txIconPalette,
  'paperclip': txIconPaperclip,
  'paragraph-left': txIconParagraphLeft,
  'paragraph-right': txIconParagraphRight,
  'pause-circle': txIconPauseCircle,
  'pause': txIconPause,
  'pen-line': txIconPenLine,
  'pen-to-square': txIconPenToSquare,
  'pencil': txIconPencil,
  'percentage': txIconPercentage,
  'phone': txIconPhone,
  'play-circle': txIconPlayCircle,
  'play': txIconPlay,
  'plus-circle': txIconPlusCircle,
  'plus': txIconPlus,
  'pound': txIconPound,
  'power-off': txIconPowerOff,
  'print': txIconPrint,
  'qrcode': txIconQrcode,
  'question-circle': txIconQuestionCircle,
  'question': txIconQuestion,
  'receipt': txIconReceipt,
  'rectangle-xmark': txIconRectangleXmark,
  'refresh': txIconRefresh,
  'replay': txIconReplay,
  'reply': txIconReply,
  'rows-2': txIconRows2,
  'save': txIconSave,
  'search-minus': txIconSearchMinus,
  'search-plus': txIconSearchPlus,
  'search': txIconSearch,
  'send': txIconSend,
  'server': txIconServer,
  'share-alt': txIconShareAlt,
  'shield': txIconShield,
  'shop': txIconShop,
  'shopping-bag': txIconShoppingBag,
  'shopping-cart': txIconShoppingCart,
  'sidebar': txIconSidebar,
  'sign-in': txIconSignIn,
  'sign-out': txIconSignOut,
  'signature': txIconSignature,
  'sitemap': txIconSitemap,
  'slash': txIconSlash,
  'sliders-h': txIconSlidersH,
  'sliders-v': txIconSlidersV,
  'sort-alpha-down-alt': txIconSortAlphaDownAlt,
  'sort-alpha-down': txIconSortAlphaDown,
  'sort-alpha-up-alt': txIconSortAlphaUpAlt,
  'sort-alpha-up': txIconSortAlphaUp,
  'sort-alt-slash': txIconSortAltSlash,
  'sort-alt': txIconSortAlt,
  'sort-amount-down-alt': txIconSortAmountDownAlt,
  'sort-amount-down': txIconSortAmountDown,
  'sort-amount-up-alt': txIconSortAmountUpAlt,
  'sort-amount-up': txIconSortAmountUp,
  'sort-down-fill': txIconSortDownFill,
  'sort-down': txIconSortDown,
  'sort-numeric-down-alt': txIconSortNumericDownAlt,
  'sort-numeric-down': txIconSortNumericDown,
  'sort-numeric-up-alt': txIconSortNumericUpAlt,
  'sort-numeric-up': txIconSortNumericUp,
  'sort-up-fill': txIconSortUpFill,
  'sort-up': txIconSortUp,
  'sort': txIconSort,
  'sparkles': txIconSparkles,
  'spinner-dotted': txIconSpinnerDotted,
  'spinner': txIconSpinner,
  'square': txIconSquare,
  'stamp': txIconStamp,
  'star-fill': txIconStarFill,
  'star-half-fill': txIconStarHalfFill,
  'star-half': txIconStarHalf,
  'star': txIconStar,
  'step-backward-alt': txIconStepBackwardAlt,
  'step-backward': txIconStepBackward,
  'step-forward-alt': txIconStepForwardAlt,
  'step-forward': txIconStepForward,
  'stop-circle': txIconStopCircle,
  'stop': txIconStop,
  'stopwatch': txIconStopwatch,
  'strikethrough': txIconStrikethrough,
  'subscript': txIconSubscript,
  'sun': txIconSun,
  'superscript': txIconSuperscript,
  'sync': txIconSync,
  'table': txIconTable,
  'tablet': txIconTablet,
  'tag': txIconTag,
  'tags': txIconTags,
  'text-color': txIconTextColor,
  'text': txIconText,
  'th-large': txIconThLarge,
  'thumbs-down-fill': txIconThumbsDownFill,
  'thumbs-down': txIconThumbsDown,
  'thumbs-up-fill': txIconThumbsUpFill,
  'thumbs-up': txIconThumbsUp,
  'thumbtack': txIconThumbtack,
  'ticket': txIconTicket,
  'times-circle': txIconTimesCircle,
  'times': txIconTimes,
  'trash': txIconTrash,
  'trophy': txIconTrophy,
  'truck': txIconTruck,
  'turkish-lira': txIconTurkishLira,
  'underline': txIconUnderline,
  'undo': txIconUndo,
  'unlock': txIconUnlock,
  'upload': txIconUpload,
  'user-edit': txIconUserEdit,
  'user-minus': txIconUserMinus,
  'user-plus': txIconUserPlus,
  'user': txIconUser,
  'users': txIconUsers,
  'venus': txIconVenus,
  'verified': txIconVerified,
  'video': txIconVideo,
  'volume-down': txIconVolumeDown,
  'volume-off': txIconVolumeOff,
  'volume-up': txIconVolumeUp,
  'wallet': txIconWallet,
  'warehouse': txIconWarehouse,
  'wave-pulse': txIconWavePulse,
  'wifi': txIconWifi,
  'window-maximize': txIconWindowMaximize,
  'window-minimize': txIconWindowMinimize,
  'wrench': txIconWrench,
};

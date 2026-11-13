const COPIED = [
  'boxSizing',
  'width',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'textTransform',
  'wordSpacing',
  'tabSize',
] as const;

/** Position of the caret inside a textarea, in px. */
export interface TxCaretPoint {
  /** Distance from the top of the textarea to the caret line. */
  top: number;
  /** Distance from the left edge of the textarea to the caret. */
  left: number;
  /** Height of one text line. */
  height: number;
}

/** Measures where the caret is in a textarea by laying the text out in a hidden mirror element. */
export function caretPoint(textarea: HTMLTextAreaElement, position: number): TxCaretPoint {
  const document = textarea.ownerDocument;
  const style = getComputedStyle(textarea);
  const mirror = document.createElement('div');
  for (const property of COPIED) {
    mirror.style[property] = style[property];
  }
  mirror.style.position = 'absolute';
  mirror.style.visibility = 'hidden';
  mirror.style.whiteSpace = 'pre-wrap';
  mirror.style.overflowWrap = 'break-word';
  mirror.style.top = '0';
  mirror.style.left = '-9999px';
  mirror.textContent = textarea.value.slice(0, position);
  const marker = document.createElement('span');
  marker.textContent = textarea.value.slice(position) || '.';
  mirror.appendChild(marker);
  document.body.appendChild(mirror);
  const lineHeight = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4 || 16;
  const point = {
    top: marker.offsetTop - textarea.scrollTop,
    left: marker.offsetLeft - textarea.scrollLeft,
    height: lineHeight,
  };
  mirror.remove();
  return point;
}

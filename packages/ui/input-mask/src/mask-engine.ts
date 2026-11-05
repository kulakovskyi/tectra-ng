export interface TxMaskSlot {
  readonly test: RegExp | null;
  readonly literal: string;
  readonly optional: boolean;
}

export type TxMaskValues = (string | null)[];

export interface TxMaskEdit {
  readonly values: TxMaskValues;
  readonly caret: number;
}

const DEFINITIONS: Record<string, string> = { '9': '[0-9]', '*': '[A-Za-z0-9]' };

export function parseMask(mask: string, characterPattern = '[A-Za-z]'): TxMaskSlot[] {
  const slots: TxMaskSlot[] = [];
  let optional = false;
  for (const char of mask) {
    if (char === '?') {
      optional = true;
      continue;
    }
    const pattern = char === 'a' ? characterPattern : DEFINITIONS[char];
    slots.push({ test: pattern ? new RegExp(`^(?:${pattern})$`) : null, literal: pattern ? '' : char, optional });
  }
  return slots;
}

export function emptyValues(slots: TxMaskSlot[]): TxMaskValues {
  return slots.map(() => null);
}

export function nextSlot(slots: TxMaskSlot[], from: number): number {
  let position = Math.max(0, from);
  while (position < slots.length && !slots[position].test) {
    position += 1;
  }
  return position;
}

export function previousSlot(slots: TxMaskSlot[], before: number): number {
  let position = before - 1;
  while (position >= 0 && !slots[position].test) {
    position -= 1;
  }
  return position;
}

export function placeFrom(slots: TxMaskSlot[], values: TxMaskValues, from: number, chars: string[]): { values: TxMaskValues; last: number } {
  const next = [...values];
  let position = nextSlot(slots, from);
  let last = -1;
  for (const char of chars) {
    if (position >= slots.length) {
      break;
    }
    if (slots[position].test?.test(char)) {
      next[position] = char;
      last = position;
      position = nextSlot(slots, position + 1);
    }
  }
  return { values: next, last };
}

export function remove(slots: TxMaskSlot[], values: TxMaskValues, start: number, end: number): TxMaskValues {
  const tail = valuesFrom(slots, values, end);
  const cleared = values.map((value, index) => (index >= start && slots[index].test ? null : value));
  return placeFrom(slots, cleared, start, tail).values;
}

export function insert(slots: TxMaskSlot[], values: TxMaskValues, start: number, end: number, text: string): TxMaskEdit {
  const base = start === end ? values : remove(slots, values, start, end);
  const position = nextSlot(slots, start);
  const tail = valuesFrom(slots, base, position);
  const cleared = base.map((value, index) => (index >= position && slots[index].test ? null : value));
  const typed = placeFrom(slots, cleared, position, Array.from(text));
  if (typed.last < 0) {
    return { values: base, caret: position };
  }
  const shifted = placeFrom(slots, typed.values, typed.last + 1, tail).values;
  return { values: shifted, caret: nextSlot(slots, typed.last + 1) };
}

export function deleteBackward(slots: TxMaskSlot[], values: TxMaskValues, caret: number): TxMaskEdit {
  const position = previousSlot(slots, caret);
  return position < 0 ? { values, caret } : { values: remove(slots, values, position, position + 1), caret: position };
}

export function deleteForward(slots: TxMaskSlot[], values: TxMaskValues, caret: number): TxMaskEdit {
  const position = nextSlot(slots, caret);
  return position >= slots.length ? { values, caret } : { values: remove(slots, values, position, position + 1), caret: position };
}

export function fromText(slots: TxMaskSlot[], text: string, unmasked: boolean): TxMaskValues {
  if (unmasked) {
    return placeFrom(slots, emptyValues(slots), 0, Array.from(text)).values;
  }
  const values = emptyValues(slots);
  let position = 0;
  for (const char of text) {
    while (position < slots.length && !slots[position].test && slots[position].literal !== char) {
      position += 1;
    }
    if (position >= slots.length) {
      break;
    }
    const slot = slots[position];
    if (!slot.test) {
      position += 1;
    } else if (slot.test.test(char)) {
      values[position] = char;
      position += 1;
    }
  }
  return values;
}

export function render(slots: TxMaskSlot[], values: TxMaskValues, slotChar: string): string {
  const placeholder = (index: number) => (slotChar.length > 1 ? (slotChar[index] ?? '_') : slotChar);
  return slots.map((slot, index) => (slot.test ? (values[index] ?? placeholder(index)) : slot.literal)).join('');
}

export function renderFilled(slots: TxMaskSlot[], values: TxMaskValues, slotChar: string): string {
  const last = lastFilled(slots, values);
  return last < 0 ? '' : render(slots, values, slotChar).slice(0, last + 1);
}

export function unmaskedValue(slots: TxMaskSlot[], values: TxMaskValues): string {
  return values.filter((value, index) => slots[index].test && value !== null).join('');
}

export function lastFilled(slots: TxMaskSlot[], values: TxMaskValues): number {
  for (let index = slots.length - 1; index >= 0; index -= 1) {
    if (slots[index].test && values[index] !== null) {
      return index;
    }
  }
  return -1;
}

export function isComplete(slots: TxMaskSlot[], values: TxMaskValues): boolean {
  return slots.every((slot, index) => !slot.test || slot.optional || values[index] !== null);
}

function valuesFrom(slots: TxMaskSlot[], values: TxMaskValues, from: number): string[] {
  return values.filter((value, index): value is string => index >= from && !!slots[index].test && value !== null);
}

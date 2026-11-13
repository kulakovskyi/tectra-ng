/** One position of a parsed mask: an editable slot or a fixed literal. */
export interface TxMaskSlot {
  /** Pattern a typed character must match; `null` for a literal position. */
  readonly test: RegExp | null;
  /** Fixed character shown at a literal position; empty for an editable slot. */
  readonly literal: string;
  /** `true` for slots after `?` in the mask, which may stay empty. */
  readonly optional: boolean;
}

/** Characters typed into the slots, one entry per mask position; `null` marks an empty slot. */
export type TxMaskValues = (string | null)[];

/** Result of an edit: the new slot values and where the caret goes. */
export interface TxMaskEdit {
  /** Slot values after the edit. */
  readonly values: TxMaskValues;
  /** Caret position after the edit, as a mask position. */
  readonly caret: number;
}

const DEFINITIONS: Record<string, string> = { '9': '[0-9]', '*': '[A-Za-z0-9]' };

/**
 * Turns a mask such as `(999) 999-9999` into slots; `9` is a digit, `a` a letter, `*` a letter or
 * digit and `?` makes the rest optional.
 */
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

/** Creates slot values with every slot empty. */
export function emptyValues(slots: TxMaskSlot[]): TxMaskValues {
  return slots.map(() => null);
}

/** Finds the first editable slot at or after a position; the slot count when there is none. */
export function nextSlot(slots: TxMaskSlot[], from: number): number {
  let position = Math.max(0, from);
  while (position < slots.length && !slots[position].test) {
    position += 1;
  }
  return position;
}

/** Finds the last editable slot before a position; `-1` when there is none. */
export function previousSlot(slots: TxMaskSlot[], before: number): number {
  let position = before - 1;
  while (position >= 0 && !slots[position].test) {
    position -= 1;
  }
  return position;
}

/** Types characters into the slots from a position, skipping literals and characters that do not fit. */
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

/** Clears a range of slots and shifts the characters after it forward. */
export function remove(slots: TxMaskSlot[], values: TxMaskValues, start: number, end: number): TxMaskValues {
  const tail = valuesFrom(slots, values, end);
  const cleared = values.map((value, index) => (index >= start && slots[index].test ? null : value));
  return placeFrom(slots, cleared, start, tail).values;
}

/** Types text over a range of slots, pushing the characters after it back, and returns the new caret. */
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

/** Handles Backspace: clears the slot before the caret. */
export function deleteBackward(slots: TxMaskSlot[], values: TxMaskValues, caret: number): TxMaskEdit {
  const position = previousSlot(slots, caret);
  return position < 0 ? { values, caret } : { values: remove(slots, values, position, position + 1), caret: position };
}

/** Handles Delete: clears the slot at or after the caret. */
export function deleteForward(slots: TxMaskSlot[], values: TxMaskValues, caret: number): TxMaskEdit {
  const position = nextSlot(slots, caret);
  return position >= slots.length ? { values, caret } : { values: remove(slots, values, position, position + 1), caret: position };
}

/**
 * Fills slots from a text: either raw characters (`unmasked`) or a text that already contains the mask
 * literals.
 */
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

/** Builds the displayed text, with the slot character in empty slots. */
export function render(slots: TxMaskSlot[], values: TxMaskValues, slotChar: string): string {
  const placeholder = (index: number) => (slotChar.length > 1 ? (slotChar[index] ?? '_') : slotChar);
  return slots.map((slot, index) => (slot.test ? (values[index] ?? placeholder(index)) : slot.literal)).join('');
}

/** Builds the displayed text up to the last filled slot; empty when nothing is typed. */
export function renderFilled(slots: TxMaskSlot[], values: TxMaskValues, slotChar: string): string {
  const last = lastFilled(slots, values);
  return last < 0 ? '' : render(slots, values, slotChar).slice(0, last + 1);
}

/** Joins the typed characters without literals or empty slots. */
export function unmaskedValue(slots: TxMaskSlot[], values: TxMaskValues): string {
  return values.filter((value, index) => slots[index].test && value !== null).join('');
}

/** Position of the last filled slot; `-1` when none is filled. */
export function lastFilled(slots: TxMaskSlot[], values: TxMaskValues): number {
  for (let index = slots.length - 1; index >= 0; index -= 1) {
    if (slots[index].test && values[index] !== null) {
      return index;
    }
  }
  return -1;
}

/** Tells whether every required slot is filled. */
export function isComplete(slots: TxMaskSlot[], values: TxMaskValues): boolean {
  return slots.every((slot, index) => !slot.test || slot.optional || values[index] !== null);
}

function valuesFrom(slots: TxMaskSlot[], values: TxMaskValues, from: number): string[] {
  return values.filter((value, index): value is string => index >= from && !!slots[index].test && value !== null);
}

const SPIN_MODIFIERS = new Set(['spin', 'pi-spin']);

/** An `icon` input value split into the icon name and the words after it. */
export interface TxIconValue {
  /** First word: the icon name. */
  name: string;
  /** The other words, put on the icon as classes. */
  modifiers: string[];
  /** Whether a modifier asks the icon to rotate (`spin` or `pi-spin`). */
  spin: boolean;
}

/**
 * Splits an `icon` value such as `'spinner spin'` into the icon name and its modifier classes; `null` for an empty
 * value.
 */
export function splitIconValue(value: string | null | undefined): TxIconValue | null {
  const [name, ...modifiers] = (value ?? '').trim().split(/\s+/);
  if (!name) {
    return null;
  }
  return { name, modifiers, spin: modifiers.some((modifier) => SPIN_MODIFIERS.has(modifier)) };
}

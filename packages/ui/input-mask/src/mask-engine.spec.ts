import { deleteBackward, deleteForward, fromText, insert, isComplete, parseMask, remove, render, renderFilled, unmaskedValue } from './mask-engine';

describe('mask engine', () => {
  const phone = parseMask('(999) 999-9999');
  const show = (values: (string | null)[]) => render(phone, values, '_');

  it('parses digit, letter, any and literal slots and the optional tail', () => {
    const slots = parseMask('a*-9?99');
    expect(slots.map((slot) => (slot.test ? 'slot' : slot.literal))).toEqual(['slot', 'slot', '-', 'slot', 'slot', 'slot']);
    expect(slots.map((slot) => slot.optional)).toEqual([false, false, false, false, true, true]);
    expect(slots[0].test?.test('b')).toBe(true);
    expect(slots[0].test?.test('1')).toBe(false);
    expect(parseMask('a', '[а-я]')[0].test?.test('ж')).toBe(true);
  });

  it('types over literals and skips characters that do not fit', () => {
    const typed = insert(phone, fromText(phone, '', false), 0, 0, '(050) 12x3');
    expect(show(typed.values)).toBe('(050) 123-____');
    expect(typed.caret).toBe(10);
  });

  it('inserts in the middle and shifts the rest', () => {
    const start = fromText(phone, '0501234567', true);
    const edited = insert(phone, start, 1, 1, '9');
    expect(show(edited.values)).toBe('(905) 012-3456');
  });

  it('deletes backward and forward across literals', () => {
    const start = fromText(phone, '(050) 123-4567', false);
    const back = deleteBackward(phone, start, 6);
    expect(show(back.values)).toBe('(051) 234-567_');
    expect(back.caret).toBe(3);
    const forward = deleteForward(phone, start, 4);
    expect(show(forward.values)).toBe('(050) 234-567_');
    expect(show(remove(phone, start, 1, 5))).toBe('(123) 456-7___');
  });

  it('knows when the required part is complete and renders values', () => {
    const optional = parseMask('99?99');
    expect(isComplete(optional, fromText(optional, '12', true))).toBe(true);
    const half = fromText(phone, '050', true);
    expect(isComplete(phone, half)).toBe(false);
    expect(renderFilled(phone, half, '_')).toBe('(050');
    expect(unmaskedValue(phone, fromText(phone, '(050) 123-4567', false))).toBe('0501234567');
    const date = parseMask('99.99.9999');
    expect(render(date, fromText(date, '12', true), 'dd.mm.yyyy')).toBe('12.mm.yyyy');
  });
});

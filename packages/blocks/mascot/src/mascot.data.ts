import { TxMascotBodyPart, TxMascotLayer, TxMascotTrick } from './mascot.types';

export const TX_MASCOT_SPRITE: readonly string[] = [
  '.......A.......',
  '.......S.......',
  '....#######....',
  '...#########...',
  '..###########..',
  '..##EE###EE##..',
  'hh##EE###EE##HH',
  '..###########..',
  '..####MMM####..',
  '...#########...',
  '...ll.....LL...',
  '...ll.....LL...',
];

export const TX_MASCOT_TRICKS: readonly TxMascotTrick[] = ['waving', 'looking', 'hopping', 'dancing', 'stretching'];

const PART_CHARS: Record<TxMascotBodyPart, string> = {
  stem: 'S',
  antenna: 'A',
  'arm-left': 'h',
  'arm-right': 'H',
  body: '#EM',
  eye: 'E',
  mouth: 'M',
  'leg-left': 'l',
  'leg-right': 'L',
};

const UPPER_PARTS: TxMascotBodyPart[] = ['stem', 'antenna', 'arm-left', 'arm-right', 'body', 'eye', 'mouth'];
const LEG_PARTS: TxMascotBodyPart[] = ['leg-left', 'leg-right'];

export const TX_MASCOT_TRICK_SLOT_MS = 3000;
export const TX_MASCOT_TRICK_EVERY_SLOTS = 3;

export function txMascotLayers(parts: TxMascotBodyPart[], sprite: readonly string[] = TX_MASCOT_SPRITE): TxMascotLayer[] {
  return parts.map((part) => ({
    part,
    pixels: sprite.flatMap((row, y) => [...row].flatMap((char, x) => (PART_CHARS[part].includes(char) ? [{ x, y }] : []))),
  }));
}

export const TX_MASCOT_UPPER_LAYERS = txMascotLayers(UPPER_PARTS);
export const TX_MASCOT_LEG_LAYERS = txMascotLayers(LEG_PARTS);

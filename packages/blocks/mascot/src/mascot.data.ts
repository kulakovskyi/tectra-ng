import { TxMascotBodyPart, TxMascotLayer, TxMascotTrick } from './mascot.types';

/** The mascot as rows of letters, one letter per pixel; each letter stands for a body part. */
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

/** Tricks an idle mascot plays, in turn. */
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

/** Length of one time slot in ms; an idle mascot may start a trick every few slots. */
export const TX_MASCOT_TRICK_SLOT_MS = 3000;
/** A playful idle mascot starts a trick every this many slots. */
export const TX_MASCOT_TRICK_EVERY_SLOTS = 3;

/** Cuts the sprite into one layer of pixels per body part; the sprite is `TX_MASCOT_SPRITE` by default. */
export function txMascotLayers(parts: TxMascotBodyPart[], sprite: readonly string[] = TX_MASCOT_SPRITE): TxMascotLayer[] {
  return parts.map((part) => ({
    part,
    pixels: sprite.flatMap((row, y) => [...row].flatMap((char, x) => (PART_CHARS[part].includes(char) ? [{ x, y }] : []))),
  }));
}

/** Layers of the upper body: stem, antenna, arms, body, eyes and mouth. */
export const TX_MASCOT_UPPER_LAYERS = txMascotLayers(UPPER_PARTS);
/** Layers of the two legs. */
export const TX_MASCOT_LEG_LAYERS = txMascotLayers(LEG_PARTS);

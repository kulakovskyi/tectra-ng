import { TxQrErrorCorrection, TxQrMatrix } from './types';

const LEVELS: Record<TxQrErrorCorrection, { index: number; format: number }> = {
  L: { index: 0, format: 1 },
  M: { index: 1, format: 0 },
  Q: { index: 2, format: 3 },
  H: { index: 3, format: 2 },
};

const ECC_CODEWORDS_PER_BLOCK = [
  [-1, 7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],
  [-1, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
  [-1, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],
];

const ERROR_CORRECTION_BLOCKS = [
  [-1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 4, 4, 6, 6, 6, 6, 7, 8, 8, 9, 9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],
  [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5, 5, 8, 9, 9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],
  [-1, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8, 8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],
  [-1, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],
];

const ALPHANUMERIC = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
const NUMERIC_PATTERN = /^[0-9]*$/;
const ALPHANUMERIC_PATTERN = /^[0-9A-Z $%*+./:-]*$/;
const PENALTY_RUN = 3;
const PENALTY_BLOCK = 3;
const PENALTY_FINDER = 40;
const PENALTY_BALANCE = 10;

interface Mode {
  indicator: number;
  countBits: [number, number, number];
}

const MODES: Record<'numeric' | 'alphanumeric' | 'byte', Mode> = {
  numeric: { indicator: 0x1, countBits: [10, 12, 14] },
  alphanumeric: { indicator: 0x2, countBits: [9, 11, 13] },
  byte: { indicator: 0x4, countBits: [8, 16, 16] },
};

interface Segment {
  mode: Mode;
  count: number;
  bits: number[];
}

/** Options of `encodeQr`: error-correction level, version range and mask. */
export interface TxQrEncodeOptions {
  /** Error-correction level (default `M`). */
  errorCorrection?: TxQrErrorCorrection;
  /** Smallest version to try (default 1). */
  minVersion?: number;
  /** Largest version allowed (default 40); a longer text throws `TxQrCapacityError`. */
  maxVersion?: number;
  /** Mask pattern from 0 to 7; by default the one with the lowest penalty is chosen. */
  mask?: number;
  /** Raises the level to `Q` or `H` when the text still fits the chosen version. */
  boostErrorCorrection?: boolean;
}

/** Thrown by `encodeQr` when the text does not fit in a QR code of the allowed versions. */
export class TxQrCapacityError extends Error {
  constructor() {
    super('The data does not fit in a QR code');
  }
}

function pushBits(bits: number[], value: number, length: number): void {
  for (let i = length - 1; i >= 0; i -= 1) {
    bits.push((value >>> i) & 1);
  }
}

function makeSegment(text: string): Segment {
  const bits: number[] = [];
  if (NUMERIC_PATTERN.test(text)) {
    for (let i = 0; i < text.length; i += 3) {
      const group = text.slice(i, i + 3);
      pushBits(bits, Number(group), group.length * 3 + 1);
    }
    return { mode: MODES.numeric, count: text.length, bits };
  }
  if (ALPHANUMERIC_PATTERN.test(text)) {
    for (let i = 0; i + 1 < text.length; i += 2) {
      pushBits(bits, ALPHANUMERIC.indexOf(text[i]) * 45 + ALPHANUMERIC.indexOf(text[i + 1]), 11);
    }
    if (text.length % 2) {
      pushBits(bits, ALPHANUMERIC.indexOf(text[text.length - 1]), 6);
    }
    return { mode: MODES.alphanumeric, count: text.length, bits };
  }
  const bytes = new TextEncoder().encode(text);
  bytes.forEach((byte) => pushBits(bits, byte, 8));
  return { mode: MODES.byte, count: bytes.length, bits };
}

function countBits(mode: Mode, version: number): number {
  return mode.countBits[version < 10 ? 0 : version < 27 ? 1 : 2];
}

function rawDataModules(version: number): number {
  let result = (16 * version + 128) * version + 64;
  if (version >= 2) {
    const alignments = Math.floor(version / 7) + 2;
    result -= (25 * alignments - 10) * alignments - 55;
    if (version >= 7) {
      result -= 36;
    }
  }
  return result;
}

function dataCodewords(version: number, level: number): number {
  return Math.floor(rawDataModules(version) / 8) - ECC_CODEWORDS_PER_BLOCK[level][version] * ERROR_CORRECTION_BLOCKS[level][version];
}

function segmentBits(segment: Segment, version: number): number {
  const length = countBits(segment.mode, version);
  return segment.count >= 1 << length ? Infinity : 4 + length + segment.bits.length;
}

function multiply(x: number, y: number): number {
  let z = 0;
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d);
    z ^= ((y >>> i) & 1) * x;
  }
  return z;
}

function divisor(degree: number): number[] {
  const result = new Array<number>(degree).fill(0);
  result[degree - 1] = 1;
  let root = 1;
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = multiply(result[j], root);
      if (j + 1 < result.length) {
        result[j] ^= result[j + 1];
      }
    }
    root = multiply(root, 0x02);
  }
  return result;
}

function remainder(data: readonly number[], generator: readonly number[]): number[] {
  const result = generator.map(() => 0);
  for (const byte of data) {
    const factor = byte ^ (result.shift() ?? 0);
    result.push(0);
    generator.forEach((coefficient, i) => (result[i] ^= multiply(coefficient, factor)));
  }
  return result;
}

function interleave(data: readonly number[], version: number, level: number): number[] {
  const blocks = ERROR_CORRECTION_BLOCKS[level][version];
  const eccLength = ECC_CODEWORDS_PER_BLOCK[level][version];
  const raw = Math.floor(rawDataModules(version) / 8);
  const shortBlocks = blocks - (raw % blocks);
  const shortLength = Math.floor(raw / blocks);
  const generator = divisor(eccLength);
  const all: number[][] = [];
  for (let i = 0, k = 0; i < blocks; i += 1) {
    const chunk = data.slice(k, k + shortLength - eccLength + (i < shortBlocks ? 0 : 1));
    k += chunk.length;
    const ecc = remainder(chunk, generator);
    if (i < shortBlocks) {
      chunk.push(0);
    }
    all.push([...chunk, ...ecc]);
  }
  const result: number[] = [];
  for (let i = 0; i < all[0].length; i += 1) {
    all.forEach((block, j) => {
      if (i !== shortLength - eccLength || j >= shortBlocks) {
        result.push(block[i]);
      }
    });
  }
  return result;
}

function alignmentPositions(version: number): number[] {
  if (version === 1) {
    return [];
  }
  const count = Math.floor(version / 7) + 2;
  const size = version * 4 + 17;
  const step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (count * 2 - 2)) * 2;
  const result = [6];
  for (let position = size - 7; result.length < count; position -= step) {
    result.splice(1, 0, position);
  }
  return result;
}

function maskBit(mask: number, x: number, y: number): boolean {
  switch (mask) {
    case 0:
      return (x + y) % 2 === 0;
    case 1:
      return y % 2 === 0;
    case 2:
      return x % 3 === 0;
    case 3:
      return (x + y) % 3 === 0;
    case 4:
      return (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0;
    case 5:
      return ((x * y) % 2) + ((x * y) % 3) === 0;
    case 6:
      return (((x * y) % 2) + ((x * y) % 3)) % 2 === 0;
    default:
      return (((x + y) % 2) + ((x * y) % 3)) % 2 === 0;
  }
}

class Grid {
  readonly modules: boolean[][];
  readonly reserved: boolean[][];

  constructor(readonly size: number) {
    this.modules = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
    this.reserved = Array.from({ length: size }, () => new Array<boolean>(size).fill(false));
  }

  set(x: number, y: number, dark: boolean): void {
    this.modules[y][x] = dark;
    this.reserved[y][x] = true;
  }
}

function drawFinder(grid: Grid, cx: number, cy: number): void {
  for (let dy = -4; dy <= 4; dy += 1) {
    for (let dx = -4; dx <= 4; dx += 1) {
      const x = cx + dx;
      const y = cy + dy;
      if (x >= 0 && x < grid.size && y >= 0 && y < grid.size) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy));
        grid.set(x, y, distance !== 2 && distance !== 4);
      }
    }
  }
}

function drawFormat(grid: Grid, level: number, mask: number): void {
  const data = (level << 3) | mask;
  let rem = data;
  for (let i = 0; i < 10; i += 1) {
    rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
  }
  const bits = ((data << 10) | rem) ^ 0x5412;
  const bit = (i: number) => ((bits >>> i) & 1) !== 0;
  const size = grid.size;
  for (let i = 0; i <= 5; i += 1) {
    grid.set(8, i, bit(i));
  }
  grid.set(8, 7, bit(6));
  grid.set(8, 8, bit(7));
  grid.set(7, 8, bit(8));
  for (let i = 9; i < 15; i += 1) {
    grid.set(14 - i, 8, bit(i));
  }
  for (let i = 0; i < 8; i += 1) {
    grid.set(size - 1 - i, 8, bit(i));
  }
  for (let i = 8; i < 15; i += 1) {
    grid.set(8, size - 15 + i, bit(i));
  }
  grid.set(8, size - 8, true);
}

function drawPatterns(grid: Grid, version: number, level: number): void {
  const size = grid.size;
  for (let i = 0; i < size; i += 1) {
    grid.set(6, i, i % 2 === 0);
    grid.set(i, 6, i % 2 === 0);
  }
  drawFinder(grid, 3, 3);
  drawFinder(grid, size - 4, 3);
  drawFinder(grid, 3, size - 4);
  const positions = alignmentPositions(version);
  const last = positions.length - 1;
  positions.forEach((y, i) =>
    positions.forEach((x, j) => {
      if ((i === 0 && j === 0) || (i === 0 && j === last) || (i === last && j === 0)) {
        return;
      }
      for (let dy = -2; dy <= 2; dy += 1) {
        for (let dx = -2; dx <= 2; dx += 1) {
          grid.set(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
        }
      }
    }),
  );
  drawFormat(grid, level, 0);
  if (version >= 7) {
    let rem = version;
    for (let i = 0; i < 12; i += 1) {
      rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    }
    const bits = (version << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const dark = ((bits >>> i) & 1) !== 0;
      const a = size - 11 + (i % 3);
      const b = Math.floor(i / 3);
      grid.set(a, b, dark);
      grid.set(b, a, dark);
    }
  }
}

function drawCodewords(grid: Grid, codewords: readonly number[]): void {
  const size = grid.size;
  let i = 0;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) {
      right = 5;
    }
    for (let vertical = 0; vertical < size; vertical += 1) {
      for (let j = 0; j < 2; j += 1) {
        const x = right - j;
        const upward = ((right + 1) & 2) === 0;
        const y = upward ? size - 1 - vertical : vertical;
        if (!grid.reserved[y][x] && i < codewords.length * 8) {
          grid.modules[y][x] = ((codewords[i >>> 3] >>> (7 - (i & 7))) & 1) !== 0;
          i += 1;
        }
      }
    }
  }
}

function applyMask(grid: Grid, mask: number): void {
  for (let y = 0; y < grid.size; y += 1) {
    for (let x = 0; x < grid.size; x += 1) {
      if (!grid.reserved[y][x] && maskBit(mask, x, y)) {
        grid.modules[y][x] = !grid.modules[y][x];
      }
    }
  }
}

function penalty(grid: Grid): number {
  const size = grid.size;
  const modules = grid.modules;
  let result = 0;
  const addHistory = (run: number, history: number[]) => {
    if (history[0] === 0) {
      run += size;
    }
    history.pop();
    history.unshift(run);
  };
  const countPatterns = (history: number[]) => {
    const n = history[1];
    const core = n > 0 && history[2] === n && history[3] === n * 3 && history[4] === n && history[5] === n;
    return (core && history[0] >= n * 4 && history[6] >= n ? 1 : 0) + (core && history[6] >= n * 4 && history[0] >= n ? 1 : 0);
  };
  const terminate = (color: boolean, run: number, history: number[]) => {
    if (color) {
      addHistory(run, history);
      run = 0;
    }
    addHistory(run + size, history);
    return countPatterns(history);
  };
  for (const vertical of [false, true]) {
    for (let a = 0; a < size; a += 1) {
      let color = false;
      let run = 0;
      const history = [0, 0, 0, 0, 0, 0, 0];
      for (let b = 0; b < size; b += 1) {
        const dark = vertical ? modules[b][a] : modules[a][b];
        if (dark === color) {
          run += 1;
          if (run === 5) {
            result += PENALTY_RUN;
          } else if (run > 5) {
            result += 1;
          }
        } else {
          addHistory(run, history);
          if (!color) {
            result += countPatterns(history) * PENALTY_FINDER;
          }
          color = dark;
          run = 1;
        }
      }
      result += terminate(color, run, history) * PENALTY_FINDER;
    }
  }
  let dark = 0;
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const color = modules[y][x];
      if (color) {
        dark += 1;
      }
      if (y < size - 1 && x < size - 1 && color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) {
        result += PENALTY_BLOCK;
      }
    }
  }
  const total = size * size;
  return result + (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * PENALTY_BALANCE;
}

/**
 * Encodes text into a QR code matrix; throws `TxQrCapacityError` when the text does not fit the
 * allowed versions.
 */
export function encodeQr(text: string, options: TxQrEncodeOptions = {}): TxQrMatrix {
  const minVersion = options.minVersion ?? 1;
  const maxVersion = options.maxVersion ?? 40;
  let errorCorrection = options.errorCorrection ?? 'M';
  const segment = makeSegment(text);
  let version = minVersion;
  let used = Infinity;
  for (; version <= maxVersion; version += 1) {
    used = segmentBits(segment, version);
    if (used <= dataCodewords(version, LEVELS[errorCorrection].index) * 8) {
      break;
    }
  }
  if (version > maxVersion) {
    throw new TxQrCapacityError();
  }
  if (options.boostErrorCorrection) {
    for (const level of ['Q', 'H'] as const) {
      if (LEVELS[level].index > LEVELS[errorCorrection].index && used <= dataCodewords(version, LEVELS[level].index) * 8) {
        errorCorrection = level;
      }
    }
  }
  const level = LEVELS[errorCorrection];
  const capacity = dataCodewords(version, level.index) * 8;
  const bits: number[] = [];
  pushBits(bits, segment.mode.indicator, 4);
  pushBits(bits, segment.count, countBits(segment.mode, version));
  bits.push(...segment.bits);
  pushBits(bits, 0, Math.min(4, capacity - bits.length));
  pushBits(bits, 0, (8 - (bits.length % 8)) % 8);
  for (let pad = 0xec; bits.length < capacity; pad ^= 0xec ^ 0x11) {
    pushBits(bits, pad, 8);
  }
  const data: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    data.push(bits.slice(i, i + 8).reduce((byte, bit) => (byte << 1) | bit, 0));
  }
  const grid = new Grid(version * 4 + 17);
  drawPatterns(grid, version, level.format);
  drawCodewords(grid, interleave(data, version, level.index));
  let mask = options.mask ?? -1;
  if (mask < 0) {
    let best = Infinity;
    for (let candidate = 0; candidate < 8; candidate += 1) {
      applyMask(grid, candidate);
      drawFormat(grid, level.format, candidate);
      const score = penalty(grid);
      if (score < best) {
        best = score;
        mask = candidate;
      }
      applyMask(grid, candidate);
    }
  }
  applyMask(grid, mask);
  drawFormat(grid, level.format, mask);
  return { version, size: grid.size, errorCorrection, mask, modules: grid.modules };
}

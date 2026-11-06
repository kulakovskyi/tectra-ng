export type LogoBlockTone = 'contrast' | 'soft' | 'accent';

export type LogoBlockPart = 'arm' | 'head' | 'body' | 'legs' | 'hand';

export interface LogoBlock {
  x: number;
  y: number;
  tone: LogoBlockTone;
  part: LogoBlockPart;
}

export const LOGO_SIZE = 120;
export const LOGO_RADIUS = 28;
export const LOGO_BLOCK_SIZE = 20;
export const LOGO_BLOCK_RADIUS = 5;

export const LOGO_BLOCKS: LogoBlock[] = [
  { x: 26, y: 30, tone: 'contrast', part: 'arm' },
  { x: 50, y: 30, tone: 'contrast', part: 'head' },
  { x: 50, y: 54, tone: 'contrast', part: 'body' },
  { x: 50, y: 78, tone: 'soft', part: 'legs' },
  { x: 74, y: 30, tone: 'accent', part: 'hand' },
];

export function logoSvg(colors: Record<LogoBlockTone | 'tile', string>): string {
  const blocks = LOGO_BLOCKS.map(
    ({ x, y, tone }) =>
      `<rect x="${x}" y="${y}" width="${LOGO_BLOCK_SIZE}" height="${LOGO_BLOCK_SIZE}" rx="${LOGO_BLOCK_RADIUS}" fill="${colors[tone]}"/>`,
  ).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${LOGO_SIZE} ${LOGO_SIZE}"><rect width="${LOGO_SIZE}" height="${LOGO_SIZE}" rx="${LOGO_RADIUS}" fill="${colors.tile}"/>${blocks}</svg>`;
}

import { TectraStyle } from '../types/style.interface';
import { edgeStyle } from './edge/edge.style';
import { softStyle } from './soft/soft.style';
import { paperStyle } from './paper/paper.style';
import { tectraStyle } from './tectra.style';

export const TECTRA_STYLES = {
  tectra: tectraStyle,
  soft: softStyle,
  edge: edgeStyle,
  paper: paperStyle,
} satisfies Record<string, TectraStyle>;

export type TectraStyleName = keyof typeof TECTRA_STYLES;

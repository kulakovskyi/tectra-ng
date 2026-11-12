export type TectraNgAddStyle = 'tectra' | 'soft' | 'edge' | 'paper';

export type TectraNgAddPrimary =
  | 'noir'
  | 'emerald'
  | 'green'
  | 'lime'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

export type TectraNgAddSurface = 'ink' | 'slate' | 'gray' | 'zinc' | 'neutral' | 'stone' | 'soho' | 'viva' | 'ocean' | 'mauve' | 'olive' | 'mist' | 'taupe';

export interface TectraNgAddOptions {
  project?: string;
  style?: TectraNgAddStyle;
  primary?: TectraNgAddPrimary;
  surface?: TectraNgAddSurface;
  fonts?: boolean;
  icons?: boolean;
  skipInstall?: boolean;
}

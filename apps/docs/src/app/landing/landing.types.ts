export type LandingTone = 'sky' | 'green' | 'orange' | 'amber' | 'purple' | 'blue' | 'brand' | 'ink';

export type LandingShapeKind = 'square' | 'circle' | 'arch' | 'bowl' | 'quarter' | 'drop' | 'leaf' | 'diamond' | 'triangle' | 'ring';

export type LandingGlyphKind = 'dots' | 'asterisk' | 'arch' | 'stripes' | 'pinwheel' | 'pill' | 'bars' | 'half' | 'grid';

export type LandingDemo = 'table' | 'form' | 'chart' | 'editor' | 'theme' | 'board';

export interface LandingNavLink {
  label: string;
  path: string;
}

export interface LandingWord {
  text: string;
  tone: LandingTone;
}

export interface LandingTile {
  col: number;
  row: number;
  kind: LandingShapeKind;
  tone: LandingTone;
  icon?: string;
  small?: boolean;
  turn?: number;
}

export interface LandingOrbitItem {
  kind: LandingShapeKind;
  tone: LandingTone;
  icon: string;
}

export interface LandingFeature {
  label: string;
  title: string;
  text: string;
  points: string[];
  link: string;
  linkLabel: string;
  tone: LandingTone;
  demo: LandingDemo;
}

export interface LandingLibrary {
  title: string;
  text: string;
  icon: string;
  tone: LandingTone;
  x: number;
  y: number;
  turn: number;
}

export interface LandingTally {
  before: string;
  beforeLabel: string;
  after: string;
  afterLabel: string;
}

export interface LandingCatalogTile {
  title: string;
  note: string;
  categories: string[];
  link: string;
  tone: LandingTone;
  glyph: LandingGlyphKind;
}

export interface LandingCatalogRow {
  label: string;
  title: string;
  tiles: LandingCatalogTile[];
}

export interface LandingCodePart {
  kind: 'keyword' | 'plain' | 'string' | 'name';
  text: string;
}

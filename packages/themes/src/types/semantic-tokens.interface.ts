/** Colors of one severity (or the primary color) in a color scheme. */
export interface TectraSeverityTokens {
  /** Main color: backgrounds of solid buttons and badges. */
  base: string;
  /** Main color on hover. */
  hover: string;
  /** Main color while pressed. */
  active: string;
  /** Text and icon color on top of the main color. */
  contrast: string;
  /** Light tint of the color for soft backgrounds. */
  soft: string;
}

/** Semantic colors and shadows of one color scheme: severities, surfaces, text, fields and focus. */
export interface TectraSemanticTokens {
  /** Primary color, with the text color for soft backgrounds. */
  primary: TectraSeverityTokens & { softText: string };
  /** Neutral secondary color of buttons and similar controls, with its border. */
  secondary: { base: string; hover: string; active: string; border: string; contrast: string };
  /** Success severity. */
  success: TectraSeverityTokens;
  /** Info severity. */
  info: TectraSeverityTokens;
  /** Warning severity. */
  warn: TectraSeverityTokens;
  /** Danger severity, also used for errors. */
  danger: TectraSeverityTokens;
  /** Help severity. */
  help: TectraSeverityTokens;
  /** High-contrast severity: near black in light mode, near white in dark mode. */
  contrast: TectraSeverityTokens;
  /** Colors of the page, cards, hovered rows, borders and overlays. */
  surface: { ground: string; card: string; hover: string; border: string; overlay: string; overlayBorder: string };
  /** Text colors: primary, hovered, muted and muted on hover. */
  text: { primary: string; hover: string; muted: string; mutedHover: string };
  /** Colors of form fields: background, border, text, placeholder and icons. */
  field: {
    background: string;
    disabledBackground: string;
    border: string;
    hoverBorder: string;
    color: string;
    placeholder: string;
    icon: string;
  };
  /** Colors of selected items in lists and menus, plain and focused. */
  highlight: { background: string; focusBackground: string; color: string; focusColor: string };
  /** Background of a focused list item. */
  list: { focusBackground: string };
  /** Color of the backdrop behind modal overlays. */
  mask: { background: string };
  /** Color of the keyboard focus ring. */
  focusRing: { color: string };
  /** Box shadows of fields, overlays and modals. */
  shadow: { field: string; overlay: string; modal: string };
}

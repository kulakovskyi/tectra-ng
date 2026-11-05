export interface TectraSeverityTokens {
  base: string;
  hover: string;
  active: string;
  contrast: string;
  soft: string;
}

export interface TectraSemanticTokens {
  primary: TectraSeverityTokens & { softText: string };
  secondary: { base: string; hover: string; active: string; border: string; contrast: string };
  success: TectraSeverityTokens;
  info: TectraSeverityTokens;
  warn: TectraSeverityTokens;
  danger: TectraSeverityTokens;
  help: TectraSeverityTokens;
  contrast: TectraSeverityTokens;
  surface: { ground: string; card: string; hover: string; border: string; overlay: string; overlayBorder: string };
  text: { primary: string; hover: string; muted: string; mutedHover: string };
  field: {
    background: string;
    disabledBackground: string;
    border: string;
    hoverBorder: string;
    color: string;
    placeholder: string;
    icon: string;
  };
  highlight: { background: string; focusBackground: string; color: string; focusColor: string };
  list: { focusBackground: string };
  mask: { background: string };
  focusRing: { color: string };
  shadow: { field: string; overlay: string; modal: string };
}

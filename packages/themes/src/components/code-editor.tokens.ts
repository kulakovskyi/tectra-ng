import { extendTokens, lightDark, tokenRef } from './token-helpers';

/**
 * Syntax colors of the code editor and the static code highlight: comments, keywords, strings, numbers and
 * other token kinds.
 */
export const codeSyntaxTokens = {
  comment: lightDark('#008000', '#6a9955'),
  keyword: lightDark('#0000ff', '#569cd6'),
  literal: lightDark('#0451a5', '#ce9178'),
  string: lightDark('#a31515', '#ce9178'),
  number: lightDark('#098658', '#b5cea8'),
  regexp: lightDark('#811f3f', '#d16969'),
  type: lightDark('#008080', '#3dc9b0'),
  delimiter: lightDark('#000000', '#dcdcdc'),
  tag: lightDark('#800000', '#569cd6'),
  tagDelimiter: lightDark('#383838', '#808080'),
  meta: lightDark('#737373', '#569cd6'),
  attribute: lightDark('#e50000', '#9cdcfe'),
  attributeValue: lightDark('#0000ff', '#ce9178'),
  value: lightDark('#0451a5', '#ce9178'),
  key: lightDark('#a31515', '#9cdcfe'),
  heading: lightDark('#0000ff', '#569cd6'),
  headingWeight: tokenRef('font-weight-bold'),
  strongWeight: tokenRef('font-weight-bold'),
  link: lightDark('#a31515', '#ce9178'),
  code: lightDark('#001188', '#74b0df'),
  quote: lightDark('#008000', '#6a9955'),
  indentGuide: lightDark('#d3d3d3', '#404040'),
};

const highlightRoot = {
  background: lightDark('#fffffe', '#1e1e1e'),
  color: lightDark('#000000', '#d4d4d4'),
  borderColor: tokenRef('surface-border'),
  borderWidth: '1px',
  borderRadius: tokenRef('radius-md'),
  fontFamily: "Menlo, Monaco, Consolas, 'Droid Sans Mono', 'Courier New', monospace",
  fontSize: '14px',
  lineHeight: '21px',
  tabSize: '4',
  paddingBlock: '0',
  paddingInlineEnd: '14px',
};

const highlightGutter = {
  background: lightDark('#fffffe', '#1e1e1e'),
  color: lightDark('#237893', '#858585'),
  activeColor: lightDark('#0b216f', '#c6c6c6'),
  minDigits: '5ch',
  paddingStart: '18px',
  gap: '26px',
};

/** Design tokens of `tx-code-highlight`: colors, sizes and spacing of its root and gutter. */
export const codeHighlightTokens = {
  root: highlightRoot,
  gutter: highlightGutter,
};

/**
 * Design tokens of `tx-code-editor`: colors, sizes and spacing of its root, gutter, cursor, selection, active
 * line and other parts.
 */
export const codeEditorTokens = {
  root: extendTokens(highlightRoot, {
    focusBorderColor: tokenRef('surface-border'),
    invalidBorderColor: tokenRef('danger-base'),
    disabledOpacity: '0.6',
    placeholderColor: tokenRef('form-field-placeholder-color'),
  }),
  gutter: highlightGutter,
  cursor: {
    color: lightDark('#000000', '#aeafad'),
    width: '2px',
  },
  selection: {
    background: lightDark('#add6ff', '#264f78'),
    inactiveBackground: lightDark('#e5ebf1', '#3a3d41'),
  },
  activeLine: {
    borderColor: lightDark('#eeeeee', '#282828'),
    borderWidth: '2px',
  },
  bracket: {
    background: 'rgb(0 100 0 / 0.1)',
    borderColor: lightDark('#b9b9b9', '#888888'),
  },
  search: {
    matchBackground: 'rgb(234 92 0 / 0.33)',
    currentBackground: lightDark('#a8ac94', '#515c6a'),
    widgetBackground: lightDark('#f3f3f3', '#252526'),
    widgetColor: tokenRef('text-primary'),
    widgetShadow: lightDark('0 0 8px 2px rgb(168 168 168 / 0.6)', '0 0 8px 2px rgb(0 0 0 / 0.36)'),
    widgetBorderRadius: tokenRef('radius-md'),
    widgetPadding: '4px',
    widgetGap: '4px',
    widgetTop: '0',
    widgetEnd: '14px',
    widgetWidth: '420px',
    countColor: tokenRef('text-muted'),
    countFontSize: '12px',
  },
};

/**
 * Design tokens of `tx-code-diff`: colors, sizes and spacing of its root, gutter, syntax, inserted, removed
 * and other parts.
 */
export const codeDiffTokens = {
  root: extendTokens(highlightRoot, {
    splitGap: '0',
    splitBorderColor: tokenRef('surface-border'),
  }),
  gutter: extendTokens(highlightGutter, {
    paddingStart: '8px',
    gap: '14px',
    markerWidth: '14px',
  }),
  syntax: {
    mix: '40%',
    shade: lightDark('#000000', '#d4d4d4'),
  },
  inserted: {
    lineBackground: lightDark('rgb(155 185 85 / 0.2)', 'rgb(155 185 85 / 0.12)'),
    textBackground: lightDark('rgb(156 204 44 / 0.25)', 'rgb(156 204 44 / 0.18)'),
    markerColor: lightDark('#587c0c', '#81b88b'),
  },
  removed: {
    lineBackground: 'rgb(255 0 0 / 0.2)',
    textBackground: lightDark('rgb(255 0 0 / 0.2)', 'rgb(255 0 0 / 0.2)'),
    markerColor: lightDark('#ad0707', '#c74e39'),
  },
  filler: {
    background: lightDark('rgb(34 34 34 / 0.05)', 'rgb(204 204 204 / 0.05)'),
  },
};

type CodeSyntaxTokensShape = typeof codeSyntaxTokens;

/** Type of `codeSyntaxTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCodeSyntaxTokens extends CodeSyntaxTokensShape {}
type CodeHighlightTokensShape = typeof codeHighlightTokens;

/** Type of `codeHighlightTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCodeHighlightTokens extends CodeHighlightTokensShape {}
type CodeEditorTokensShape = typeof codeEditorTokens;

/** Type of `codeEditorTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCodeEditorTokens extends CodeEditorTokensShape {}
type CodeDiffTokensShape = typeof codeDiffTokens;

/** Type of `codeDiffTokens`: the shape of the component tokens that presets and `dt` overrides can change. */
export interface TectraCodeDiffTokens extends CodeDiffTokensShape {}

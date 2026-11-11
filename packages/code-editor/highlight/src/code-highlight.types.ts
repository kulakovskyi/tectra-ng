export type TxCodeLanguage = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown' | 'plain';

export type TxCodeTokenType =
  | 'comment'
  | 'keyword'
  | 'literal'
  | 'string'
  | 'number'
  | 'regexp'
  | 'type'
  | 'delimiter'
  | 'tag'
  | 'tag-delimiter'
  | 'meta'
  | 'attribute'
  | 'attribute-value'
  | 'property'
  | 'value'
  | 'key'
  | 'heading'
  | 'strong'
  | 'emphasis'
  | 'link'
  | 'code'
  | 'quote';

export interface TxCodeToken {
  readonly from: number;
  readonly to: number;
  readonly type: TxCodeTokenType;
}

export interface TxCodeComments {
  readonly line?: string;
  readonly block?: readonly [string, string];
}

export interface TxCodeMode<S = unknown> {
  readonly language: TxCodeLanguage;
  readonly comments: TxCodeComments;
  start(): S;
  copy(state: S): S;
  token(stream: TxCodeStreamLike, state: S): TxCodeTokenType | null;
}

export interface TxCodeStreamLike {
  readonly string: string;
  pos: number;
  start: number;
  eol(): boolean;
  sol(): boolean;
  peek(offset?: number): string;
  next(): string;
  eat(match: string | RegExp): string;
  eatWhile(match: RegExp): boolean;
  eatSpace(): boolean;
  skipToEnd(): void;
  skipTo(text: string): boolean;
  match(pattern: RegExp, consume?: boolean): RegExpExecArray | null;
  matchText(text: string, consume?: boolean, ignoreCase?: boolean): boolean;
  current(): string;
  rest(): string;
  before(): string;
}

export type TxCodeHighlightPart = 'root' | 'gutter' | 'content' | 'line';

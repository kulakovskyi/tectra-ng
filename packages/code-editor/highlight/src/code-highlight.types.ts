/**
 * Languages the tokenizers know; other names resolve through aliases such as `js`, `ts` or `md`, and unknown ones fall back to `plain`.
 */
export type TxCodeLanguage = 'html' | 'css' | 'javascript' | 'typescript' | 'json' | 'markdown' | 'plain';

/** Kind of a token, which becomes the `tx-code-tok-<type>` class and picks its colour. */
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

/** A highlighted span of one line: character offsets and a type. */
export interface TxCodeToken {
  /** Offset of the first character in the line. */
  readonly from: number;
  /** Offset after the last character in the line. */
  readonly to: number;
  /** Kind of the span, which decides its colour. */
  readonly type: TxCodeTokenType;
}

/** Comment markers of a language, used by the comment toggle of the editor. */
export interface TxCodeComments {
  /** Prefix of a line comment, such as `//`; missing when the language has none. */
  readonly line?: string;
  /** Opening and closing marker of a block comment, as a pair; missing when the language has none. */
  readonly block?: readonly [string, string];
}

/**
 * Tokenizer of one language: it reads a line from a stream and keeps a state that carries over to the next line.
 */
export interface TxCodeMode<S = unknown> {
  /** The language this mode reads. */
  readonly language: TxCodeLanguage;
  /** Comment markers of the language. */
  readonly comments: TxCodeComments;
  /** Creates the state at the first line of a text. */
  start(): S;
  /** Copies a state so a line can be tokenized again without changing the stored one. */
  copy(state: S): S;
  /**
   * Reads the next token from the stream, advancing it, and returns its type; `null` leaves the text unstyled.
   */
  token(stream: TxCodeStreamLike, state: S): TxCodeTokenType | null;
}

/** Cursor over one line of code that a mode reads from. */
export interface TxCodeStreamLike {
  /** The whole line. */
  readonly string: string;
  /** Current offset in the line. */
  pos: number;
  /** Offset where the token being read began. */
  start: number;
  /** Whether the cursor is at the end of the line. */
  eol(): boolean;
  /** Whether the cursor is at the start of the line. */
  sol(): boolean;
  /** Returns the character at `offset` from the cursor (default 0) without moving; empty past the end. */
  peek(offset?: number): string;
  /** Moves one character on and returns it; empty at the end. */
  next(): string;
  /**
   * Moves past the next character when it equals a string or fits a pattern, and returns it; empty otherwise.
   */
  eat(match: string | RegExp): string;
  /** Moves past characters while they fit the pattern; `true` when it moved. */
  eatWhile(match: RegExp): boolean;
  /** Moves past whitespace; `true` when it moved. */
  eatSpace(): boolean;
  /** Moves to the end of the line. */
  skipToEnd(): void;
  /** Moves to the next occurrence of the text without consuming it; `false` when there is none. */
  skipTo(text: string): boolean;
  /** Matches a pattern at the cursor and returns the match, moving past it unless `consume` is `false`. */
  match(pattern: RegExp, consume?: boolean): RegExpExecArray | null;
  /**
   * Checks that the text follows the cursor, moving past it unless `consume` is `false`; `ignoreCase` ignores case.
   */
  matchText(text: string, consume?: boolean, ignoreCase?: boolean): boolean;
  /** Text of the token read so far, from `start` to `pos`. */
  current(): string;
  /** Text from the cursor to the end of the line. */
  rest(): string;
  /** Text of the line before the current token. */
  before(): string;
}

/** Parts of `tx-code-highlight` that `pt` can style. */
export type TxCodeHighlightPart = 'root' | 'gutter' | 'content' | 'line';

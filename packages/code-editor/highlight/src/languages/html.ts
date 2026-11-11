import { TxCodeMode, TxCodeStreamLike, TxCodeTokenType } from '../code-highlight.types';
import { tokenInside } from '../stream';
import { TX_CSS_MODE } from './css';
import { TX_JAVASCRIPT_MODE } from './javascript';
import { TX_JSON_MODE } from './json';

type HtmlContext = 'text' | 'tag' | 'comment' | 'doctype' | 'embedded';

interface HtmlEmbed {
  readonly mode: TxCodeMode | null;
  state: unknown;
}

export interface TxHtmlState {
  context: HtmlContext;
  tagName: string;
  closing: boolean;
  expectName: boolean;
  afterEquals: boolean;
  quote: string;
  attribute: string;
  scriptType: string;
  embed: HtmlEmbed | null;
}

const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);

function embedFor(tag: string, scriptType: string): HtmlEmbed {
  let mode: TxCodeMode | null = null;
  if (tag === 'style') {
    mode = TX_CSS_MODE as TxCodeMode;
  } else if (tag === 'script') {
    const type = scriptType.toLowerCase();
    if (type.includes('json')) {
      mode = TX_JSON_MODE as TxCodeMode;
    } else if (!type || type === 'module' || type.includes('javascript') || type.includes('ecmascript')) {
      mode = TX_JAVASCRIPT_MODE as TxCodeMode;
    }
  }
  return { mode, state: mode?.start() ?? null };
}

function embeddedToken(stream: TxCodeStreamLike, state: TxHtmlState): TxCodeTokenType | null {
  const embed = state.embed;
  const close = stream.string.toLowerCase().indexOf(`</${state.tagName}`, stream.pos);
  const end = close < 0 ? stream.string.length : close;
  if (stream.pos >= end) {
    state.context = 'text';
    state.embed = null;
    return htmlToken(stream, state);
  }
  if (!embed?.mode) {
    stream.pos = end;
    return null;
  }
  const mode = embed.mode;
  return tokenInside(stream, end, (inner) => {
    const type = mode.token(inner, embed.state);
    if (inner.pos === inner.start) {
      inner.next();
    }
    return type;
  });
}

function attributeValue(stream: TxCodeStreamLike, state: TxHtmlState): TxCodeTokenType {
  const start = stream.pos;
  if (stream.skipTo(state.quote)) {
    stream.pos++;
    if (state.attribute === 'type') {
      state.scriptType += stream.string.slice(start, stream.pos - 1);
    }
    state.quote = '';
  } else {
    if (state.attribute === 'type') {
      state.scriptType += stream.string.slice(start);
    }
    stream.skipToEnd();
  }
  return 'attribute-value';
}

function tagToken(stream: TxCodeStreamLike, state: TxHtmlState): TxCodeTokenType | null {
  if (state.quote) {
    return attributeValue(stream, state);
  }
  if (stream.eatSpace()) {
    return null;
  }
  if (state.expectName) {
    state.expectName = false;
    const name = stream.match(/[A-Za-z][\w:.-]*/);
    if (name) {
      state.tagName = name[0].toLowerCase();
      return 'tag';
    }
  }
  if (stream.matchText('/>')) {
    state.context = 'text';
    return 'tag-delimiter';
  }
  if (stream.matchText('>')) {
    const raw = !state.closing && RAW_TAGS.has(state.tagName);
    state.context = raw ? 'embedded' : 'text';
    state.embed = raw ? embedFor(state.tagName, state.scriptType) : null;
    return 'tag-delimiter';
  }
  if (state.afterEquals) {
    state.afterEquals = false;
    const char = stream.peek();
    if (char === '"' || char === "'") {
      stream.next();
      state.quote = char;
      return attributeValue(stream, state);
    }
    const value = stream.match(/[^\s"'`=<>]+/);
    if (value) {
      if (state.attribute === 'type') {
        state.scriptType = value[0];
      }
      return 'attribute-value';
    }
  }
  if (stream.eat('=')) {
    state.afterEquals = true;
    return 'delimiter';
  }
  const attribute = stream.match(/[^\s"'>/=]+/);
  if (attribute) {
    state.attribute = attribute[0].toLowerCase();
    return 'attribute';
  }
  stream.next();
  return 'tag-delimiter';
}

function htmlToken(stream: TxCodeStreamLike, state: TxHtmlState): TxCodeTokenType | null {
  switch (state.context) {
    case 'comment':
      if (stream.skipTo('-->')) {
        stream.pos += 3;
        state.context = 'text';
      } else {
        stream.skipToEnd();
      }
      return 'comment';
    case 'doctype':
      if (stream.eat('>')) {
        state.context = 'text';
        return 'meta';
      }
      if (stream.eatSpace()) {
        return null;
      }
      stream.match(/[^>\s]+/);
      return 'attribute';
    case 'embedded':
      return embeddedToken(stream, state);
    case 'tag':
      return tagToken(stream, state);
  }
  if (stream.matchText('<!--')) {
    state.context = 'comment';
    return htmlToken(stream, state);
  }
  if (stream.match(/<!doctype/i)) {
    state.context = 'doctype';
    return 'meta';
  }
  const open = stream.match(/<\/?(?=[A-Za-z])/);
  if (open) {
    state.context = 'tag';
    state.closing = open[0] === '</';
    state.expectName = true;
    state.afterEquals = false;
    state.attribute = '';
    state.scriptType = state.closing ? state.scriptType : '';
    return 'tag-delimiter';
  }
  if (!stream.match(/[^<]+/)) {
    stream.next();
  }
  return null;
}

export const TX_HTML_MODE: TxCodeMode<TxHtmlState> = {
  language: 'html',
  comments: { block: ['<!--', '-->'] },
  start: () => ({
    context: 'text',
    tagName: '',
    closing: false,
    expectName: false,
    afterEquals: false,
    quote: '',
    attribute: '',
    scriptType: '',
    embed: null,
  }),
  copy: (state) => ({
    ...state,
    embed: state.embed ? { mode: state.embed.mode, state: state.embed.mode ? state.embed.mode.copy(state.embed.state) : null } : null,
  }),
  token: htmlToken,
};

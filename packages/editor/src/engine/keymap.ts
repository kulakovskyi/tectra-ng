import { Command, Plugin } from 'prosemirror-state';

const CODE_KEYS: Record<string, string> = {
  BracketLeft: '[',
  BracketRight: ']',
  Comma: ',',
  Period: '.',
  Slash: '/',
  Backslash: '\\',
  Minus: '-',
  Equal: '=',
  Quote: "'",
  Semicolon: ';',
  Backquote: '`',
};

export function isMac(): boolean {
  const navigator = globalThis.navigator as (Navigator & { userAgentData?: { platform?: string } }) | undefined;
  const platform = navigator?.userAgentData?.platform ?? navigator?.platform ?? '';
  return /mac|iphone|ipad|ipod/i.test(platform);
}

function baseKey(event: KeyboardEvent): string {
  if (/^Key[A-Z]$/.test(event.code)) {
    return event.code.slice(3).toLowerCase();
  }
  if (/^Digit\d$/.test(event.code)) {
    return event.code.slice(5);
  }
  if (CODE_KEYS[event.code] && (event.ctrlKey || event.metaKey || event.altKey)) {
    return CODE_KEYS[event.code];
  }
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

export function keyName(event: KeyboardEvent, mac = isMac()): string {
  const parts: string[] = [];
  if (mac ? event.metaKey : event.ctrlKey) {
    parts.push('Mod');
  }
  if (mac && event.ctrlKey) {
    parts.push('Ctrl');
  }
  if (event.altKey) {
    parts.push('Alt');
  }
  if (event.shiftKey) {
    parts.push('Shift');
  }
  parts.push(baseKey(event));
  return parts.join('-');
}

function normalize(binding: string): string {
  const parts = binding.split('-');
  const key = parts.pop() ?? '';
  const order = ['Mod', 'Ctrl', 'Alt', 'Shift'];
  const modifiers = order.filter((modifier) => parts.includes(modifier));
  return [...modifiers, key.length === 1 ? key.toLowerCase() : key].join('-');
}

export function chain(...commands: Command[]): Command {
  return (state, dispatch, view) => commands.some((command) => command(state, dispatch, view));
}

export function keymap(bindings: Record<string, Command>): Plugin {
  const map = new Map(Object.entries(bindings).map(([binding, command]) => [normalize(binding), command]));
  return new Plugin({
    props: {
      handleKeyDown(view, event) {
        if (event.isComposing) {
          return false;
        }
        const command = map.get(keyName(event));
        return !!command && command(view.state, view.dispatch, view);
      },
    },
  });
}

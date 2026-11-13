import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { analyze, buildIndex, documentDeclarations, missingDocs, shiftSourceMap, toComment } from './api-docs.mjs';
import { parseReadme, rowNames, splitRow } from './readme.mjs';

const README = `# Widget

A widget that shows things. Put \`<tx-widget />\` anywhere.

\`\`\`html
<tx-widget [size]="'small'" />
\`\`\`

## Inputs
| Name | Description |
|---|---|
| size | \`small\` or \`large\` |
| label / title | Text of the widget |
| width | \`tx-widget-part\`: width of a part |
| pattern | Matches \`a\\|b\` |
| inherited | Comes from the base |
| ripple | From the ripple host directive |
| missing | Not in the types |

## Outputs
| Name | Description |
|---|---|
| changed | The value changed |

## Methods
| Name | Description |
|---|---|
| open() | Opens the widget */ now |
| TxWidgetService.notify(text) | Sends a note |
| new TxPoller(config) | A poller |

## Slots
| Name | Description |
|---|---|
| txWidgetItem | \`<ng-template txWidgetItem>\` — own item |
| txWidgetHeader | Content projected into the header |

## Pipes
| Name | Description |
|---|---|
| txShout: loud? | Upper case |

## Functions
| Name | Description |
|---|---|
| widgetSize(value) | Size of a widget |
| resolveField(item, path) | Re-exported |

## Constants
| Name | Description |
|---|---|
| TX_WIDGET_DEFAULT | The defaults |

## Inputs — tx-widget-footer
| Name | Description |
|---|---|
| size | Size of the footer |

## Keyboard
| Key | Action |
|---|---|
| Enter | Opens |
`;

const TYPES = `import * as i0 from "@angular/core";
import { resolveField } from '@tectra-ng/ui/table';
export declare function widgetSize(value: number): string;
export declare const TX_WIDGET_DEFAULT: {
  size: string;
};
export declare class TxWidgetService {
  notify(text: string): void;
}
export declare class TxPoller {
  constructor(config: unknown);
}
export declare class TxWidgetItem {
  readonly txWidgetItem: i0.InputSignal<string>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<TxWidgetItem, "ng-template[txWidgetItem]", never, {
    "txWidgetItem": {
      "alias": "txWidgetItem";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class TxWidget extends TxWidgetBase {
  private secret;
  readonly size: i0.InputSignal<string>;
  readonly text: i0.InputSignal<string>;
  readonly pattern: i0.InputSignal<string>;
  readonly unlisted: i0.InputSignal<string>;
  readonly changed: i0.OutputEmitterRef<string>;
  open(): void;
  static ɵcmp: i0.ɵɵComponentDeclaration<TxWidget, "tx-widget", never, {
    "size": {
      "alias": "size";
      "required": false;
      "isSignal": true;
    };
    "text": {
      "alias": "label";
      "required": false;
      "isSignal": true;
    };
    "pattern": {
      "alias": "pattern";
      "required": false;
      "isSignal": true;
    };
    "unlisted": {
      "alias": "unlisted";
      "required": false;
      "isSignal": true;
    };
  }, {
    "changed": "changed";
  }, never, never, true, [{
    directive: typeof i1.TxRipple;
    inputs: {
      "ripple": "ripple";
    };
    outputs: {};
  }]>;
}
export declare class TxWidgetPart {
  readonly width: i0.InputSignal<number>;
  static ɵcmp: i0.ɵɵComponentDeclaration<TxWidgetPart, "tx-widget-part", never, {
    "width": {
      "alias": "width";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class TxWidgetFooter {
  readonly size: i0.InputSignal<string>;
  static ɵcmp: i0.ɵɵComponentDeclaration<TxWidgetFooter, "tx-widget-footer", never, {
    "size": {
      "alias": "size";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
export declare class TxShoutPipe {
  transform(value: string): string;
  static ɵpipe: i0.ɵɵPipeDeclaration<TxShoutPipe, "txShout", true>;
}
export { resolveField };
`;

const BASE = `import * as i0 from "@angular/core";
export declare class TxWidgetBase {
  readonly inherited: i0.InputSignal<string>;
  static ɵdir: i0.ɵɵDirectiveDeclaration<TxWidgetBase, never, never, {
    "inherited": {
      "alias": "inherited";
      "required": false;
      "isSignal": true;
    };
  }, {}, never, never, true, never>;
}
`;

function docAbove(text, line) {
  const lines = text.split('\n');
  const index = lines.findIndex((candidate) => candidate.includes(line));
  assert.notEqual(index, -1, `no line ${line}`);
  const above = [];
  for (let current = index - 1; current >= 0 && /^\s*(\/\*\*|\*)/.test(lines[current]); current -= 1) {
    above.unshift(lines[current].trim());
  }
  return above.join('\n');
}

function run(options = {}) {
  const analysis = analyze(TYPES, 'widget.d.ts');
  const index = buildIndex([analysis, analyze(BASE, 'base.d.ts')]);
  return documentDeclarations(TYPES, [{ text: README, docsUrl: 'https://tectra-ng.com/components/widget', ...options }], { analysis, index });
}

describe('readme', () => {
  it('splits a table row and keeps escaped pipes and pipes in code', () => {
    assert.deepEqual(splitRow('| a | b \\| c | `x | y` |'), ['a', 'b | c', '`x | y`']);
  });

  it('reads the names of a row', () => {
    assert.deepEqual(rowNames('show()'), ['show']);
    assert.deepEqual(rowNames('txPlural: forms, locale?'), ['txPlural']);
    assert.deepEqual(rowNames('prev / next'), ['prev', 'next']);
    assert.deepEqual(rowNames('`[(value)]`'), ['value']);
    assert.deepEqual(rowNames('*txTableAction'), ['txTableAction']);
    assert.deepEqual(rowNames('highlightCode(code, language)'), ['highlightCode']);
    assert.deepEqual(rowNames('min, max'), ['min', 'max']);
  });

  it('reads the title, the intro, the first code block and the tables', () => {
    const readme = parseReadme(README);
    assert.equal(readme.title, 'Widget');
    assert.equal(readme.intro, 'A widget that shows things. Put `<tx-widget />` anywhere.');
    assert.equal(readme.firstCode, `<tx-widget [size]="'small'" />`);
    const inputs = readme.sections.find((section) => section.heading === 'Inputs');
    assert.equal(inputs.rows.find((row) => row.cell === 'width').scope, 'tx-widget-part');
    assert.equal(inputs.rows.find((row) => row.cell === 'width').description, 'width of a part');
    assert.equal(inputs.rows.find((row) => row.cell === 'pattern').description, 'Matches `a|b`');
    assert.equal(readme.sections.find((section) => section.scope === 'tx-widget-footer').heading, 'Inputs');
  });

  it('takes only a selector as a row scope', () => {
    const readme = parseReadme('# A\n\n## Outputs\n| Name | Description |\n|---|---|\n| loaded | `lazy`: data arrived |\n');
    assert.equal(readme.sections[0].rows[0].scope, null);
  });
});

describe('documentDeclarations', () => {
  it('documents inputs by alias, outputs, methods and the main class', () => {
    const { text } = run();
    assert.equal(docAbove(text, 'readonly size: i0.InputSignal<string>;'), '/** `small` or `large` */');
    assert.equal(docAbove(text, 'readonly text:'), '/** Text of the widget */');
    assert.equal(docAbove(text, 'readonly changed:'), '/** The value changed */');
    assert.equal(docAbove(text, 'open(): void;'), '/** Opens the widget *\\/ now */');
    assert.equal(
      docAbove(text, 'export declare class TxWidget extends'),
      '/**\n* A widget that shows things. Put `<tx-widget />` anywhere.\n* @see https://tectra-ng.com/components/widget\n*/',
    );
  });

  it('keeps scoped rows on their component and heading scopes off the others', () => {
    const { text } = run();
    assert.equal(docAbove(text, 'readonly width:'), '/** width of a part */');
    const footer = text.slice(text.indexOf('class TxWidgetFooter'));
    assert.equal(docAbove(footer, 'readonly size:'), '/** Size of the footer */');
  });

  it('documents slots with their own input, pipes, functions, constants and qualified methods', () => {
    const { text } = run();
    assert.match(docAbove(text, 'export declare class TxWidgetItem'), /own item/);
    assert.equal(docAbove(text, 'readonly txWidgetItem:'), '/** `<ng-template txWidgetItem>` — own item */');
    assert.match(docAbove(text, 'export declare class TxShoutPipe'), /Upper case/);
    assert.match(docAbove(text, 'export declare function widgetSize'), /Size of a widget/);
    assert.match(docAbove(text, 'export declare const TX_WIDGET_DEFAULT'), /The defaults/);
    assert.equal(docAbove(text, 'notify(text: string): void;'), '/** Sends a note */');
    assert.match(docAbove(text, 'export declare class TxPoller'), /A poller/);
  });

  it('accepts inherited, host directive and re-exported names, and reports the rest', () => {
    const { unmatched, undocumented } = run();
    assert.deepEqual(unmatched, ['Inputs: missing']);
    assert.deepEqual(undocumented, ['TxWidget.unlisted (input)']);
  });

  it('labels unmatched rows and scopes a page README to its class', () => {
    const { unmatched, text } = run({ label: 'docs/widget.md', defaultScope: 'TxWidgetPart', mainClass: 'TxWidgetPart' });
    assert.ok(unmatched.includes('docs/widget.md — Inputs (TxWidgetPart): size'));
    assert.match(docAbove(text, 'export declare class TxWidgetPart'), /A widget that shows things/);
  });

  it('does nothing on a second run', () => {
    const first = run();
    const second = documentDeclarations(first.text, README);
    assert.equal(second.documented, 0);
    assert.equal(second.text, first.text);
  });

  it('counts the lines it inserts before each original line', () => {
    const { text, inserted } = run();
    const added = [...inserted.values()].reduce((sum, count) => sum + count, 0);
    assert.equal(text.split('\n').length, TYPES.split('\n').length + added);
  });
});

describe('helpers', () => {
  it('writes one line or a block comment with the indent', () => {
    assert.equal(toComment(['One'], '  '), '/** One */\n  ');
    assert.equal(toComment(['One', '@see x'], '  '), '/**\n   * One\n   * @see x\n   */\n  ');
  });

  it('shifts the mappings of a declaration map by the inserted lines', () => {
    const map = JSON.stringify({ version: 3, mappings: 'AAAA;AACA;AACA' });
    const shifted = JSON.parse(shiftSourceMap(map, new Map([[1, 2]])));
    assert.equal(shifted.mappings, 'AAAA;;;AACA;AACA');
    assert.equal(shiftSourceMap(map, new Map()), map);
  });
});

describe('missingDocs', () => {
  it('lists public declarations without JSDoc and skips component members, private and repeated names', () => {
    const text = `import * as i0 from "@angular/core";
/** Documented. */
export declare function done(): void;
export declare function size(value: number): string;
export declare function size(value: string): string;
export declare const LIMIT = 3;
export type Mode = 'a' | 'b';
export interface Options {
  /** Documented. */
  text: string;
  life?: number;
}
export declare class Service {
  private secret;
  protected hidden: string;
  constructor(value: string);
  /** Documented. */
  send(): void;
  get value(): string;
  set value(next: string);
}
export declare class TxPart {
  readonly hostStyle: string;
  static ɵcmp: i0.ɵɵComponentDeclaration<TxPart, "tx-part", never, {}, {}, never, never, true, never>;
}
type Shape = typeof LIMIT;
interface Helper {
  value: string;
}
declare function listed(): void;
export { listed };
`;
    assert.deepEqual(
      missingDocs(text).map((item) => `${item.kind} ${item.name}`),
      ['function size', 'constant LIMIT', 'type Mode', 'function listed', 'interface Options', 'field Options.life', 'class Service', 'member Service.value', 'component TxPart'],
    );
  });
});

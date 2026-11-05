import { Injectable } from '@angular/core';
import type { HLJSApi } from 'highlight.js';
import { CodeLanguage } from './code-block.types';

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escapeCode(code: string): string {
  return code.replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

@Injectable({ providedIn: 'root' })
export class CodeHighlighter {
  private engine: Promise<HLJSApi> | null = null;

  async highlight(code: string, language: CodeLanguage): Promise<string> {
    if (language === 'bash') {
      return this.highlightShell(code);
    }
    const hljs = await this.load();
    const html = hljs.highlight(code, { language }).value;
    return language === 'css' ? this.fixCustomElements(html) : html;
  }

  private load(): Promise<HLJSApi> {
    this.engine ??= Promise.all([
      import('highlight.js/lib/core'),
      import('highlight.js/lib/languages/typescript'),
      import('highlight.js/lib/languages/css'),
      import('highlight.js/lib/languages/xml'),
    ]).then(([core, typescript, css, xml]) => {
      const hljs = core.default;
      hljs.registerLanguage('typescript', typescript.default);
      hljs.registerLanguage('css', css.default);
      hljs.registerLanguage('xml', xml.default);
      return hljs;
    });
    return this.engine;
  }

  private highlightShell(code: string): string {
    return code
      .split('\n')
      .map((line) => {
        const [command, ...args] = line.split(' ');
        const rest = args.map((arg) => (arg.startsWith('-') ? `<span class="hljs-attr">${escapeCode(arg)}</span>` : escapeCode(arg)));
        return [`<span class="hljs-built_in">${escapeCode(command)}</span>`, ...rest].join(' ');
      })
      .join('\n');
  }

  private fixCustomElements(html: string): string {
    return html
      .replace(/([\w-])<span class="hljs-selector-tag">([\w-]+)<\/span>/g, '$1$2')
      .replace(/(^|[\s,>+~])([a-z][\w]*-[\w-]+)(?=\s*[{,:.[])/gm, '$1<span class="hljs-selector-tag">$2</span>');
  }
}

import { DOCUMENT, Injectable, inject } from '@angular/core';
import { STACKBLITZ_SETUP } from '../../../generated/stackblitz';
import { DocsThemeSettings } from '../../layout/theme-settings';
import { exampleAssets, stackblitzProject } from './stackblitz-project';
import { StackblitzExample, StackblitzProject } from './stackblitz.types';

export const STACKBLITZ_URL = 'https://stackblitz.com/run';

@Injectable({ providedIn: 'root' })
export class DocsStackblitz {
  private readonly document = inject(DOCUMENT);
  private readonly settings = inject(DocsThemeSettings);

  async open(example: StackblitzExample): Promise<void> {
    const theme = {
      style: this.settings.style(),
      primary: this.settings.primary(),
      surface: this.settings.surface(),
      mode: this.settings.mode(),
      ripple: this.settings.ripple(),
    };
    const assets = await this.loadAssets(exampleAssets(example.source));
    this.submit(stackblitzProject(example, theme, STACKBLITZ_SETUP, assets));
  }

  private async loadAssets(paths: string[]): Promise<Record<string, string>> {
    const loaded = await Promise.all(
      paths.map(async (path) => {
        const response = await fetch(new URL(path, this.document.baseURI)).catch(() => null);
        return response?.ok ? [path, await response.text()] : null;
      }),
    );
    return Object.fromEntries(loaded.filter((entry): entry is [string, string] => entry !== null));
  }

  private submit(project: StackblitzProject): void {
    const form = this.document.createElement('form');
    form.method = 'POST';
    form.action = `${STACKBLITZ_URL}?file=${encodeURIComponent(project.openFile)}`;
    form.target = '_blank';
    form.hidden = true;
    const fields: [string, string][] = [
      ['project[title]', project.title],
      ['project[description]', project.description],
      ['project[template]', project.template],
      ...Object.entries(project.files).map(([path, content]): [string, string] => [`project[files][${path}]`, content]),
    ];
    for (const [name, value] of fields) {
      const input = this.document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      form.appendChild(input);
    }
    this.document.body.appendChild(form);
    form.submit();
    this.document.body.removeChild(form);
  }
}

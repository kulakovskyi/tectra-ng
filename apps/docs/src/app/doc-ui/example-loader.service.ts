import { Injectable, Type } from '@angular/core';
import { DocExample } from '../types/doc-component.interface';

@Injectable({ providedIn: 'root' })
export class ExampleLoader {
  private cache = new Map<string, Type<unknown>>();

  getCached(component: string, examples: DocExample[]): Map<string, Type<unknown>> | null {
    return examples.every((example) => this.cache.has(this.key(component, example))) ? this.pick(component, examples) : null;
  }

  async loadAll(component: string, examples: DocExample[]): Promise<Map<string, Type<unknown>>> {
    await Promise.all(
      examples.map(async (example) => {
        if (!this.cache.has(this.key(component, example))) {
          this.cache.set(this.key(component, example), await example.load());
        }
      }),
    );
    return this.pick(component, examples);
  }

  private pick(component: string, examples: DocExample[]): Map<string, Type<unknown>> {
    return new Map(examples.map((example) => [example.id, this.cache.get(this.key(component, example)) as Type<unknown>]));
  }

  private key(component: string, example: DocExample): string {
    return `${component}/${example.id}`;
  }
}

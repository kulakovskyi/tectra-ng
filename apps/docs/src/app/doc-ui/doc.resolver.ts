import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DOC_COMPONENTS } from '../../generated/registry';
import { DocComponent } from '../types/doc-component.interface';
import { ExampleLoader } from './example-loader.service';

const loaded = new Map<string, Promise<DocComponent>>();

export const docResolver: ResolveFn<DocComponent | null> = async (route) => {
  const exampleLoader = inject(ExampleLoader);
  const entry = DOC_COMPONENTS.find((component) => component.name === route.paramMap.get('name'));
  if (!entry) {
    return null;
  }
  if (!loaded.has(entry.name)) {
    loaded.set(
      entry.name,
      entry.load().catch((error: unknown) => {
        loaded.delete(entry.name);
        throw error;
      }),
    );
  }
  const doc = await (loaded.get(entry.name) as Promise<DocComponent>);
  await exampleLoader.loadAll(doc.name, doc.examples);
  return doc;
};

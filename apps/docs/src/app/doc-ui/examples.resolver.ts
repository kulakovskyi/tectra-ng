import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { DOC_COMPONENTS } from '../../generated/registry';
import { ExampleLoader } from './example-loader.service';

export const examplesResolver: ResolveFn<boolean> = async (route) => {
  const doc = DOC_COMPONENTS.find((component) => component.name === route.paramMap.get('name'));
  if (doc) {
    await inject(ExampleLoader).loadAll(doc.name, doc.examples);
  }
  return true;
};

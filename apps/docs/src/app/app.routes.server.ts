import { RenderMode, ServerRoute } from '@angular/ssr';
import { DOC_COMPONENTS } from '../generated/registry';
import { DOC_CATEGORIES } from './data/categories.data';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'components/:name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => DOC_COMPONENTS.map(({ name }) => ({ name })),
  },
  {
    path: 'categories/:category',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => DOC_CATEGORIES.map(({ slug }) => ({ category: slug })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];

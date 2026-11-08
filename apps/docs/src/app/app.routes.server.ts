import { RenderMode, ServerRoute } from '@angular/ssr';
import { DOC_COMPONENTS } from '../generated/registry';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'components/:name',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => DOC_COMPONENTS.map(({ name }) => ({ name })),
  },
  { path: '**', renderMode: RenderMode.Prerender },
];

import { Routes } from '@angular/router';
import { examplesResolver } from './doc-ui/examples.resolver';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.page') },
  { path: 'getting-started', loadComponent: () => import('./pages/getting-started/getting-started.page') },
  { path: 'theming', loadComponent: () => import('./pages/theming/theming.page') },
  { path: 'icons', loadComponent: () => import('./pages/icons/icons.page') },
  { path: 'core/overlay', loadComponent: () => import('./pages/core-overlay/core-overlay.page') },
  { path: 'core/locale', loadComponent: () => import('./pages/core-locale/core-locale.page') },
  {
    path: 'components/:name',
    loadComponent: () => import('./pages/component-doc/component-doc.page'),
    resolve: { examples: examplesResolver },
  },
  { path: '**', redirectTo: '' },
];

import { isDevMode } from '@angular/core';
import { Routes } from '@angular/router';
import { docResolver } from './doc-ui/doc.resolver';

export const routes: Routes = [
  { path: '', pathMatch: 'full', loadComponent: () => import('./landing/landing.page') },
  {
    path: '',
    loadComponent: () => import('./layout/docs-layout').then((m) => m.DocsLayout),
    children: [
      { path: 'docs', loadComponent: () => import('./pages/home/home.page') },
      { path: 'getting-started', loadComponent: () => import('./pages/getting-started/getting-started.page') },
      { path: 'theming', loadComponent: () => import('./pages/theming/theming.page') },
      { path: 'icons', loadComponent: () => import('./pages/icons/icons.page') },
      { path: 'core/overlay', loadComponent: () => import('./pages/core-overlay/core-overlay.page') },
      { path: 'core/locale', loadComponent: () => import('./pages/core-locale/core-locale.page') },
      {
        path: 'components/:name',
        loadComponent: () => import('./pages/component-doc/component-doc.page'),
        resolve: { doc: docResolver },
      },
    ],
  },
  ...(isDevMode() ? [{ path: 'studio/:scene', loadComponent: () => import('./studio/studio.page') }] : []),
  { path: '**', redirectTo: '' },
];

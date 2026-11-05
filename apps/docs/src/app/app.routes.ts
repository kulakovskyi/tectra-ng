import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./pages/home/home.page') },
  { path: 'getting-started', loadComponent: () => import('./pages/getting-started/getting-started.page') },
  { path: 'theming', loadComponent: () => import('./pages/theming/theming.page') },
  { path: 'components/:name', loadComponent: () => import('./pages/component-doc/component-doc.page') },
  { path: '**', redirectTo: '' },
];

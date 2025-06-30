import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/registration',
    pathMatch: 'full'
  },
  {
    path: 'form',
    loadComponent: () => import('./features/form/form.component').then(m => m.FormComponent)
  },
  {
    path: 'results',
    loadComponent: () => import('./features/results/results.component').then(m => m.ResultsComponent),
  },
  {
    path: '**',
    redirectTo: '/form'
  }
];
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './admin/auth.guard';
import { Landing } from './pages/landing';

export const routes: Routes = [
  { path: '', component: Landing, title: 'Sostecoop Cooperativa' },
  {
    path: 'noticias',
    loadComponent: () => import('./pages/news-catalog/news-catalog').then((m) => m.NewsCatalog),
    title: 'Noticias · Sostecoop',
  },
  {
    path: 'noticias/:slug',
    loadComponent: () => import('./pages/news-detail/news-detail').then((m) => m.NewsDetail),
  },
  {
    path: 'admin/login',
    canActivate: [guestGuard],
    loadComponent: () => import('./admin/login/login').then((m) => m.Login),
    title: 'Ingresar · Panel Sostecoop',
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () => import('./admin/shell/shell').then((m) => m.Shell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'secciones' },
      {
        path: 'secciones',
        loadComponent: () =>
          import('./admin/sections-list/sections-list').then((m) => m.SectionsList),
        title: 'Contenido · Panel Sostecoop',
      },
      {
        path: 'secciones/nuevo',
        loadComponent: () => import('./admin/new-module/new-module').then((m) => m.NewModule),
        title: 'Nuevo módulo · Panel Sostecoop',
      },
      {
        path: 'secciones/:key',
        loadComponent: () =>
          import('./admin/section-editor/section-editor').then((m) => m.SectionEditor),
        canDeactivate: [(editor: { canLeave(): boolean }) => editor.canLeave()],
        title: 'Editar · Panel Sostecoop',
      },
      {
        path: 'mensajes',
        loadComponent: () => import('./admin/inbox/inbox').then((m) => m.Inbox),
        title: 'Mensajes · Panel Sostecoop',
      },
    ],
  },
  { path: '**', redirectTo: '' },
];

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

/** Sin una cookie válida, /admin redirige al login. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  return (await auth.checkSession()) || inject(Router).parseUrl('/admin/login');
};

/** Con cookie de sesión válida, el login lleva directo al panel. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  return (await auth.checkSession()) ? inject(Router).parseUrl('/admin') : true;
};

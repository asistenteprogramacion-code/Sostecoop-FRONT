import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

/** Sin una cookie válida, /admin redirige al inicio público. */
export const authGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return (await auth.checkSession()) || router.parseUrl('/');
};

/** Con cookie de sesión válida, el login lleva directo al panel. */
export const guestGuard: CanActivateFn = async () => {
  const auth = inject(Auth);
  const router = inject(Router);
  return (await auth.checkSession()) ? router.parseUrl('/admin') : true;
};

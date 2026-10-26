import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from './auth';

/** Sin token, /admin redirige al login. */
export const authGuard: CanActivateFn = () =>
  inject(Auth).loggedIn() || inject(Router).parseUrl('/admin/login');

/** Con sesión abierta, el login lleva directo al panel. */
export const guestGuard: CanActivateFn = () =>
  !inject(Auth).loggedIn() || inject(Router).parseUrl('/admin');

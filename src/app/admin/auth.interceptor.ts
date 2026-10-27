import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../core/api';
import { Auth } from './auth';

const ADMIN_API = `${API_URL}/api/admin/`;

/** Envía la cookie de sesión en las llamadas de admin y cierra la sesión ante un 401. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.startsWith(ADMIN_API)) return next(req);

  const auth = inject(Auth);
  const withCookie = req.clone({ withCredentials: true });

  return next(withCookie).pipe(
    catchError((err: unknown) => {
      if (
        err instanceof HttpErrorResponse &&
        err.status === 401 &&
        auth.loggedIn() &&
        !req.url.endsWith('/logout')
      ) {
        void auth.logout();
      }
      return throwError(() => err);
    }),
  );
};

import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../core/api';

const TOKEN_KEY = 'sostecoop-admin-token';
const LEGACY_TOKEN_KEY = 'fondofuturo-admin-token';

/** Sesión del administrador. El token dura 8 h; un 401 la cierra (ver authInterceptor). */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  readonly token = signal<string | null>(readToken());
  readonly loggedIn = computed(() => !!this.token());

  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<{ access_token: string }>(`${API_URL}/api/admin/login`, { email, password }),
    );
    this.token.set(res.access_token);
    try {
      localStorage.setItem(TOKEN_KEY, res.access_token);
    } catch {
      // Sin almacenamiento la sesión dura lo que la pestaña.
    }
  }

  logout(): void {
    this.token.set(null);
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      // nada que limpiar
    }
    this.router.navigateByUrl('/admin/login');
  }
}

function readToken(): string | null {
  try {
    const token = localStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(LEGACY_TOKEN_KEY);
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
    return token;
  } catch {
    return null;
  }
}

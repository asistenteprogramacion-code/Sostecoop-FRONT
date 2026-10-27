import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../core/api';

const ADMIN_API = `${API_URL}/api/admin`;
type SessionState = 'unknown' | 'authenticated' | 'anonymous';

/** Estado de sesión del administrador. La credencial vive en una cookie HttpOnly del backend. */
@Injectable({ providedIn: 'root' })
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly session = signal<SessionState>('unknown');
  readonly loggedIn = computed(() => this.session() === 'authenticated');
  private sessionCheck: Promise<boolean> | null = null;

  async login(email: string, password: string): Promise<void> {
    await firstValueFrom(this.http.post<void>(`${ADMIN_API}/login`, { email, password }));
    this.session.set('authenticated');
  }

  /** Comprueba con el backend si el navegador conserva una cookie de sesión válida. */
  checkSession(): Promise<boolean> {
    if (this.session() !== 'unknown') return Promise.resolve(this.loggedIn());
    if (this.sessionCheck) return this.sessionCheck;

    this.sessionCheck = firstValueFrom(this.http.get(`${ADMIN_API}/me`))
      .then(() => {
        this.session.set('authenticated');
        return true;
      })
      .catch(() => {
        this.session.set('anonymous');
        return false;
      })
      .finally(() => (this.sessionCheck = null));
    return this.sessionCheck;
  }

  async logout(): Promise<void> {
    // Se marca primero como anónima para que un 401 del endpoint logout no lo repita.
    this.session.set('anonymous');
    try {
      await firstValueFrom(this.http.post<void>(`${ADMIN_API}/logout`, {}));
    } catch {
      // La sesión queda cerrada también en el frontend si no hay conexión con el servidor.
    }
    await this.router.navigateByUrl('/admin/login');
  }
}

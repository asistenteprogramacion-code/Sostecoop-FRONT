import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom, timeout } from 'rxjs';
import { API_URL } from '../core/api';

const ADMIN_API = `${API_URL}/api/admin`;
type SessionState = 'unknown' | 'authenticated' | 'anonymous';

/**
 * Pista local de sesión: solo la hora en que vence (nada sensible; la credencial sigue en la
 * cookie HttpOnly). Sin pista vigente no se consulta /me, que respondería 401 y el navegador lo
 * mostraría como error en la consola. Debe coincidir con `token_minutes` del backend (480 = 8 h).
 */
const SESSION_HINT_KEY = 'sostecoop-admin-session';
const SESSION_MINUTES = 480;

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
    writeHint(Date.now() + SESSION_MINUTES * 60_000);
  }

  /** Comprueba con el backend si el navegador conserva una cookie de sesión válida. */
  checkSession(): Promise<boolean> {
    if (this.session() !== 'unknown') return Promise.resolve(this.loggedIn());
    if (this.sessionCheck) return this.sessionCheck;

    // Sin una sesión iniciada en este navegador (o ya vencida) no hace falta preguntar.
    if (!hasValidHint()) {
      writeHint(null);
      this.session.set('anonymous');
      return Promise.resolve(false);
    }

    this.sessionCheck = firstValueFrom(
      this.http.get(`${ADMIN_API}/me`).pipe(timeout({ first: 5000 })),
    )
      .then(() => {
        this.session.set('authenticated');
        return true;
      })
      .catch(() => {
        writeHint(null);
        this.session.set('anonymous');
        return false;
      })
      .finally(() => (this.sessionCheck = null));
    return this.sessionCheck;
  }

  async logout(): Promise<void> {
    // Se marca primero como anónima para que un 401 del endpoint logout no lo repita.
    this.session.set('anonymous');
    writeHint(null);
    try {
      await firstValueFrom(this.http.post<void>(`${ADMIN_API}/logout`, {}));
    } catch {
      // La sesión queda cerrada también en el frontend si no hay conexión con el servidor.
    }
    await this.router.navigateByUrl('/admin/login');
  }
}

function hasValidHint(): boolean {
  try {
    return Number(localStorage.getItem(SESSION_HINT_KEY)) > Date.now();
  } catch {
    // Sin almacenamiento disponible se pregunta al backend como antes.
    return true;
  }
}

/** Guarda la hora de vencimiento, o la borra con null. */
function writeHint(expiresAt: number | null): void {
  try {
    if (expiresAt === null) localStorage.removeItem(SESSION_HINT_KEY);
    else localStorage.setItem(SESSION_HINT_KEY, String(expiresAt));
  } catch {
    // Sin almacenamiento no hay pista; checkSession consultará al backend.
  }
}

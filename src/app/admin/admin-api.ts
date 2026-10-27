import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_URL } from '../core/api';
import { anchorOf, CORE_KEYS } from '../core/modules';
import { withRequiredMenuItems } from '../core/menu-defaults';
import { Section } from '../core/site-content';

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  read: boolean;
  created_at: string;
}

/** title, visible y position son parciales; content se reemplaza completo. */
export type SectionPatch = Partial<Pick<Section, 'title' | 'visible' | 'position' | 'content'>>;

export type NewSection = Pick<Section, 'key' | 'title' | 'visible' | 'position' | 'content'>;

export interface MenuItem {
  label: string;
  anchor: string;
}

/** Enlaces del menú guardados en settings.content.menu. */
export function menuOf(settings: Section | undefined): MenuItem[] {
  const menu = settings?.content['menu'];
  return withRequiredMenuItems(menu);
}

const ADMIN = `${API_URL}/api/admin`;

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
export const UPLOAD_TYPES = ['image/png', 'image/jpeg', 'image/webp'];

@Injectable({ providedIn: 'root' })
export class AdminApi {
  private readonly http = inject(HttpClient);

  sections(): Promise<Section[]> {
    return firstValueFrom(this.http.get<Section[]>(`${ADMIN}/sections`));
  }

  updateSection(key: string, patch: SectionPatch): Promise<Section> {
    if (CORE_KEYS.has(key) && patch.visible === false) {
      return Promise.reject(new Error('Esta sección es obligatoria y no se puede ocultar.'));
    }
    const normalizedPatch =
      key === 'settings' && patch.content
        ? {
            ...patch,
            content: { ...patch.content, menu: withRequiredMenuItems(patch.content['menu']) },
          }
        : patch;
    return firstValueFrom(this.http.put<Section>(`${ADMIN}/sections/${key}`, normalizedPatch));
  }

  /** Crea un módulo nuevo (requiere POST /api/admin/sections en el backend). */
  createSection(section: NewSection): Promise<Section> {
    return firstValueFrom(this.http.post<Section>(`${ADMIN}/sections`, section));
  }

  /** Borra un módulo (requiere DELETE /api/admin/sections/{key} en el backend). */
  async deleteSection(key: string): Promise<void> {
    if (CORE_KEYS.has(key)) {
      throw new Error('Esta sección es obligatoria y no se puede borrar.');
    }
    const settings = (await this.sections()).find((section) => section.key === 'settings');
    const anchor = '#' + anchorOf(key);
    if (menuOf(settings).some((item) => item.anchor === anchor)) {
      throw new Error('Primero quita este enlace del menú; después podrás borrar el módulo.');
    }
    await firstValueFrom(this.http.delete<void>(`${ADMIN}/sections/${key}`));
  }

  /**
   * Agrega o quita del menú (settings.menu) el enlace a una sección.
   * Lee settings justo antes para no pisar cambios recientes.
   */
  async setInMenu(anchor: string, label: string, inMenu: boolean): Promise<Section> {
    const settings = (await this.sections()).find((s) => s.key === 'settings');
    if (!settings) throw new Error('No existe la sección de ajustes generales.');
    const current = menuOf(settings);
    const exists = current.some((i) => i.anchor === anchor);
    // Si ya estaba, se actualiza el texto sin moverlo de lugar; si no, va al final.
    const menu = inMenu
      ? exists
        ? current.map((i) => (i.anchor === anchor ? { ...i, label } : i))
        : [...current, { label, anchor }]
      : current.filter((i) => i.anchor !== anchor);
    return this.updateSection('settings', { content: { ...settings.content, menu } });
  }

  async upload(file: File): Promise<string> {
    const body = new FormData();
    body.append('file', file);
    const res = await firstValueFrom(this.http.post<{ url: string }>(`${ADMIN}/upload`, body));
    return res.url;
  }

  contacts(): Promise<ContactMessage[]> {
    return firstValueFrom(this.http.get<ContactMessage[]>(`${ADMIN}/contacts`));
  }

  markRead(id: number): Promise<ContactMessage> {
    return firstValueFrom(this.http.patch<ContactMessage>(`${ADMIN}/contacts/${id}/read`, {}));
  }

  deleteContact(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${ADMIN}/contacts/${id}`));
  }
}

/** Mensaje legible a partir de un error de la API ({"detail": ...}). */
export function apiErrorMessage(err: unknown, fallback = 'Ocurrió un error. Intenta de nuevo.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No hay conexión con el servidor.';
    const detail = err.error?.detail;
    if (typeof detail === 'string') return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail.map((d) => d.msg).join(' · ');
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

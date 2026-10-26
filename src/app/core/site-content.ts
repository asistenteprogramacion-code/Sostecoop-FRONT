import { computed, DestroyRef, inject, Injectable, Signal, signal } from '@angular/core';
import { API_URL } from './api';
import { openLiveSocket } from './live-socket';

export interface Section {
  key: string;
  title: string;
  visible: boolean;
  position: number;
  content: Record<string, unknown>;
  updated_at: string;
}

export type ConnectionStatus = 'conectando' | 'en-vivo' | 'sin-conexion';

/**
 * Contenido del sitio público: carga GET /api/public/content y lo mantiene
 * actualizado con los eventos del WebSocket (section_updated / section_deleted).
 * Se provee en cada página pública para que el socket viva solo mientras está abierta.
 */
@Injectable()
export class SiteContent {
  /** null mientras no responde la API; después, solo las secciones visibles. */
  private readonly sections = signal<Record<string, Section> | null>(null);
  readonly status = signal<ConnectionStatus>('conectando');
  /** true cuando ya llegó el contenido de la API (puede cambiar el alto de las secciones). */
  readonly loaded = computed(() => this.sections() !== null);
  /** Secciones visibles ordenadas por posición. */
  readonly list = computed(() =>
    Object.values(this.sections() ?? {}).sort((a, b) => a.position - b.position),
  );

  constructor() {
    this.load();
    const close = openLiveSocket({
      onOpen: () => {
        this.status.set('en-vivo');
        this.load();
      },
      onClose: () => this.status.set('sin-conexion'),
      onEvent: (msg) => {
        const data = msg.data as Partial<Section> | undefined;
        if (!data?.key) return;
        if (msg.event === 'section_updated') {
          const section = data as Section;
          this.patch(section.key, section.visible ? section : null);
        } else if (msg.event === 'section_deleted') {
          this.patch(data.key, null);
        }
      },
    });
    inject(DestroyRef).onDestroy(close);
  }

  /**
   * Contenido de una sección mezclado con los valores del diseño.
   * Mientras carga devuelve los valores del diseño; null si la sección está oculta o no existe.
   */
  section<T extends object>(key: string, defaults: T): Signal<T | null> {
    return computed(() => {
      const all = this.sections();
      if (!all) return defaults;
      const section = all[key];
      if (!section) return null;
      return { ...defaults, ...withoutEmpty(section.content) } as T;
    });
  }

  /** Sección tal como llega de la API: undefined mientras carga, null si no está visible. */
  raw(key: string): Signal<Section | null | undefined> {
    return computed(() => {
      const all = this.sections();
      return all ? (all[key] ?? null) : undefined;
    });
  }

  /** Antes de cargar se asume visible para no parpadear. */
  isVisible(key: string): boolean {
    const all = this.sections();
    return !all || key in all;
  }

  private patch(key: string, section: Section | null): void {
    this.sections.update((prev) => {
      const next = { ...prev };
      if (section) next[key] = section;
      else delete next[key];
      return next;
    });
  }

  private async load(): Promise<void> {
    try {
      const res = await fetch(`${API_URL}/api/public/content`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const list: Section[] = await res.json();
      this.sections.set(
        Object.fromEntries(
          list
            .filter((s) => s.visible)
            .map((section) => [
              section.key,
              {
                ...section,
                title: replaceLegacyName(section.title),
                content: replaceLegacyNames(section.content) as Record<string, unknown>,
              },
            ]),
        ),
      );
    } catch {
      // Sin API se mantiene el contenido del diseño.
      if (this.status() !== 'en-vivo') this.status.set('sin-conexion');
    }
  }
}

/** Mantiene la marca nueva en contenido existente que aún llega con el nombre anterior. */
function replaceLegacyNames(value: unknown): unknown {
  if (typeof value === 'string') return replaceLegacyName(value);
  if (Array.isArray(value)) return value.map(replaceLegacyNames);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, replaceLegacyNames(entry)]),
    );
  }
  return value;
}

function replaceLegacyName(value: string): string {
  if (value.includes('@') || /^https?:\/\//i.test(value)) return value;
  return value.replace(/Fondo\s*Futuro/gi, 'Sostecoop');
}

/** Quita valores vacíos para que no tapen el contenido por defecto. */
function withoutEmpty(content: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(content ?? {}).filter(
      ([, v]) => v !== '' && v !== null && v !== undefined && !(Array.isArray(v) && !v.length),
    ),
  );
}

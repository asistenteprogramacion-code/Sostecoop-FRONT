import { computed, Signal } from '@angular/core';
import { SiteContent } from './site-content';

/** Enlace del menú listo para routerLink: ancla de la landing, página interna o externa. */
export interface MenuLink {
  label: string;
  /** Ruta interna ('/' para la landing) o URL externa. */
  path: string;
  fragment: string | null;
  external: boolean;
}

interface RawMenuItem {
  label?: string;
  anchor?: string;
}

/** Menú por defecto (el del diseño) mientras carga la API o si settings no trae menú. */
const DEFAULT_MENU: RawMenuItem[] = [
  { label: 'Inicio', anchor: '#inicio' },
  { label: 'Quiénes somos', anchor: '#nosotros' },
  { label: 'Noticias', anchor: '#noticias' },
  { label: 'Contáctanos', anchor: '#contacto' },
];

/** Sección a la que apunta un ancla (#inicio es el hero). */
function keyOfAnchor(fragment: string): string {
  return fragment === 'inicio' ? 'hero' : fragment;
}

/**
 * Menú del sitio a partir de settings.menu. Se ocultan los enlaces a secciones
 * que no existen o están ocultas, para no dejar enlaces muertos.
 */
export function siteMenu(content: SiteContent): Signal<MenuLink[]> {
  const settings = content.raw('settings');
  return computed(() => {
    const menu = settings()?.content['menu'];
    const items = Array.isArray(menu) && menu.length ? (menu as RawMenuItem[]) : DEFAULT_MENU;
    return items
      .filter((i) => i.label?.trim() && i.anchor?.trim())
      .map((i) => toLink(i.label!.trim(), i.anchor!.trim()))
      .filter((l) => !l.fragment || content.isVisible(keyOfAnchor(l.fragment)));
  });
}

function toLink(label: string, anchor: string): MenuLink {
  if (/^https?:\/\//.test(anchor)) return { label, path: anchor, fragment: null, external: true };
  if (anchor.startsWith('#')) return { label, path: '/', fragment: anchor.slice(1), external: false };
  if (anchor.startsWith('/')) {
    const [path, fragment] = anchor.split('#');
    return { label, path: path || '/', fragment: fragment ?? null, external: false };
  }
  return { label, path: '/', fragment: anchor, external: false };
}

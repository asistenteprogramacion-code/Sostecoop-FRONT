/**
 * Base de las llamadas al backend FastAPI. Va vacía a propósito: las rutas son relativas (/api/...)
 * y en desarrollo `proxy.conf.json` las reenvía al backend. Así la cookie de sesión (SameSite=Lax)
 * pertenece al mismo origen que la página y el navegador la envía.
 * En producción el servidor web debe reenviar /api y /uploads al backend bajo el mismo dominio (https).
 */
export const API_URL = '';

/** WebSocket de eventos en vivo, construido con el host desde el que se abrió la página. */
export const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/public/ws`;

/** Las rutas /uploads/ vienen relativas a la API; si no hay imagen se usa la del diseño. */
export function resolveImage(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  return url.startsWith('/uploads/') ? API_URL + url : url;
}

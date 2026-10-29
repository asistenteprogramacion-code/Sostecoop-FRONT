/** Las rutas relativas pasan por el proxy del frontend hacia el backend. */
export const API_URL = '';

/** WebSocket de eventos en vivo, reenviado por el proxy al backend. */
export const WS_URL = `${location.protocol === 'https:' ? 'wss' : 'ws'}://${location.host}/api/public/ws`;

/** Las rutas /uploads/ vienen relativas a la API; si no hay imagen se usa la del diseño. */
export function resolveImage(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  return url.startsWith('/uploads/') ? API_URL + url : url;
}

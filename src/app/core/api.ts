/** Base directa del backend FastAPI. */
export const API_URL = 'http://192.168.12.95:8000';

/** WebSocket de eventos en vivo conectado directamente al backend. */
export const WS_URL = `${API_URL.replace(/^http/, 'ws')}/api/public/ws`;

/** Las rutas /uploads/ vienen relativas a la API; si no hay imagen se usa la del diseño. */
export function resolveImage(url: string | null | undefined, fallback: string): string {
  if (!url) return fallback;
  return url.startsWith('/uploads/') ? API_URL + url : url;
}

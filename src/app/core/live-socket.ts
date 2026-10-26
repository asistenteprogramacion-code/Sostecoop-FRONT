import { WS_URL } from './api';

export interface LiveEvent<T = unknown> {
  event: string;
  data: T;
}

export interface LiveSocketHandlers {
  onEvent: (msg: LiveEvent) => void;
  /** Se llama al conectar y al reconectar: buen momento para recargar datos. */
  onOpen?: () => void;
  onClose?: () => void;
}

const PING_MS = 30_000;
const MAX_RETRY_MS = 15_000;

/**
 * WebSocket de eventos en vivo (/api/public/ws) con ping cada 30 s y
 * reconexión con espera creciente. Devuelve la función para cerrarlo.
 */
export function openLiveSocket(handlers: LiveSocketHandlers): () => void {
  let ws: WebSocket | undefined;
  let ping: ReturnType<typeof setInterval> | undefined;
  let retryTimer: ReturnType<typeof setTimeout> | undefined;
  let retry = 0;
  let closed = false;

  const connect = () => {
    ws = new WebSocket(WS_URL);
    const socket = ws;

    socket.onopen = () => {
      retry = 0;
      handlers.onOpen?.();
      ping = setInterval(() => socket.send('ping'), PING_MS);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg && typeof msg.event === 'string') handlers.onEvent(msg);
      } catch {
        // respuesta al ping u otro texto
      }
    };

    socket.onclose = () => {
      clearInterval(ping);
      if (closed) return;
      handlers.onClose?.();
      retryTimer = setTimeout(connect, Math.min(1000 * 2 ** retry++, MAX_RETRY_MS));
    };
  };

  connect();

  return () => {
    closed = true;
    clearInterval(ping);
    clearTimeout(retryTimer);
    ws?.close();
  };
}

import { Injectable } from '@angular/core';
import { API_URL } from './api';

export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

/** Errores por campo (422) o un mensaje general. */
export class ContactError extends Error {
  constructor(
    message: string,
    readonly fields: Record<string, string> = {},
  ) {
    super(message);
  }
}

@Injectable({ providedIn: 'root' })
export class ContactApi {
  async send(data: ContactMessage): Promise<void> {
    let res: Response;
    try {
      res = await fetch(`${API_URL}/api/public/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch {
      throw new ContactError('No pudimos conectar con el servidor. Intenta de nuevo en unos minutos.');
    }
    if (res.status === 201 || res.ok) return;

    const body = await res.json().catch(() => ({}));
    if (res.status === 422 && Array.isArray(body.detail)) {
      // FastAPI: [{ loc: ['body', 'email'], msg: '...' }]
      const fields: Record<string, string> = {};
      for (const err of body.detail) {
        const field = err.loc?.[err.loc.length - 1];
        if (typeof field === 'string' && !fields[field]) fields[field] = err.msg;
      }
      throw new ContactError('Revisa los campos marcados.', fields);
    }
    throw new ContactError(
      typeof body.detail === 'string' ? body.detail : 'No se pudo enviar el mensaje.',
    );
  }
}

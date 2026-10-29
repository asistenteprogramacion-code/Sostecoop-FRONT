import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { openLiveSocket } from '../core/live-socket';
import { AdminApi, apiErrorMessage, ContactMessage } from './admin-api';

/**
 * Bandeja de mensajes compartida por el layout (contador) y la página de mensajes.
 * Se refresca sola con el evento new_contact del WebSocket.
 */
@Injectable()
export class InboxStore {
  private readonly api = inject(AdminApi);

  readonly messages = signal<ContactMessage[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');

  constructor() {
    this.load();
    const close = openLiveSocket({
      onOpen: () => this.load(),
      onEvent: (msg) => {
        if (msg.event === 'new_contact') this.load();
      },
    });
    inject(DestroyRef).onDestroy(close);
  }

  async load(): Promise<void> {
    try {
      this.messages.set(await this.api.contacts());
      this.error.set('');
    } catch (err) {
      this.error.set(apiErrorMessage(err, 'No se pudieron cargar los mensajes.'));
    } finally {
      this.loading.set(false);
    }
  }

  async remove(id: number): Promise<void> {
    await this.api.deleteContact(id);
    this.messages.update((list) => list.filter((m) => m.id !== id));
  }
}

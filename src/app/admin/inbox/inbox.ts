import { Component, inject, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { apiErrorMessage, ContactMessage } from '../admin-api';
import { InboxStore } from '../inbox-store';
import { timeAgo } from '../section-meta';
import { Toast } from '../toast';

const dateFormat = new Intl.DateTimeFormat('es-CO', { dateStyle: 'long', timeStyle: 'short' });

@Component({
  selector: 'app-inbox',
  imports: [Icon],
  templateUrl: './inbox.html',
  styleUrl: './inbox.css',
})
export class Inbox {
  protected readonly store = inject(InboxStore);
  private readonly toast = inject(Toast);

  protected readonly openId = signal<number | null>(null);
  protected readonly markingReadId = signal<number | null>(null);
  protected readonly busyId = signal<number | null>(null);
  /** Mensaje con la confirmación de borrado abierta. */
  protected readonly confirmDeleteId = signal<number | null>(null);

  protected readonly timeAgo = timeAgo;
  protected readonly skeletons = [1, 2, 3, 4];

  protected async toggle(msg: ContactMessage): Promise<void> {
    const opening = this.openId() !== msg.id;
    this.openId.set(opening ? msg.id : null);
    this.confirmDeleteId.set(null);
    if (opening && !msg.read) {
      this.markingReadId.set(msg.id);
      try {
        await this.store.markRead(msg.id);
      } catch (err) {
        this.toast.error(apiErrorMessage(err, 'No se pudo marcar el mensaje como leído.'));
      } finally {
        this.markingReadId.set(null);
      }
    }
  }

  protected async remove(msg: ContactMessage): Promise<void> {
    const ok = await this.run(msg.id, () => this.store.remove(msg.id), 'No se pudo borrar el mensaje.');
    if (ok) this.toast.ok(`Mensaje de ${msg.name} borrado.`);
  }

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  }

  protected date(iso: string): string {
    // La API envía UTC; si la fecha no trae zona se interpreta como UTC.
    const d = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z');
    return isNaN(d.getTime()) ? iso : dateFormat.format(d);
  }

  protected replyLink(msg: ContactMessage): string {
    return `mailto:${msg.email}?subject=${encodeURIComponent('Respuesta a tu mensaje')}`;
  }

  private async run(id: number, task: () => Promise<void>, fallback: string): Promise<boolean> {
    this.busyId.set(id);
    try {
      await task();
      return true;
    } catch (err) {
      this.toast.error(apiErrorMessage(err, fallback));
      return false;
    } finally {
      this.busyId.set(null);
      this.confirmDeleteId.set(null);
    }
  }
}

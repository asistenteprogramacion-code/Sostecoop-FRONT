import { Component, inject, Injectable, signal } from '@angular/core';
import { Icon } from '../shared/icon';

export interface ToastMessage {
  id: number;
  text: string;
  kind: 'ok' | 'error';
}

/** Avisos breves del panel (guardado, errores) en la esquina inferior. */
@Injectable({ providedIn: 'root' })
export class Toast {
  readonly items = signal<ToastMessage[]>([]);
  private nextId = 1;

  ok(text: string): void {
    this.push(text, 'ok');
  }

  error(text: string): void {
    this.push(text, 'error');
  }

  dismiss(id: number): void {
    this.items.update((list) => list.filter((t) => t.id !== id));
  }

  private push(text: string, kind: ToastMessage['kind']): void {
    const id = this.nextId++;
    this.items.update((list) => [...list.slice(-2), { id, text, kind }]);
    setTimeout(() => this.dismiss(id), kind === 'error' ? 6000 : 3500);
  }
}

@Component({
  selector: 'app-toasts',
  imports: [Icon],
  template: `
    <div class="stack" aria-live="polite">
      @for (t of toast.items(); track t.id) {
        <div class="toast" [class.error]="t.kind === 'error'" [attr.role]="t.kind === 'error' ? 'alert' : 'status'">
          <svg [appIcon]="t.kind === 'error' ? 'alert' : 'check'"></svg>
          <span>{{ t.text }}</span>
          <button type="button" aria-label="Cerrar aviso" (click)="toast.dismiss(t.id)">
            <svg appIcon="close"></svg>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    .stack {
      position: fixed;
      right: 20px;
      bottom: 20px;
      z-index: var(--z-toast);
      display: grid;
      gap: 10px;
      width: min(380px, calc(100vw - 40px));
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 13px 12px 13px 16px;
      border-radius: 14px;
      background: var(--navy);
      color: white;
      font-size: 14px;
      box-shadow: var(--shadow-lg);
      animation: toast-in 0.4s var(--ease-spring);
    }
    .toast > svg {
      width: 18px;
      height: 18px;
      color: #6be0b8;
    }
    .toast.error > svg {
      color: #ffb3aa;
    }
    .toast span {
      flex: 1;
    }
    button {
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      border: 0;
      border-radius: 8px;
      background: transparent;
      color: #a9bbc4;
      cursor: pointer;
    }
    button:hover {
      background: #ffffff1a;
      color: white;
    }
    button svg {
      width: 16px;
      height: 16px;
    }
    @keyframes toast-in {
      from {
        opacity: 0;
        transform: translateY(12px) scale(0.97);
      }
    }
  `,
})
export class Toasts {
  protected readonly toast = inject(Toast);
}

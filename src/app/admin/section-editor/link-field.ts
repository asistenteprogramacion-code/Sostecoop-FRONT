import { Component, computed, inject, input, output, signal } from '@angular/core';
import { Icon } from '../../shared/icon';
import { LinkCatalog } from './link-catalog';

const CUSTOM = '__otro';

/**
 * Elige a dónde lleva un botón o un enlace del menú: una sección de la página,
 * una página interna o un enlace externo escrito a mano.
 */
@Component({
  selector: 'app-link-field',
  imports: [Icon],
  template: `
    <label class="adm-field" [class.invalid]="error()">
      <span>{{ label() }}</span>
      <select class="adm-input" [disabled]="locked()" (change)="pick($any($event.target).value)" [attr.aria-invalid]="!!error()">
        @if (optional()) {
          <option value="" [selected]="selected() === ''">Sin enlace</option>
        } @else if (!value()) {
          <option value="" disabled [selected]="selected() === ''">Elige a dónde lleva…</option>
        }
        @for (group of catalog.groups(); track group.label) {
          @if (group.options.length) {
            <optgroup [label]="group.label">
              @for (option of group.options; track option.value) {
                <option [value]="option.value" [selected]="selected() === option.value" [disabled]="disabledValues().includes(option.value)">{{ option.label }}{{ disabledValues().includes(option.value) ? ' (en uso)' : '' }}</option>
              }
            </optgroup>
          }
        }
        <option [value]="custom" [selected]="selected() === custom">+ Otro enlace (sitio externo)…</option>
      </select>
    </label>

    @if (selected() === custom) {
      <label class="adm-field custom" [class.invalid]="error()">
        <span class="sr-only">Dirección del enlace externo</span>
        <input
          class="adm-input"
          type="url"
          inputmode="url"
          placeholder="https://"
          [value]="value()"
          [disabled]="locked()"
          (input)="valueChange.emit($any($event.target).value.trim())"
          [attr.aria-invalid]="!!error()"
        />
      </label>
    }

    @if (error()) {
      <small class="err"><svg appIcon="alert"></svg>{{ error() }}</small>
    } @else if (selected() === custom) {
      <small class="hint">Pega la dirección completa, por ejemplo https://wa.me/573001234567</small>
    }
  `,
  styles: `
    :host {
      display: grid;
      gap: 8px;
      min-width: 0;
    }
    select {
      cursor: pointer;
    }
    .custom {
      animation: unfold 0.2s var(--ease-out);
    }
    @keyframes unfold {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
    .hint {
      font-size: 13px;
      color: var(--muted);
    }
    .err {
      display: flex;
      align-items: flex-start;
      gap: 6px;
      color: #b33a3a;
      font-size: 13px;
      font-weight: 500;
    }
    .err svg {
      width: 15px;
      height: 15px;
      margin-top: 1px;
    }
    .invalid .adm-input {
      border-color: #e39a9a;
      background: #fffafa;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
    }
  `,
})
export class LinkField {
  protected readonly catalog = inject(LinkCatalog);
  protected readonly custom = CUSTOM;

  readonly value = input<string>('');
  readonly label = input('Enlace');
  /** Si se puede dejar sin enlace (los botones sí; los enlaces del menú no). */
  readonly optional = input(false);
  readonly error = input('');
  readonly locked = input(false);
  readonly disabledValues = input<readonly string[]>([]);
  readonly valueChange = output<string>();

  /** El admin eligió escribir un enlace a mano aunque todavía esté vacío. */
  private readonly customMode = signal(false);

  protected readonly selected = computed(() => {
    const value = this.value();
    if (this.customMode()) return CUSTOM;
    if (!value) return '';
    // Un destino que ya no existe se muestra como enlace manual para poder corregirlo.
    return this.catalog.valid().has(value) ? value : CUSTOM;
  });

  protected pick(choice: string): void {
    if (choice === CUSTOM) {
      this.customMode.set(true);
      if (this.catalog.valid().has(this.value())) this.valueChange.emit('');
      return;
    }
    this.customMode.set(false);
    this.valueChange.emit(choice);
  }
}

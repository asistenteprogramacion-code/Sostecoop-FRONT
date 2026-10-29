import { Component, computed, input, output } from '@angular/core';
import { ICON_CHOICES, moduleIcon } from '../../core/modules';
import { Icon } from '../../shared/icon';

/** Selector de ícono con vista previa, en lugar de escribir su nombre. */
@Component({
  selector: 'app-icon-field',
  imports: [Icon],
  template: `
    <label class="adm-field">
      <span>{{ label() }}</span>
      <span class="row">
        <span class="adm-tile preview" aria-hidden="true"><svg [appIcon]="current()"></svg></span>
        <select class="adm-input" [disabled]="disabled()" (change)="valueChange.emit($any($event.target).value)">
          @for (choice of choices; track choice.id) {
            <option [value]="choice.id" [selected]="choice.id === current()">{{ choice.label }}</option>
          }
        </select>
      </span>
    </label>
  `,
  styles: `
    :host {
      display: block;
      min-width: 0;
    }
    .row {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .preview {
      width: 40px;
      height: 40px;
    }
    select {
      flex: 1;
      min-width: 0;
      cursor: pointer;
    }
  `,
})
export class IconField {
  protected readonly choices = ICON_CHOICES;

  readonly value = input<string>('');
  readonly label = input('Ícono');
  readonly disabled = input(false);
  readonly valueChange = output<string>();

  /** Nombres viejos o desconocidos ("piggy-bank") se muestran con su equivalente. */
  protected readonly current = computed(() => moduleIcon(this.value()));
}

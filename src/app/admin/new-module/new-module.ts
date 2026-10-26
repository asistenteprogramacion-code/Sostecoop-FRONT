import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ModuleTemplate, TEMPLATES, uniqueKey } from '../../core/modules';
import { Section } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { AdminApi, apiErrorMessage } from '../admin-api';
import { Toast } from '../toast';

@Component({
  selector: 'app-new-module',
  imports: [FormsModule, RouterLink, Icon],
  templateUrl: './new-module.html',
  styleUrl: './new-module.css',
})
export class NewModule {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(Toast);
  private readonly router = inject(Router);

  protected readonly templates = TEMPLATES;

  protected readonly name = signal('');
  protected readonly template = signal<ModuleTemplate>('tarjetas');
  protected readonly inMenu = signal(true);
  protected readonly visible = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal('');
  protected readonly touched = signal(false);

  private readonly existing = signal<Section[]>([]);

  /** Dirección que tendrá el módulo en la página, p. ej. #ahorro-escolar. */
  protected readonly key = computed(() =>
    uniqueKey(this.name(), this.existing().map((s) => s.key)),
  );
  protected readonly nameError = computed(() => {
    const name = this.name().trim();
    if (!name) return 'Escribe un nombre para el módulo.';
    if (name.length < 3) return 'Usa al menos 3 letras.';
    return '';
  });

  constructor() {
    this.api.sections().then(
      (list) => this.existing.set(list),
      () => {
        // Sin la lista se valida la clave en el backend al crear.
      },
    );
  }

  protected async create(): Promise<void> {
    this.touched.set(true);
    if (this.nameError() || this.saving()) return;
    this.saving.set(true);
    this.error.set('');

    const title = this.name().trim();
    const info = TEMPLATES.find((t) => t.id === this.template())!;
    const key = this.key();
    const position = Math.max(0, ...this.existing().map((s) => s.position)) + 1;

    try {
      await this.api.createSection({
        key,
        title,
        visible: this.visible(),
        position,
        content: info.starter(title),
      });
    } catch (err) {
      this.saving.set(false);
      this.error.set(
        err instanceof HttpErrorResponse && (err.status === 404 || err.status === 405)
          ? 'El servidor todavía no permite crear módulos. Falta que el backend agregue esa opción.'
          : apiErrorMessage(err, 'No se pudo crear el módulo.'),
      );
      return;
    }

    if (this.inMenu()) {
      try {
        await this.api.setInMenu('#' + key, title, true);
      } catch (err) {
        this.toast.error(apiErrorMessage(err, 'El módulo se creó, pero no se pudo agregar al menú.'));
      }
    }

    this.toast.ok(`Módulo «${title}» creado. Ahora edita su contenido.`);
    this.router.navigate(['/admin/secciones', key]);
  }
}

import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, computed, inject, signal } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { anchorOf, CORE_KEYS, MAX_MODULES } from '../../core/modules';
import { Section } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { AdminApi, apiErrorMessage, menuOf } from '../admin-api';
import { isModule, sectionDescription, sectionIcon, timeAgo } from '../section-meta';
import { Toast } from '../toast';

/** Secciones que la página muestra siempre en el mismo lugar. */
const TOP_KEY = 'hero';
const BOTTOM_KEY = 'contacto';
const SETTINGS_KEY = 'settings';

@Component({
  selector: 'app-sections-list',
  imports: [RouterLink, NgTemplateOutlet, CdkDropList, CdkDrag, CdkDragHandle, CdkDragPlaceholder, Icon],
  templateUrl: './sections-list.html',
  styleUrl: './sections-list.css',
})
export class SectionsList {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(Toast);

  private readonly sections = signal<Section[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  /** Claves que se están guardando, para deshabilitar sus controles. */
  protected readonly busy = signal<ReadonlySet<string>>(new Set());

  protected readonly settings = computed(() => this.sections().find((s) => s.key === SETTINGS_KEY));
  protected readonly top = computed(() => this.sections().find((s) => s.key === TOP_KEY));
  protected readonly bottom = computed(() => this.sections().find((s) => s.key === BOTTOM_KEY));
  /** Bloques del medio de la página, los únicos que se pueden reordenar. */
  protected readonly middle = computed(() =>
    this.sections().filter((s) => ![SETTINGS_KEY, TOP_KEY, BOTTOM_KEY].includes(s.key)),
  );
  protected readonly hiddenCount = computed(
    () => this.sections().filter((s) => s.key !== SETTINGS_KEY && !s.visible).length,
  );
  protected readonly moduleCount = computed(() => this.sections().filter((s) => isModule(s.key)).length);
  protected readonly canCreateModule = computed(() => this.moduleCount() < MAX_MODULES);
  protected readonly maxModules = MAX_MODULES;

  /** Anclas que ya están en el menú del sitio. */
  private readonly menuAnchors = computed(
    () => new Set(menuOf(this.settings()).map((i) => i.anchor)),
  );

  protected readonly icon = sectionIcon;
  protected readonly description = sectionDescription;
  protected readonly isModule = isModule;
  protected readonly isProtected = (key: string) => CORE_KEYS.has(key);
  protected readonly timeAgo = timeAgo;
  protected readonly skeletons = [1, 2, 3, 4, 5];

  constructor() {
    this.load();
  }

  protected inMenu(key: string): boolean {
    return this.menuAnchors().has('#' + anchorOf(key));
  }

  protected isBusy(key: string): boolean {
    return this.busy().has(key);
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    try {
      const list = await this.api.sections();
      this.sections.set([...list].sort((a, b) => a.position - b.position));
      this.error.set('');
    } catch (err) {
      this.error.set(apiErrorMessage(err, 'No se pudieron cargar las secciones.'));
    } finally {
      this.loading.set(false);
    }
  }

  protected async toggleVisible(section: Section, visible: boolean): Promise<void> {
    if (this.isProtected(section.key)) return;
    await this.save([section.key], async () => {
      const updated = await this.api.updateSection(section.key, { visible });
      this.replace(updated);
      this.toast.ok(visible ? `«${section.title}» ahora se ve en la página.` : `«${section.title}» quedó oculta.`);
    });
  }

  protected async drop(event: CdkDragDrop<Section[]>): Promise<void> {
    if (event.previousIndex === event.currentIndex) return;
    const previous = this.sections();
    const middle = [...this.middle()];
    moveItemInArray(middle, event.previousIndex, event.currentIndex);

    // Ajustes = 0, portada = 1; el medio sigue desde 2 y contacto queda al final.
    const changed = middle
      .map((s, i) => ({ s, position: i + 2 }))
      .filter(({ s, position }) => s.position !== position);
    this.sections.set(
      [
        ...previous.filter((s) => [SETTINGS_KEY, TOP_KEY].includes(s.key)),
        ...middle.map((s, i) => ({ ...s, position: i + 2 })),
        ...previous.filter((s) => s.key === BOTTOM_KEY),
      ],
    );

    await this.save(
      changed.map(({ s }) => s.key),
      async () => {
        const updated = await Promise.all(
          changed.map(({ s, position }) => this.api.updateSection(s.key, { position })),
        );
        updated.forEach((u) => this.replace(u));
        this.toast.ok('Orden guardado.');
      },
      () => this.sections.set(previous),
    );
  }

  private async save(keys: string[], run: () => Promise<void>, rollback?: () => void): Promise<void> {
    this.busy.update((b) => new Set([...b, ...keys]));
    try {
      await run();
    } catch (err) {
      rollback?.();
      this.toast.error(apiErrorMessage(err, 'No se pudo guardar el cambio.'));
    } finally {
      this.busy.update((b) => new Set([...b].filter((k) => !keys.includes(k))));
    }
  }

  private replace(updated: Section): void {
    this.sections.update((list) => list.map((s) => (s.key === updated.key ? updated : s)));
  }
}

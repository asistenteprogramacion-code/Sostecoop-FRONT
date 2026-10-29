import { HttpErrorResponse } from '@angular/common/http';
import {
  afterNextRender,
  Component,
  computed,
  effect,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { anchorOf, CORE_KEYS, slugify } from '../../core/modules';
import { REQUIRED_MENU_ANCHORS, withRequiredMenuItems } from '../../core/menu-defaults';
import { Section } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { AdminApi, apiErrorMessage, menuOf } from '../admin-api';
import { isModule, sectionDescription, sectionIcon, timeAgo } from '../section-meta';
import { Toast } from '../toast';
import { LinkCatalog } from './link-catalog';
import { ObjectFields } from './object-fields';
import { FieldErrors, validateContent } from './validation';

type SaveState = 'idle' | 'saving' | 'saved' | 'error';

@Component({
  selector: 'app-section-editor',
  imports: [FormsModule, RouterLink, ObjectFields, Icon],
  templateUrl: './section-editor.html',
  styleUrl: './section-editor.css',
  providers: [LinkCatalog],
  host: { '(window:beforeunload)': 'warnOnUnload($event)' },
})
export class SectionEditor {
  private readonly api = inject(AdminApi);
  private readonly toast = inject(Toast);
  private readonly router = inject(Router);
  private readonly injector = inject(Injector);
  private readonly fields = viewChild(ObjectFields);
  private readonly links = inject(LinkCatalog);

  protected readonly icon = sectionIcon;
  protected readonly description = sectionDescription;
  protected readonly timeAgo = timeAgo;

  /** :key de la ruta. */
  readonly key = input.required<string>();

  protected readonly section = signal<Section | null>(null);
  protected readonly loading = signal(true);
  protected readonly notFound = signal(false);
  protected readonly loadError = signal('');

  /** Copia de trabajo: el content se edita en su lugar y se envía completo. */
  protected readonly content = signal<Record<string, unknown>>({});
  protected readonly hasFields = computed(() => Object.keys(this.content()).length > 0);
  protected readonly newsCategories = computed(() => {
    this.version();
    return newsCategoriesOf(this.content());
  });
  protected readonly title = signal('');
  protected readonly visible = signal(true);
  protected readonly dirty = signal(false);

  protected readonly saveState = signal<SaveState>('idle');
  protected readonly saveError = signal('');
  protected readonly savedAt = signal('');
  /** Confirmación en línea antes de descartar cambios. */
  protected readonly confirmingDiscard = signal(false);

  /** Sube con cada cambio: el content se edita en su lugar y así se recalcula la validación. */
  private readonly version = signal(0);
  /** Los errores se muestran después del primer intento de guardar. */
  protected readonly showErrors = signal(false);
  private readonly allErrors = computed<FieldErrors>(() => {
    this.version();
    const key = this.section()?.key;
    return key ? validateContent(key, this.content(), this.links.valid()) : {};
  });
  protected readonly errors = computed<FieldErrors>(() => (this.showErrors() ? this.allErrors() : {}));
  protected readonly errorCount = computed(() => Object.keys(this.errors()).length);

  /** Si la sección tiene enlace en el menú del sitio (settings.menu). */
  protected readonly inMenu = signal(false);
  protected readonly menuBusy = signal(false);
  protected readonly visibleBusy = signal(false);
  /** Ajustes generales no se muestran ni ocultan: solo se editan. */
  protected readonly isSettings = computed(() => this.section()?.key === 'settings');
  protected readonly menuLinkRequired = computed(() => {
    const key = this.section()?.key;
    return !!key && REQUIRED_MENU_ANCHORS.has('#' + anchorOf(key));
  });

  protected readonly deletable = computed(() => isModule(this.section()?.key ?? 'settings'));
  protected readonly confirmingDelete = signal(false);
  protected readonly deleting = signal(false);

  /** Dónde ver la sección en el sitio público. */
  protected readonly siteLink = computed(() => {
    const key = this.section()?.key ?? '';
    if (key === 'noticias') return { path: '/noticias', fragment: undefined };
    if (key === 'settings') return { path: '/', fragment: undefined };
    return { path: '/', fragment: anchorOf(key) };
  });

  constructor() {
    effect(() => {
      this.load(this.key());
    });
  }

  protected markDirty(): void {
    this.dirty.set(true);
    this.version.update((v) => v + 1);
    if (this.saveState() === 'saved') this.saveState.set('idle');
  }

  protected async save(): Promise<void> {
    const section = this.section();
    if (!section || this.saveState() === 'saving') return;
    if (section.key === 'noticias') normalizeNews(this.content());
    this.version.update((v) => v + 1);

    const count = Object.keys(this.allErrors()).length;
    if (count) {
      this.showErrors.set(true);
      this.saveError.set(
        count === 1 ? 'Hay 1 campo por revisar.' : `Hay ${count} campos por revisar.`,
      );
      this.saveState.set('error');
      this.revealFirstError();
      return;
    }

    this.saveState.set('saving');
    this.saveError.set('');
    try {
      const updated = await this.api.updateSection(section.key, {
        title: this.title().trim() || section.title,
        content: section.key === 'noticias' ? newsContentForSave(this.content()) : this.content(),
      });
      // Si cambió el nombre y está en el menú, el menú muestra el nombre nuevo.
      if (updated.title !== section.title && this.inMenu()) {
        await this.api
          .setInMenu('#' + anchorOf(section.key), updated.title, true)
          .catch(() => this.toast.error('Se guardó, pero el menú sigue con el nombre anterior.'));
      }
      this.reset(updated);
      this.savedAt.set(new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
      this.saveState.set('saved');
      this.toast.ok(
        updated.visible || this.isSettings() || !this.deletable()
          ? 'Cambios guardados. Ya se ven en la página.'
          : 'Cambios guardados. La sección sigue oculta.',
      );
    } catch (err) {
      this.saveError.set(apiErrorMessage(err, 'No se pudieron guardar los cambios.'));
      this.saveState.set('error');
    }
  }

  protected discard(): void {
    const section = this.section();
    if (section) this.reset(section);
  }

  /** Abre los elementos con errores y lleva la vista al primer campo marcado. */
  private revealFirstError(): void {
    this.fields()?.openItemsWithErrors(this.allErrors());
    afterNextRender(
      () => {
        const field = document.querySelector<HTMLElement>('app-section-editor .invalid');
        field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        field?.querySelector<HTMLElement>('input, textarea')?.focus({ preventScroll: true });
      },
      { injector: this.injector },
    );
  }

  protected reload(): void {
    this.load(this.key());
  }

  /** Mostrar u ocultar se guarda al instante, sin tocar los cambios pendientes del formulario. */
  protected async toggleVisible(value: boolean): Promise<void> {
    const section = this.section();
    if (!section || this.visibleBusy()) return;
    if (!value && CORE_KEYS.has(section.key)) return;
    this.visibleBusy.set(true);
    try {
      const updated = await this.api.updateSection(section.key, { visible: value });
      this.section.set({ ...section, visible: updated.visible, updated_at: updated.updated_at });
      this.visible.set(updated.visible);
      this.toast.ok(value ? 'La sección ya se ve en la página.' : 'La sección quedó oculta.');
    } catch (err) {
      this.visible.set(section.visible);
      this.toast.error(apiErrorMessage(err, 'No se pudo cambiar la visibilidad.'));
    } finally {
      this.visibleBusy.set(false);
    }
  }

  protected async toggleMenu(value: boolean): Promise<void> {
    const section = this.section();
    if (!section || this.menuBusy()) return;
    if (!value && this.menuLinkRequired()) return;
    this.menuBusy.set(true);
    try {
      await this.api.setInMenu('#' + anchorOf(section.key), this.title().trim() || section.title, value);
      this.inMenu.set(value);
      this.toast.ok(value ? `«${section.title}» se agregó al menú.` : `«${section.title}» se quitó del menú.`);
    } catch (err) {
      this.toast.error(apiErrorMessage(err, 'No se pudo actualizar el menú.'));
    } finally {
      this.menuBusy.set(false);
    }
  }

  protected async deleteModule(): Promise<void> {
    const section = this.section();
    if (!section || !isModule(section.key) || this.deleting()) return;
    if (this.inMenu()) {
      this.toast.error('Primero quita este enlace del menú; después podrás borrar el módulo.');
      return;
    }
    this.deleting.set(true);
    try {
      await this.api.deleteSection(section.key);
    } catch (err) {
      this.deleting.set(false);
      this.confirmingDelete.set(false);
      this.toast.error(
        err instanceof HttpErrorResponse && (err.status === 404 || err.status === 405)
          ? 'El servidor todavía no permite borrar módulos. Mientras tanto puedes ocultarlo.'
          : apiErrorMessage(err, 'No se pudo borrar el módulo.'),
      );
      return;
    }
    this.dirty.set(false);
    this.toast.ok(`Módulo «${section.title}» borrado.`);
    this.router.navigateByUrl('/admin/secciones');
  }

  /** Usado por el guard de salida de la ruta. */
  canLeave(): boolean {
    return !this.dirty() || confirm('Tienes cambios sin guardar. ¿Salir de todos modos?');
  }

  protected warnOnUnload(event: BeforeUnloadEvent): void {
    if (this.dirty()) event.preventDefault();
  }

  private async load(key: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    this.loadError.set('');
    try {
      const all = await this.api.sections();
      this.links.set(all);
      const section = all.find((s) => s.key === key);
      const anchor = '#' + anchorOf(key);
      this.inMenu.set(menuOf(all.find((s) => s.key === 'settings')).some((i) => i.anchor === anchor));
      if (section) this.reset(section);
      else this.notFound.set(true);
    } catch (err) {
      this.loadError.set(apiErrorMessage(err, 'No se pudo cargar la sección.'));
    } finally {
      this.loading.set(false);
    }
  }

  private reset(section: Section): void {
    this.section.set(section);
    const content = structuredClone(section.content ?? {});
    if (section.key === 'noticias' && Array.isArray(content['items'])) {
      for (const item of content['items']) {
        if (item && typeof item === 'object' && !Array.isArray(item) && !('active' in item)) {
          (item as Record<string, unknown>)['active'] = true;
        }
      }
    }
    if (section.key === 'settings') {
      content['menu'] = withRequiredMenuItems(content['menu']);
      const social = content['social'];
      if (social && typeof social === 'object' && !Array.isArray(social)) {
        const whatsapp = (social as Record<string, unknown>)['whatsapp'];
        if (typeof whatsapp === 'string') {
          let digits = whatsapp.replace(/\D/g, '');
          // Los datos anteriores guardaban el indicativo colombiano (+57).
          if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
          (social as Record<string, unknown>)['whatsapp'] = digits.slice(0, 10);
        }
      }
    }
    this.content.set(content);
    this.title.set(section.title);
    this.visible.set(section.visible);
    this.dirty.set(false);
    this.confirmingDiscard.set(false);
    this.confirmingDelete.set(false);
    this.showErrors.set(false);
    this.saveError.set('');
    this.version.update((v) => v + 1);
    this.saveState.set('idle');
  }
}

/** Completa las direcciones vacías de las noticias y evita que se repitan. */
function normalizeNews(content: Record<string, unknown>): void {
  const items = content['items'];
  if (!Array.isArray(items)) return;
  const used = new Set<string>();
  for (const item of items as Record<string, unknown>[]) {
    const base = slugify(String(item['slug'] || item['title'] || '')) || 'noticia';
    let slug = base;
    for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
    used.add(slug);
    item['slug'] = slug;
    item['reading_minutes'] = Number(item['reading_minutes']) || 0;
  }
}

/** Envía la lista completa conservando id y active; created_at lo controla el backend. */
function newsContentForSave(content: Record<string, unknown>): Record<string, unknown> {
  const items = content['items'];
  if (!Array.isArray(items)) return content;
  return {
    ...content,
    items: items.map((item) => {
      if (!item || typeof item !== 'object' || Array.isArray(item)) return item;
      const { created_at: _createdAt, ...news } = item as Record<string, unknown>;
      return news;
    }),
  };
}

const DEFAULT_NEWS_CATEGORIES = ['Educación financiera', 'Cooperativa', 'Consejos'];

function newsCategoriesOf(content: Record<string, unknown>): string[] {
  const stored = Array.isArray(content['categories']) ? content['categories'] : [];
  const items = Array.isArray(content['items']) ? content['items'] : [];
  const used = items
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object' && !Array.isArray(item))
    .map((item) => item['category']);
  const candidates = [...stored, ...used];
  if (!Array.isArray(content['categories']) && !candidates.length) candidates.push(...DEFAULT_NEWS_CATEGORIES);

  const unique = new Map<string, string>();
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue;
    const category = candidate.trim().slice(0, 40);
    if (category && !unique.has(category.toLocaleLowerCase())) unique.set(category.toLocaleLowerCase(), category);
  }
  return [...unique.values()];
}

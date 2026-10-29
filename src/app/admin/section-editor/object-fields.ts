import { afterNextRender, Component, DestroyRef, ElementRef, inject, Injector, input, output, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../shared/icon';
import { MAX_MENU_ITEMS, REQUIRED_MENU_ANCHORS } from '../../core/menu-defaults';
import {
  addsAtTop,
  fieldHint,
  fieldKind,
  fieldLabel,
  fieldPlaceholder,
  isHiddenField,
  isShortField,
  listLabel,
  newItem,
} from './field-meta';
import { IconField } from './icon-field';
import { ImageField } from './image-field';
import { LinkField } from './link-field';
import { errorsUnder, FieldErrors } from './validation';

type Obj = Record<string, unknown>;

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Formulario generado a partir de un objeto de content. Edita el objeto en
 * su lugar y avisa con (changed); se usa de forma recursiva para listas y grupos.
 */
@Component({
  selector: 'app-object-fields',
  imports: [FormsModule, ImageField, LinkField, IconField, Icon],
  templateUrl: './object-fields.html',
  styleUrl: './object-fields.css',
})
export class ObjectFields {
  private static readonly NEWS_ITEMS_KEY = 'items';
  private static readonly NEWS_EDIT_WINDOW_MS = 72 * 60 * 60 * 1000;
  readonly obj = input.required<Obj>();
  readonly sectionKey = input.required<string>();
  readonly newsCategories = input<readonly string[]>([]);
  /** Ruta de este objeto dentro del content ("items.2."), para ubicar sus errores. */
  readonly path = input('');
  readonly readOnly = input(false);
  readonly errors = input<FieldErrors>({});
  readonly changed = output<void>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly injector = inject(Injector);
  private readonly categoryDialog = viewChild<ElementRef<HTMLDialogElement>>('categoryDialog');

  protected readonly label = fieldLabel;
  protected readonly hint = fieldHint;
  protected readonly placeholder = fieldPlaceholder;
  protected readonly kind = fieldKind;
  protected readonly short = isShortField;

  /** Elementos de lista abiertos, como "items:2". Los demás se ven plegados. */
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());
  protected readonly now = signal(Date.now());

  constructor() {
    afterNextRender(() => {
      const timer = window.setInterval(() => this.now.set(Date.now()), 60_000);
      this.destroyRef.onDestroy(() => window.clearInterval(timer));
    });
  }

  protected listName(key: string): string {
    return listLabel(this.sectionKey(), key);
  }

  /** Texto del botón para agregar: "Agregar noticia", "Agregar pregunta"… */
  protected addText(key: string): string {
    const nouns: Record<string, string> = {
      Noticias: 'noticia',
      Servicios: 'servicio',
      Beneficios: 'beneficio',
      Testimonios: 'testimonio',
      Preguntas: 'pregunta',
      'Enlaces del menú': 'enlace al menú',
    };
    return `Agregar ${nouns[this.listName(key)] ?? 'elemento'}`;
  }

  protected canAdd(key: string): boolean {
    return !(this.sectionKey() === 'settings' && key === 'menu') || this.list(key).length < MAX_MENU_ITEMS;
  }

  protected isNewsList(key: string): boolean {
    return this.sectionKey() === 'noticias' && key === ObjectFields.NEWS_ITEMS_KEY;
  }

  protected newsEntries(key: string): { item: unknown; index: number }[] {
    const activeTab = this.newsTab();
    return this.list(key)
      .map((item, index) => ({ item, index }))
      .filter(({ item }) => this.newsIsActive(item) === (activeTab === 'active'));
  }

  protected entries(key: string): { item: unknown; index: number }[] {
    return this.isNewsList(key)
      ? this.newsEntries(key)
      : this.list(key).map((item, index) => ({ item, index }));
  }

  protected readonly newsTab = signal<'active' | 'inactive'>('active');

  protected newsIsActive(item: unknown): boolean {
    return !this.isObj(item) || (item as Obj)['active'] !== false;
  }

  protected isNewsEditLocked(item: unknown): boolean {
    const createdAt = this.newsCreatedAt(item);
    if (createdAt === null) return this.newsHasBeenSaved(item);
    return this.now() - createdAt >= ObjectFields.NEWS_EDIT_WINDOW_MS;
  }

  protected newsEditMessage(item: unknown): string {
    const createdAt = this.newsCreatedAt(item);
    if (createdAt === null) {
      return this.newsHasBeenSaved(item)
        ? 'Edición bloqueada: el servidor no entregó la fecha de creación.'
        : 'El plazo de edición de 3 días empieza cuando guardes esta noticia.';
    }

    const remaining = createdAt + ObjectFields.NEWS_EDIT_WINDOW_MS - this.now();
    if (remaining <= 0) return 'Terminó el plazo de edición. El contenido está bloqueado, pero puedes activar o desactivar esta noticia cuando quieras.';
    const hoursTotal = Math.ceil(remaining / (60 * 60 * 1000));
    const days = Math.floor(hoursTotal / 24);
    const hours = hoursTotal % 24;
    if (days && hours) return `Edición disponible: ${days} d ${hours} h más.`;
    if (days) return `Edición disponible: ${days} ${days === 1 ? 'día' : 'días'} más.`;
    return `Edición disponible: ${hoursTotal} ${hoursTotal === 1 ? 'hora' : 'horas'} más.`;
  }

  private newsHasBeenSaved(item: unknown): boolean {
    return this.isObj(item) && typeof (item as Obj)['slug'] === 'string' && !!String((item as Obj)['slug']).trim();
  }

  private newsCreatedAt(item: unknown): number | null {
    if (!this.isObj(item)) return null;
    const value = (item as Obj)['created_at'];
    if (typeof value !== 'string' || !value.trim()) return null;
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) ? timestamp : null;
  }

  protected newsCount(key: string, active: boolean): number {
    return this.list(key).filter((item) => this.newsIsActive(item) === active).length;
  }

  protected setNewsTab(tab: 'active' | 'inactive'): void {
    this.newsTab.set(tab);
  }

  protected readonly categoryDraft = signal('');
  protected readonly categoryModalOpen = signal(false);

  protected openCategoryManager(): void {
    if (this.readOnly() || this.categoryModalOpen()) return;
    this.categoryModalOpen.set(true);
    afterNextRender(() => {
      const dialog = this.categoryDialog()?.nativeElement;
      if (dialog && !dialog.open) dialog.showModal();
    }, { injector: this.injector });
  }

  protected closeCategoryManager(): void {
    this.categoryDialog()?.nativeElement.close();
    this.categoryModalOpen.set(false);
  }

  protected onCategoryDialogClose(): void {
    this.categoryModalOpen.set(false);
  }

  protected onCategoryDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeCategoryManager();
  }

  protected canAddCategory(): boolean {
    const value = this.categoryDraft().trim();
    return !!value && value.length <= 40 && !this.newsCategories().some((category) => category.toLocaleLowerCase() === value.toLocaleLowerCase());
  }

  protected addCategory(): void {
    const value = this.categoryDraft().trim().slice(0, 40);
    if (!value || !this.canAddCategory() || this.readOnly()) return;
    this.obj()['categories'] = [...this.newsCategories(), value];
    this.categoryDraft.set('');
    this.changed.emit();
  }

  protected categoryUsage(category: string): number {
    const items = this.obj()['items'];
    if (!Array.isArray(items)) return 0;
    return items.filter(
      (item) => this.isObj(item) && String((item as Obj)['category'] ?? '').trim().toLocaleLowerCase() === category.toLocaleLowerCase(),
    ).length;
  }

  protected removeCategory(category: string): void {
    if (this.readOnly() || this.categoryUsage(category)) return;
    this.obj()['categories'] = this.newsCategories().filter((item) => item.toLocaleLowerCase() !== category.toLocaleLowerCase());
    this.changed.emit();
  }

  protected toggleNewsActive(key: string, index: number): void {
    if (!this.isNewsList(key)) return;
    const item = this.list(key)[index];
    if (!this.isObj(item)) return;
    (item as Obj)['active'] = !this.newsIsActive(item);
    this.changed.emit();
  }

  protected keys(): string[] {
    return Object.keys(this.obj()).filter(
      (key) => !isHiddenField(key) && !(this.sectionKey() === 'noticias' && key === 'active'),
    );
  }

  protected list(key: string): unknown[] {
    return this.obj()[key] as unknown[];
  }

  protected asObj(value: unknown): Obj {
    return value as Obj;
  }

  protected isObj(value: unknown): boolean {
    return !!value && typeof value === 'object' && !Array.isArray(value);
  }

  protected isRequiredMenuItem(key: string, item: unknown): boolean {
    return (
      this.sectionKey() === 'settings' &&
      key === 'menu' &&
      this.isObj(item) &&
      REQUIRED_MENU_ANCHORS.has(String((item as Obj)['anchor']))
    );
  }

  protected isRequiredMenuAnchor(key: string): boolean {
    return (
      this.sectionKey() === 'settings' &&
      key === 'anchor' &&
      this.path().startsWith('menu.') &&
      REQUIRED_MENU_ANCHORS.has(String(this.obj()['anchor']))
    );
  }

  protected error(key: string): string {
    return this.errors()[this.path() + key] ?? '';
  }

  protected itemErrors(key: string, index: number): number {
    return errorsUnder(this.errors(), `${this.path()}${key}.${index}.`);
  }

  /** Título corto de un elemento de lista, para reconocerlo sin abrirlo. */
  protected itemTitle(item: unknown): string {
    if (!this.isObj(item)) return '';
    const obj = item as Obj;
    const value = obj['title'] ?? obj['question'] ?? obj['name'] ?? obj['label'];
    return typeof value === 'string' ? value : '';
  }

  /** Dato secundario del elemento plegado: fecha y categoría, enlace o inicio del texto. */
  protected itemMeta(item: unknown): string {
    if (!this.isObj(item)) return '';
    const obj = item as Obj;
    const date = typeof obj['date'] === 'string' ? formatDate(obj['date']) : '';
    const category = typeof obj['category'] === 'string' ? obj['category'] : '';
    if (date || category) return [date, category].filter(Boolean).join(' · ');
    if (typeof obj['anchor'] === 'string') return obj['anchor'];
    const text = obj['text'] ?? obj['answer'];
    return typeof text === 'string' ? text : '';
  }

  protected isOpen(key: string, index: number): boolean {
    return this.expanded().has(`${key}:${index}`);
  }

  protected toggle(key: string, index: number): void {
    const indices = [index];
    if (this.sectionKey() === 'settings' && key === 'menu') {
      const partner = index % 2 === 0 ? index + 1 : index - 1;
      if (partner >= 0 && partner < this.list(key).length) indices.push(partner);
    }
    const open = !this.isOpen(key, index);
    this.expanded.update((set) => {
      const next = new Set(set);
      for (const itemIndex of indices) {
        const id = `${key}:${itemIndex}`;
        if (open) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  }

  protected setAll(key: string, open: boolean): void {
    const ids = this.list(key).map((_, i) => `${key}:${i}`);
    this.expanded.update((set) => {
      const next = new Set([...set].filter((id) => !id.startsWith(key + ':')));
      if (open) ids.forEach((id) => next.add(id));
      return next;
    });
  }

  /** Abre los elementos que tienen errores (lo llama el editor al intentar guardar). */
  openItemsWithErrors(errors: FieldErrors): void {
    const next = new Set(this.expanded());
    for (const key of this.keys()) {
      const value = this.obj()[key];
      if (!Array.isArray(value)) continue;
      value.forEach((_, i) => {
        if (errorsUnder(errors, `${this.path()}${key}.${i}.`)) next.add(`${key}:${i}`);
      });
    }
    this.expanded.set(next);
  }

  protected set(key: string, value: unknown): void {
    if (this.readOnly()) return;
    this.obj()[key] = value;
    this.changed.emit();
  }

  protected setDigitsOnly(key: string, value: string): void {
    this.set(key, value.replace(/\D/g, '').slice(0, 10));
  }

  protected setItem(key: string, index: number, value: unknown): void {
    if (this.readOnly()) return;
    this.list(key)[index] = value;
    this.changed.emit();
  }

  protected add(key: string): void {
    if (!this.canAdd(key) || this.readOnly()) return;
    const items = this.list(key);
    const item = newItem(this.sectionKey(), key, items);
    if (this.isNewsList(key)) {
      this.newsTab.set('active');
      if (this.isObj(item)) (item as Obj)['active'] = true;
    }
    const atTop = addsAtTop(this.sectionKey(), key);
    if (atTop) {
      items.unshift(item);
      this.shiftExpanded(key, 0, 1);
    } else {
      items.push(item);
    }
    const index = atTop ? 0 : items.length - 1;
    this.expanded.update((set) => new Set([...set, `${key}:${index}`]));
    this.changed.emit();
  }

  protected remove(key: string, index: number): void {
    if (this.isNewsList(key) || this.readOnly()) return;
    if (this.isRequiredMenuItem(key, this.list(key)[index])) return;
    this.list(key).splice(index, 1);
    this.expanded.update((set) => new Set([...set].filter((id) => id !== `${key}:${index}`)));
    this.shiftExpanded(key, index + 1, -1);
    this.changed.emit();
  }

  protected move(key: string, index: number, delta: number): void {
    if (this.isNewsList(key) || this.readOnly()) return;
    const items = this.list(key);
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    [items[index], items[target]] = [items[target], items[index]];
    // El estado abierto/cerrado viaja con el elemento.
    const a = this.isOpen(key, index);
    const b = this.isOpen(key, target);
    this.expanded.update((set) => {
      const next = new Set(set);
      next.delete(`${key}:${index}`);
      next.delete(`${key}:${target}`);
      if (a) next.add(`${key}:${target}`);
      if (b) next.add(`${key}:${index}`);
      return next;
    });
    this.changed.emit();
  }

  /** Corre los índices abiertos desde `from` cuando se agrega o quita un elemento. */
  private shiftExpanded(key: string, from: number, delta: number): void {
    this.expanded.update((set) => {
      const next = new Set<string>();
      for (const id of set) {
        const [k, i] = id.split(':');
        const n = Number(i);
        next.add(k === key && n >= from ? `${k}:${n + delta}` : id);
      }
      return next;
    });
  }
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return y && m && d ? `${Number(d)} ${MONTHS[Number(m) - 1] ?? ''} ${y}` : '';
}

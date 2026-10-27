import { Component, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../shared/icon';
import { REQUIRED_MENU_ANCHORS } from '../../core/menu-defaults';
import {
  addsAtTop,
  fieldHint,
  fieldKind,
  fieldLabel,
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
  readonly obj = input.required<Obj>();
  readonly sectionKey = input.required<string>();
  /** Ruta de este objeto dentro del content ("items.2."), para ubicar sus errores. */
  readonly path = input('');
  readonly errors = input<FieldErrors>({});
  readonly changed = output<void>();

  protected readonly label = fieldLabel;
  protected readonly hint = fieldHint;
  protected readonly kind = fieldKind;
  protected readonly short = isShortField;

  /** Elementos de lista abiertos, como "items:2". Los demás se ven plegados. */
  protected readonly expanded = signal<ReadonlySet<string>>(new Set());

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

  protected keys(): string[] {
    return Object.keys(this.obj()).filter((k) => !isHiddenField(k));
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
    const id = `${key}:${index}`;
    this.expanded.update((set) => {
      const next = new Set(set);
      if (next.has(id)) next.delete(id);
      else next.add(id);
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
    this.obj()[key] = value;
    this.changed.emit();
  }

  protected setItem(key: string, index: number, value: unknown): void {
    this.list(key)[index] = value;
    this.changed.emit();
  }

  protected add(key: string): void {
    const items = this.list(key);
    const item = newItem(this.sectionKey(), key, items);
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
    if (this.isRequiredMenuItem(key, this.list(key)[index])) return;
    this.list(key).splice(index, 1);
    this.expanded.update((set) => new Set([...set].filter((id) => id !== `${key}:${index}`)));
    this.shiftExpanded(key, index + 1, -1);
    this.changed.emit();
  }

  protected move(key: string, index: number, delta: number): void {
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

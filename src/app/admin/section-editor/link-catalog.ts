import { computed, Injectable, signal } from '@angular/core';
import { anchorOf, slugify } from '../../core/modules';
import { Section } from '../../core/site-content';

export interface LinkOption {
  value: string;
  label: string;
}

export interface LinkGroup {
  label: string;
  options: LinkOption[];
}

/**
 * Destinos a los que puede llevar un botón o un enlace del menú: secciones de la
 * página principal, el catálogo de noticias y cada noticia. Lo llena el editor.
 */
@Injectable()
export class LinkCatalog {
  private readonly sections = signal<Section[]>([]);

  readonly groups = computed<LinkGroup[]>(() => {
    const all = this.sections();
    const byKey = (key: string) => all.find((s) => s.key === key);
    const label = (s: Section) => s.title + (s.visible ? '' : ' (oculta)');

    const page: LinkOption[] = [];
    const hero = byKey('hero');
    if (hero) page.push({ value: '#inicio', label: 'Portada (inicio de la página)' });
    all
      .filter((s) => !['settings', 'hero', 'contacto'].includes(s.key))
      .sort((a, b) => a.position - b.position)
      .forEach((s) => page.push({ value: '#' + anchorOf(s.key), label: label(s) }));
    const contact = byKey('contacto');
    if (contact) page.push({ value: '#contacto', label: label(contact) });

    const pages: LinkOption[] = [{ value: '/noticias', label: 'Todas las noticias' }];
    const items = byKey('noticias')?.content['items'];
    if (Array.isArray(items)) {
      for (const item of items as Record<string, unknown>[]) {
        const title = String(item['title'] ?? '').trim();
        const slug = String(item['slug'] || slugify(title));
        if (title && slug) pages.push({ value: `/noticias/${slug}`, label: `Noticia: ${title}` });
      }
    }

    return [
      { label: 'Secciones de la página principal', options: page },
      { label: 'Otras páginas', options: pages },
    ];
  });

  /** Destinos internos que existen (para validar enlaces viejos o rotos). */
  readonly valid = computed(
    () => new Set(this.groups().flatMap((g) => g.options.map((o) => o.value))),
  );

  set(sections: Section[]): void {
    this.sections.set(sections);
  }

  labelFor(value: string): string {
    for (const group of this.groups()) {
      const option = group.options.find((o) => o.value === value);
      if (option) return option.label;
    }
    return '';
  }
}

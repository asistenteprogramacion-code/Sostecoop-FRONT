import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { resolveImage } from '../../core/api';
import { DEFAULT_IMAGES } from '../../core/content-defaults';
import { anchorOf, moduleIcon, templateOf } from '../../core/modules';
import { Section } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';

type Item = Record<string, unknown>;

/**
 * Sección creada desde el panel (o sin diseño propio, como servicios o faq).
 * Se pinta con la plantilla guardada en content.template.
 */
@Component({
  selector: 'app-module',
  imports: [RouterLink, Icon, Reveal],
  templateUrl: './module.html',
  styleUrl: './module.css',
})
export class ModuleSection {
  readonly section = input.required<Section>();

  protected readonly id = computed(() => anchorOf(this.section().key));
  protected readonly template = computed(() => templateOf(this.section().content));
  protected readonly title = computed(() => this.text('title') || this.section().title);
  protected readonly subtitle = computed(() => this.text('subtitle'));
  protected readonly body = computed(() =>
    this.text('text')
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  );
  protected readonly image = computed(() =>
    resolveImage(this.text('image_url'), DEFAULT_IMAGES.about),
  );
  protected readonly items = computed(() => {
    const items = this.section().content['items'];
    return Array.isArray(items) ? (items as Item[]) : [];
  });

  /** Botón del módulo de texto: ancla de la landing (#x) o ruta interna (/x). */
  protected readonly cta = computed(() => {
    const label = this.text('cta_label');
    const anchor = this.text('cta_anchor') || '#contacto';
    if (!label) return null;
    if (/^https?:\/\//.test(anchor)) return { label, external: anchor, path: null, fragment: null };
    const [path, fragment] = anchor.startsWith('#') ? ['/', anchor.slice(1)] : anchor.split('#');
    return { label, external: null, path: path || '/', fragment: fragment ?? null };
  });

  protected readonly icon = moduleIcon;

  protected str(item: Item, key: string): string {
    const value = item[key];
    return typeof value === 'string' ? value : '';
  }

  protected photo(item: Item): string {
    return resolveImage(this.str(item, 'photo_url'), '');
  }

  protected initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() || '?';
  }

  private text(key: string): string {
    const value = this.section().content[key];
    return typeof value === 'string' ? value.trim() : '';
  }
}

import { afterNextRender, Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MenuLink, siteMenu } from '../../core/menu';
import { SiteContent } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';

@Component({
  selector: 'app-header',
  imports: [RouterLink, Icon, Logo],
  templateUrl: './header.html',
  styleUrl: './header.css',
  host: {
    '[class.scrolled]': 'scrolled()',
    '[class.menu-open]': 'menuOpen()',
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeMenus()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class Header {
  /** Fuera de la landing (p. ej. una noticia) fija el enlace activo en vez de seguir el scroll. */
  readonly section = input<string | null>(null);

  /** Menú editable desde el panel (Ajustes generales → Menú). */
  protected readonly links = siteMenu(inject(SiteContent));
  // Reserva espacio para la marca y el botón de contacto en el encabezado.
  // A partir del séptimo enlace, los restantes se muestran en el desplegable.
  protected readonly mainLinks = computed(() => this.links().slice(0, 6));
  protected readonly overflowLinks = computed(() => this.links().slice(6));

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
  protected readonly overflowOpen = signal(false);
  protected readonly overflowActive = computed(() => this.overflowLinks().some((link) => this.isActive(link)));
  /** Sección visible en pantalla, para resaltar su enlace. */
  private readonly spied = signal('inicio');

  constructor() {
    afterNextRender(() => this.onScroll());
  }

  protected isActive(link: MenuLink): boolean {
    return link.path === '/' && link.fragment === (this.section() ?? this.spied());
  }

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 12);
    if (this.section()) return;
    // Se consulta en cada scroll porque el admin puede ocultar o mostrar secciones en vivo.
    const line = window.innerHeight * 0.45;
    const atBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 4;
    let current = 'inicio';

    // El orden del menú lo decide el usuario; para detectar la sección activa
    // usamos el orden real de las secciones en la página, no el de los enlaces.
    const sections = this.links()
      .filter((link) => link.fragment && link.path === '/')
      .map((link) => ({ fragment: link.fragment!, element: document.getElementById(link.fragment!) }))
      .filter((item): item is { fragment: string; element: HTMLElement } => !!item.element)
      .sort((a, b) =>
        a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );

    if (atBottom && sections.length) {
      current = sections[sections.length - 1].fragment;
    } else {
      for (const section of sections) {
        if (section.element.getBoundingClientRect().top <= line) current = section.fragment;
      }
    }
    this.spied.set(current);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected toggleOverflow(): void {
    this.overflowOpen.update((open) => !open);
  }

  protected closeMenus(): void {
    this.menuOpen.set(false);
    this.overflowOpen.set(false);
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!(event.target instanceof Element) || !event.target.closest('.overflow-menu')) {
      this.overflowOpen.set(false);
    }
  }
}

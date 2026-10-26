import { afterNextRender, Component, inject, input, signal } from '@angular/core';
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
    '(document:keydown.escape)': 'menuOpen.set(false)',
  },
})
export class Header {
  /** Fuera de la landing (p. ej. una noticia) fija el enlace activo en vez de seguir el scroll. */
  readonly section = input<string | null>(null);

  /** Menú editable desde el panel (Ajustes generales → Menú). */
  protected readonly links = siteMenu(inject(SiteContent));

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);
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
    for (const link of this.links()) {
      if (!link.fragment || link.path !== '/') continue;
      const el = document.getElementById(link.fragment);
      if (el && (atBottom || el.getBoundingClientRect().top <= line)) current = link.fragment;
    }
    this.spied.set(current);
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}

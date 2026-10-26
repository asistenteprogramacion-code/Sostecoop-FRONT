import { ViewportScroller } from '@angular/common';
import { Component, computed, effect, inject, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Section, SiteContent } from '../core/site-content';
import { About } from '../sections/about/about';
import { Contact } from '../sections/contact/contact';
import { Footer } from '../sections/footer/footer';
import { Header } from '../sections/header/header';
import { Hero } from '../sections/hero/hero';
import { ModuleSection } from '../sections/module/module';
import { News } from '../sections/news/news';
import { TrustStrip } from '../sections/trust-strip/trust-strip';

/** Van siempre en su lugar: el hero arriba y contacto al final. */
const FIXED_KEYS = new Set(['settings', 'hero', 'contacto']);

@Component({
  selector: 'app-landing',
  imports: [Header, Hero, TrustStrip, About, News, ModuleSection, Contact, Footer],
  providers: [SiteContent],
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    <app-header />
    <main id="contenido" tabindex="-1">
      <app-hero />
      <app-trust-strip />
      @for (item of middle(); track item.key) {
        @switch (item.key) {
          @case ('nosotros') { <app-about /> }
          @case ('noticias') { <app-news /> }
          @default { <app-module [section]="item.section!" /> }
        }
      }
      <app-contact />
    </main>
    <app-footer />
  `,
  styles: `
    :host {
      display: block;
    }
    main:focus {
      outline: none;
    }
  `,
})
export class Landing {
  private readonly content = inject(SiteContent);

  /**
   * Secciones entre el hero y contacto, en el orden que define el panel.
   * Mientras carga la API se muestran las del diseño.
   */
  protected readonly middle = computed<{ key: string; section?: Section }[]>(() =>
    this.content.loaded()
      ? this.content
          .list()
          .filter((s) => !FIXED_KEYS.has(s.key))
          .map((s) => ({ key: s.key, section: s }))
      : [{ key: 'nosotros' }, { key: 'noticias' }],
  );

  constructor() {
    const content = this.content;
    const route = inject(ActivatedRoute);
    const scroller = inject(ViewportScroller);

    // Al llegar con /#seccion, el router baja antes de que cargue la API; cuando el
    // contenido real cambia el alto de las secciones, se vuelve a ajustar una vez.
    let adjusted = false;
    effect(() => {
      if (!content.loaded() || adjusted) return;
      adjusted = true;
      const fragment = untracked(() => route.snapshot.fragment);
      if (fragment) setTimeout(() => scroller.scrollToAnchor(fragment));
    });

    // El nombre del sitio de Ajustes generales es el título de la pestaña.
    const title = inject(Title);
    const settings = content.raw('settings');
    effect(() => {
      const name = settings()?.content['site_name'];
      if (typeof name === 'string' && name.trim()) title.setTitle(name.trim());
    });
  }
}

import { Component, computed, inject } from '@angular/core';
import { resolveImage } from '../../core/api';
import { DEFAULT_IMAGES, HERO_DEFAULTS } from '../../core/content-defaults';
import { SiteContent } from '../../core/site-content';
import { Icon } from '../../shared/icon';

@Component({
  selector: 'app-hero',
  imports: [Icon],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
})
export class Hero {
  protected readonly hero = inject(SiteContent).section('hero', HERO_DEFAULTS);
  protected readonly image = computed(() =>
    resolveImage(this.hero()?.image_url, DEFAULT_IMAGES.hero),
  );
  /** El segundo botón lleva a la sección que no cubre el botón principal. */
  protected readonly secondary = computed(() =>
    this.hero()?.cta_anchor === '#contacto'
      ? { label: 'Conócenos', href: '#nosotros' }
      : { label: 'Contáctanos', href: '#contacto' },
  );
}

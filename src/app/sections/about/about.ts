import { Component, computed, inject } from '@angular/core';
import { resolveImage } from '../../core/api';
import { ABOUT_DEFAULTS, DEFAULT_IMAGES } from '../../core/content-defaults';
import { SiteContent } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-about',
  imports: [Icon, Reveal],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly about = inject(SiteContent).section('nosotros', ABOUT_DEFAULTS);
  protected readonly image = computed(() =>
    resolveImage(this.about()?.image_url, DEFAULT_IMAGES.about),
  );
  /** El texto admite varios párrafos separados por una línea en blanco. */
  protected readonly paragraphs = computed(() =>
    (this.about()?.text ?? '').split(/\n\s*\n/).filter(Boolean),
  );
  protected readonly items = computed(() => {
    const about = this.about();
    if (!about) return [];
    return [
      { title: 'Nuestra misión', text: about.mission },
      { title: 'Nuestra visión', text: about.vision },
    ];
  });
}

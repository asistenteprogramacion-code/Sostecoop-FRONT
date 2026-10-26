import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { newsFeed } from '../../core/news-data';
import { SiteContent } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';

const NEWS_DEFAULTS = {
  title: 'Noticias y contenidos para ti',
};

@Component({
  selector: 'app-news',
  imports: [RouterLink, Icon, Reveal],
  templateUrl: './news.html',
  styleUrl: './news.css',
})
export class News {
  private readonly content = inject(SiteContent);
  protected readonly section = this.content.section('noticias', NEWS_DEFAULTS);
  private readonly all = newsFeed(this.content);
  /** En la landing solo las tres más recientes; el resto, en el catálogo. */
  protected readonly news = computed(() => this.all().slice(0, 3));
  protected readonly total = computed(() => this.all().length);
}

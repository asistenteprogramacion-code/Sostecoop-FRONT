import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NewsBlock, newsFeed } from '../../core/news-data';
import { SiteContent } from '../../core/site-content';
import { Footer } from '../../sections/footer/footer';
import { Header } from '../../sections/header/header';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';

interface BlockView {
  type: 'p' | 'h' | 'list' | 'quote';
  text: string;
  items: string[];
}

@Component({
  selector: 'app-news-detail',
  imports: [RouterLink, Header, Footer, Icon, Reveal],
  providers: [SiteContent],
  templateUrl: './news-detail.html',
  styleUrl: './news-detail.css',
})
export class NewsDetail {
  private readonly title = inject(Title);
  private readonly content = inject(SiteContent);
  private readonly feed = newsFeed(this.content);

  /** :slug de la ruta. */
  readonly slug = input.required<string>();

  protected readonly article = computed(() => this.feed().find((n) => n.slug === this.slug()));
  /** Mientras llega la API la noticia puede no estar aún en la lista. */
  protected readonly loading = computed(() => !this.article() && !this.content.loaded());
  protected readonly blocks = computed(() => (this.article()?.body ?? []).map(toView));
  protected readonly related = computed(() =>
    this.feed()
      .filter((n) => n.slug !== this.slug())
      .slice(0, 2),
  );
  protected readonly copied = signal(false);

  constructor() {
    effect(() => {
      const article = this.article();
      if (this.loading()) return;
      this.title.setTitle(
        article ? `${article.title} · Sostecoop` : 'Noticia no encontrada · Sostecoop',
      );
      this.copied.set(false);
    });
  }

  protected shareUrl(): string {
    return typeof location === 'undefined' ? '' : location.href.split('#')[0];
  }

  protected whatsappLink(): string {
    const article = this.article();
    return `https://wa.me/?text=${encodeURIComponent(`${article?.title ?? ''} ${this.shareUrl()}`)}`;
  }

  protected async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl());
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2500);
    } catch {
      // Sin permiso de portapapeles: el enlace sigue visible en la barra de direcciones.
    }
  }
}

function toView(block: NewsBlock): BlockView {
  if ('h' in block) return { type: 'h', text: block.h, items: [] };
  if ('list' in block) return { type: 'list', text: '', items: block.list };
  if ('quote' in block) return { type: 'quote', text: block.quote, items: [] };
  return { type: 'p', text: block.p, items: [] };
}

import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { newsFeed } from '../../core/news-data';
import { SiteContent } from '../../core/site-content';
import { Footer } from '../../sections/footer/footer';
import { Header } from '../../sections/header/header';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';

/** Minúsculas y sin tildes, para buscar "credito" y encontrar "Crédito". */
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

@Component({
  selector: 'app-news-catalog',
  imports: [RouterLink, Header, Footer, Icon, Reveal],
  providers: [SiteContent],
  templateUrl: './news-catalog.html',
  styleUrl: './news-catalog.css',
})
export class NewsCatalog {
  private readonly content = inject(SiteContent);
  private readonly feed = newsFeed(this.content);

  protected readonly query = signal('');
  protected readonly category = signal<string | null>(null);

  protected readonly categories = computed(() => [...new Set(this.feed().map((n) => n.category))]);

  protected readonly results = computed(() => {
    const q = normalize(this.query().trim());
    const cat = this.category();
    return this.feed().filter(
      (n) =>
        (!cat || n.category === cat) &&
        (!q || normalize(`${n.title} ${n.text} ${n.category}`).includes(q)),
    );
  });

  protected readonly total = computed(() => this.feed().length);
  protected readonly filtering = computed(() => !!this.query().trim() || !!this.category());

  protected clear(): void {
    this.query.set('');
    this.category.set(null);
  }
}

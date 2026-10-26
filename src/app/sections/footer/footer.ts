import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CONTACT_DEFAULTS, SETTINGS_DEFAULTS } from '../../core/content-defaults';
import { siteMenu } from '../../core/menu';
import { SiteContent } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon, Logo, Reveal],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private readonly content = inject(SiteContent);
  protected readonly settings = this.content.section('settings', SETTINGS_DEFAULTS);
  protected readonly contact = this.content.section('contacto', CONTACT_DEFAULTS);
  protected readonly defaults = { settings: SETTINGS_DEFAULTS, contact: CONTACT_DEFAULTS };
  protected readonly menu = siteMenu(this.content);
  protected readonly whatsapp = computed(() => {
    const value = this.settings()?.social?.whatsapp?.trim();
    if (!value) return null;

    const number = value.replace(/\D/g, '');
    if (!number) return null;

    const message = encodeURIComponent('Hola, quiero más información sobre Sostecoop.');
    return `https://api.whatsapp.com/send?phone=${number}&text=${message}`;
  });

  /** Redes de Ajustes generales; solo las que tienen dirección. */
  protected readonly social = computed(() => {
    const social = this.settings()?.social ?? {};
    const links: { label: string; url: string }[] = [];
    if (social.facebook?.trim()) links.push({ label: 'Facebook', url: social.facebook.trim() });
    if (social.instagram?.trim()) links.push({ label: 'Instagram', url: social.instagram.trim() });
    const whatsapp = social.whatsapp?.trim();
    if (whatsapp) {
      links.push({
        label: 'WhatsApp',
        url: /^https?:\/\//.test(whatsapp) ? whatsapp : `https://wa.me/${whatsapp.replace(/\D/g, '')}`,
      });
    }
    return links;
  });

  protected tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }
}

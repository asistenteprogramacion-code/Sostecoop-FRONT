import { Component, inject } from '@angular/core';
import { CONTACT_DEFAULTS } from '../../core/content-defaults';
import { SiteContent } from '../../core/site-content';
import { Icon } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';
import { ContactForm } from './contact-form';

@Component({
  selector: 'app-contact',
  imports: [Icon, Reveal, ContactForm],
  templateUrl: './contact.html',
  styleUrl: './contact.css',
})
export class Contact {
  protected readonly contact = inject(SiteContent).section('contacto', CONTACT_DEFAULTS);

  protected tel(phone: string): string {
    return 'tel:' + phone.replace(/[^\d+]/g, '');
  }
}

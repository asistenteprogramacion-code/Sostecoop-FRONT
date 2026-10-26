import { Component } from '@angular/core';
import { Icon, IconName } from '../../shared/icon';
import { Reveal } from '../../shared/reveal';

@Component({
  selector: 'app-trust-strip',
  imports: [Icon, Reveal],
  templateUrl: './trust-strip.html',
  styleUrl: './trust-strip.css',
})
export class TrustStrip {
  protected readonly principles: { icon: IconName; title: string; text: string }[] = [
    { icon: 'shield', title: 'Confianza', text: 'Información clara y transparente' },
    { icon: 'users', title: 'Cooperación', text: 'El bienestar se construye juntos' },
    { icon: 'chart', title: 'Progreso', text: 'Impulsamos tus proyectos' },
    { icon: 'heart', title: 'Cercanía', text: 'Siempre estamos para escucharte' },
  ];
}

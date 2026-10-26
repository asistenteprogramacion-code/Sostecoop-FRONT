import { Component, input } from '@angular/core';

export type IconName =
  | 'arrow'
  | 'arrow-up-right'
  | 'shield'
  | 'chart'
  | 'users'
  | 'heart'
  | 'mail'
  | 'phone'
  | 'pin'
  | 'clock'
  | 'menu'
  | 'close'
  | 'sliders'
  | 'home'
  | 'briefcase'
  | 'spark'
  | 'quote'
  | 'help'
  | 'layers'
  | 'inbox'
  | 'grip'
  | 'trash'
  | 'chevron-up'
  | 'chevron-down'
  | 'chevron-left'
  | 'check'
  | 'upload'
  | 'logout'
  | 'eye'
  | 'eye-off'
  | 'alert'
  | 'reply'
  | 'search'
  | 'move-up'
  | 'move-down'
  | 'plus'
  | 'menu-list';

/** Íconos de trazo (1.8 px, puntas redondeadas). Uso: <svg appIcon="arrow"></svg> */
@Component({
  selector: 'svg[appIcon]',
  host: {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': '1.8',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
  },
  template: `
    @switch (appIcon()) {
      @case ('arrow') {
        <svg:path d="M5 12h14M14 7l5 5-5 5" />
      }
      @case ('arrow-up-right') {
        <svg:path d="M7 17 17 7M8 7h9v9" />
      }
      @case ('shield') {
        <svg:path d="M12 3 4.5 6v5.5c0 4.8 3.2 8.1 7.5 10 4.3-1.9 7.5-5.2 7.5-10V6Z" />
        <svg:path d="m9 12 2 2 4-5" />
      }
      @case ('chart') {
        <svg:path d="M4 19V9M10 19V5M16 19v-7M21 19H2" />
        <svg:path d="m4 7 5-3 5 3 6-5" />
      }
      @case ('users') {
        <svg:circle cx="9" cy="8" r="3.5" />
        <svg:path d="M2.5 20v-1.5A5.5 5.5 0 0 1 8 13h2a5.5 5.5 0 0 1 5.5 5.5V20M16 5a3.5 3.5 0 0 1 0 7M18 14a5 5 0 0 1 3.5 4.7V20" />
      }
      @case ('heart') {
        <svg:path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0L12 6.9l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 22l8.8-8.4a5.5 5.5 0 0 0 0-7.8Z" />
      }
      @case ('mail') {
        <svg:rect x="3" y="5" width="18" height="14" rx="2" />
        <svg:path d="m3 7 9 6 9-6" />
      }
      @case ('phone') {
        <svg:path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.7 19.7 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.7 19.7 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.4 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
      }
      @case ('pin') {
        <svg:path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
        <svg:circle cx="12" cy="10" r="2.5" />
      }
      @case ('clock') {
        <svg:circle cx="12" cy="12" r="9" />
        <svg:path d="M12 7v5l3 2" />
      }
      @case ('menu') {
        <svg:path d="M4 7h16M4 12h16M4 17h10" />
      }
      @case ('close') {
        <svg:path d="M6 6l12 12M18 6 6 18" />
      }
      @case ('sliders') {
        <svg:path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
        <svg:circle cx="16" cy="6" r="2" />
        <svg:circle cx="10" cy="12" r="2" />
        <svg:circle cx="18" cy="18" r="2" />
      }
      @case ('home') {
        <svg:path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1Z" />
      }
      @case ('briefcase') {
        <svg:rect x="3" y="7" width="18" height="13" rx="2" />
        <svg:path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18" />
      }
      @case ('spark') {
        <svg:path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />
      }
      @case ('quote') {
        <svg:path d="M7 11H4.5A1.5 1.5 0 0 1 3 9.5v-3A1.5 1.5 0 0 1 4.5 5h3A1.5 1.5 0 0 1 9 6.5V11c0 3-1.5 5-4 6M17 11h-2.5A1.5 1.5 0 0 1 13 9.5v-3A1.5 1.5 0 0 1 14.5 5h3A1.5 1.5 0 0 1 19 6.5V11c0 3-1.5 5-4 6" />
      }
      @case ('help') {
        <svg:circle cx="12" cy="12" r="9" />
        <svg:path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.4M12 17h0" />
      }
      @case ('layers') {
        <svg:path d="m12 3 9 5-9 5-9-5Z" />
        <svg:path d="m3 13 9 5 9-5" />
      }
      @case ('inbox') {
        <svg:path d="M3 13h5l1.5 3h5L16 13h5" />
        <svg:path d="M5.5 5h13L21 13v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6Z" />
      }
      @case ('grip') {
        <svg:path d="M9 6h0M15 6h0M9 12h0M15 12h0M9 18h0M15 18h0" stroke-width="3" />
      }
      @case ('trash') {
        <svg:path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-12M9 7V4h6v3" />
      }
      @case ('chevron-up') {
        <svg:path d="m6 15 6-6 6 6" />
      }
      @case ('chevron-down') {
        <svg:path d="m6 9 6 6 6-6" />
      }
      @case ('chevron-left') {
        <svg:path d="m15 6-6 6 6 6" />
      }
      @case ('check') {
        <svg:path d="m5 12.5 4.5 4.5L19 7.5" />
      }
      @case ('upload') {
        <svg:path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M4 15v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" />
      }
      @case ('logout') {
        <svg:path d="M15 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 16l-4-4 4-4M6 12h10" />
      }
      @case ('eye') {
        <svg:path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <svg:circle cx="12" cy="12" r="3" />
      }
      @case ('eye-off') {
        <svg:path d="M4 4l16 16M10.6 6A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-2.6 3.4M6.6 7.3A16.5 16.5 0 0 0 2.5 12S6 18.5 12 18.5c1.6 0 3-.4 4.2-1.1M9.9 9.9a3 3 0 0 0 4.2 4.2" />
      }
      @case ('alert') {
        <svg:circle cx="12" cy="12" r="9" />
        <svg:path d="M12 7.5v5.5M12 16.5h0" />
      }
      @case ('reply') {
        <svg:path d="M9 8 4 13l5 5" />
        <svg:path d="M4 13h10a6 6 0 0 1 6 6" />
      }
      @case ('search') {
        <svg:circle cx="11" cy="11" r="6.5" />
        <svg:path d="m20 20-4.2-4.2" />
      }
      @case ('move-up') {
        <svg:path d="M12 19V5M6 11l6-6 6 6" />
      }
      @case ('move-down') {
        <svg:path d="M12 5v14M6 13l6 6 6-6" />
      }
      @case ('plus') {
        <svg:path d="M12 5v14M5 12h14" />
      }
      @case ('menu-list') {
        <svg:rect x="3" y="4" width="18" height="16" rx="2" />
        <svg:path d="M7 9h10M7 13h10M7 17h6" />
      }
    }
  `,
})
export class Icon {
  readonly appIcon = input.required<IconName>();
}

import { Component, input } from '@angular/core';

@Component({
  selector: 'app-logo',
  host: { '[class.inverse]': 'inverse()' },
  template: `
    <span class="mark"><i></i><i></i><i></i></span>
    <span>Sostecoop<small>Cooperativa</small></span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 11px;
      color: var(--navy);
      font: 700 19px var(--font-display);
      letter-spacing: -0.4px;
      line-height: 1;
    }
    small {
      display: block;
      color: #6c818c;
      font: 600 10px var(--font-body);
      letter-spacing: 1.6px;
      text-transform: uppercase;
      margin-top: 5px;
    }
    .mark {
      transition: transform 0.4s var(--ease-spring);
    }
    :host:hover .mark {
      transform: rotate(-6deg) scale(1.04);
    }
    .mark {
      width: 38px;
      height: 38px;
      padding: 9px;
      border-radius: 11px;
      background: var(--navy);
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: 3px;
    }
    .mark i {
      width: 4px;
      border-radius: 3px;
      background: white;
    }
    .mark i:nth-child(1) { height: 8px; }
    .mark i:nth-child(2) { height: 14px; background: #4ed4aa; }
    .mark i:nth-child(3) { height: 20px; }
    :host(.inverse) { color: white; }
    :host(.inverse) small { color: #8fa3ae; }
  `,
})
export class Logo {
  /** Versión para fondos oscuros (footer). */
  readonly inverse = input(false);
}

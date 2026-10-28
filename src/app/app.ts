import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
  RouterOutlet,
} from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (navigating()) {
      <div class="route-loading" role="status" aria-live="polite">
        <span class="spinner" aria-hidden="true"></span>
        <span>Cargando página…</span>
      </div>
    }
    <router-outlet />
  `,
  styles: [`
    .route-loading {
      position: fixed;
      inset: 0;
      z-index: 9999;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 12px;
      background: #f5f9f8;
      color: #0b2c43;
      font: 600 15px system-ui, sans-serif;
    }
    .spinner {
      width: 34px;
      height: 34px;
      border: 3px solid #d9e9e4;
      border-top-color: #109b73;
      border-radius: 50%;
      animation: spin 0.75s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class App {
  protected readonly navigating = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(takeUntilDestroyed())
      .subscribe((event) => {
        if (event instanceof NavigationStart) this.navigating.set(true);
        if (
          event instanceof NavigationEnd ||
          event instanceof NavigationCancel ||
          event instanceof NavigationError
        ) {
          this.navigating.set(false);
        }
      });
  }
}

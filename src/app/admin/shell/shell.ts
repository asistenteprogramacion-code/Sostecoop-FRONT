import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { Auth } from '../auth';
import { InboxStore } from '../inbox-store';
import { Toasts } from '../toast';

@Component({
  selector: 'app-admin-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Icon, Logo, Toasts],
  providers: [InboxStore],
  templateUrl: './shell.html',
  styleUrl: './shell.css',
  host: { class: 'adm' },
})
export class Shell {
  protected readonly auth = inject(Auth);
  protected readonly inbox = inject(InboxStore);
}

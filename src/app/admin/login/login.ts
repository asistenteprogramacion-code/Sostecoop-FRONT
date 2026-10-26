import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon';
import { Logo } from '../../shared/logo';
import { apiErrorMessage } from '../admin-api';
import { Auth } from '../auth';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, Icon, Logo],
  templateUrl: './login.html',
  styleUrl: './login.css',
  host: { class: 'adm' },
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  protected readonly sending = signal(false);
  protected readonly error = signal('');
  protected readonly showPassword = signal(false);

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.sending.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    try {
      await this.auth.login(email, password);
      this.router.navigateByUrl('/admin');
    } catch (err) {
      this.error.set(
        err instanceof HttpErrorResponse && err.status === 401
          ? 'Correo o contraseña incorrectos.'
          : apiErrorMessage(err, 'No se pudo iniciar sesión.'),
      );
    } finally {
      this.sending.set(false);
    }
  }
}

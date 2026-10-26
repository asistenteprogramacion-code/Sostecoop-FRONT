import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactApi, ContactError } from '../../core/contact-api';
import { Icon } from '../../shared/icon';

type FormState = 'idle' | 'sending' | 'sent' | 'error';
type Field = 'name' | 'email' | 'phone' | 'message';

@Component({
  selector: 'app-contact-form',
  imports: [ReactiveFormsModule, Icon],
  templateUrl: './contact-form.html',
  styleUrl: './contact-form.css',
})
export class ContactForm {
  private readonly api = inject(ContactApi);

  protected readonly form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    message: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(3000)]],
  });

  protected readonly state = signal<FormState>('idle');
  protected readonly errorMessage = signal('');

  protected async submit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.set('sending');
    const { phone, ...rest } = this.form.getRawValue();
    try {
      await this.api.send(phone.trim() ? { ...rest, phone } : rest);
      this.form.reset();
      this.state.set('sent');
    } catch (e) {
      const err = e instanceof ContactError ? e : new ContactError('No se pudo enviar el mensaje.');
      for (const [field, msg] of Object.entries(err.fields)) {
        this.form.get(field)?.setErrors({ server: msg });
      }
      this.errorMessage.set(err.message);
      this.state.set('error');
    }
  }

  protected error(field: Field): string {
    const control: AbstractControl = this.form.controls[field];
    if (!control.touched || !control.errors) return '';
    const e = control.errors;
    if (e['server']) return e['server'];
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['email']) return 'Escribe un correo válido.';
    if (e['minlength']) return `Escribe al menos ${e['minlength'].requiredLength} caracteres.`;
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    return 'Valor no válido.';
  }
}

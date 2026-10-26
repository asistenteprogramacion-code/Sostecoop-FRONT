import { Component, computed, inject, input, output, signal } from '@angular/core';
import { resolveImage } from '../../core/api';
import { Icon } from '../../shared/icon';
import { AdminApi, apiErrorMessage, MAX_UPLOAD_BYTES, UPLOAD_TYPES } from '../admin-api';

/** Campo de imagen: vista previa, subida a /api/admin/upload y opción de quitarla. */
@Component({
  selector: 'app-image-field',
  imports: [Icon],
  templateUrl: './image-field.html',
  styleUrl: './image-field.css',
})
export class ImageField {
  private readonly api = inject(AdminApi);

  readonly value = input<string>('');
  readonly label = input<string>('Imagen');
  readonly valueChange = output<string>();

  protected readonly uploading = signal(false);
  protected readonly error = signal('');
  protected readonly preview = computed(() => resolveImage(this.value(), ''));

  protected async pick(event: Event): Promise<void> {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;

    if (!UPLOAD_TYPES.includes(file.type)) {
      this.error.set('Usa una imagen PNG, JPG o WEBP.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      this.error.set('La imagen pesa más de 5 MB.');
      return;
    }

    this.uploading.set(true);
    this.error.set('');
    try {
      this.valueChange.emit(await this.api.upload(file));
    } catch (err) {
      this.error.set(apiErrorMessage(err, 'No se pudo subir la imagen.'));
    } finally {
      this.uploading.set(false);
    }
  }
}

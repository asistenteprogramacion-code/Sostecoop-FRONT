/**
 * Validación del content antes de guardar. Devuelve los errores por ruta
 * ("items.2.title") para mostrarlos junto a cada campo.
 */

export type FieldErrors = Record<string, string>;

type Obj = Record<string, unknown>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^\+?[\d\s().-]{6,}$/;
const WHATSAPP_NUMBER = /^\d{10}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const URL = /^https?:\/\/\S+\.\S+/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Máximo de caracteres por campo. */
const MAX: Record<string, number> = {
  title: 140,
  site_name: 80,
  label: 40,
  cta_label: 40,
  category: 40,
  author: 80,
  name: 80,
  question: 200,
  subtitle: 300,
  summary: 240,
  image_alt: 160,
  footer_text: 200,
  text: 3000,
  answer: 1500,
  mission: 600,
  vision: 600,
  body: 20000,
};

/** Campos obligatorios dentro de cada elemento de lista, según su forma. */
function requiredInItem(item: Obj): string[] {
  if ('question' in item) return ['question', 'answer'];
  if ('name' in item && 'text' in item) return ['name', 'text'];
  if ('slug' in item && 'body' in item) return ['title', 'date', 'category', 'summary', 'body'];
  if ('label' in item && 'anchor' in item) return ['label', 'anchor'];
  if ('title' in item) return ['title'];
  return [];
}

/** validLinks: destinos internos que existen; si se pasa, se marcan los enlaces rotos. */
export function validateContent(
  sectionKey: string,
  content: Obj,
  validLinks?: ReadonlySet<string>,
): FieldErrors {
  const errors: FieldErrors = {};
  // El título principal de cada sección es obligatorio, salvo en ajustes generales.
  if (sectionKey !== 'settings' && 'title' in content && !str(content['title'])) {
    errors['title'] = 'Escribe un título.';
  }
  if (sectionKey === 'settings' && 'site_name' in content && !str(content['site_name'])) {
    errors['site_name'] = 'Escribe el nombre del sitio.';
  }
  walk(content, '', errors, validLinks);
  return errors;
}

function walk(obj: Obj, prefix: string, errors: FieldErrors, links?: ReadonlySet<string>): void {
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix + key;
    if (Array.isArray(value)) {
      const slugs = new Map<string, number>();
      value.forEach((item, i) => {
        if (!item || typeof item !== 'object') return;
        const itemPath = `${path}.${i}.`;
        for (const field of requiredInItem(item as Obj)) {
          if (!str((item as Obj)[field])) errors[itemPath + field] = 'Este campo es obligatorio.';
        }
        walk(item as Obj, itemPath, errors, links);
        const slug = str((item as Obj)['slug']);
        if (slug) {
          if (slugs.has(slug)) errors[itemPath + 'slug'] = `Ya la usa el elemento ${slugs.get(slug)! + 1}.`;
          else slugs.set(slug, i);
        }
      });
    } else if (value && typeof value === 'object') {
      walk(value as Obj, path + '.', errors, links);
    } else if (!errors[path]) {
      const message = checkField(key, value, links);
      if (message) errors[path] = message;
    }
  }
}

function checkField(key: string, value: unknown, links?: ReadonlySet<string>): string {
  if (typeof value === 'number') {
    if (key === 'reading_minutes' && (value < 0 || value > 120 || !Number.isInteger(value))) {
      return 'Usa un número entero entre 0 y 120.';
    }
    return '';
  }
  const text = str(value);
  const max = MAX[key];
  if (max && text.length > max) return `Máximo ${max} caracteres (tiene ${text.length}).`;
  if (!text) return '';

  switch (key) {
    case 'email':
      return EMAIL.test(text) ? '' : 'Escribe un correo válido, por ejemplo contacto@cooperativa.co.';
    case 'phone':
      return PHONE.test(text) && digits(text) >= 7
        ? ''
        : 'Escribe un teléfono válido: números, espacios, paréntesis o el signo +.';
    case 'slug':
      return SLUG.test(text) ? '' : 'Solo minúsculas, números y guiones, sin espacios ni tildes.';
    case 'date':
      return DATE.test(text) && !isNaN(Date.parse(text)) ? '' : 'Elige una fecha válida.';
    case 'anchor':
    case 'cta_anchor':
      if (/^https?:\/\//.test(text)) return URL.test(text) ? '' : 'Revisa la dirección del enlace externo.';
      if (/^[#/]/.test(text)) {
        return !links || links.has(text) ? '' : 'Ese destino ya no existe. Elige otro de la lista.';
      }
      return 'Elige un destino de la lista o escribe un enlace que empiece por https://.';
    case 'map_url':
    case 'facebook':
    case 'instagram':
      return URL.test(text) ? '' : 'Pega el enlace completo, empezando por https://.';
    case 'whatsapp':
      return WHATSAPP_NUMBER.test(text)
        ? ''
        : 'Escribe un número de 10 dígitos, solo números y sin indicativo del país.';
    default:
      return '';
  }
}

function digits(text: string): number {
  return text.replace(/\D/g, '').length;
}

function str(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

/** Cuántos errores hay dentro de una ruta (para marcar elementos plegados). */
export function errorsUnder(errors: FieldErrors, prefix: string): number {
  return Object.keys(errors).filter((k) => k.startsWith(prefix)).length;
}

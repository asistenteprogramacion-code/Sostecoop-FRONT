/** Cómo presentar cada campo del content en el editor genérico. */

const LABELS: Record<string, string> = {
  title: 'Título',
  subtitle: 'Subtítulo',
  cta_label: 'Texto del botón',
  cta_anchor: 'El botón lleva a',
  image_url: 'Imagen',
  image_alt: 'Descripción de la imagen (para lectores de pantalla)',
  logo_url: 'Logo',
  photo_url: 'Foto',
  text: 'Texto',
  mission: 'Misión',
  vision: 'Visión',
  items: 'Elementos',
  icon: 'Ícono',
  name: 'Nombre',
  question: 'Pregunta',
  answer: 'Respuesta',
  address: 'Dirección',
  phone: 'Teléfono',
  email: 'Correo electrónico',
  schedule: 'Horario de atención',
  map_url: 'Enlace del mapa (Google Maps)',
  site_name: 'Nombre del sitio',
  menu: 'Enlaces del menú',
  label: 'Texto del enlace',
  anchor: 'Lleva a',
  footer_text: 'Texto de derechos (pie de página)',
  tagline: 'Frase del pie de página',
  social: 'Redes sociales',
  facebook: 'Facebook',
  instagram: 'Instagram',
  whatsapp: 'WhatsApp',
  slug: 'Dirección de la noticia',
  category: 'Categoría',
  date: 'Fecha de publicación',
  author: 'Autor',
  reading_minutes: 'Minutos de lectura',
  summary: 'Resumen',
  body: 'Contenido completo',
};

const HINTS: Record<string, string> = {
  site_name: 'Se usa como título de la pestaña del navegador.',
  map_url: 'Si lo agregas, la dirección de contacto abre el mapa.',
  summary: 'Una o dos frases. Se ve en la tarjeta de la noticia.',
  body:
    'Separa los párrafos con una línea en blanco. Para un subtítulo empieza la línea con «## », para una lista con «- » y para una cita destacada con «> ».',
  whatsapp: 'Número con indicativo, por ejemplo +57 300 123 4567.',
};

/** Campos internos que el admin no debe tocar. */
const HIDDEN_KEYS = new Set(['template', 'slug', 'reading_minutes', 'logo_url']);

const LONG_KEYS = new Set([
  'subtitle',
  'text',
  'mission',
  'vision',
  'answer',
  'description',
  'footer_text',
  'message',
  'summary',
  'body',
]);

const IMAGE_KEY = /(^|_)(image|logo|photo)_url$/;

const today = () => new Date().toISOString().slice(0, 10);

/** Plantilla para elementos nuevos cuando la lista está vacía (por sección o genérica). */
const ITEM_TEMPLATES: Record<string, () => unknown> = {
  'servicios.items': () => ({ icon: '', title: '', text: '' }),
  'beneficios.items': () => ({ title: '', text: '' }),
  'testimonios.items': () => ({ name: '', text: '', photo_url: '' }),
  'faq.items': () => ({ question: '', answer: '' }),
  'settings.menu': () => ({ label: '', anchor: '' }),
  'noticias.items': () => ({
    slug: '',
    title: '',
    category: '',
    date: today(),
    author: '',
    reading_minutes: 0,
    summary: '',
    image_url: '',
    image_alt: '',
    body: '',
  }),
  '*.items': () => ({ title: '', text: '' }),
};

export type FieldKind =
  | 'image'
  | 'long'
  | 'text'
  | 'date'
  | 'number'
  | 'bool'
  | 'list'
  | 'group'
  | 'link'
  | 'icon';

export function fieldLabel(key: string): string {
  if (LABELS[key]) return LABELS[key];
  const words = key.replace(/_/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Nombre de una lista según la sección ("Noticias" en vez de "Elementos"). */
const LIST_LABELS: Record<string, string> = {
  'noticias.items': 'Noticias',
  'servicios.items': 'Servicios',
  'beneficios.items': 'Beneficios',
  'testimonios.items': 'Testimonios',
  'faq.items': 'Preguntas',
};

export function listLabel(sectionKey: string, key: string): string {
  return LIST_LABELS[`${sectionKey}.${key}`] ?? fieldLabel(key);
}

export function fieldHint(key: string): string {
  return HINTS[key] ?? '';
}

export function isHiddenField(key: string): boolean {
  return HIDDEN_KEYS.has(key);
}

export function fieldKind(key: string, value: unknown): FieldKind {
  if (Array.isArray(value)) return 'list';
  if (typeof value === 'boolean') return 'bool';
  if (typeof value === 'number') return 'number';
  if (value && typeof value === 'object') return 'group';
  if (IMAGE_KEY.test(key)) return 'image';
  if (key === 'anchor' || key === 'cta_anchor') return 'link';
  if (key === 'icon') return 'icon';
  if (key === 'date') return 'date';
  if (LONG_KEYS.has(key)) return 'long';
  if (!SHORT_KEYS.has(key) && key !== 'title' && typeof value === 'string' && value.length > 90) {
    return 'long';
  }
  return 'text';
}

/** Campos cortos que van de a dos por fila. */
const SHORT_KEYS = new Set([
  'slug',
  'category',
  'date',
  'author',
  'reading_minutes',
  'label',
  'anchor',
  'icon',
  'phone',
  'email',
  'schedule',
  'address',
  'cta_label',
  'cta_anchor',
  'name',
  'site_name',
  'facebook',
  'instagram',
  'whatsapp',
  'map_url',
]);

export function isShortField(key: string, kind: FieldKind): boolean {
  return SHORT_KEYS.has(key) || kind === 'number' || kind === 'bool';
}

/** Lista cuyos elementos nuevos van arriba (las noticias más recientes primero). */
export function addsAtTop(sectionKey: string, listKey: string): boolean {
  return sectionKey === 'noticias' && listKey === 'items';
}

/** Elemento vacío con la misma forma que los de la lista. */
export function newItem(sectionKey: string, listKey: string, list: unknown[]): unknown {
  const template = ITEM_TEMPLATES[`${sectionKey}.${listKey}`];
  if (template) return template();
  if (list[0] !== undefined) return blankLike(list[0]);
  return ITEM_TEMPLATES[`*.${listKey}`]?.() ?? '';
}

function blankLike(value: unknown): unknown {
  if (Array.isArray(value)) return [];
  if (typeof value === 'number') return 0;
  if (typeof value === 'boolean') return false;
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, blankLike(v)]));
  }
  return '';
}

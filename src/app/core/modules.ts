/**
 * Módulos: secciones que el admin puede crear desde el panel. Cada uno usa una
 * plantilla que define sus campos y cómo se ve en la landing.
 */

import { IconName } from '../shared/icon';

export type ModuleTemplate = 'tarjetas' | 'texto-imagen' | 'preguntas' | 'testimonios';

export interface TemplateInfo {
  id: ModuleTemplate;
  name: string;
  description: string;
  icon: IconName;
  /** Contenido inicial al crear el módulo. */
  starter: (title: string) => Record<string, unknown>;
}

export const TEMPLATES: TemplateInfo[] = [
  {
    id: 'tarjetas',
    name: 'Tarjetas',
    description: 'Varios elementos con ícono, título y texto. Ideal para servicios o beneficios.',
    icon: 'layers',
    starter: (title) => ({
      template: 'tarjetas',
      title,
      subtitle: '',
      items: [
        { icon: 'spark', title: 'Primer elemento', text: 'Describe aquí este elemento.' },
        { icon: 'heart', title: 'Segundo elemento', text: 'Describe aquí este elemento.' },
        { icon: 'shield', title: 'Tercer elemento', text: 'Describe aquí este elemento.' },
      ],
    }),
  },
  {
    id: 'texto-imagen',
    name: 'Texto con imagen',
    description: 'Un bloque de texto junto a una foto, con botón opcional.',
    icon: 'home',
    starter: (title) => ({
      template: 'texto-imagen',
      title,
      text: 'Escribe aquí el contenido de este módulo.',
      image_url: '',
      cta_label: '',
      cta_anchor: '#contacto',
    }),
  },
  {
    id: 'preguntas',
    name: 'Preguntas frecuentes',
    description: 'Preguntas con su respuesta, que se despliegan al tocarlas.',
    icon: 'help',
    starter: (title) => ({
      template: 'preguntas',
      title,
      subtitle: '',
      items: [{ question: '¿Primera pregunta?', answer: 'Escribe aquí la respuesta.' }],
    }),
  },
  {
    id: 'testimonios',
    name: 'Testimonios',
    description: 'Opiniones de asociados con nombre y foto.',
    icon: 'quote',
    starter: (title) => ({
      template: 'testimonios',
      title,
      items: [{ name: 'Nombre del asociado', text: 'Lo que opina de la cooperativa.', photo_url: '' }],
    }),
  },
];

/** Secciones con diseño propio en la landing; no se pueden borrar ni usan plantilla. */
export const CORE_KEYS = new Set(['settings', 'hero', 'nosotros', 'noticias', 'contacto']);
/** Máximo de secciones adicionales que se pueden crear desde el panel. */
export const MAX_MODULES = 7;

/** Claves que no pueden usar los módulos nuevos (rutas y anclas ya ocupadas). */
const RESERVED_KEYS = new Set([...CORE_KEYS, 'inicio', 'admin', 'contenido', 'menu-principal']);

export function templateInfo(id: ModuleTemplate): TemplateInfo {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}

/** Plantilla de una sección: la guardada en content.template o la que sugiere su forma. */
export function templateOf(content: Record<string, unknown>): ModuleTemplate {
  const explicit = content['template'];
  if (typeof explicit === 'string' && TEMPLATES.some((t) => t.id === explicit)) {
    return explicit as ModuleTemplate;
  }
  const items = content['items'];
  const first = Array.isArray(items) ? (items[0] as Record<string, unknown> | undefined) : undefined;
  if (first && 'question' in first) return 'preguntas';
  if (first && 'name' in first) return 'testimonios';
  if (Array.isArray(items)) return 'tarjetas';
  return 'texto-imagen';
}

/** Ancla de la sección en la landing (el hero usa #inicio). */
export function anchorOf(key: string): string {
  return key === 'hero' ? 'inicio' : key;
}

/** "Ahorro escolar" → "ahorro-escolar" */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

/** Clave única para un módulo nuevo a partir de su nombre. */
export function uniqueKey(title: string, taken: Iterable<string>): string {
  const used = new Set(taken);
  const base = slugify(title) || 'modulo';
  let key = RESERVED_KEYS.has(base) ? `${base}-2` : base;
  for (let n = 2; used.has(key) || RESERVED_KEYS.has(key); n++) key = `${base}-${n}`;
  return key;
}

/** Los íconos que escribe el admin pueden no existir; se usan alias y uno por defecto. */
const ICON_ALIASES: Record<string, IconName> = {
  'piggy-bank': 'heart',
  ahorro: 'heart',
  'hand-coins': 'briefcase',
  credito: 'briefcase',
  'crédito': 'briefcase',
  seguro: 'shield',
  grafica: 'chart',
  personas: 'users',
};

/** Íconos que el admin puede elegir para tarjetas, con su nombre en español. */
export const ICON_CHOICES: { id: IconName; label: string }[] = [
  { id: 'heart', label: 'Corazón (ahorro, cuidado)' },
  { id: 'briefcase', label: 'Maletín (créditos, negocios)' },
  { id: 'chart', label: 'Gráfica (crecimiento, inversión)' },
  { id: 'shield', label: 'Escudo (protección, seguros)' },
  { id: 'users', label: 'Personas (comunidad)' },
  { id: 'home', label: 'Casa (vivienda)' },
  { id: 'eye', label: 'Ojo (transparencia)' },
  { id: 'spark', label: 'Destello (novedad)' },
  { id: 'check', label: 'Visto bueno' },
  { id: 'help', label: 'Ayuda' },
  { id: 'mail', label: 'Correo' },
  { id: 'phone', label: 'Teléfono' },
  { id: 'pin', label: 'Ubicación' },
  { id: 'clock', label: 'Reloj (horarios)' },
  { id: 'quote', label: 'Comillas (opinión)' },
  { id: 'layers', label: 'Capas' },
];

const KNOWN_ICONS = new Set<IconName>(ICON_CHOICES.map((c) => c.id));

export function moduleIcon(name: unknown): IconName {
  const key = String(name ?? '').trim().toLowerCase();
  if (KNOWN_ICONS.has(key as IconName)) return key as IconName;
  return ICON_ALIASES[key] ?? 'spark';
}

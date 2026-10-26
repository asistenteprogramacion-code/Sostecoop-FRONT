import { CORE_KEYS, templateInfo, templateOf } from '../core/modules';
import { Section } from '../core/site-content';
import { IconName } from '../shared/icon';

type SectionLike = Pick<Section, 'key' | 'content'>;

/** Ícono y descripción de cada sección del backend para el panel. */
const META: Record<string, { icon: IconName; description: string }> = {
  settings: { icon: 'sliders', description: 'Nombre del sitio, menú, redes y pie de página' },
  hero: { icon: 'home', description: 'Portada: título principal, texto, botón e imagen' },
  nosotros: { icon: 'users', description: 'Quiénes somos, misión, visión e imagen' },
  noticias: { icon: 'menu-list', description: 'Noticias del sitio y su página de catálogo' },
  servicios: { icon: 'briefcase', description: 'Lista de servicios que ofrece la cooperativa' },
  beneficios: { icon: 'spark', description: 'Razones para asociarse' },
  testimonios: { icon: 'quote', description: 'Opiniones de asociados con foto' },
  faq: { icon: 'help', description: 'Preguntas frecuentes y sus respuestas' },
  contacto: { icon: 'mail', description: 'Datos de contacto, horario y mapa' },
};

export function sectionIcon(section: SectionLike): IconName {
  return META[section.key]?.icon ?? templateInfo(templateOf(section.content)).icon;
}

export function sectionDescription(section: SectionLike): string {
  return (
    META[section.key]?.description ??
    `Módulo con plantilla «${templateInfo(templateOf(section.content)).name}»`
  );
}

/** Las secciones con diseño propio no se pueden borrar; los módulos sí. */
export function isModule(key: string): boolean {
  return !CORE_KEYS.has(key);
}

const relative = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });

/** "hace 5 minutos", "ayer"… a partir de una fecha ISO en UTC. */
export function timeAgo(iso: string): string {
  const date = new Date(/[zZ]|[+-]\d\d:?\d\d$/.test(iso) ? iso : iso + 'Z');
  const seconds = (date.getTime() - Date.now()) / 1000;
  if (isNaN(seconds)) return '';
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ['year', 31_536_000],
    ['month', 2_592_000],
    ['day', 86_400],
    ['hour', 3_600],
    ['minute', 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return 'hace un momento';
}
